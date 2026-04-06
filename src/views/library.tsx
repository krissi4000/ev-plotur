type Album = {
  title: string;
  artist: string;
  releaseYear: number | null;
  genre: string | null;
  coverArtUrl: string | null;
};

type Entry = {
  id: string;
  status: string;
  rating: number | null;
  review: string | null;
  addedAt: Date;
  album: Album;
};

type GenreStat = {
  genre: string;
  avg: string;
  count: number;
};

const SORT_OPTIONS = [
  { value: "addedAt", label: "Date Added" },
  { value: "rating", label: "Rating" },
  { value: "artist", label: "Artist" },
  { value: "title", label: "Title" },
  { value: "releaseYear", label: "Release Year" },
  { value: "genre", label: "Genre" },
  { value: "status", label: "Status" },
];

export function LibraryPage({
  username,
  entries,
  listenedCount,
  toListenCount,
  avgRating,
  genreStats,
  sort,
}: {
  username: string;
  entries: Entry[];
  listenedCount: number;
  toListenCount: number;
  avgRating: string | null;
  genreStats: GenreStat[];
  sort: string;
}) {
  return (
    <html>
      <head><title>{username}'s Library</title></head>
      <body>
        <h1>{username}'s Library</h1>
        <a href="/search">Search albums</a>

        <section>
          <p>Total: {entries.length} albums · Listened: {listenedCount} · To-Listen: {toListenCount}</p>
          {avgRating && <p>Average rating: {avgRating} / 10</p>}
          {genreStats.length > 0 && (
            <details>
              <summary>Average rating by genre</summary>
              <ul>
                {genreStats.map((g) => (
                  <li key={g.genre}>{g.genre}: {g.avg} ({g.count} albums)</li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <form method="get" action="/library">
          <label>Sort by: </label>
          <select name="sort" onchange="this.form.submit()">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} selected={sort === o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </form>

        <ul>
          {entries.map((entry) => (
            <li key={entry.id}>
              {entry.album.coverArtUrl && (
                <img
                  src={entry.album.coverArtUrl}
                  alt=""
                  width={50}
                  onerror="this.style.display='none'"
                />
              )}
              <a href={`/library/${entry.id}`}>
                <strong>{entry.album.title}</strong>
              </a>
              {" — "}
              {entry.album.artist}
              {entry.album.releaseYear ? ` (${entry.album.releaseYear})` : ""}
              {entry.album.genre ? ` · ${entry.album.genre}` : ""}
              {" · "}
              {entry.status === "LISTENED"
                ? entry.rating ? `★ ${entry.rating}/10` : "Listened"
                : "To-Listen"}
            </li>
          ))}
        </ul>
      </body>
    </html>
  );
}

export function AlbumDetailPage({ entry, entryId }: { entry: Entry & { review: string | null }; entryId: string }) {
  return (
    <html>
      <head><title>{entry.album.title}</title></head>
      <body>
        <a href="/library">← Back to library</a>
        <div>
          {entry.album.coverArtUrl && (
            <img
              src={entry.album.coverArtUrl}
              alt={entry.album.title}
              width={150}
              onerror="this.style.display='none'"
            />
          )}
          <h1>{entry.album.title}</h1>
          <p>
            {entry.album.artist}
            {entry.album.releaseYear ? ` · ${entry.album.releaseYear}` : ""}
            {entry.album.genre ? ` · ${entry.album.genre}` : ""}
          </p>
        </div>

        <form method="post" action={`/library/${entryId}/update`}>
          <div>
            <label>Status</label>
            <select name="status">
              <option value="LISTENED" selected={entry.status === "LISTENED"}>Listened</option>
              <option value="UNLISTENED" selected={entry.status === "UNLISTENED"}>To-Listen</option>
            </select>
          </div>

          <div>
            <label>Rating (1–10)</label>
            <input
              type="number"
              name="rating"
              min={1}
              max={10}
              value={entry.rating ?? ""}
              placeholder="No rating"
            />
          </div>

          <div>
            <label>Review</label>
            <textarea name="review" rows={5} placeholder="Write something about this album...">
              {entry.review ?? ""}
            </textarea>
          </div>

          <button type="submit">Save</button>
        </form>

        <form method="post" action={`/library/${entryId}/delete`} style="margin-top:1rem">
          <button type="submit" onclick="return confirm('Remove from library?')">
            Remove from library
          </button>
        </form>
      </body>
    </html>
  );
}
