import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "#06b6d4", fontSize: 13 }}>New Customers: <strong>{payload[0]?.value}</strong></p>
    </div>
  );
};

export default function CustomerGrowthLine({ data }) {
  if (!data?.length) return <div className="empty-state" style={{ height: "100%" }}><p>No customer data yet</p></div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey="customers" stroke="#06b6d4" strokeWidth={2.5} fill="url(#custGrad)" dot={{ fill: "#06b6d4", r: 3 }} activeDot={{ r: 5 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
