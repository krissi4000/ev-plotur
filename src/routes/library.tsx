import { Hono } from "hono";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db/client.js";
import { LibraryPage, AlbumDetailPage } from "../views/library.js";

const library = new Hono<{
  Variables: { userId: string | null; username: string | null };
}>();

library.use("*", requireAuth);

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
  const body = await c.req.json<{
    mbid: string;
    title: string;
    artist: string;
    artistMbid?: string;
    releaseYear?: number | null;
    genre?: string | null;
    coverArtUrl?: string | null;
    status?: string;
  }>();

  const album = await prisma.album.upsert({
    where: { mbid: body.mbid },
    create: {
      mbid: body.mbid,
      title: body.title,
      artist: body.artist,
      artistMbid: body.artistMbid || null,
      releaseYear: body.releaseYear ?? null,
      genre: body.genre || null,
      coverArtUrl: body.coverArtUrl || null,
    },
    update: {},
  });

  const status = body.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED";

  const entry = await prisma.libraryEntry.upsert({
    where: { userId_albumId: { userId, albumId: album.id } },
    create: { userId, albumId: album.id, status },
    update: { status },
  });

  return c.json({ entryId: entry.id });
});

// POST /library/api/:entryId/update — JSON update entry
library.post("/api/:entryId/update", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();
  const body = await c.req.json<{ status: string; rating: number | null; review: string }>();

  const entry = await prisma.libraryEntry.findFirst({ where: { id: entryId, userId } });
  if (!entry) return c.json({ error: "Not found" }, 404);

  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: {
      status: body.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED",
      rating: body.rating !== null && body.rating >= 1 && body.rating <= 10 ? body.rating : null,
      review: body.review?.trim() || null,
    },
  });

  return c.json({ ok: true });
});

// POST /library/api/:entryId/delete — JSON delete entry
library.post("/api/:entryId/delete", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();

  await prisma.libraryEntry.deleteMany({ where: { id: entryId, userId } });

  return c.json({ ok: true });
});

// GET /library — library overview with sorting and stats
library.get("/", async (c) => {
  const userId = c.get("userId")!;
  const username = c.get("username")!;
  const sortBy = c.req.query("sort") ?? "addedAt";

  const entries = await prisma.libraryEntry.findMany({
    where: { userId },
    include: { album: true },
  });

  const validSorts = ["addedAt", "rating", "artist", "releaseYear", "genre", "title", "status"];
  const sort = validSorts.includes(sortBy) ? sortBy : "addedAt";

  const sorted = [...entries].sort((a, b) => {
    switch (sort) {
      case "rating":       return (b.rating ?? -1) - (a.rating ?? -1);
      case "artist":       return a.album.artist.localeCompare(b.album.artist);
      case "releaseYear":  return (b.album.releaseYear ?? 0) - (a.album.releaseYear ?? 0);
      case "genre":        return (a.album.genre ?? "zzz").localeCompare(b.album.genre ?? "zzz");
      case "title":        return a.album.title.localeCompare(b.album.title);
      case "status":       return a.status.localeCompare(b.status);
      default:             return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });

  const listened = entries.filter((e) => e.status === "LISTENED");
  const toListenCount = entries.filter((e) => e.status === "UNLISTENED").length;
  const rated = listened.filter((e) => e.rating !== null);
  const avgRating = rated.length
    ? (rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length).toFixed(1)
    : null;

  const genreMap = new Map<string, number[]>();
  for (const e of listened) {
    if (e.album.genre && e.rating !== null) {
      const list = genreMap.get(e.album.genre) ?? [];
      list.push(e.rating);
      genreMap.set(e.album.genre, list);
    }
  }
  const genreStats = [...genreMap.entries()]
    .map(([genre, ratings]) => ({
      genre,
      avg: (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1),
      count: ratings.length,
    }))
    .sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));

  return c.html(
    <LibraryPage
      username={username}
      entries={sorted}
      listenedCount={listened.length}
      toListenCount={toListenCount}
      avgRating={avgRating}
      genreStats={genreStats}
      sort={sort}
    />
  );
});

// POST /library/add — called from search results
library.post("/add", async (c) => {
  const userId = c.get("userId")!;
  const body = await c.req.parseBody<{
    mbid: string;
    title: string;
    artist: string;
    artistMbid: string;
    releaseYear: string;
    genre: string;
    coverArtUrl: string;
    status?: string;
  }>();

  const album = await prisma.album.upsert({
    where: { mbid: body.mbid },
    create: {
      mbid: body.mbid,
      title: body.title,
      artist: body.artist,
      artistMbid: body.artistMbid || null,
      releaseYear: body.releaseYear ? parseInt(body.releaseYear) : null,
      genre: body.genre || null,
      coverArtUrl: body.coverArtUrl || null,
    },
    update: {},
  });

  const status = body.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED";

  await prisma.libraryEntry.upsert({
    where: { userId_albumId: { userId, albumId: album.id } },
    create: { userId, albumId: album.id, status },
    update: { status },
  });

  return c.redirect("/library");
});

// GET /library/:entryId — album detail + edit form
library.get("/:entryId", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();

  const entry = await prisma.libraryEntry.findFirst({
    where: { id: entryId, userId },
    include: { album: true },
  });

  if (!entry) return c.text("Not found", 404);

  return c.html(<AlbumDetailPage entry={entry} entryId={entryId} />);
});

// POST /library/:entryId/update
library.post("/:entryId/update", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();
  const body = await c.req.parseBody<{
    status: string;
    rating: string;
    review: string;
  }>();

  const entry = await prisma.libraryEntry.findFirst({
    where: { id: entryId, userId },
  });
  if (!entry) return c.text("Not found", 404);

  const rating = body.rating ? parseInt(body.rating) : null;

  await prisma.libraryEntry.update({
    where: { id: entryId },
    data: {
      status: body.status === "UNLISTENED" ? "UNLISTENED" : "LISTENED",
      rating: rating !== null && rating >= 1 && rating <= 10 ? rating : null,
      review: body.review?.trim() || null,
    },
  });

  return c.redirect(`/library/${entryId}`);
});

// POST /library/:entryId/delete
library.post("/:entryId/delete", async (c) => {
  const userId = c.get("userId")!;
  const { entryId } = c.req.param();

  await prisma.libraryEntry.deleteMany({
    where: { id: entryId, userId },
  });

  return c.redirect("/library");
});

export default library;
