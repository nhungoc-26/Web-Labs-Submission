import { useEffect, useRef, useState } from 'react';
import { FALLBACK_PROFILES } from './data/fallbackProfiles';
import './SwipeDeck.css';

/**
 * SwipeDeck — "Hẹn Hò Nhưng Không Yêu" Edition
 * ------------------------------------------------------------------
 * - Bàn phím: ← NOPE, → LIKE, ↑ FRIENDZONE, Backspace = Undo
 * - Pointer (chuột / cảm ứng / bút): kéo ngang > 50px để quẹt trái/phải
 * - Undo Stack kiểu LIFO: history là một stack, undo = bỏ phần tử cuối
 * - Điểm bất đối xứng (Asymmetric Score) là DERIVED STATE:
 *   tính lại từ history mỗi lần render, không lưu trong useState riêng.
 * - Thẻ hiện tại cũng là derived state: profiles[history.length]
 *   => Undo một phát là thẻ vừa quẹt tự quay lại, không cần code thêm.
 */

const DIRECTION_TO_TYPE = {
  right: 'LIKE',
  left: 'NOPE',
  up: 'FRIENDZONE',
};

const TYPE_LABEL = {
  LIKE: 'Thích',
  NOPE: 'Bỏ qua',
  FRIENDZONE: 'Friendzone',
};

const SWIPE_THRESHOLD = 50;

