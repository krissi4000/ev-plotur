import { Hono } from "hono";
import { searchAlbums } from "../services/lastfm.js";
import { requireAuth } from "../middleware/auth.js";
import { SearchPage, SearchResults } from "../views/search.js";
import type { AppVariables } from "../types.js";

const search = new Hono<{ Variables: AppVariables }>();

search.use("*", requireAuth);

search.get("/", (c) => c.html(<SearchPage />));

search.get("/results", async (c) => {
  const q = c.req.query("q")?.trim();

  if (!q || q.length < 2) {
    return c.html(<div></div>);
  }

  try {
    const albums = await searchAlbums(q);
    return c.html(<SearchResults albums={albums} query={q} />);
  } catch {
    return c.html(<p>Search failed. Please try again.</p>);
  }
});

search.get("/api", async (c) => {
  const q = c.req.query("q")?.trim();
  const page = parseInt(c.req.query("page") ?? "1", 10);

  if (!q || q.length < 2) {
    return c.json([]);
  }

  try {
    const albums = await searchAlbums(q, 10, page);
    return c.json(albums);
  } catch {
    return c.json({ error: "Search failed" }, 500);
  }
});

export default search;
