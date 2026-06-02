import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color, fontSize: 13 }}>
            {p.name === "orders" ? "Orders" : "Revenue"}: {p.name === "revenue" ? `$${p.value}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OrdersLineChart({ data }) {
  const isMobile = useIsMobile();
  if (!data?.length) return <div className="empty-state"><p>No order data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: isMobile ? -28 : -20, bottom: 0 }}>
        <defs>
          <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false}
          interval={isMobile ? 3 : 1} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: isMobile ? 9 : 11 }} axisLine={false} tickLine={false} width={isMobile ? 28 : 36} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} fill="url(#ordersGrad)" name="orders" dot={false} />
        <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revenueGrad)" name="revenue" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
