import { useEffect, useState } from 'react';

const LEVEL_TEXT = {
  ok: 'Còn trong hạn',
  warning: 'Sắp hết hạn (dưới 24 giờ)',
  critical: 'Khẩn cấp (dưới 1 giờ)',
  breached: 'Đã quá hạn SLA',
  unknown: 'Đang tính…',
};

const SYNC_TEXT = {
  idle: 'Chưa đồng bộ',
  syncing: 'Đang đồng bộ với server…',
  synced: 'Đã đồng bộ với server',
  offline: 'Mất kết nối server, đang đếm theo đồng hồ máy',
};

const pad = (n) => String(n).padStart(2, '0');

export default function SlaCountdown({ sla }) {
  const { days, hours, minutes, seconds, level, progress, sync, resync } = sla;
  const [announcement, setAnnouncement] = useState('');

  // Chỉ thông báo cho screen reader khi đổi mức cảnh báo (không đọc từng giây)
  useEffect(() => {
    if (level === 'warning' || level === 'critical' || level === 'breached') {
      setAnnouncement(`Hạn SLA kháng nghị: ${LEVEL_TEXT[level]}`);
    }
  }, [level]);

  const ready = days != null;
  const readable = ready ? `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây` : 'đang tính';

  return (
    <section className={`panel sla sla--${level}`} aria-labelledby="sla-heading">
      <div className="sla__head">
        <h2 id="sla-heading">Hạn xử lý kháng nghị (SLA)</h2>
        <span className={`badge badge--sla-${level}`}>{LEVEL_TEXT[level]}</span>
      </div>

      {/* role="timer" mặc định aria-live="off" => screen reader không bị đọc liên tục mỗi giây */}
      <div className="sla__clock" role="timer" aria-label={`Thời gian còn lại: ${readable}`}>
        {[
          ['Ngày', ready ? days : '--'],
          ['Giờ', ready ? pad(hours) : '--'],
          ['Phút', ready ? pad(minutes) : '--'],
          ['Giây', ready ? pad(seconds) : '--'],
        ].map(([label, value]) => (
          <div className="sla__unit" key={label} aria-hidden="true">
            <span className="sla__value">{value}</span>
            <span className="sla__label">{label}</span>
          </div>
        ))}
      </div>

      {progress != null && (
        <div className="sla__progress">
          <label htmlFor="sla-progress">Đã dùng {Math.round(progress * 100)}% thời gian SLA</label>
          <progress id="sla-progress" max="1" value={progress} />
        </div>
      )}

      <div className="sla__sync">
        <p className={`sla__sync-status sla__sync-status--${sync.status}`}>
          <span aria-hidden="true">{sync.status === 'synced' ? '🟢' : sync.status === 'offline' ? '🔴' : '🟡'}</span>{' '}
          {SYNC_TEXT[sync.status]}
          {sync.error ? ` (${sync.error})` : ''}
        </p>
        <dl className="sla__sync-facts">
          <div>
            <dt>Lệch đồng hồ (server − máy)</dt>
            <dd>{sync.offsetMs} ms</dd>
          </div>
          <div>
            <dt>Round-trip</dt>
            <dd>{sync.rttMs == null ? '—' : `${sync.rttMs} ms`}</dd>
          </div>
          <div>
            <dt>Lần đồng bộ cuối</dt>
            <dd>{sync.lastSyncAt ? new Date(sync.lastSyncAt).toLocaleTimeString('vi-VN') : '—'}</dd>
          </div>
        </dl>
        <button type="button" className="button" onClick={resync}>
          Đồng bộ lại ngay
        </button>
      </div>

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
