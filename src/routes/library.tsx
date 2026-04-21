import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db/client.js";
import type { AppVariables } from "../types.js";

const library = new Hono<{ Variables: AppVariables }>();

library.use("*", requireAuth);

interface AlbumInput {
  lastfmKey: string;
  title: string;
  artist: string;
  releaseYear?: number | string | null;
  genres?: string[];
  coverArtUrl?: string | null;
  status?: string;
}

async function addAlbumToLibrary(userId: string, data: AlbumInput) {
  const releaseYear = typeof data.releaseYear === "string"
    ? (data.releaseYear ? parseInt(data.releaseYear, 10) : null)
    : (data.releaseYear ?? null);
  const validYear = typeof releaseYear === "number" && !isNaN(releaseYear) ? releaseYear : null;

  const album = await prisma.album.upsert({
    where: { lastfmKey: data.lastfmKey },
    create: {
      lastfmKey: data.lastfmKey,
      title: data.title,
      artist: data.artist,
      releaseYear: validYear,
      genres: data.genres ?? [],
      coverArtUrl: data.coverArtUrl || null,
    },
    update: {
      title: data.title,
      artist: data.artist,
      releaseYear: validYear,
      genres: data.genres ?? [],
      coverArtUrl: data.coverArtUrl || null,
    },
  });

  const status = data.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED";

  return prisma.libraryEntry.upsert({
    where: { userId_albumId: { userId, albumId: album.id } },
    create: { userId, albumId: album.id, status },
    update: { status },
  });
}

// skilar öllum plötum notandans úr gagnagrunni
// GET /library/api — JSON list of library entries
library.get("/api", async (c) => {
  const userId = c.get("userId")!;
  const entries = await prisma.libraryEntry.findMany({
    where: { userId },
    include: { album: true },
    orderBy: { addedAt: "desc" },
  });
  return c.json(entries);
});

// GET /library/api/:entryId — JSON single entry
library.get("/api/:entryId", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();
  const entry = await prisma.libraryEntry.findFirst({
    where: { id: entryId, userId },
    include: { album: true },
  });
  if (!entry) return c.json({ error: "Not found" }, 404);
  return c.json(entry);
});

// POST /library/api/add — JSON add album to library
library.post("/api/add", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.json().catch(() => null);
  if (!body || typeof body.lastfmKey !== "string" || typeof body.title !== "string" || typeof body.artist !== "string") {
    return c.json({ error: "Invalid request body" }, 400);
  }
  const entry = await addAlbumToLibrary(userId, body);
  return c.json({ entryId: entry.id });
});

// PATCH /library/api/:entryId — JSON update entry
library.patch("/api/:entryId", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Invalid request body" }, 400);

  const entry = await prisma.libraryEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) return c.json({ error: "Not found" }, 404);

  const status = typeof body.status === "string" && body.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED";
  const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 10 ? body.rating : null;
  const review = typeof body.review === "string" ? body.review.trim() || null : null;

  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: { status, rating, review },
  });

  return c.json({ ok: true });
});

// DELETE /library/api/:entryId — JSON delete entry
library.delete("/api/:entryId", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();
  await prisma.libraryEntry.deleteMany({ where: { id: entryId, userId } });
  return c.json({ ok: true });
});

export default library;
