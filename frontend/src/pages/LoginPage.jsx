import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Logo from "../components/ui/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", data);
      login(res.data);
      toast.success(`Welcome back, ${res.data.username}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="glass auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo size={68} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg,#00D4FF 0%,#8B5CF6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", marginBottom: 3,
            }}>
              InventoryFlow <span style={{ fontWeight: 400 }}>Pro</span>
            </div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", color: "#00D4FF", opacity: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
              Track · Manage · Grow
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Sign in to your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="input"
              placeholder="Enter username"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && <p className="form-error">{errors.username.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPwd ? "text" : "password"}
                placeholder="Enter password"
                style={{ paddingRight: 44 }}
                {...register("password", { required: "Password is required" })}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex" }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Quick login hint */}
        <div className="glass" style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", marginTop: 16 }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Default credentials</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["admin", "admin123", "admin"], ["manager", "manager123", "manager"]].map(([u, p, role]) => (
              <button
                key={u}
                type="button"
                onClick={() => { reset({ username: u, password: p }); }}
                style={{ textAlign: "left", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", cursor: "pointer" }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{u}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{role} · {p}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>
            Register here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
