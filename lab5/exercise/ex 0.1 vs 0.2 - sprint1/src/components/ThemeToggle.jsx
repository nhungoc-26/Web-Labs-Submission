import { useAppDispatch } from '../context/AppProvider.jsx';
import { toggleTheme } from '../reducer/appReducer.js';
import { useRenderLog } from '../hooks/useRenderLog.js';

// Chỉ dùng DISPATCH -> KHÔNG re-render khi theme/activeTab đổi.
export default function ThemeToggle() {
  useRenderLog('ThemeToggle (dispatch only)');
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      className="btn btn--toggle"
      onClick={() => dispatch(toggleTheme())}
    >
      🌓 Đổi giao diện
    </button>
  );
}
