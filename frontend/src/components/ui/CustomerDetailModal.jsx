import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Phone, MapPin, FileText, ShoppingCart, DollarSign, Calendar, CheckCircle, XCircle, Clock, Activity } from "lucide-react";
import { customerService } from "../../services/customerService";

export default function CustomerDetailModal({ customer, onClose, onEdit }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customer) return;
    setLoading(true);
    customerService.get(customer.id)
      .then(res => setDetail(res.data))
      .catch(() => setDetail(customer))
      .finally(() => setLoading(false));
  }, [customer]);

  if (!customer) return null;

  const statusColor = { Pending: "#f59e0b", Processing: "#3b82f6", Completed: "#10b981", Cancelled: "#ef4444" };
  const statusIcon = { Pending: Clock, Processing: Activity, Completed: CheckCircle, Cancelled: XCircle };

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 300 }}
          className="glass"
          style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", borderRadius: "var(--radius)", padding: 0, margin: 16 }}
        >
          {/* Header */}
          <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: "1.3rem", flexShrink: 0 }}>
                {customer.full_name[0].toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: 4 }}>{customer.full_name}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 600,
                      background: customer.is_active ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: customer.is_active ? "var(--success)" : "var(--danger)",
                      border: `1px solid ${customer.is_active ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: customer.is_active ? "var(--success)" : "var(--danger)", display: "inline-block" }} />
                    {customer.is_active ? "Active" : "Inactive"}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    Customer #{customer.id}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { onClose(); onEdit(customer); }}
                style={{ flexShrink: 0 }}
              >
                Edit
              </button>
              <button
                className="btn-icon btn-secondary"
                onClick={onClose}
                style={{ background: "none", border: "1px solid var(--border)", borderRadius: 8, padding: 6, cursor: "pointer", color: "var(--text-muted)" }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", margin: "20px 0 0" }} />

          {/* Stats row */}
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>Loading details…</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "20px 24px 0" }}>
                <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(99,102,241,0.15)", borderRadius: 8, padding: 8, display: "flex" }}>
                    <ShoppingCart size={16} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{detail?.total_orders ?? 0}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Orders</div>
                  </div>
                </div>
                <div style={{ background: "var(--bg-card)", borderRadius: 10, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: 8, padding: 8, display: "flex" }}>
                    <DollarSign size={16} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>${(detail?.total_spent ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Spent</div>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ padding: "20px 24px 0" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Contact Information
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <InfoRow icon={Mail} label="Email" value={detail?.email} accent />
                  <InfoRow icon={Phone} label="Phone" value={detail?.phone || "—"} />
                  <InfoRow icon={MapPin} label="Address" value={detail?.address || "—"} />
                  <InfoRow icon={Calendar} label="Joined" value={new Date(detail?.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
                  {detail?.notes && <InfoRow icon={FileText} label="Notes" value={detail.notes} />}
                </div>
              </div>

              {/* Recent Orders */}
              {detail?.recent_orders?.length > 0 && (
                <div style={{ padding: "20px 24px 0" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                    Recent Orders
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {detail.recent_orders.map(o => {
                      const Icon = statusIcon[o.status] || Clock;
                      return (
                        <div key={o.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-card)", borderRadius: 8, padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Icon size={14} color={statusColor[o.status]} />
                            <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>Order #{o.id}</span>
                            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{new Date(o.created_at).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColor[o.status] }}>{o.status}</span>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>${parseFloat(o.total_amount).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <div style={{ height: 24 }} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ marginTop: 1, flexShrink: 0 }}>
        <Icon size={14} color="var(--text-muted)" />
      </div>
      <div>
        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 1 }}>{label}</span>
        <span style={{ fontSize: "0.875rem", color: accent ? "var(--accent)" : "var(--text-primary)", wordBreak: "break-word" }}>{value}</span>
      </div>
    </div>
  );
}
