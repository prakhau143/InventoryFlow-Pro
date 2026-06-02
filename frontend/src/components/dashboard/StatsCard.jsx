import { motion } from "framer-motion";

export default function StatsCard({ icon: Icon, label, value, sub, gradient, iconColor }) {
  return (
    <motion.div
      className={`glass ${gradient}`}
      style={{ padding: 24, borderRadius: "var(--radius)", cursor: "default" }}
      whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.3)" }}
      transition={{ duration: 0.2 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44,
          borderRadius: 12,
          background: iconColor ? `${iconColor}20` : "rgba(99,102,241,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: iconColor || "var(--accent)"
        }}>
          <Icon size={22} />
        </div>
      </div>
      <div style={{ fontSize: "1.75rem", fontWeight: 800, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub}</div>}
    </motion.div>
  );
}
