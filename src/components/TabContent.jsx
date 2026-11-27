import { useAppState } from '../context/AppProvider.jsx';
import { useRenderLog } from '../hooks/useRenderLog.js';
import { EvidencePanel } from './evidence/EvidencePanel.jsx';

const PLACEHOLDER = {
  reels: {
    icon: '🎬',
    title: 'Reels',
    text: 'Khu vực xem clip dọc. Sẽ tích hợp ở sprint sau (Exercise 1.1).',
  },
  saved: {
    icon: '🔖',
    title: 'Đã lưu',
    text: 'Các bằng chứng được đánh dấu sẽ hiển thị ở đây.',
  },
};

export default function TabContent() {
  useRenderLog('TabContent (state)');
  const { activeTab } = useAppState();

  if (activeTab === 'evidence') return <EvidencePanel />;

  const { icon, title, text } = PLACEHOLDER[activeTab];
  return (
    <section className="card" role="tabpanel">
      <div className="card__icon" aria-hidden="true">{icon}</div>
      <h2 className="card__title">{title}</h2>
      <p className="card__text">{text}</p>
    </section>
  );
}
