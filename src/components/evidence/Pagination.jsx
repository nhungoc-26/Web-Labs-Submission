// Nút phân trang: tối thiểu 44×44px (WCAG 2.5.5 Target Size)
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Trang trước"
      >
        ‹
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn ${p === page ? 'pagination__btn--active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Trang ${p}`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Trang sau"
      >
        ›
      </button>
    </nav>
  );
}
