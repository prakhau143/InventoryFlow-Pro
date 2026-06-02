import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { RefreshCw, TrendingUp, TrendingDown, History, Activity, AlertTriangle } from "lucide-react";
import Pagination from "../components/ui/Pagination";
import { SkeletonTable, SkeletonCard } from "../components/ui/LoadingSkeleton";
import StatsCard from "../components/dashboard/StatsCard";
import StockMovementLine from "../components/charts/StockMovementLine";
import LowStockRiskBar from "../components/charts/LowStockRiskBar";
import { analyticsService } from "../services/analyticsService";
import api from "../services/api";

export default function InventoryHistoryPage() {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    analyticsService.inventory()
      .then(r => setAnalytics(r.data))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/inventory-history", { params: { page, per_page: 20 } });
      setRecords(res.data.items);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error("Failed to load inventory history"); } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Stock History</h2>
          <p className="page-subtitle">{total} stock movement records</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      {/* ── Analytics: KPIs ── */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        {analyticsLoading ? Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>) : <>
          <StatsCard icon={Activity}      label="Total Movements"  value={analytics?.kpis?.total_movements ?? 0} gradient="grad-purple" iconColor="#6366f1" sub="All time events" />
          <StatsCard icon={TrendingUp}    label="Total Stock Added" value={analytics?.kpis?.total_added ?? 0}    gradient="grad-green"  iconColor="#10b981" sub="Units received" />
          <StatsCard icon={TrendingDown}  label="Stock Removed"     value={analytics?.kpis?.total_removed ?? 0}  gradient="grad-red"    iconColor="#ef4444" sub="Units consumed / sold" />
          <StatsCard icon={AlertTriangle} label="Low Stock Products" value={analytics?.kpis?.low_stock_count ?? 0} gradient="grad-amber" iconColor="#f59e0b" sub="Below threshold" />
        </>}
      </div>

      {/* ── Analytics: Charts ── */}
      <div className="charts-grid" style={{ marginBottom: 20 }}>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Inventory Movement — Last 30 Days</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>Stock added vs removed daily</p>
          <div className="chart-card"><StockMovementLine data={analytics?.movement ?? []} /></div>
        </motion.div>
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          <h3 style={{ fontWeight:700, marginBottom:4 }}>Low Stock Risk Analysis</h3>
          <p style={{ fontSize:"0.8rem", color:"var(--text-muted)", marginBottom:16 }}>
            Products sorted by quantity — <span style={{ color:"var(--danger)" }}>red = critical</span>, <span style={{ color:"var(--warning)" }}>amber = low</span>
          </p>
          <div className="chart-card"><LowStockRiskBar data={analytics?.low_stock_risk ?? []} /></div>
        </motion.div>
      </div>

      {/* ── Movements Table ── */}
      <motion.div className="glass" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay:0.15 }}>
        {loading ? <SkeletonTable rows={8} cols={7}/> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Change</th><th>Before</th><th>After</th><th>Reason</th><th>User</th><th>Time</th></tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><History size={40}/><h3>No history yet</h3><p>Stock movements will appear here</p></div></td></tr>
                ) : records.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.product_name}</strong></td>
                    <td><span style={{ fontFamily: "monospace", fontSize: "0.8rem", background: "var(--bg-card)", padding: "2px 8px", borderRadius: 4 }}>{r.product_sku}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {r.change > 0
                          ? <><TrendingUp size={14} color="var(--success)"/><span style={{ color: "var(--success)", fontWeight: 700 }}>+{r.change}</span></>
                          : <><TrendingDown size={14} color="var(--danger)"/><span style={{ color: "var(--danger)", fontWeight: 700 }}>{r.change}</span></>
                        }
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>{r.previous_quantity}</td>
                    <td><strong>{r.new_quantity}</strong></td>
                    <td style={{ fontSize: "0.8rem", color: "var(--text-secondary)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reason || "—"}</td>
                    <td style={{ color: "var(--accent)" }}>{r.username}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString()}</td>
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
