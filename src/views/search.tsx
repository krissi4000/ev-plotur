import type { MBReleaseGroup } from "../services/musicbrainz.js";

export function SearchPage() {
  return (
    <html>
      <head>
        <title>Search Albums</title>
        <script src="/static/htmx.min.js"></script>
      </head>
      <body>
        <h1>Search Albums</h1>
        <input
          type="search"
          name="q"
          placeholder="Search for an album..."
          hx-get="/search/results"
          hx-trigger="input changed delay:400ms, search"
          hx-target="#results"
          hx-indicator="#spinner"
          autocomplete="off"
        />
        <span id="spinner" style="display:none"> Searching...</span>
        <div id="results"></div>
      </body>
    </html>
  );
}

export function SearchResults({ albums, query }: { albums: MBReleaseGroup[]; query: string }) {
  if (albums.length === 0) {
    return <p>No results for "{query}".</p>;
  }

  return (
    <ul>
      {albums.map((album) => (
        <li key={album.id}>
          <img
            src={album.coverArtUrl ?? ""}
            alt=""
            width={50}
            onerror="this.style.display='none'"
          />
          <strong>{album.title}</strong> — {album.artist}
          {album.releaseYear ? ` (${album.releaseYear})` : ""}
          {album.genre ? ` · ${album.genre}` : ""}
          <form method="post" action="/library/add" style="display:inline">
            <input type="hidden" name="mbid" value={album.id} />
            <input type="hidden" name="title" value={album.title} />
            <input type="hidden" name="artist" value={album.artist} />
            <input type="hidden" name="artistMbid" value={album.artistMbid ?? ""} />
            <input type="hidden" name="releaseYear" value={String(album.releaseYear ?? "")} />
            <input type="hidden" name="genre" value={album.genre ?? ""} />
            <input type="hidden" name="coverArtUrl" value={album.coverArtUrl ?? ""} />
            <input type="hidden" name="status" value="LISTENED" />
            <button type="submit">+ Add to library</button>
          </form>
          <form method="post" action="/library/add" style="display:inline">
            <input type="hidden" name="mbid" value={album.id} />
            <input type="hidden" name="title" value={album.title} />
            <input type="hidden" name="artist" value={album.artist} />
            <input type="hidden" name="artistMbid" value={album.artistMbid ?? ""} />
            <input type="hidden" name="releaseYear" value={String(album.releaseYear ?? "")} />
            <input type="hidden" name="genre" value={album.genre ?? ""} />
            <input type="hidden" name="coverArtUrl" value={album.coverArtUrl ?? ""} />
            <input type="hidden" name="status" value="UNLISTENED" />
            <button type="submit">+ To-Listen</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
