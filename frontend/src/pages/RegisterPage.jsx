import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../services/api";
import Logo from "../components/ui/Logo";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/api/auth/register", { username: data.username, email: data.email, password: data.password, role: data.role });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="glass auth-card"
        style={{ maxWidth: 460 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-logo">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <Logo size={60} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg,#00D4FF 0%,#8B5CF6 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", marginBottom: 3,
            }}>
              InventoryFlow <span style={{ fontWeight: 400 }}>Pro</span>
            </div>
            <div style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.22em", color: "#00D4FF", opacity: 0.5, textTransform: "uppercase", marginBottom: 6 }}>
              Track · Manage · Grow
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Create your account</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="input" placeholder="johndoe" {...register("username", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })} />
              {errors.username && <p className="form-error">{errors.username.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="select" {...register("role")}>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="you@company.com" {...register("email", { required: "Required" })} />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.875rem", color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
