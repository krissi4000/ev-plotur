import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = { username: string };

export default function useAuth() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/auth/me")
      .then((r) => {
        if (!r.ok) {
          navigate("/auth/login", { replace: true });
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => navigate("/auth/login", { replace: true }))
      .finally(() => setLoading(false));
  }, [navigate]);

  return { user, loading };
}
