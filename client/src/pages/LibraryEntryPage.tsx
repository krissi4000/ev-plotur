import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  album: Album;
};

export default function LibraryEntryPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("LISTENED");
  const [rating, setRating] = useState("");
  const [review, setReview] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/library/api/${entryId}`)
      .then((r) => r.json())
      .then((data: Entry) => {
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
    await fetch(`/library/api/${entryId}/update`, {
      method: "POST",
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
    await fetch(`/library/api/${entryId}/delete`, { method: "POST" });
    navigate("/library");
  }

  if (loading) return <div><Navbar /><p>Hleð...</p></div>;
  if (!entry) return <div><Navbar /><p>Fannst ekki.</p></div>;

  return (
    <div>
      <Navbar />
      <p><Link to="/library">← Til baka í safn</Link></p>

      <div>
        {entry.album.coverArtUrl && (
          <img
            src={entry.album.coverArtUrl}
            alt={entry.album.title}
            width={150}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
        <h1>{entry.album.title}</h1>
        <p>
          {entry.album.artist}
          {entry.album.releaseYear ? ` · ${entry.album.releaseYear}` : ""}
          {entry.album.genre ? ` · ${entry.album.genre}` : ""}
        </p>
      </div>

      <form onSubmit={handleUpdate}>
        <div>
          <label>
            Staða:{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="LISTENED">Hlustað</option>
              <option value="UNLISTENED">Á að hlusta</option>
            </select>
          </label>
        </div>

        <div>
          <label>
            Einkunn (1–10):{" "}
            <input
              type="number"
              min={1}
              max={10}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Engin einkunn"
            />
          </label>
        </div>

        <div>
          <label>
            Umsögn:
            <br />
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={5}
              cols={40}
              placeholder="Skrifaðu eitthvað um þessa plötu..."
            />
          </label>
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Vistandi..." : "Vista"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleDelete}>Fjarlægja úr safni</button>
      </div>
    </div>
  );
}
