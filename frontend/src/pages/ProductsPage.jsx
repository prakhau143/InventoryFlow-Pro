import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Plus, Search, Edit2, Trash2, Download, RefreshCw, AlertTriangle, Package } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";
import { productService } from "../services/productService";

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

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

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

  const openCreate = () => { setEditing(null); reset({}); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    reset({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, category: p.category || "", description: p.description || "", low_stock_threshold: p.low_stock_threshold });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, price: parseFloat(data.price), quantity: parseInt(data.quantity), low_stock_threshold: parseInt(data.low_stock_threshold) };
      if (editing) {
        await productService.update(editing.id, payload);
        toast.success("Product updated!");
      } else {
        await productService.create(payload);
        toast.success("Product created!");
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Operation failed");
    } finally { setSubmitting(false); }
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

      <div className="search-bar">
        <div className="search-input-wrap">
          <Search className="icon" size={15} />
          <input className="input" placeholder="Search by name or SKU…" value={search} onChange={(e)=>{setSearch(e.target.value);setPage(1);}} />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }}>
        {loading ? <SkeletonTable rows={5} cols={7} /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><Package size={40}/><h3>No products found</h3><p>Add your first product to get started</p></div></td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    <td><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{p.description?.slice(0,40)}</div></td>
                    <td><span style={{ fontFamily:"monospace", background:"var(--bg-card)", padding:"2px 8px", borderRadius:4, fontSize:"0.8rem" }}>{p.sku}</span></td>
                    <td>{p.category ? <span className="badge badge-muted">{p.category}</span> : "—"}</td>
                    <td><strong>${p.price.toFixed(2)}</strong></td>
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
                      <div style={{ display:"flex", gap:6 }}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>openEdit(p)}><Edit2 size={13}/></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(p.id)}><Trash2 size={13}/></button>
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

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={()=>setModalOpen(false)} title={editing ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              <label className="form-label">Price ($) *</label>
              <input className="input" type="number" step="0.01" min="0" placeholder="0.00" {...register("price",{required:"Required",min:{value:0,message:"Must be ≥ 0"}})}/>
              {errors.price && <p className="form-error">{errors.price.message}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input className="input" type="number" min="0" placeholder="0" {...register("quantity",{required:"Required",min:{value:0,message:"Must be ≥ 0"}})}/>
              {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="select" {...register("category")}>
                <option value="">Select category</option>
                {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Low Stock Threshold</label>
              <input className="input" type="number" min="0" defaultValue={10} {...register("low_stock_threshold")}/>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={()=>setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting?"Saving…":editing?"Update Product":"Create Product"}</button>
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
