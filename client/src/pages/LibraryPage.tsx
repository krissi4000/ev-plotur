import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
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
  const { loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [sort, setSort] = useState("addedAt");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    fetch("/library/api")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const sorted = sortEntries(entries, sort);
  const listened = entries.filter((e) => e.status === "LISTENED");
  const toListenCount = entries.filter((e) => e.status === "UNLISTENED").length;
  const rated = listened.filter((e) => e.rating !== null);
  const avgRating = rated.length
    ? (rated.reduce((sum, e) => sum + e.rating!, 0) / rated.length).toFixed(1)
    : null;

  if (authLoading) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Mitt safn</h1>
        {loading ? (
          <p className="text-zinc-500">Hleð...</p>
        ) : (
          <>
            <section className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400 mb-4">
              <span>Samtals: {entries.length}</span>
              <span>Hlustað: {listened.length}</span>
              <span>Á að hlusta: {toListenCount}</span>
              {avgRating && <span>Meðaleinkunn: {avgRating}/10</span>}
            </section>

            <div className="mb-6">
              <label className="text-sm text-zinc-400">
                Raða eftir:{" "}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-zinc-100 focus:outline-none focus:border-zinc-500"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {sorted.length === 0 ? (
              <p className="text-zinc-500">
                Engar plötur enn.{" "}
                <Link to="/search" className="text-zinc-300 hover:text-zinc-100 underline">
                  Leitaðu að plötum
                </Link>{" "}
                til að bæta við.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {sorted.map((entry) => (
                  <Link
                    key={entry.id}
                    to={`/library/${entry.id}`}
                    className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-3 hover:border-zinc-700"
                  >
                    {entry.album.coverArtUrl ? (
                      <img
                        src={entry.album.coverArtUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-800 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-zinc-100 font-medium truncate">{entry.album.title}</div>
                      <div className="text-zinc-400 text-sm truncate">
                        {entry.album.artist}
                        {entry.album.releaseYear ? ` · ${entry.album.releaseYear}` : ""}
                        {entry.album.genres.length > 0 ? ` · ${entry.album.genres.join(", ")}` : ""}
                      </div>
                    </div>
                    <span className="text-zinc-500 text-sm shrink-0">
                      {entry.status === "LISTENED"
                        ? entry.rating
                          ? `${entry.rating}/10`
                          : "Hlustað"
                        : "Á að hlusta"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
