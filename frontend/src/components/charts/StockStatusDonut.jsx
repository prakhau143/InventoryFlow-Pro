import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useIsMobile } from "../../hooks/useIsMobile";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontWeight: 700, color: payload[0].payload.color, marginBottom: 2 }}>{payload[0].name}</p>
      <p style={{ color: "var(--text-primary)", fontSize: 13 }}>{payload[0].value} products</p>
    </div>
  );
};

export default function StockStatusDonut({ data }) {
  const isMobile = useIsMobile();
  const hasData = data?.some(d => d.value > 0);
  if (!hasData) return <div className="empty-state" style={{ height: "100%" }}><p>Add products to see distribution</p></div>;
  const r = isMobile ? { inner: 40, outer: 65 } : { inner: 55, outer: 90 };
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy={isMobile ? "42%" : "45%"}
          innerRadius={r.inner} outerRadius={r.outer} paddingAngle={3} dataKey="value">
          {data.map((e, i) => <Cell key={i} fill={e.color} />)}
        </Pie>
        <Tooltip content={<Tip />} />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconSize={10}
          wrapperStyle={{ paddingTop: 8, fontSize: isMobile ? 10 : 11 }}
          formatter={v => <span style={{ color: "var(--text-secondary)", fontSize: isMobile ? 10 : 11 }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
