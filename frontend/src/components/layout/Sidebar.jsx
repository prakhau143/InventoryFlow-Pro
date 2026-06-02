import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  LogOut, X, Activity, History
} from "lucide-react";
import Logo from "../ui/Logo";

const navItems = [
  { to: "/dashboard",          icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products",           icon: Package,          label: "Products" },
  { to: "/customers",          icon: Users,            label: "Customers" },
  { to: "/orders",             icon: ShoppingCart,     label: "Orders" },
  { to: "/inventory-history",  icon: History,          label: "Stock History" },
  { to: "/audit-logs",         icon: Activity,         label: "Audit Logs" },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:199}} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Premium logo mark + wordmark */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <Logo size={36} />
              <div style={{ overflow: "hidden" }}>
                <div style={{
                  fontSize: "0.9rem", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1,
                  background: "linear-gradient(135deg,#00D4FF 0%,#8B5CF6 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text", whiteSpace: "nowrap",
                }}>
                  InventoryFlow
                </div>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", color: "#00D4FF", opacity: 0.5, textTransform: "uppercase" }}>
                  Pro Edition
                </div>
              </div>
            </div>
            <button className="btn-icon btn-secondary" onClick={onClose} style={{display:"none"}} id="sidebar-close">
              <X size={16} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{user?.username}</div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-danger btn-sm" style={{ width: "100%" }} onClick={handleLogout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
