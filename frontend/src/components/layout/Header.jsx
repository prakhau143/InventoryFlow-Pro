import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Moon, Sun, Menu, Bell } from "lucide-react";

export default function Header({ onMenuToggle, title }) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          className="btn-icon btn-secondary mobile-menu-btn"
          onClick={onMenuToggle}
        >
          <Menu size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h1>
        </div>
      </div>

      <div className="topbar-right">
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
      </div>
    </header>
  );
}
