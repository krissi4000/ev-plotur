import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import AlbumCard from "../components/AlbumCard";

type Album = {
  id: string;
  title: string;
  artist: string;
  artistMbid: string | null;
  releaseYear: number | null;
  genre: string | null;
  coverArtUrl: string | null;
  score: number;
};

const PAGE_SIZE = 10;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Album[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [added, setAdded] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOffset(0);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/search/api?q=${encodeURIComponent(query)}&offset=0`);
        const data = await res.json();
        setResults(data);
        setOffset(PAGE_SIZE);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [query]);

  // sækir fleiri niðurstöður með offset
  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/search/api?q=${encodeURIComponent(query)}&offset=${offset}`);
      const data: Album[] = await res.json();
      setResults((prev) => [...prev, ...data]);
      setOffset((prev) => prev + PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  async function addToLibrary(album: Album, status: "LISTENED" | "UNLISTENED") {
    const res = await fetch("/library/api/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mbid: album.id,
        title: album.title,
        artist: album.artist,
        artistMbid: album.artistMbid,
        releaseYear: album.releaseYear,
        genre: album.genre,
        coverArtUrl: album.coverArtUrl,
        status,
      }),
    });
    const data = await res.json();
    if (data.entryId) {
      setAdded((prev) => ({ ...prev, [album.id]: status }));
    }
  }

  return (
    <div>
      <Navbar />
      <h1>Leita að plötum</h1>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Leita að plötu..."
      />
      {loading && <span> Leita...</span>}
      <div>
        {results.map((album) => (
          <div key={album.id}>
            <AlbumCard album={album} />
            {added[album.id] ? (
              <span>
                {added[album.id] === "LISTENED" ? "Bætt í safn" : "Bætt á hlustunarlista"}
              </span>
            ) : (
              <>
                <button onClick={() => addToLibrary(album, "LISTENED")}>+ Bæta í safn</button>
                {" "}
                <button onClick={() => addToLibrary(album, "UNLISTENED")}>+ Á að hlusta</button>
              </>
            )}
          </div>
        ))}
      </div>
      {results.length > 0 && (
        <button onClick={loadMore} disabled={loadingMore}>
          {loadingMore ? "Hleð..." : "Sjá fleiri"}
        </button>
      )}
    </div>
  );
}
