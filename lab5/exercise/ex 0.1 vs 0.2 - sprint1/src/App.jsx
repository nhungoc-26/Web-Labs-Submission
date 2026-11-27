import Header from './components/Header.jsx';
import TabBar from './components/TabBar.jsx';
import TabContent from './components/TabContent.jsx';
import { useRenderLog } from './hooks/useRenderLog.js';

// ============================================================
// SPRINT 1 – Evidence Dashboard Shell
// App KHÔNG đọc context -> không bao giờ re-render khi state đổi.
// Bố cục:  [ header ]
//          [ nav | main ]   (container rộng)
//          [ nav ] / [ main ] (container hẹp: nav nằm ngang trên cùng)
// ============================================================
export default function App() {
  useRenderLog('App');

  return (
    <div className="shell">
      <Header />
      <TabBar />
      <main className="shell__main" id="main">
        <TabContent />
      </main>
      <footer className="shell__footer">
        Dữ liệu minh hoạ cho bài lab · UIT S3T Lab 5 · Sprint 1
      </footer>
    </div>
  );
}
