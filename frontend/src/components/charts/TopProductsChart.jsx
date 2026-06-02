import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4, fontSize: 12 }}>{label}</p>
        <p style={{ color: "#6366f1", fontSize: 13 }}>Sold: {payload[0]?.value}</p>
        {payload[1] && <p style={{ color: "#06b6d4", fontSize: 13 }}>Revenue: ${payload[1]?.value}</p>}
      </div>
    );
  }
  return null;
};

export default function TopProductsChart({ data }) {
  if (!data?.length) return <div className="empty-state"><p>No sales data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total_sold" fill="#6366f1" radius={[4, 4, 0, 0]} name="total_sold" />
        <Bar dataKey="total_revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} name="total_revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
}
