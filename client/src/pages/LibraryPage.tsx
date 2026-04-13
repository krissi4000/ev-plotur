import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

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
  addedAt: string;
  album: Album;
};

const SORT_OPTIONS = [
  { value: "addedAt", label: "Date Added" },
  { value: "rating", label: "Rating" },
  { value: "title", label: "Title" },
  { value: "artist", label: "Artist" },
  { value: "releaseYear", label: "Release Year" },
  { value: "genre", label: "Genre" },
  { value: "status", label: "Status" },
];

function sortEntries(entries: Entry[], sort: string): Entry[] {
  return [...entries].sort((a, b) => {
    switch (sort) {
      case "rating":      return (b.rating ?? -1) - (a.rating ?? -1);
      case "artist":      return a.album.artist.localeCompare(b.album.artist);
      case "releaseYear": return (b.album.releaseYear ?? 0) - (a.album.releaseYear ?? 0);
      case "genre":       return (a.album.genre ?? "zzz").localeCompare(b.album.genre ?? "zzz");
      case "title":       return a.album.title.localeCompare(b.album.title);
      case "status":      return a.status.localeCompare(b.status);
      default:            return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  });
}

export default function LibraryPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sort, setSort] = useState("addedAt");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/library/api")
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .finally(() => setLoading(false));
  }, []);

  const sorted = sortEntries(entries, sort);
  const listened = entries.filter((e) => e.status === "LISTENED");
  const toListenCount = entries.filter((e) => e.status === "UNLISTENED").length;
  const rated = listened.filter((e) => e.rating !== null);
  const avgRating = rated.length
    ? (rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length).toFixed(1)
    : null;

  return (
    <div>
      <Navbar />
      <h1>My Library</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <section>
            <p>
              Total: {entries.length} · Listened: {listened.length} · To-Listen: {toListenCount}
            </p>
            {avgRating && <p>Average rating: {avgRating} / 10</p>}
          </section>

          <div>
            <label>
              Sort by:{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {sorted.length === 0 ? (
            <p>No albums yet. <Link to="/search">Search for albums</Link> to add some.</p>
          ) : (
            <ul>
              {sorted.map((entry) => (
                <li key={entry.id}>
                  {entry.album.coverArtUrl && (
                    <img
                      src={entry.album.coverArtUrl}
                      alt=""
                      width={50}
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  <Link to={`/library/${entry.id}`}>
                    <strong>{entry.album.title}</strong>
                  </Link>
                  {" — "}
                  {entry.album.artist}
                  {entry.album.releaseYear ? ` (${entry.album.releaseYear})` : ""}
                  {entry.album.genre ? ` · ${entry.album.genre}` : ""}
                  {" · "}
                  {entry.status === "LISTENED"
                    ? entry.rating
                      ? `★ ${entry.rating}/10`
                      : "Listened"
                    : "To-Listen"}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
