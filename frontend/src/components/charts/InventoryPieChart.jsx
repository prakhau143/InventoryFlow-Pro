import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
        <p style={{ fontWeight: 600, color: payload[0].payload.color }}>{payload[0].name}</p>
        <p style={{ color: "var(--text-primary)", fontSize: 14 }}>{payload[0].value} products</p>
      </div>
    );
  }
  return null;
};

export default function InventoryPieChart({ data }) {
  if (!data || data.every(d => d.value === 0)) {
    return <div className="empty-state"><p>No inventory data yet</p></div>;
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
