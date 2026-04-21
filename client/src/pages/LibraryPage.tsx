import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import useAuth from "../hooks/useAuth";
import useLibraryView from "../hooks/useLibraryView";
import ViewToggle from "../components/library/ViewToggle";
import LibraryGrid from "../components/library/LibraryGrid";
import LibraryTable from "../components/library/LibraryTable";
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
  const [loading, setLoading] = useState(true);
  const { state, setView, setSort, toggleTableSort } = useLibraryView();

  useEffect(() => {
    if (authLoading) return;
    fetch("/library/api")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [authLoading]);

  const sorted = sortEntries(entries, state.sort, state.sortDir);
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
      <div className={`${state.view === "table" ? "max-w-7xl" : "max-w-4xl"} mx-auto px-6`}>
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Safnið mitt</h1>
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

            <div className="mb-6 flex items-center justify-between gap-4">
              {state.view === "grid" ? (
                <label className="text-sm text-zinc-400">
                  Raða eftir:{" "}
                  <select
                    value={state.sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1 text-zinc-100 focus:outline-none focus:border-orange-500"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <span />
              )}
              <ViewToggle value={state.view} onChange={setView} />
            </div>

            {sorted.length === 0 ? (
              <p className="text-zinc-500">
                Engar plötur enn.{" "}
                <Link to="/search" className="text-orange-400 hover:text-orange-300 underline">
                  Leitaðu að plötum
                </Link>{" "}
                til að bæta við.
              </p>
            ) : state.view === "grid" ? (
              <LibraryGrid entries={sorted} />
            ) : (
              <LibraryTable
                entries={sorted}
                sort={state.sort}
                sortDir={state.sortDir}
                onSort={toggleTableSort}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
