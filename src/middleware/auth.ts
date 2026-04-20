import { createMiddleware } from "hono/factory";
import { getCookie } from "hono/cookie";
import { prisma } from "../db/client.js";
import type { AppVariables } from "../types.js";

// athugar hvort notandi sé innskráður
export const authMiddleware = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const sessionId = getCookie(c, "session");

  if (!sessionId) {
    c.set("userId", null);
    c.set("username", null);
    return next();
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: sessionId } });
    }
    c.set("userId", null);
    c.set("username", null);
    return next();
  }

  c.set("userId", session.user.id);
  c.set("username", session.user.username);
  return next();
});

export const requireAuth = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const userId = c.get("userId");
  if (!userId) {
    if (c.req.path.includes("/api") || c.req.header("accept")?.includes("application/json")) {
      return c.json({ error: "Not authenticated" }, 401);
    }
    return c.redirect("/auth/login");
  }
  return next();
});
