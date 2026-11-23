
import "./Skeleton.css";

export default function Skeleton() {
  return (
    <section
      className="person-skeleton"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading person details"
    >
      <div className="skeleton-avatar" />

      <div className="skeleton-content">
        <div className="skeleton-line skeleton-name" />
        <div className="skeleton-line skeleton-email" />
        <div className="skeleton-line skeleton-info" />
        <div className="skeleton-line skeleton-info short" />
      </div>

      <div className="skeleton-card">
        <div className="skeleton-line skeleton-info" />
        <div className="skeleton-line skeleton-info" />
      </div>
    </section>
  );
}
