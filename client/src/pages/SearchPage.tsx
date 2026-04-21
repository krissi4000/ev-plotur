import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AlbumCard from "../components/AlbumCard";
import useAuth from "../hooks/useAuth";
import type { SearchAlbum } from "../types";

export default function SearchPage() {
  const { loading: authLoading } = useAuth();
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
        setResults(Array.isArray(data) ? data : []);
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
      const data = await res.json();
      if (Array.isArray(data)) setResults((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }

  async function addToLibrary(album: SearchAlbum, status: "LISTENED" | "UNLISTENED"): Promise<boolean> {
    try {
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
      if (!res.ok) return false;
      const data = await res.json();
      if (data.entryId) {
        setAdded((prev) => ({ ...prev, [album.lastfmKey]: status }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  if (authLoading) return null;

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
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        {loading && results.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800">
                <div className="w-full h-full skeleton-shimmer" />
                <div className="absolute bottom-0 left-0 p-4 flex flex-col gap-2">
                  <div className="h-3.5 w-24 bg-zinc-700 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-16 bg-zinc-800 rounded-full skeleton-shimmer" />
                  <div className="h-3 w-10 bg-zinc-800 rounded-full skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {results.map((album) => (
              <AlbumCard
                key={album.lastfmKey}
                album={album}
                onAdd={(status) => addToLibrary(album, status)}
                added={!!added[album.lastfmKey]}
              />
            ))}
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-6 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-orange-400 rounded-lg px-6 py-2 text-sm"
            >
              {loadingMore ? "Hleð..." : "Sjá fleiri"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
