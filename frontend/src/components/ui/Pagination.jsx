import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null;
  return (
    <div className="pagination">
      <button className="page-btn" onClick={() => onPage(page - 1)} disabled={page === 1}>
        <ChevronLeft size={15} />
      </button>
      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
        return (
          <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onPage(p)}>
            {p}
          </button>
        );
      })}
      <button className="page-btn" onClick={() => onPage(page + 1)} disabled={page === pages}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
