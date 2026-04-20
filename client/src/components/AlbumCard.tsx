type Album = {
  id: string;
  title: string;
  artist: string;
  releaseYear?: number | null;
  genre?: string | null;
  coverArtUrl?: string | null;
};

async function fetchItunesArtwork(title: string, artist: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${q}&entity=album&limit=1`);
    const data = await res.json();
    const url = data.results?.[0]?.artworkUrl100;
    return url ? url.replace("100x100", "600x600") : null;
  } catch {
    return null;
  }
}

export default function AlbumCard({ album }: { album: Album }) {
  return (
    <div className="rounded-3xl overflow-hidden bg-zinc-900 flex flex-col border border-zinc-700 shadow-md shadow-black/40">
      {album.coverArtUrl ? (
        <img
          src={album.coverArtUrl}
          alt={album.title}
          className="w-full aspect-square object-cover"
          onError={async (e) => {
            const img = e.currentTarget;
            const fallback = await fetchItunesArtwork(album.title, album.artist);
            if (fallback) {
              img.src = fallback;
            } else {
              img.style.display = "none";
              img.nextElementSibling?.removeAttribute("style");
            }
          }}
        />
      ) : null}
      <div
        className="w-full aspect-square bg-zinc-800"
        style={album.coverArtUrl ? { display: "none" } : undefined}
      />
      <div className="flex flex-col gap-1 p-4">
        <span className="text-zinc-100 font-semibold leading-tight">{album.title}</span>
        <span className="text-zinc-400 text-sm">{album.artist}</span>
        {(album.releaseYear || album.genre) && (
          <span className="text-zinc-500 text-xs">
            {[album.releaseYear, album.genre].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
    </div>
  );
}
