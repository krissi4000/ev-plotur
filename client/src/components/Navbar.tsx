import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type User = { username: string } | null;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | undefined>(undefined);

  useEffect(() => {
    fetch("/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    await fetch("/auth/api/logout", { method: "POST" });
    navigate("/auth/login");
  }

  return (
    <nav className="flex items-center gap-6 border-b border-zinc-800 px-6 py-4 mb-8">
      <Link to="/" className="text-gradient-orange font-bold text-lg">Plata</Link>
      <Link to="/search" className="text-zinc-400 hover:text-orange-400">Leita</Link>
      <Link to="/library" className="text-zinc-400 hover:text-orange-400">Safn</Link>
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-zinc-400">{user.username}</span>
            <button onClick={logout} className="text-zinc-500 hover:text-orange-400">Útskrá</button>
          </>
        ) : user === null ? (
          <Link to="/auth/login" className="text-zinc-400 hover:text-orange-400">Innskrá</Link>
        ) : null}
      </div>
    </nav>
  );
}
