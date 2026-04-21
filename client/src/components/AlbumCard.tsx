import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Album } from "../types";

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

type CardState = "idle" | "menu" | "confirmed";

export default function AlbumCard({
  album,
  onAdd,
  added,
  linkTo,
  linkState,
}: {
  album: Album;
  onAdd?: (status: "LISTENED" | "UNLISTENED") => Promise<boolean>;
  added?: boolean;
  linkTo?: string;
  linkState?: unknown;
}) {
  const [imgSrc, setImgSrc] = useState(album.coverArtUrl);
  const [triedFallback, setTriedFallback] = useState(false);
  const [state, setState] = useState<CardState>("idle");
  const timerRef = useRef<number>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function handleImageError() {
    if (!triedFallback) {
      setTriedFallback(true);
      const fallback = await fetchItunesArtwork(album.title, album.artist);
      if (fallback) {
        setImgSrc(fallback);
        return;
      }
    }
    setImgSrc(null);
  }

  function openMenu() {
    setState("menu");
    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setState("idle"), 4000);
  }

  function handleCardClick() {
    if (added || !onAdd || state !== "idle") return;
    openMenu();
  }

  function handlePlusClick(e: React.MouseEvent) {
    e.stopPropagation();
    openMenu();
  }

  async function handleAdd(status: "LISTENED" | "UNLISTENED") {
    clearTimeout(timerRef.current);
    const ok = await onAdd?.(status);
    if (ok) {
      setState("confirmed");
      timerRef.current = window.setTimeout(() => setState("idle"), 1500);
    } else {
      setState("idle");
    }
  }

  const clickable = !linkTo && !added && !!onAdd;
  const rootClass =
    "relative aspect-square rounded-3xl overflow-hidden bg-zinc-900 group transition-transform duration-200 ease-out hover:scale-110 hover:z-10 hover:shadow-2xl hover:shadow-black/60" +
    (clickable ? " cursor-pointer" : "");

  const content = (
    <>
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={album.title}
          className={`w-full h-full object-cover transition-[filter] duration-300 ${state === "menu" ? "blur-sm brightness-50" : ""}`}
          onError={handleImageError}
        />
      ) : (
        <div className={`w-full h-full bg-zinc-800 transition-[filter] duration-300 ${state === "menu" ? "blur-sm brightness-50" : ""}`} />
      )}

      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

      <div className="absolute bottom-0 left-0 p-4 flex flex-col gap-0.5">
        <span className="text-white font-semibold text-sm leading-tight drop-shadow-lg truncate">{album.title}</span>
        <span className="text-white/80 text-xs drop-shadow-lg">{album.artist}</span>
        {album.releaseYear && (
          <span className="text-white/60 text-xs drop-shadow-lg">{album.releaseYear}</span>
        )}
      </div>

      {!linkTo && state === "idle" && !added && onAdd && (
        <button
          onClick={handlePlusClick}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center text-zinc-900 text-xl font-bold opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-200 cursor-pointer hover:!text-orange-400 hover:!bg-zinc-900 hover:border hover:border-orange-400"
          style={{ background: "var(--gradient-orange)" }}
        >
          +
        </button>
      )}

      {!linkTo && state === "menu" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <button
            onClick={() => handleAdd("LISTENED")}
            className="text-white font-medium text-sm hover:text-orange-400 transition-colors drop-shadow-lg cursor-pointer"
          >
            Bæta í safn
          </button>
          <button
            onClick={() => handleAdd("UNLISTENED")}
            className="text-white/70 font-medium text-sm hover:text-orange-400 transition-colors drop-shadow-lg cursor-pointer"
          >
            Hlusta seinna
          </button>
        </div>
      )}

      {!linkTo && state === "confirmed" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="text-white font-medium text-sm drop-shadow-lg">✓ Plata bætt</span>
        </div>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} state={linkState} className={`${rootClass} block`}>
        {content}
      </Link>
    );
  }

  return <div className={rootClass} onClick={handleCardClick}>{content}</div>;
}
