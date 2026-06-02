export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton" style={{ height: 16, borderRadius: 4, width: i === 0 ? "60%" : "80%" }} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass" style={{ padding: 24, borderRadius: "var(--radius)" }}>
      <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 12 }} />
      <div className="skeleton" style={{ height: 32, width: "70%", marginBottom: 8 }} />
      <div className="skeleton" style={{ height: 12, width: "40%" }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>{Array.from({ length: cols }).map((_, i) => <th key={i}><div className="skeleton" style={{ height: 12, width: 60 }} /></th>)}</tr>
        </thead>
        <tbody>{Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} cols={cols} />)}</tbody>
      </table>
    </div>
  );
}
