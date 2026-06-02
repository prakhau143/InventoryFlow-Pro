import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ifp-user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ifp-token");
    if (token) {
      api.get("/api/auth/me")
        .then((r) => setUser(r.data))
        .catch(() => { logout(); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (tokenData) => {
    localStorage.setItem("ifp-token", tokenData.access_token);
    localStorage.setItem("ifp-user", JSON.stringify({ username: tokenData.username, role: tokenData.role }));
    setUser({ username: tokenData.username, role: tokenData.role });
  };

  const logout = () => {
    localStorage.removeItem("ifp-token");
    localStorage.removeItem("ifp-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
