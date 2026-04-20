import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import { GitHub, Google, generateState, generateCodeVerifier } from "arctic";
import { prisma } from "../db/client.js";
import { LoginPage, RegisterPage, ErrorMessage } from "../views/auth.js";

const SESSION_DURATION_MINUTES = 30;

const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  `${process.env.BASE_URL}/auth/github/callback`
);

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.BASE_URL}/auth/google/callback`
);

async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_DURATION_MINUTES);
  const session = await prisma.session.create({
    data: { userId, expiresAt },
  });
  return session.id;
}

function setSessionCookie(c: any, sessionId: string) {
  setCookie(c, "session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * SESSION_DURATION_MINUTES,
  });
}

type Variables = { userId: string | null; username: string | null };
const auth = new Hono<{ Variables: Variables }>();

// --- Current user ---
auth.get("/me", (c) => {
  const userId = c.get("userId");
  const username = c.get("username");
  if (!userId) return c.json({ error: "Not authenticated" }, 401);
  return c.json({ userId, username });
});

// --- JSON API ---
auth.post("/api/login", async (c) => {
  const { username, password } = await c.req.json<{ username: string; password: string }>();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) return c.json({ error: "Invalid credentials" }, 401);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return c.json({ error: "Invalid credentials" }, 401);
  const sessionId = await createSession(user.id);
  setSessionCookie(c, sessionId);
  return c.json({ ok: true });
});

auth.post("/api/register", async (c) => {
  const { username, email, password } = await c.req.json<{ username: string; email?: string; password: string }>();
  if (!username || !password) return c.json({ error: "Username and password required" }, 400);
  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
  });
  if (existing) return c.json({ error: "Username or email already taken" }, 400);
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { username, email: email || null, passwordHash } });
  const sessionId = await createSession(user.id);
  setSessionCookie(c, sessionId);
  return c.json({ ok: true });
});

auth.post("/api/logout", async (c) => {
  const sessionId = getCookie(c, "session");
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    deleteCookie(c, "session");
  }
  return c.json({ ok: true });
});

auth.post("/register", async (c) => {
  const { username, email, password } = await c.req.parseBody<{
    username: string;
    email: string;
    password: string;
  }>();

  if (!username || !password) {
    return c.html(<ErrorMessage message="Username and password required." />, 400);
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, ...(email ? [{ email }] : [])] },
  });
  if (existing) {
    return c.html(<ErrorMessage message="Username or email already taken." />, 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { username, email: email || null, passwordHash },
  });

  const sessionId = await createSession(user.id);
  setSessionCookie(c, sessionId);
  return c.redirect("/");
});

auth.post("/login", async (c) => {
  const { username, password } = await c.req.parseBody<{
    username: string;
    password: string;
  }>();

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.passwordHash) {
    return c.html(<ErrorMessage message="Invalid credentials." />, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.html(<ErrorMessage message="Invalid credentials." />, 401);
  }

  const sessionId = await createSession(user.id);
  setSessionCookie(c, sessionId);
  return c.redirect("/");
});

// --- Logout ---
auth.post("/logout", async (c) => {
  const sessionId = getCookie(c, "session");
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    deleteCookie(c, "session");
  }
  return c.redirect("/auth/login");
});

// --- GitHub OAuth ---
auth.get("/github", async (c) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);
  setCookie(c, "oauth_state", state, { httpOnly: true, maxAge: 600 });
  return c.redirect(url.toString());
});

auth.get("/github/callback", async (c) => {
  const { code, state } = c.req.query();
  const storedState = getCookie(c, "oauth_state");

  if (!code || !state || state !== storedState) {
    return c.text("Invalid OAuth state", 400);
  }

  const tokens = await github.validateAuthorizationCode(code);
  const accessToken = tokens.accessToken();

  const githubRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const githubUser = (await githubRes.json()) as { id: number; login: string; email?: string };

  const userId = await findOrCreateOAuthUser(
    "GITHUB",
    String(githubUser.id),
    githubUser.login,
    githubUser.email ?? null
  );

  const sessionId = await createSession(userId);
  setSessionCookie(c, sessionId);
  deleteCookie(c, "oauth_state");
  return c.redirect("/");
});

// --- Google OAuth ---
auth.get("/google", async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ["openid", "profile", "email"]);
  setCookie(c, "oauth_state", state, { httpOnly: true, maxAge: 600 });
  setCookie(c, "code_verifier", codeVerifier, { httpOnly: true, maxAge: 600 });
  return c.redirect(url.toString());
});

auth.get("/google/callback", async (c) => {
  const { code, state } = c.req.query();
  const storedState = getCookie(c, "oauth_state");
  const codeVerifier = getCookie(c, "code_verifier");

  if (!code || !state || state !== storedState || !codeVerifier) {
    return c.text("Invalid OAuth state", 400);
  }

  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const accessToken = tokens.accessToken();

  const googleRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const googleUser = (await googleRes.json()) as { sub: string; name: string; email?: string };

  const baseUsername = googleUser.name.replace(/\s+/g, "_").toLowerCase();
  const userId = await findOrCreateOAuthUser(
    "GOOGLE",
    googleUser.sub,
    baseUsername,
    googleUser.email ?? null
  );

  const sessionId = await createSession(userId);
  setSessionCookie(c, sessionId);
  deleteCookie(c, "oauth_state");
  deleteCookie(c, "code_verifier");
  return c.redirect("/");
});

// --- Helpers ---
async function findOrCreateOAuthUser(
  provider: "GITHUB" | "GOOGLE",
  providerAccountId: string,
  desiredUsername: string,
  email: string | null
): Promise<string> {
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
  });
  if (existing) return existing.userId;

  if (email) {
    const userByEmail = await prisma.user.findUnique({ where: { email } });
    if (userByEmail) {
      await prisma.oAuthAccount.create({
        data: { userId: userByEmail.id, provider, providerAccountId },
      });
      return userByEmail.id;
    }
  }

  let username = desiredUsername;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${desiredUsername}_${suffix++}`;
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      oauthAccounts: { create: { provider, providerAccountId } },
    },
  });
  return user.id;
}

export default auth;
