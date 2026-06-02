import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Plus, Search, Eye, Trash2, RefreshCw, Download, ShoppingCart, Clock, DollarSign, TrendingUp } from "lucide-react";
import Modal from "../components/ui/Modal";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable, SkeletonCard } from "../components/ui/LoadingSkeleton";
import StatsCard from "../components/dashboard/StatsCard";
import OrdersTrendChart from "../components/charts/OrdersTrendChart";
import { orderService } from "../services/orderService";
import { analyticsService } from "../services/analyticsService";

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
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    analyticsService.orders()
      .then(r => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

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

  // Inline status change directly from the dropdown in the table row
  const handleInlineStatus = async (orderId, currentStatus, nextStatus) => {
    if (nextStatus === currentStatus) return;
    try {
      await orderService.updateStatus(orderId, nextStatus);
      toast.success(`Order #${orderId} → ${nextStatus}`);
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Status update failed"); }
  };

  const STATUS_STYLE = {
    Pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
    Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)"  },
    Completed:  { color: "#10b981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.3)"  },
    Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.3)"   },
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

      {/* ── Analytics: KPIs ── */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {analyticsLoading ? Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>) : <>
          <StatsCard icon={ShoppingCart} label="Total Orders"      value={analytics?.kpis?.total_orders ?? 0}      gradient="grad-purple" iconColor="#6366f1" sub="All time" />
          <StatsCard icon={Clock}        label="Pending Orders"    value={analytics?.kpis?.pending_orders ?? 0}    gradient="grad-amber"  iconColor="#f59e0b" sub="Awaiting action" />
          <StatsCard icon={DollarSign}   label="Total Revenue"     value={`$${(analytics?.kpis?.total_revenue ?? 0).toLocaleString()}`} gradient="grad-green" iconColor="#10b981" sub="Excl. cancelled" />
          <StatsCard icon={TrendingUp}   label="Orders This Month" value={analytics?.kpis?.orders_this_month ?? 0} gradient="grad-cyan"   iconColor="#06b6d4" sub="Current month" />
        </>}
      </div>

      {/* ── Analytics: Charts ── */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Orders Trend — Last 30 Days</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>Daily order volume over the past month</p>
          <div className="chart-card"><OrdersTrendChart data={analytics?.trend ?? []} mode="orders" /></div>
        </motion.div>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Revenue Trend — Last 30 Days</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>Daily revenue from non-cancelled orders</p>
          <div className="chart-card"><OrdersTrendChart data={analytics?.trend ?? []} mode="revenue" /></div>
        </motion.div>
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
              <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th className="hide-mobile">Date</th><th>Actions</th></tr></thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><ShoppingCart size={40}/><h3>No orders found</h3></div></td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td><span style={{fontFamily:"monospace",fontWeight:700,color:"var(--accent)"}}>#{o.id.toString().padStart(4,"0")}</span></td>
                    <td>{o.customer_name || `Customer #${o.customer_id}`}</td>
                    <td><strong>${o.total_amount.toFixed(2)}</strong></td>
                    <td>
                      {/* Inline status dropdown — clearly shows it's changeable */}
                      <select
                        value={o.status}
                        onChange={(e) => handleInlineStatus(o.id, o.status, e.target.value)}
                        style={{
                          background: STATUS_STYLE[o.status]?.bg || "var(--bg-card)",
                          color: STATUS_STYLE[o.status]?.color || "var(--text-primary)",
                          border: `1px solid ${STATUS_STYLE[o.status]?.border || "var(--border)"}`,
                          borderRadius: 20,
                          padding: "4px 10px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          outline: "none",
                          appearance: "auto",
                          minWidth: 120,
                        }}
                        title="Select to change order status"
                      >
                        {["Pending","Processing","Completed","Cancelled"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="hide-mobile" style={{color:"var(--text-muted)",fontSize:"0.8rem"}}>{new Date(o.created_at).toLocaleString()}</td>
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
