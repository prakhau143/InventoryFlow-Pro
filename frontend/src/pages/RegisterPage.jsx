import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import api from "../services/api";

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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ background: "linear-gradient(135deg,#6366f1,#06b6d4)", borderRadius: 10, padding: 8, display: "flex" }}>
              <Zap size={22} color="#fff" />
            </div>
          </div>
          <h1>InventoryFlow Pro</h1>
          <p>Create your account</p>
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