export default function SwipeDeck() {
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'online' | 'offline'
  const [syncError, setSyncError] = useState(null);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const deckRef = useRef(null);

  // ---------------------------------------------------------------
  // Tải profiles từ backend (GET /api/profiles).
  // Nếu server chưa chạy => dùng dữ liệu mẫu để vẫn demo được frontend.
  // ---------------------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch('/api/profiles', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Dữ liệu không hợp lệ');
        setProfiles(data);
        setStatus('online');
      } catch (err) {
        if (err.name === 'AbortError') return;
        setProfiles(FALLBACK_PROFILES);
        setStatus('offline');
      }
    })();

    return () => controller.abort();
  }, []);

  // Tự focus vào deck sau khi tải xong để bấm phím được ngay
  useEffect(() => {
    if (status !== 'loading') deckRef.current?.focus();
  }, [status]);

  // ---------------------------------------------------------------
  // LIFO Undo Stack Implementation
  // ---------------------------------------------------------------
  const [history, setHistory] = useState([]);

  const undoLastSwipe = () => {
    setHistory((prev) => prev.slice(0, -1));
  };

  // Thẻ hiện tại suy ra từ độ dài stack
  const currentIndex = history.length;
  const currentProfile = profiles[currentIndex] ?? null;
  const nextProfile = profiles[currentIndex + 1] ?? null;
  const lastAction = history.at(-1) ?? null;

  const swipe = (direction) => {
    if (!currentProfile) return;

    const action = {
      profileId: currentProfile._id,
      profileName: currentProfile.name,
      direction,
      type: DIRECTION_TO_TYPE[direction],
    };

    // Push vào stack (immutable)
    setHistory((prev) => [...prev, action]);

    // Ghi lên backend: POST /api/swipe
    if (status === 'online') {
      fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: action.profileId,
          type: action.type,
          direction: action.direction,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `HTTP ${res.status}`);
          }
          setSyncError(null);
        })
        .catch((err) => setSyncError(err.message));
    }
  };

  // ---------------------------------------------------------------
  // Asymmetric Score Derived State
  // LIKE +10, mọi loại còn lại (NOPE, FRIENDZONE) -5
  // ---------------------------------------------------------------
  const score = history.reduce((acc, action) => {
    if (action.type === 'LIKE') {
      return acc + 10;
    } else {
      return acc - 5;
    }
  }, 0);
  // Derived state re-calculates cleanly on render

  const likeCount = history.filter((a) => a.type === 'LIKE').length;
  const nopeCount = history.filter((a) => a.type === 'NOPE').length;
  const friendzoneCount = history.filter((a) => a.type === 'FRIENDZONE').length;

  // ---------------------------------------------------------------
  // Keyboard Navigation Mapping
  // ---------------------------------------------------------------
  const handleKeyDown = (e) => {
    // Chặn hành vi mặc định: mũi tên cuộn trang, Backspace "Back" ở vài trình duyệt
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Backspace'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') swipe('left');
    if (e.key === 'ArrowRight') swipe('right');
    if (e.key === 'ArrowUp') swipe('up');
    if (e.key === 'Backspace') undoLastSwipe();
  };

  // ---------------------------------------------------------------
  // Pointer Event Gesture Tracking
  // ---------------------------------------------------------------
  const [startPos, setStartPos] = useState(null);

  const handlePointerDown = (e) => {
    if (!currentProfile) return;
    // Giữ pointer để vẫn nhận pointerup khi kéo ra ngoài thẻ
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e) => {
    if (!startPos) return;
    setDrag({ x: e.clientX - startPos.x, y: e.clientY - startPos.y });
  };

  const handlePointerUp = (e) => {
    if (!startPos) return; // guard: chưa pointerdown thì startPos là null
    const dx = e.clientX - startPos.x;
    const dy = e.clientY - startPos.y;
    if (dx > SWIPE_THRESHOLD) swipe('right');
    if (dx < -SWIPE_THRESHOLD) swipe('left');
    // Mở rộng: kéo lên (khi không kéo ngang) = FRIENDZONE, khớp với ArrowUp
    if (Math.abs(dx) <= SWIPE_THRESHOLD && dy < -SWIPE_THRESHOLD) swipe('up');
    setStartPos(null);
    setDrag({ x: 0, y: 0 });
  };

  const handlePointerCancel = () => {
    setStartPos(null);
    setDrag({ x: 0, y: 0 });
  };

  // Hiệu ứng nhãn khi đang kéo
  const likeOpacity = Math.min(Math.max(drag.x / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-drag.x / 100, 0), 1);
  const friendOpacity =
    Math.abs(drag.x) <= SWIPE_THRESHOLD ? Math.min(Math.max(-drag.y / 100, 0), 1) : 0;

  const cardStyle = {
    transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.x / 15}deg)`,
    transition: startPos ? 'none' : undefined,
  };

  return (
    <section className="swipe-app">
      <div className="scoreboard" aria-label="Bảng điểm">
        <div className="scoreboard__score">
          <span className="scoreboard__label">Điểm</span>
          <span className={`scoreboard__value ${score < 0 ? 'is-negative' : ''}`}>{score}</span>
        </div>
        <ul className="scoreboard__stats">
          <li>💚 Like: {likeCount} (+10)</li>
          <li>❌ Nope: {nopeCount} (−5)</li>
          <li>🫂 Friendzone: {friendzoneCount} (−5)</li>
        </ul>
      </div>

      {status === 'offline' && (
        <p className="notice notice--warn" role="status">
          Không kết nối được backend, đang dùng dữ liệu mẫu (không lưu lượt quẹt).
        </p>
      )}
      {syncError && (
        <p className="notice notice--error" role="alert">
          Lưu lượt quẹt thất bại: {syncError}
        </p>
      )}

      <div
        ref={deckRef}
        className="deck"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="group"
        aria-label="Bộ thẻ hẹn hò. Mũi tên trái: bỏ qua, phải: thích, lên: friendzone, Backspace: hoàn tác."
      >
        <div className="deck__stage">
          {status === 'loading' && <p className="deck__empty">Đang tải hồ sơ…</p>}

          {status !== 'loading' && profiles.length === 0 && (
            <p className="deck__empty">
              Database chưa có hồ sơ nào. Chạy <code>npm run seed</code> trong thư mục server.
            </p>
          )}

          {status !== 'loading' && profiles.length > 0 && !currentProfile && (
            <div className="deck__empty">
              <p className="deck__empty-title">Hết người để hẹn hò rồi 😅</p>
              <p>
                Tổng điểm: <strong>{score}</strong>. Nhấn <kbd>Backspace</kbd> để hoàn tác.
              </p>
            </div>
          )}

          {nextProfile && (
            <ProfileCard profile={nextProfile} className="card card--behind" aria-hidden="true" />
          )}

          {currentProfile && (
            <ProfileCard
              key={currentProfile._id}
              profile={currentProfile}
              className="card card--top"
              style={cardStyle}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <span className="stamp stamp--like" style={{ opacity: likeOpacity }}>
                LIKE
              </span>
              <span className="stamp stamp--nope" style={{ opacity: nopeOpacity }}>
                NOPE
              </span>
              <span className="stamp stamp--friend" style={{ opacity: friendOpacity }}>
                FRIENDZONE
              </span>
            </ProfileCard>
          )}
        </div>

        <div className="controls">
          <button type="button" className="ctrl ctrl--nope" onClick={() => swipe('left')} disabled={!currentProfile}>
            <span aria-hidden="true">❌</span> Bỏ qua <kbd>←</kbd>
          </button>
          <button type="button" className="ctrl ctrl--friend" onClick={() => swipe('up')} disabled={!currentProfile}>
            <span aria-hidden="true">🫂</span> Friendzone <kbd>↑</kbd>
          </button>
          <button type="button" className="ctrl ctrl--like" onClick={() => swipe('right')} disabled={!currentProfile}>
            <span aria-hidden="true">💚</span> Thích <kbd>→</kbd>
          </button>
          <button type="button" className="ctrl ctrl--undo" onClick={undoLastSwipe} disabled={history.length === 0}>
            <span aria-hidden="true">↩️</span> Hoàn tác <kbd>Backspace</kbd>
          </button>
        </div>

        <p className="deck__progress">
          Thẻ {Math.min(currentIndex + 1, profiles.length)}/{profiles.length} · Undo stack: {history.length}
        </p>
      </div>

      {/* Thông báo cho screen reader */}
      <p className="sr-only" aria-live="polite">
        {lastAction
          ? `${TYPE_LABEL[lastAction.type]} ${lastAction.profileName}. Điểm hiện tại ${score}.`
          : ''}
      </p>

      {history.length > 0 && (
        <details className="history">
          <summary>Undo stack (mới nhất ở trên)</summary>
          <ol reversed>
            {[...history].reverse().map((a, i) => (
              <li key={`${a.profileId}-${history.length - i}`}>
                {a.profileName} — <strong>{a.type}</strong> ({a.type === 'LIKE' ? '+10' : '−5'})
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}

function ProfileCard({ profile, children, ...rest }) {
  const [from, to] = profile.colors ?? ['#ff8a8a', '#ffb36b'];
  return (
    <article {...rest}>
      <div className="card__photo" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        <span className="card__emoji" aria-hidden="true">
          {profile.emoji ?? '🙂'}
        </span>
        {children}
      </div>
      <div className="card__body">
        <h2 className="card__name">
          {profile.name}, <span className="card__age">{profile.age}</span>
        </h2>
        <p className="card__bio">{profile.bio}</p>
        {profile.tags?.length > 0 && (
          <ul className="card__tags">
            {profile.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
