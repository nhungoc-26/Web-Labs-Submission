import { useState } from 'react';
import { EvidenceGrid } from './EvidenceGrid.jsx';
import { useRenderLog } from '../../hooks/useRenderLog.js';

// ============================================================
// EXERCISE 0.2 – ZERO-useEffect
// Thư mục evidence/ KHÔNG có useEffect nào.
// - Dữ liệu tải trong EVENT HANDLER (bấm nút), không phải effect.
// - filteredClips, stats, totalPages, visibleItems: TÍNH KHI RENDER.
// - Đổi bộ lọc / pageSize -> reset page ngay trong handler.
// State trang (page) nằm CỤC BỘ ở đây, không đưa lên AppProvider
// -> đổi trang không làm Header/ThemeToggle render lại.
// ============================================================

const PLAYERS = ['all', 'Himass', 'TanVuu'];
const PLAYER_LABEL = { all: 'Tất cả', Himass: 'Himass', TanVuu: 'TanVuu' };

export function EvidencePanel() {
  useRenderLog('EvidencePanel (local page state)');

  // FIX bug React 8: khởi tạo đúng là mảng rỗng
  // (bản cũ useState() -> undefined -> clips.slice crash).
  const [clips, setClips] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [player, setPlayer] = useState('all');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error

  async function handleLoad() {
    setStatus('loading');
    try {
      const res = await fetch('/clips.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setClips(Array.isArray(data) ? data : []);
      setPage(1);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  function handlePlayerChange(next) {
    setPlayer(next);
    setPage(1);
  }

  function handleQueryChange(e) {
    setQuery(e.target.value);
    setPage(1);
  }

  function handlePageSizeChange(e) {
    setPageSize(Number(e.target.value));
    setPage(1);
  }

  // ---------- Derived state (tính trong render) ----------
  const keyword = query.trim().toLowerCase();
  const filteredClips = clips.filter(
    (c) =>
      (player === 'all' || c.player === player) &&
      (!keyword || c.title.toLowerCase().includes(keyword) || c.type.includes(keyword))
  );

  const stats = {
    total: filteredClips.length,
    handcam: filteredClips.filter((c) => c.type === 'handcam').length,
    telemetry: filteredClips.filter((c) => c.type === 'telemetry').length,
    replay: filteredClips.filter((c) => c.type === 'replay').length,
  };

  return (
    <section className="evidence-panel" role="tabpanel" aria-label="Bằng chứng">
      <div className="toolbar">
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleLoad}
          disabled={status === 'loading'}
        >
          {status === 'loading'
            ? 'Đang tải…'
            : clips.length
              ? 'Tải lại hồ sơ'
              : 'Tải hồ sơ bằng chứng'}
        </button>

        <div className="chips" role="group" aria-label="Lọc theo người chơi">
          {PLAYERS.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${player === p ? 'chip--active' : ''}`}
              aria-pressed={player === p}
              onClick={() => handlePlayerChange(p)}
            >
              {PLAYER_LABEL[p]}
            </button>
          ))}
        </div>

        <label className="field">
          <span className="field__label">Tìm map / loại</span>
          <input
            className="field__input"
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="vd: Erangel, handcam"
          />
        </label>

        <label className="field field--narrow">
          <span className="field__label">Mỗi trang</span>
          <select className="field__input" value={pageSize} onChange={handlePageSizeChange}>
            {[3, 6, 9, 12].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>

      {clips.length > 0 && (
        <dl className="stats">
          <div className="stats__item"><dt>Tổng</dt><dd>{stats.total}</dd></div>
          <div className="stats__item"><dt>Handcam</dt><dd>{stats.handcam}</dd></div>
          <div className="stats__item"><dt>Telemetry</dt><dd>{stats.telemetry}</dd></div>
          <div className="stats__item"><dt>Replay</dt><dd>{stats.replay}</dd></div>
        </dl>
      )}

      {status === 'error' && (
        <p className="notice notice--error" role="alert">
          Không tải được dữ liệu. Thử lại nhé.
        </p>
      )}

      {status === 'idle' && clips.length === 0 ? (
        <p className="notice">Bấm “Tải hồ sơ bằng chứng” để bắt đầu.</p>
      ) : (
        <EvidenceGrid
          clips={filteredClips}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}
