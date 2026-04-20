import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { LibraryEntry } from "../types";

export default function LibraryEntryPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<LibraryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("LISTENED");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/library/api/${entryId}`)
      .then((r) => r.json())
      .then((data: LibraryEntry) => {
        setEntry(data);
        setStatus(data.status);
        setRating(data.rating !== null ? String(data.rating) : "");
        setReview(data.review ?? "");
      })
      .finally(() => setLoading(false));
  }, [entryId]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/library/api/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rating: rating ? Number(rating) : null,
        review,
      }),
    });
    setSaving(false);
    navigate("/library");
  }

  async function handleDelete() {
    if (!confirm("Fjarlægja plötu úr safni?")) return;
    await fetch(`/library/api/${entryId}`, { method: "DELETE" });
    navigate("/library");
  }

  if (loading) return <div className="min-h-screen"><Navbar /><p className="text-zinc-500 px-6">Hleð...</p></div>;
  if (!entry) return <div className="min-h-screen"><Navbar /><p className="text-zinc-500 px-6">Fannst ekki.</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6">
        <p className="mb-6">
          <Link to="/library" className="text-zinc-400 hover:text-zinc-100 text-sm">← Til baka í safn</Link>
        </p>

        <div className="flex gap-6 mb-8">
          {entry.album.coverArtUrl ? (
            <img
              src={entry.album.coverArtUrl}
              alt={entry.album.title}
              className="w-36 h-36 rounded-2xl object-cover shrink-0"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          ) : (
            <div className="w-36 h-36 rounded-2xl bg-zinc-800 shrink-0" />
          )}
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-zinc-100">{entry.album.title}</h1>
            <p className="text-zinc-400 mt-1">
              {entry.album.artist}
              {entry.album.releaseYear ? ` · ${entry.album.releaseYear}` : ""}
              {entry.album.genres.length > 0 ? ` · ${entry.album.genres.join(", ")}` : ""}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Staða</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-500"
            >
              <option value="LISTENED">Hlustað</option>
              <option value="UNLISTENED">Á að hlusta</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Einkunn (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Engin einkunn"
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-zinc-400">Umsögn</span>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              placeholder="Skrifaðu eitthvað um þessa plötu..."
              className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 resize-y"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="bg-zinc-100 text-zinc-900 font-medium rounded-lg py-2 hover:bg-white disabled:opacity-50"
          >
            {saving ? "Vistandi..." : "Vista"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-800">
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            Fjarlægja úr safni
          </button>
        </div>
      </div>
    </div>
  );
}
