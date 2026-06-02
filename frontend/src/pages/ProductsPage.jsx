import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Plus, Search, Edit2, Trash2, Download, RefreshCw, AlertTriangle, Package, Eye, DollarSign, Archive, BoxSelect } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable, SkeletonCard } from "../components/ui/LoadingSkeleton";
import ImageUpload from "../components/ui/ImageUpload";
import ProductDetailModal from "../components/ui/ProductDetailModal";
import StatsCard from "../components/dashboard/StatsCard";
import StockStatusDonut from "../components/charts/StockStatusDonut";
import TopValueBar from "../components/charts/TopValueBar";
import { productService } from "../services/productService";
import { analyticsService } from "../services/analyticsService";
import api from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const resolveMedia = (url) =>
  !url ? null : url.startsWith("http") ? url : `${API_BASE}${url}`;
const CATEGORIES = ["Electronics", "Clothing", "Food", "Furniture", "Books", "Tools", "Other"];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);
  const [pendingImage, setPendingImage] = useState(null);
  const [pendingVideo, setPendingVideo] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    analyticsService.products()
      .then(r => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productService.list({ page, per_page: 10, search: search || undefined });
      setProducts(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load products"); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setPendingImage(null); setPendingVideo(null); reset({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setPendingImage(null);
    setPendingVideo(null);
    reset({ name: p.name, sku: p.sku, price: p.price, cost_price: p.cost_price ?? 0, quantity: p.quantity, category: p.category || "", description: p.description || "", low_stock_threshold: p.low_stock_threshold });
    setModalOpen(true);
  };

  const uploadMedia = async (productId) => {
    if (pendingImage) {
      const fd = new FormData();
      fd.append("file", pendingImage);
      await api.post(`/api/products/${productId}/upload-image`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    }
    if (pendingVideo) {
      const fd = new FormData();
      fd.append("file", pendingVideo);
      await api.post(`/api/products/${productId}/upload-video`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    }
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, price: parseFloat(data.price), cost_price: data.cost_price ? parseFloat(data.cost_price) : 0, quantity: parseInt(data.quantity), low_stock_threshold: parseInt(data.low_stock_threshold) };
      let productId;
      if (editing) {
        await productService.update(editing.id, payload);
        productId = editing.id;
        toast.success("Product updated!");
      } else {
        const res = await productService.create(payload);
        productId = res.data.id;
        toast.success("Product created!");
      }
      if (pendingImage || pendingVideo) {
        setUploadingMedia(true);
        await uploadMedia(productId);
        setUploadingMedia(false);
        toast.success("Media uploaded!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally { setSubmitting(false); setUploadingMedia(false); }
  };

  const handleDelete = async () => {
    try {
      await productService.delete(deleteId);
      toast.success("Product deleted");
      setDeleteId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  const exportCsv = async () => {
    try {
      const res = await productService.exportCsv();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = "products.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed"); }
  };

  const handleViewDetail = async (p) => {
    try {
      const res = await productService.get(p.id);
      setDetailProduct(res.data);
    } catch { setDetailProduct(p); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">{total} products in inventory</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}><Download size={14}/> Export CSV</button>
          <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add Product</button>
        </div>
      </div>

      {/* ── Analytics: KPIs ── */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {analyticsLoading ? Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>) : <>
          <StatsCard icon={Package}       label="Total Products"    value={analytics?.kpis?.total_products ?? 0}     gradient="grad-purple" iconColor="#6366f1" sub="In inventory" />
          <StatsCard icon={DollarSign}    label="Total Stock Value"  value={`$${((analytics?.kpis?.total_stock_value ?? 0)).toLocaleString()}`} gradient="grad-cyan" iconColor="#06b6d4" sub="Price × Quantity" />
          <StatsCard icon={AlertTriangle} label="Low Stock Items"    value={analytics?.kpis?.low_stock_count ?? 0}    gradient="grad-amber" iconColor="#f59e0b" sub="Need restocking" />
          <StatsCard icon={BoxSelect}     label="Out of Stock"       value={analytics?.kpis?.out_of_stock_count ?? 0} gradient="grad-red"   iconColor="#ef4444" sub="Zero quantity" />
        </>}
      </div>

      {/* ── Analytics: Charts ── */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Inventory Status Distribution</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>Current stock health across all products</p>
          <div className="chart-card"><StockStatusDonut data={analytics?.inventory_status ?? []} /></div>
        </motion.div>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Top 10 Most Valuable Products</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>By total stock value (Price × Quantity)</p>
          <div className="chart-card"><TopValueBar data={analytics?.top_valuable ?? []} /></div>
        </motion.div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search className="icon" size={15} />
          <input className="input" placeholder="Search by name or SKU…" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
        {loading ? <SkeletonTable rows={5} cols={8} /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style={{width:56}}>Image</th>
                  <th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><Package size={40}/><h3>No products found</h3><p>Add your first product to get started</p></div></td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    {/* Thumbnail */}
                    <td>
                      {p.image_url ? (
                        <img
                          src={resolveMedia(p.image_url)}
                          alt={p.name}
                          style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", cursor: "pointer", border: "1px solid var(--border)" }}
                          onClick={() => handleViewDetail(p)}
                        />
                      ) : (
                        <div
                          style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(99,102,241,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "1px solid var(--border)" }}
                          onClick={() => handleViewDetail(p)}
                        >
                          <Package size={18} color="var(--accent)" style={{ opacity: 0.5 }} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize:"0.72rem", color:"var(--text-muted)", display:"flex", gap:5, marginTop:2 }}>
                        {p.image_url && <span style={{color:"var(--success)"}}>📷</span>}
                        {p.video_url && <span style={{color:"var(--info)"}}>🎥</span>}
                        {p.description?.slice(0, 36)}
                      </div>
                    </td>
                    <td><span style={{ fontFamily:"monospace", background:"var(--bg-card)", padding:"2px 8px", borderRadius:4, fontSize:"0.8rem" }}>{p.sku}</span></td>
                    <td>{p.category ? <span className="badge badge-muted">{p.category}</span> : "—"}</td>
                    <td>
                      <strong>${p.price.toFixed(2)}</strong>
                      {p.cost_price > 0 && (
                        <div style={{ fontSize:"0.68rem", color:"var(--success)", marginTop:1 }}>
                          margin: ${(p.price - p.cost_price).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        {p.quantity <= p.low_stock_threshold && p.quantity > 0 && <AlertTriangle size={13} color="var(--warning)"/>}
                        <span style={{ color: p.quantity===0?"var(--danger)":p.quantity<=p.low_stock_threshold?"var(--warning)":"inherit" }}>{p.quantity}</span>
                      </div>
                    </td>
                    <td>
                      {p.quantity === 0
                        ? <span className="badge badge-danger">Out of Stock</span>
                        : p.quantity <= p.low_stock_threshold
                          ? <span className="badge badge-warning">Low Stock</span>
                          : <span className="badge badge-success">In Stock</span>
                      }
                    </td>
                    <td>
                      <div style={{ display:"flex", gap:5 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>handleViewDetail(p)} title="View details"><Eye size={13}/></button>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>openEdit(p)} title="Edit"><Edit2 size={13}/></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(p.id)} title="Delete"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage} />
      </motion.div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
        onEdit={(p) => openEdit(p)}
      />

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing ? "Edit Product" : "Add New Product"} size="modal-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* Left column — fields */}
            <div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="input" placeholder="e.g. Wireless Mouse" {...register("name",{required:"Required"})}/>
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input className="input" placeholder="e.g. WM-001" {...register("sku",{required:"Required"})} disabled={!!editing}/>
                  {errors.sku && <p className="form-error">{errors.sku.message}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="textarea" rows={2} placeholder="Optional description" {...register("description")}/>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Selling Price ($) *</label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0.00" {...register("price",{required:"Required",min:{value:0,message:"≥ 0"}})}/>
                  {errors.price && <p className="form-error">{errors.price.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Cost Price ($)
                    <span style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginLeft:6, fontWeight:400 }}>for profit calc</span>
                  </label>
                  <input className="input" type="number" step="0.01" min="0" placeholder="0.00" {...register("cost_price",{min:{value:0,message:"≥ 0"}})}/>
                  {errors.cost_price && <p className="form-error">{errors.cost_price.message}</p>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input className="input" type="number" min="0" placeholder="0" {...register("quantity",{required:"Required",min:{value:0,message:"≥ 0"}})}/>
                  {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="select" {...register("category")}>
                    <option value="">Select category</option>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Low Stock Threshold</label>
                <input className="input" type="number" min="0" defaultValue={10} {...register("low_stock_threshold")}/>
              </div>
            </div>

            {/* Right column — media */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ImageUpload
                currentUrl={editing?.image_url}
                onFile={setPendingImage}
                accept="image/jpeg,image/png,image/webp,image/gif"
                label="Product Image"
                type="image"
              />
              <ImageUpload
                currentUrl={editing?.video_url}
                onFile={setPendingVideo}
                accept="video/mp4,video/webm,video/ogg"
                label="Product Video (Demo / Tutorial)"
                type="video"
              />
              {(pendingImage || pendingVideo) && (
                <div className="glass" style={{ padding: 10, borderRadius: "var(--radius-sm)", fontSize: "0.8rem", color: "var(--warning)" }}>
                  ⚡ Media will be uploaded after saving the product info
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting || uploadingMedia}>
              {uploadingMedia ? "Uploading media…" : submitting ? "Saving…" : editing ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={()=>setDeleteId(null)} title="Delete Product">
        <p style={{ color:"var(--text-secondary)", marginBottom:8 }}>Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
