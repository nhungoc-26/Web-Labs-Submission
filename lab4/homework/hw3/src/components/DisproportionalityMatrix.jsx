import { BASELINE_DAYS, THRESHOLDS, VERDICT_LABEL } from '../lib/computeMatrix';

const formatRatio = (ratio) => `×${ratio.toFixed(2)}`;

/**
 * Hiển thị ma trận bất tương xứng (chỉ nhận dữ liệu đã tính sẵn, không tự tính).
 * Màu sắc luôn đi kèm chữ ("Quá nặng"...) để không phụ thuộc vào màu (WCAG 1.4.1).
 */
export default function DisproportionalityMatrix({ matrix }) {
  const { grid, severityLevels, rows } = matrix;

  return (
    <section className="panel" aria-labelledby="matrix-heading">
      <h2 id="matrix-heading">Ma trận bất tương xứng</h2>
      <p className="muted">
        Mỗi ô = tổng án thực tế ÷ tổng án chuẩn của các vụ cùng loại và cùng mức độ. Trên ×
        {THRESHOLDS.excessive} là <strong>quá nặng</strong>, dưới ×{THRESHOLDS.lenient} là{' '}
        <strong>quá nhẹ</strong>.
      </p>

      <div className="table-scroll">
        <table className="matrix">
          <caption className="sr-only">Tỉ lệ án thực tế so với án chuẩn theo loại vi phạm và mức độ</caption>
          <thead>
            <tr>
              <th scope="col">Loại vi phạm</th>
              {severityLevels.map((s) => (
                <th scope="col" key={s}>
                  Mức {s}
                  <span className="matrix__baseline">chuẩn {BASELINE_DAYS[s]} ngày</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row) => (
              <tr key={row.category}>
                <th scope="row">{row.category}</th>
                {row.cells.map((cell) =>
                  cell.count === 0 ? (
                    <td key={cell.severity} className="matrix__cell matrix__cell--empty">
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">Không có vụ nào</span>
                    </td>
                  ) : (
                    <td key={cell.severity} className={`matrix__cell matrix__cell--${cell.verdict.toLowerCase()}`}>
                      <span className="matrix__ratio">{formatRatio(cell.ratio)}</span>
                      <span className="matrix__verdict">{VERDICT_LABEL[cell.verdict]}</span>
                      <span className="matrix__detail">
                        {cell.applied}/{cell.baseline} ngày · {cell.count} vụ
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Chi tiết từng vụ việc</h3>
      <div className="table-scroll">
        <table className="incidents">
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Ngày</th>
              <th scope="col">Loại vi phạm</th>
              <th scope="col">Mức</th>
              <th scope="col">Án thực tế</th>
              <th scope="col">Án chuẩn</th>
              <th scope="col">Tỉ lệ</th>
              <th scope="col">Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                <td>
                  {r.category}
                  <span className="incidents__evidence">{r.evidence}</span>
                </td>
                <td>{r.severity}</td>
                <td>{r.sanctionDays} ngày</td>
                <td>{r.baselineDays} ngày</td>
                <td>{formatRatio(r.ratio)}</td>
                <td>
                  <span className={`badge badge--${r.verdict.toLowerCase()}`}>{VERDICT_LABEL[r.verdict]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
