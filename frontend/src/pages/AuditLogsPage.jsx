import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { RefreshCw, Download, Activity } from "lucide-react";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable } from "../components/ui/LoadingSkeleton";
import api from "../services/api";

const ACTION_COLORS = { CREATE: "badge-success", UPDATE: "badge-info", DELETE: "badge-danger" };
const RESOURCE_COLORS = { product: "badge-accent", customer: "badge-warning", order: "badge-info" };

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [resourceFilter, setResourceFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/audit-logs", {
        params: { page, per_page: 20, resource: resourceFilter || undefined, action: actionFilter || undefined }
      });
      setLogs(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load audit logs"); } finally { setLoading(false); }
  }, [page, resourceFilter, actionFilter]);

  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const res = await api.get("/api/export/audit-logs/csv", { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = "audit_logs.csv"; a.click();
    } catch { toast.error("Export failed"); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Audit Logs</h2>
          <p className="page-subtitle">{total} activity records</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCsv}><Download size={14}/> Export CSV</button>
      </div>

      <div className="search-bar" style={{ flexWrap: "wrap" }}>
        <select className="select" style={{ flex: "1 1 130px", minWidth: 0 }} value={resourceFilter} onChange={e => { setResourceFilter(e.target.value); setPage(1); }}>
          <option value="">All Resources</option>
          <option value="product">Product</option>
          <option value="customer">Customer</option>
          <option value="order">Order</option>
        </select>
        <select className="select" style={{ flex: "1 1 120px", minWidth: 0 }} value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}>
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <motion.div className="glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? <SkeletonTable rows={8} cols={6}/> : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th className="hide-mobile">#</th>
                <th>Action</th>
                <th>Resource</th>
                <th className="hide-mobile">Details</th>
                <th className="hide-mobile">User</th>
                <th>Time</th>
              </tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><Activity size={40}/><h3>No audit logs</h3><p>Actions will appear here</p></div></td></tr>
                ) : logs.map((l) => (
                  <tr key={l.id}>
                    <td className="hide-mobile" style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{l.id}</td>
                    <td><span className={`badge ${ACTION_COLORS[l.action] || "badge-muted"}`}>{l.action}</span></td>
                    <td><span className={`badge ${RESOURCE_COLORS[l.resource] || "badge-muted"}`} style={{ textTransform: "capitalize" }}>{l.resource}{l.resource_id ? ` #${l.resource_id}` : ""}</span></td>
                    <td className="hide-mobile" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem", color: "var(--text-secondary)" }}>{l.details}</td>
                    <td className="hide-mobile"><span style={{ color: "var(--accent)", fontWeight: 500 }}>{l.username}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(l.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={pages} onPage={setPage}/>
      </motion.div>
    </div>
  );
}
