import { Hono } from "hono";
import { searchReleaseGroups } from "../services/musicbrainz.js";
import { requireAuth } from "../middleware/auth.js";
import { SearchPage, SearchResults } from "../views/search.js";

const search = new Hono<{
  Variables: { userId: string | null; username: string | null };
}>();

search.use("*", requireAuth);

search.get("/", (c) => c.html(<SearchPage />));

search.get("/results", async (c) => {
  const q = c.req.query("q")?.trim();

  if (!q || q.length < 2) {
    return c.html(<div></div>);
  }

  try {
    const albums = await searchReleaseGroups(q);
    return c.html(<SearchResults albums={albums} query={q} />);
  } catch {
    return c.html(<p>Search failed. Please try again.</p>);
  }
});

export default search;
