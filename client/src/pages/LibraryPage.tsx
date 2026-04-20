import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { LibraryEntry } from "../types";
import { sortEntries } from "../../../src/shared/sort";

const SORT_OPTIONS = [
  { value: "addedAt", label: "Dagsetning" },
  { value: "rating", label: "Einkunn" },
  { value: "title", label: "Titill" },
  { value: "artist", label: "Listamaður" },
  { value: "releaseYear", label: "Útgáfuár" },
  { value: "genre", label: "Tegund" },
  { value: "status", label: "Staða" },
];

export default function LibraryPage() {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
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
      <h1>Mitt safn</h1>
      {loading ? (
        <p>Hleð...</p>
      ) : (
        <>
          <section>
            <p>
              Samtals: {entries.length} · Hlustað: {listened.length} · Á að hlusta: {toListenCount}
            </p>
            {avgRating && <p>Meðaleinkunn: {avgRating} / 10</p>}
          </section>

          <div>
            <label>
              Raða eftir:{" "}
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
            <p>Engar plötur enn. <Link to="/search">Leitaðu að plötum</Link> til að bæta við.</p>
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
                      : "Hlustað"
                    : "Á að hlusta"}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
