import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AlbumCard from "../components/AlbumCard";
import type { SearchAlbum } from "../types";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchAlbum[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [added, setAdded] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setPage(1);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/search/api?q=${encodeURIComponent(query)}&page=1`);
        const data = await res.json();
        setResults(data);
        setPage(2);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/search/api?q=${encodeURIComponent(query)}&page=${page}`);
      const data: SearchAlbum[] = await res.json();
      setResults((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }

  async function addToLibrary(album: SearchAlbum, status: "LISTENED" | "UNLISTENED") {
    const res = await fetch("/library/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lastfmKey: album.lastfmKey,
        title: album.title,
        artist: album.artist,
        releaseYear: album.releaseYear,
        genres: album.genres,
        coverArtUrl: album.coverArtUrl,
        status,
      }),
    });
    const data = await res.json();
    if (data.entryId) {
      setAdded((prev) => ({ ...prev, [album.lastfmKey]: status }));
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Leita að plötum</h1>
        <div className="flex items-center gap-3 mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Leita að plötu..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          {loading && <span className="text-zinc-500 text-sm shrink-0">Leita...</span>}
        </div>
        <div className="flex flex-wrap gap-4">
          {results.map((album) => (
            <div key={album.lastfmKey} className="w-44 flex flex-col gap-2">
              <AlbumCard album={album} />
              {added[album.lastfmKey] ? (
                <span className="text-zinc-500 text-xs text-center">
                  {added[album.lastfmKey] === "LISTENED" ? "Bætt í safn" : "Bætt á hlustunarlista"}
                </span>
              ) : (
                <div className="flex gap-1">
                  <button
                    onClick={() => addToLibrary(album, "LISTENED")}
                    className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-1.5"
                  >
                    + Safn
                  </button>
                  <button
                    onClick={() => addToLibrary(album, "UNLISTENED")}
                    className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-1.5"
                  >
                    + Listi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {results.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 rounded-lg px-6 py-2 text-sm"
            >
              {loadingMore ? "Hleð..." : "Sjá fleiri"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
