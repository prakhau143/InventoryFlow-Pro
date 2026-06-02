import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

const riskColor = (qty, threshold) => {
  if (qty === 0)              return "#6b7280";
  if (qty < threshold * 0.5)  return "#ef4444";
  if (qty < threshold)        return "#f59e0b";
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
  const isMobile = useIsMobile();
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No products to analyse</p></div>;
  const yWidth = isMobile ? 88 : 110;
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
        <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
          {d.map((item, i) => <Cell key={i} fill={riskColor(item.quantity, item.threshold)} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
