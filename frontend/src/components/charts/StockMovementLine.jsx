import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, marginBottom: 2 }}>
          {p.dataKey === "added" ? "✚ Added" : "✕ Removed"}: <strong>{p.value}</strong> units
        </p>
      ))}
    </div>
  );
};

export default function StockMovementLine({ data }) {
  const isMobile = useIsMobile();
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No movement data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: isMobile ? -28 : -20, bottom: 0 }}>
        <defs>
          <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="removedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false}
          interval={isMobile ? Math.floor((data.length - 1) / 5) : Math.floor((data.length - 1) / 6)} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: isMobile ? 9 : 10 }} axisLine={false} tickLine={false} allowDecimals={false} width={isMobile ? 28 : 36} />
        <Tooltip content={<Tip />} />
        <Legend layout="horizontal" verticalAlign="bottom" align="center" iconSize={10}
          wrapperStyle={{ fontSize: isMobile ? 10 : 11, paddingTop: 4 }}
          formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: isMobile ? 10 : 11 }}>{v === "added" ? "Stock Added" : "Stock Removed"}</span>} />
        <Area type="monotone" dataKey="added"   stroke="#10b981" strokeWidth={2} fill="url(#addedGrad)"   dot={false} activeDot={{ r: 4 }} name="added" />
        <Area type="monotone" dataKey="removed" stroke="#ef4444" strokeWidth={2} fill="url(#removedGrad)" dot={false} activeDot={{ r: 4 }} name="removed" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
