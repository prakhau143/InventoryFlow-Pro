import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, fontSize: 12 }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontSize: 13, marginBottom: 2 }}>
          {p.dataKey === "orders" ? "Orders" : "Revenue"}: <strong>{p.dataKey === "revenue" ? `$${p.value.toLocaleString()}` : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function OrdersTrendChart({ data, mode = "both" }) {
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No order data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="ordTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
          </linearGradient>
          <linearGradient id="revTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}   />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false}
          interval={Math.floor((data.length - 1) / 6)} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        {(mode === "orders" || mode === "both") && (
          <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2} fill="url(#ordTrendGrad)" dot={false} activeDot={{ r: 4 }} />
        )}
        {(mode === "revenue" || mode === "both") && (
          <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={2} fill="url(#revTrendGrad)" dot={false} activeDot={{ r: 4 }} />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
