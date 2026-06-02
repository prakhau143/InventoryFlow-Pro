import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Plus, Search, Eye, Trash2, RefreshCw, Download, ShoppingCart } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";
import { orderService } from "../services/orderService";

const STATUS_COLORS = {
  Pending:    "badge-warning",
  Processing: "badge-info",
  Completed:  "badge-success",
  Cancelled:  "badge-danger",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.list({ page, per_page: 10, status: statusFilter || undefined });
      setOrders(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load orders"); } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    try {
      await orderService.delete(deleteId);
      toast.success("Order cancelled & deleted");
      setDeleteId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Delete failed"); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSubmitting(true);
    try {
      await orderService.updateStatus(statusModal.id, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      setStatusModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Status update failed"); } finally { setSubmitting(false); }
  };

  const exportCsv = async () => {
    try {
      const res = await orderService.exportCsv();
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = "orders.csv"; a.click();
    } catch { toast.error("Export failed"); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{total} total orders</p>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button className="btn btn-secondary btn-sm" onClick={exportCsv}><Download size={14}/> Export CSV</button>
          <button className="btn btn-primary" onClick={()=>navigate("/orders/new")}><Plus size={16}/> New Order</button>
        </div>
      </div>

      <div className="search-bar">
        <select className="select" style={{width:180}} value={statusFilter} onChange={(e)=>{setStatusFilter(e.target.value);setPage(1);}}>
          <option value="">All Statuses</option>
          {["Pending","Processing","Completed","Cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>
        {loading ? <SkeletonTable rows={5} cols={6}/> : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><ShoppingCart size={40}/><h3>No orders found</h3></div></td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{fontFamily:"monospace",fontWeight:700,color:"var(--accent)"}}>#{o.id.toString().padStart(4,"0")}</span></td>
                    <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td>
                      <button
                        className={`badge ${STATUS_COLORS[o.status] || "badge-muted"}`}
                        style={{cursor:"pointer",border:"none",background:"none"}}
                        onClick={()=>{ setStatusModal(o); setNewStatus(o.status); }}
                        title="Click to change status"
                      >
                        {o.status}
                      </button>
                    </td>
                    <td style={{color:"var(--text-muted)",fontSize:"0.8rem"}}>{new Date(o.created_at).toLocaleString()}</td>
                    <td>
                      <div style={{display:"flex",gap:6}}>
                        <button className="btn btn-secondary btn-icon btn-sm" onClick={()=>navigate(`/orders/${o.id}`)}><Eye size={13}/></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDeleteId(o.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage}/>
      </motion.div>

      {/* Status Update Modal */}
      <Modal open={!!statusModal} onClose={()=>setStatusModal(null)} title={`Update Order #${statusModal?.id}`}>
        <div className="form-group">
          <label className="form-label">New Status</label>
          <select className="select" value={newStatus} onChange={e=>setNewStatus(e.target.value)}>
            {["Pending","Processing","Completed","Cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setStatusModal(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={submitting}>{submitting?"Saving…":"Update Status"}</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteId} onClose={()=>setDeleteId(null)} title="Delete Order">
        <p style={{color:"var(--text-secondary)"}}>This will delete the order and restore inventory stock if the order was not already cancelled.</p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={()=>setDeleteId(null)}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete & Restore Stock</button>
        </div>
      </Modal>
    </div>
  );
}
