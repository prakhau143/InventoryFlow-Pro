import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#3b82f6","#ec4899","#14b8a6","#f97316"];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, fontSize: 12 }}>{label}</p>
      <p style={{ color: "#8b5cf6", fontSize: 13 }}>Orders: <strong>{payload[0]?.value}</strong></p>
    </div>
  );
};

export default function TopCustomersBar({ data }) {
  const isMobile = useIsMobile();
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No order data yet</p></div>;
  const yWidth = isMobile ? 90 : 110;
  const d = isMobile ? data.slice(0, 6) : data;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={d} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="name" type="category" width={yWidth}
          tick={{ fill: "var(--text-secondary)", fontSize: isMobile ? 10 : 11 }} axisLine={false} tickLine={false}
          tickFormatter={v => isMobile && v.length > 10 ? v.slice(0, 10) + "…" : v} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="orders" radius={[0, 4, 4, 0]}>
          {d.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
