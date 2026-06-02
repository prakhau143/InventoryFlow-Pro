import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

const riskColor = (qty, threshold) => {
  if (qty === 0)             return "#6b7280";
  if (qty < threshold * 0.5) return "#ef4444";
  if (qty < threshold)       return "#f59e0b";
  return "#10b981";
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4, fontSize: 12 }}>{label}</p>
      <p style={{ color: riskColor(d?.quantity, d?.threshold), fontSize: 13 }}>Stock: <strong>{d?.quantity}</strong> units</p>
      <p style={{ color: "var(--text-muted)", fontSize: 11 }}>Threshold: {d?.threshold}</p>
    </div>
  );
};

export default function LowStockRiskBar({ data }) {
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No products to analyse</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 24, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis dataKey="name" type="category" width={110} tick={{ fill: "var(--text-secondary)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={riskColor(d.quantity, d.threshold)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
