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
    <nav>
      <Link to="/">Heim</Link>
      {" | "}
      <Link to="/search">Leita</Link>
      {" | "}
      <Link to="/library">Safn</Link>
      {user ? (
        <>
          {" | "}
          <span>{user.username}</span>
          {" "}
          <button onClick={logout}>Útskrá</button>
        </>
      ) : user === null ? (
        <>
          {" | "}
          <Link to="/auth/login">Innskrá</Link>
        </>
      ) : null}
    </nav>
  );
}
