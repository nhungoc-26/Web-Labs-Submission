const TYPE = {
  handcam: { icon: '🎥', label: 'Handcam' },
  telemetry: { icon: '📊', label: 'Telemetry' },
  replay: { icon: '⏪', label: 'Replay' },
};

const dateFmt = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

export function EvidenceCard({ clip }) {
  const type = TYPE[clip.type] ?? { icon: '📁', label: clip.type };

  return (
    <article className="evidence-card">
      <div className={`evidence-card__thumb evidence-card__thumb--${clip.type}`} aria-hidden="true">
        <span>{type.icon}</span>
      </div>
      <div className="evidence-card__body">
        <p className="evidence-card__player">{clip.player}</p>
        <h3 className="evidence-card__title">{clip.title}</h3>
        <p className="evidence-card__meta">
          <span>{type.label}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(clip.duration)}</span>
          {clip.avgFps != null && (
            <>
              <span aria-hidden="true">·</span>
              <span>{clip.avgFps} fps</span>
            </>
          )}
        </p>
        <p className="evidence-card__date">
          <time dateTime={clip.recordedAt}>{dateFmt.format(new Date(clip.recordedAt))}</time>
        </p>
      </div>
    </article>
  );
}
