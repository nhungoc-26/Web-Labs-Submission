import { useAppState } from '../context/AppProvider.jsx';
import { useRenderLog } from '../hooks/useRenderLog.js';

// Đọc STATE -> re-render khi state đổi.
export default function ThemeBadge() {
  useRenderLog('ThemeBadge (state)');
  const { theme } = useAppState();

  return (
    <span className="badge">
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </span>
  );
}
