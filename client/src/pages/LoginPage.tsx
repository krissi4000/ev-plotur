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
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Innskráning mistókst");
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Innskráning</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Notendanafn"
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Lykilorð"
            required
          />
        </div>
        {error && <p>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Skrái inn..." : "Innskrá"}
        </button>
      </form>

      <div>
        <a href="/auth/github">Innskrá með GitHub</a>
        <br />
        <a href="/auth/google">Innskrá með Google</a>
      </div>

      <p>
        <Link to="/auth/register">Búa til aðgang</Link>
      </p>
    </div>
  );
}
