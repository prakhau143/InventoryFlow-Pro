import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Image, Film, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle, Edit2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
// If the URL is already absolute (Cloudinary), use it directly.
// If relative (/uploads/...), prepend the backend API base.
const resolveMedia = (url) =>
  !url ? null : url.startsWith("http") ? url : `${API}${url}`;

function stockBadge(p) {
  if (p.quantity === 0) return <span className="badge badge-danger">Out of Stock</span>;
  if (p.quantity <= p.low_stock_threshold) return <span className="badge badge-warning">Low Stock</span>;
  return <span className="badge badge-success">In Stock</span>;
}

export default function ProductDetailModal({ product, open, onClose, onEdit }) {
  const [mediaTab, setMediaTab] = useState("image");

  useEffect(() => {
    if (open) setMediaTab("image");
  }, [open, product?.id]);

  if (!product) return null;

  const imgSrc = resolveMedia(product.image_url);
  const vidSrc = resolveMedia(product.video_url);

  return (
    <AnimatePresence>
      {open && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal modal-lg"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.22 }}
            style={{ maxWidth: 780 }}
          >
            {/* Header */}
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={20} color="var(--accent)" />
                </div>
                <div>
                  <div className="modal-title">{product.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "monospace" }}>{product.sku}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {onEdit && (
                  <button className="btn btn-secondary btn-sm" onClick={() => { onClose(); onEdit(product); }}>
                    <Edit2 size={13} /> Edit
                  </button>
                )}
                <button className="modal-close" onClick={onClose}><X size={18} /></button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Media Panel */}
              <div>
                {/* Tab switcher */}
                {(imgSrc || vidSrc) && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    {imgSrc && (
                      <button
                        className={`btn btn-sm ${mediaTab === "image" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setMediaTab("image")}
                      >
                        <Image size={13} /> Image
                      </button>
                    )}
                    {vidSrc && (
                      <button
                        className={`btn btn-sm ${mediaTab === "video" ? "btn-primary" : "btn-secondary"}`}
                        onClick={() => setMediaTab("video")}
                      >
                        <Film size={13} /> Video
                      </button>
                    )}
                  </div>
                )}

                {/* Media display */}
                <div
                  className="glass"
                  style={{
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    minHeight: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  {mediaTab === "image" && imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={product.name}
                      style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: "var(--radius)" }}
                    />
                  ) : mediaTab === "video" && vidSrc ? (
                    <video
                      src={vidSrc}
                      controls
                      style={{ width: "100%", maxHeight: 300, borderRadius: "var(--radius)" }}
                    />
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                      {mediaTab === "image" ? <Image size={48} style={{ opacity: 0.3 }} /> : <Film size={48} style={{ opacity: 0.3 }} />}
                      <p style={{ marginTop: 12, fontSize: "0.875rem" }}>
                        No {mediaTab} uploaded
                      </p>
                      <p style={{ fontSize: "0.75rem", marginTop: 4 }}>Edit the product to add one</p>
                    </div>
                  )}
                </div>

                {/* Media status dots */}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: imgSrc ? "var(--success)" : "var(--text-muted)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: imgSrc ? "var(--success)" : "var(--border)" }} />
                    Image {imgSrc ? "uploaded" : "missing"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: vidSrc ? "var(--success)" : "var(--text-muted)" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: vidSrc ? "var(--success)" : "var(--border)" }} />
                    Video {vidSrc ? "uploaded" : "missing"}
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Stock status */}
                <div className="glass" style={{ padding: 16, borderRadius: "var(--radius-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Stock</span>
                    {stockBadge(product)}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontSize: "2rem", fontWeight: 800, color: product.quantity === 0 ? "var(--danger)" : product.quantity <= product.low_stock_threshold ? "var(--warning)" : "var(--success)" }}>
                      {product.quantity}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>units</span>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
                    Low stock threshold: {product.low_stock_threshold}
                  </div>
                </div>

                {/* Price */}
                <div className="glass" style={{ padding: 16, borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Price</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--accent)" }}>
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    ["Category", product.category || "—"],
                    ["SKU", product.sku],
                    ["Created", new Date(product.created_at).toLocaleDateString()],
                    ["Updated", new Date(product.updated_at).toLocaleDateString()],
                  ].map(([label, value]) => (
                    <div key={label} className="glass" style={{ padding: "10px 14px", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="glass" style={{ padding: 14, borderRadius: "var(--radius-sm)" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Description</div>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
