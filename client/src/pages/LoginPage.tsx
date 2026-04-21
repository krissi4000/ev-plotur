import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/auth/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Innskráning mistókst");
      } else {
        navigate("/");
      }
    } catch {
      setError("Innskráning mistókst");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-100 mb-6 text-center">Innskráning</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Notendanafn"
            required
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lykilorð"
            required
            className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-2"
          >
            {loading ? "Skrái inn..." : "Innskrá"}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-6">
          <a
            href="/auth/github"
            className="block text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm"
          >
            Innskrá með GitHub
          </a>
          <a
            href="/auth/google"
            className="block text-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-sm"
          >
            Innskrá með Google
          </a>
        </div>

        <p className="text-center mt-6">
          <Link to="/auth/register" className="text-zinc-400 hover:text-orange-400 text-sm">
            Búa til aðgang
          </Link>
        </p>
      </div>
    </div>
  );
}
