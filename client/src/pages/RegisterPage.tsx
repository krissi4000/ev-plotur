import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/auth/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: email || undefined, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Nýskráning mistókst");
      } else {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Nýskráning</h1>
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
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Netfang (valfrjálst)"
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
          {loading ? "Nýskrái..." : "Nýskrá"}
        </button>
      </form>

      <p>
        <Link to="/auth/login">Ertu nú þegar með aðgang?</Link>
      </p>
    </div>
  );
}
