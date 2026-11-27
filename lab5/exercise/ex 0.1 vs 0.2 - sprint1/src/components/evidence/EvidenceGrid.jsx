import { EvidenceCard } from './EvidenceCard.jsx';
import { Pagination } from './Pagination.jsx';

// ============================================================
// Pagination là DERIVED STATE.
// KHÔNG làm kiểu cũ:
//   const [visible, setVisible] = useState([]);
//   useEffect(() => setVisible(clips.slice(...)), [clips, page]);  // ❌
// -> thừa 1 lần render, dễ lệch dữ liệu.
// Thay vào đó tính thẳng trong render pass.
// ============================================================

export function EvidenceGrid({ clips = [], page, pageSize = 6, onPageChange }) {
  // Pure derivation in render pass — Zero useEffect
  const totalPages = Math.ceil(clips.length / pageSize) || 1;
  // Kẹp page vào khoảng hợp lệ (vd: đang ở trang 4 mà lọc chỉ còn 2 trang)
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const visibleItems = clips.slice(startIdx, startIdx + pageSize);

  return (
    <div className="evidence-container">
      {visibleItems.length === 0 ? (
        <p className="notice">Không có clip nào khớp.</p>
      ) : (
        <div className="grid-layout">
          {visibleItems.map((clip) => (
            // FIX bug React 8: key ổn định từ DB, không dùng index
            <EvidenceCard key={clip._id} clip={clip} />
          ))}
        </div>
      )}

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
