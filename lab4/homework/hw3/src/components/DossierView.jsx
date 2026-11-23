import { useEffect, useMemo, useRef, useState } from 'react';
import { computeMatrix, VERDICT_LABEL } from '../lib/computeMatrix';
import { useAppealSLATimer } from '../hooks/useAppealSLATimer';
import DisproportionalityMatrix from './DisproportionalityMatrix';
import SlaCountdown from './SlaCountdown';

const formatDateTime = (value) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export default function DossierView({ user }) {
  const slug = user.toLowerCase();
  const [dossierData, setDossierData] = useState(null);
  const [error, setError] = useState(null);
  const headingRef = useRef(null);

  // Tải hồ sơ theo user. Khi đổi route Himass <-> TanVuu, React tái sử dụng component
  // nên phải reset dữ liệu cũ và huỷ request cũ (AbortController).
  useEffect(() => {
    const controller = new AbortController();
    setDossierData(null);
    setError(null);

    fetch(`/api/dossiers/${slug}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(setDossierData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });

    return () => controller.abort();
  }, [slug]);

  // Đổi route => cập nhật tiêu đề tab và đưa focus về tiêu đề trang (cho người dùng bàn phím / screen reader)
  useEffect(() => {
    document.title = `Hồ sơ ${user} – Fair Play Appeal Portal`;
    headingRef.current?.focus();
  }, [user]);

  // Disproportionality Derived Matrix computation during render
  const matrix = useMemo(() => computeMatrix(dossierData), [dossierData]);

  const sla = useAppealSLATimer(dossierData?.appeal.deadline, {
    startedAt: dossierData?.appeal.filedAt,
  });

  return (
    <article className="dossier" aria-busy={!dossierData && !error}>
      <h1 ref={headingRef} tabIndex={-1} className="dossier__title">
        Hồ sơ kháng nghị: {user}
      </h1>

      {error && (
        <p className="alert alert--error" role="alert">
          Không tải được hồ sơ: {error}
        </p>
      )}

      {!dossierData && !error && <p className="muted">Đang tải hồ sơ…</p>}

      {dossierData && (
        <>
          <section className="panel dossier__profile" aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="sr-only">
              Thông tin hồ sơ
            </h2>
            <dl className="facts">
              <div>
                <dt>Mã kháng nghị</dt>
                <dd>{dossierData.appeal.id}</dd>
              </div>
              <div>
                <dt>Đội</dt>
                <dd>{dossierData.team}</dd>
              </div>
              <div>
                <dt>Vai trò</dt>
                <dd>{dossierData.role}</dd>
              </div>
              <div>
                <dt>Nộp lúc</dt>
                <dd>{formatDateTime(dossierData.appeal.filedAt)}</dd>
              </div>
              <div>
                <dt>Hạn xử lý (SLA {dossierData.appeal.slaHours}h)</dt>
                <dd>{formatDateTime(dossierData.appeal.deadline)}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{dossierData.appeal.status}</dd>
              </div>
            </dl>
            <p className="dossier__reason">
              <strong>Lý do kháng nghị:</strong> {dossierData.appeal.reason}
            </p>
          </section>

          <SlaCountdown sla={sla} />

          {matrix && (
            <>
              <section className="panel" aria-labelledby="summary-heading">
                <h2 id="summary-heading">Tóm tắt bất tương xứng</h2>
                <ul className="stats">
                  <li className="stat">
                    <span className="stat__label">Chỉ số tổng (án thực tế / án chuẩn)</span>
                    <span className="stat__value">×{matrix.summary.index.toFixed(2)}</span>
                    <span className={`badge badge--${matrix.summary.overallVerdict.toLowerCase()}`}>
                      {VERDICT_LABEL[matrix.summary.overallVerdict]}
                    </span>
                  </li>
                  <li className="stat">
                    <span className="stat__label">Tổng ngày khoá</span>
                    <span className="stat__value">
                      {matrix.summary.totalApplied} / {matrix.summary.totalBaseline}
                    </span>
                    <span className="muted">
                      {matrix.summary.excessDays >= 0 ? 'Dư' : 'Thiếu'} {Math.abs(matrix.summary.excessDays)} ngày so
                      với khung
                    </span>
                  </li>
                  <li className="stat">
                    <span className="stat__label">Số vụ quá nặng</span>
                    <span className="stat__value">
                      {matrix.summary.counts.EXCESSIVE}/{matrix.rows.length}
                    </span>
                    <span className="muted">{Math.round(matrix.summary.excessiveShare * 100)}% số vụ</span>
                  </li>
                  <li className="stat">
                    <span className="stat__label">Cơ sở kháng nghị</span>
                    <span className="stat__value">{matrix.summary.appealStrength}</span>
                  </li>
                </ul>
              </section>

              <DisproportionalityMatrix matrix={matrix} />
            </>
          )}
        </>
      )}
    </article>
  );
}
