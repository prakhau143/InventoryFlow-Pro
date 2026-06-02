import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import StatsCard from "../components/dashboard/StatsCard";
import InventoryPieChart from "../components/charts/InventoryPieChart";
import OrdersLineChart from "../components/charts/OrdersLineChart";
import TopProductsChart from "../components/charts/TopProductsChart";
import { SkeletonCard } from "../components/ui/LoadingSkeleton";
import { dashboardService } from "../services/dashboardService";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, ls, t, d, tp, ac] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getLowStock(),
          dashboardService.getOrdersTrend(),
          dashboardService.getInventoryDistribution(),
          dashboardService.getTopProducts(),
          dashboardService.getRecentActivity(),
        ]);
        setStats(s.data);
        setLowStock(ls.data);
        setTrend(t.data);
        setDistribution(d.data);
        setTopProducts(tp.data);
        setActivity(ac.data);
      } catch {/* handled by interceptor */} finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusBadge = (status) => {
    const map = { Pending: "badge-warning", Processing: "badge-info", Completed: "badge-success", Cancelled: "badge-danger" };
    return <span className={`badge ${map[status] || "badge-muted"}`}>{status}</span>;
  };

  const actionBadge = (action) => {
    const map = { CREATE: "badge-success", UPDATE: "badge-info", DELETE: "badge-danger" };
    return <span className={`badge ${map[action] || "badge-muted"}`}>{action}</span>;
  };

  if (loading) return (
    <div>
      <div className="stats-grid">{Array.from({length:7}).map((_,i)=><SkeletonCard key={i}/>)}</div>
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <StatsCard icon={Package}       label="Total Products"   value={stats?.total_products ?? 0}   gradient="grad-purple" iconColor="#6366f1" sub="Active inventory items" />
        <StatsCard icon={Users}         label="Total Customers"  value={stats?.total_customers ?? 0}  gradient="grad-cyan"   iconColor="#06b6d4" sub="Registered customers" />
        <StatsCard icon={ShoppingCart}  label="Total Orders"     value={stats?.total_orders ?? 0}     gradient="grad-green"  iconColor="#10b981" sub={`${stats?.pending_orders} pending`} />
        <StatsCard icon={DollarSign}    label="Total Revenue"    value={`$${(stats?.total_revenue ?? 0).toLocaleString()}`}  gradient="grad-blue"  iconColor="#3b82f6" sub="Selling price × qty sold" />

        {/* ── Total Earnings (Profit) — the key new card ── */}
        <motion.div
          className="glass"
          style={{
            padding: 24,
            borderRadius: "var(--radius)",
            cursor: "default",
            border: "1.5px solid rgba(16,185,129,0.35)",
            background: "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
          whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(16,185,129,0.2)" }}
          transition={{ duration: 0.2 }}
        >
          {/* Glow accent */}
          <div style={{ position:"absolute", top:-20, right:-20, width:80, height:80, borderRadius:"50%", background:"rgba(16,185,129,0.12)", filter:"blur(20px)", pointerEvents:"none" }} />
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(16,185,129,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"#10b981" }}>
              <TrendingUp size={22}/>
            </div>
            <span style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"#10b981", background:"rgba(16,185,129,0.12)", border:"1px solid rgba(16,185,129,0.3)", borderRadius:20, padding:"2px 8px" }}>
              Profit
            </span>
          </div>
          <div style={{ fontSize:"1.75rem", fontWeight:800, lineHeight:1, marginBottom:6, color:"#10b981" }}>
            ${(stats?.total_earnings ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize:"0.875rem", fontWeight:600, color:"var(--text-secondary)", marginBottom:4 }}>Total Earnings</div>
          <div style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
            {stats?.total_revenue > 0
              ? `${(((stats?.total_earnings ?? 0) / stats.total_revenue) * 100).toFixed(1)}% margin on revenue`
              : "Revenue − Cost Price × Qty"}
          </div>
        </motion.div>

        <StatsCard icon={AlertTriangle} label="Low Stock Items"   value={stats?.low_stock_count ?? 0}  gradient="grad-amber"  iconColor="#f59e0b" sub="Need restocking" />
        <StatsCard icon={CheckCircle}   label="Completed Orders"  value={stats?.completed_orders ?? 0} gradient="grad-green"  iconColor="#10b981" sub={`${stats?.cancelled_orders} cancelled`} />
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Orders & Revenue Trend</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>Last 14 days (including today)</p>
          <div className="chart-card"><OrdersLineChart data={trend} /></div>
        </motion.div>

        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Inventory Distribution</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>Stock level breakdown</p>
          <div className="chart-card"><InventoryPieChart data={distribution} /></div>
        </motion.div>

        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 4 }}>Top Selling Products</h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 16 }}>By units sold</p>
          <div className="chart-card"><TopProductsChart data={topProducts} /></div>
        </motion.div>

        {/* Low Stock Table */}
        <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>
            <span style={{ color: "var(--warning)" }}>⚠</span> Low Stock Alerts
          </h3>
          {lowStock.length === 0 ? (
            <div className="empty-state"><p>All products are well-stocked!</p></div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {lowStock.slice(0, 6).map((p) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-card)", borderRadius: 8, border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{p.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{p.sku}</div>
                  </div>
                  <span className={`badge ${p.quantity === 0 ? "badge-danger" : "badge-warning"}`}>
                    {p.quantity === 0 ? "Out of Stock" : `${p.quantity} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }} initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Activity</h3>
        {activity.length === 0 ? (
          <div className="empty-state"><p>No activity yet</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Action</th><th>Resource</th><th>Details</th><th>User</th><th>Time</th></tr></thead>
              <tbody>
                {activity.map((a) => (
                  <tr key={a.id}>
                    <td>{actionBadge(a.action)}</td>
                    <td><span style={{ textTransform: "capitalize", color: "var(--text-secondary)" }}>{a.resource}</span></td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.details}</td>
                    <td style={{ color: "var(--accent)" }}>{a.username}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{new Date(a.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
