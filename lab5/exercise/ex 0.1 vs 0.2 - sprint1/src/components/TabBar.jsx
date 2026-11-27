import { useAppDispatch, useAppState } from '../context/AppProvider.jsx';
import { setTab, TABS } from '../reducer/appReducer.js';
import { useRenderLog } from '../hooks/useRenderLog.js';

const LABELS = {
  reels: { icon: '🎬', text: 'Reels' },
  evidence: { icon: '🗂️', text: 'Bằng chứng' },
  saved: { icon: '🔖', text: 'Đã lưu' },
};

export default function TabBar() {
  useRenderLog('TabBar (state + dispatch)');
  const { activeTab } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <nav className="tabbar" aria-label="Điều hướng chính">
      <div role="tablist" className="tabbar__list">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            aria-controls="main"
            className={`tabbar__item ${activeTab === tab ? 'tabbar__item--active' : ''}`}
            onClick={() => dispatch(setTab(tab))}
          >
            <span aria-hidden="true">{LABELS[tab].icon}</span>
            <span>{LABELS[tab].text}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
