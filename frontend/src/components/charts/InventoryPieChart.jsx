import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  if (!data || data.every(d => d.value === 0)) {
    return <div className="empty-state"><p>No inventory data yet</p></div>;
  }
  const r = isMobile ? { inner: 45, outer: 70 } : { inner: 60, outer: 95 };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy={isMobile ? "42%" : "50%"}
          innerRadius={r.inner} outerRadius={r.outer} paddingAngle={4} dataKey="value">
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconSize={10}
          wrapperStyle={{ paddingTop: 8, fontSize: isMobile ? 10 : 12 }}
          formatter={(value) => <span style={{ color: "var(--text-secondary)", fontSize: isMobile ? 10 : 12 }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
