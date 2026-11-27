import { Profiler } from 'react';
import ThemeToggle from './ThemeToggle.jsx';
import ThemeBadge from './ThemeBadge.jsx';
import { useRenderLog } from '../hooks/useRenderLog.js';

// <Profiler> chỉ gọi onRender khi cây con THỰC SỰ commit.
// Nếu đổi trang/lọc mà Console không in "[Profiler] ThemeToggle",
// nghĩa là ThemeToggle không render -> đạt checkpoint Sprint 1.
function logProfiler(id, phase, actualDuration) {
  console.log(
    `%c[Profiler] ${id} – ${phase} (${actualDuration.toFixed(2)}ms)`,
    'color:#f59e0b'
  );
}

export default function Header() {
  useRenderLog('Header');

  return (
    <header className="header">
      <div className="header__brand">
        <p className="header__eyebrow">Evidence Dashboard</p>
        <h1 className="header__title">#JusticeForHimassTanVuu</h1>
        <p className="header__subtitle">Kho lưu trữ bằng chứng kỹ thuật (PUBG)</p>
      </div>
      <div className="header__actions">
        <ThemeBadge />
        <Profiler id="ThemeToggle" onRender={logProfiler}>
          <ThemeToggle />
        </Profiler>
      </div>
    </header>
  );
}
