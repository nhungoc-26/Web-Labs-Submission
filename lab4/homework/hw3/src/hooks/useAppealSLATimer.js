import { useCallback, useEffect, useRef, useState } from 'react';

const HOUR = 60 * 60 * 1000;

/**
 * useAppealSLATimer — đồng hồ đếm ngược hạn SLA kháng nghị, KHÔNG bị trôi (zero-drift).
 *
 * Nguyên tắc chống trôi:
 * 1. KHÔNG bao giờ "trừ dần 1 giây" (remaining -= 1000). setInterval/setTimeout bị trình duyệt
 *    làm chậm khi tab ẩn, máy sleep, CPU bận... => cộng dồn sai số.
 *    Thay vào đó, mỗi lần tick đều TÍNH LẠI từ mốc tuyệt đối:
 *        remaining = deadline - (Date.now() + serverOffset)
 * 2. serverOffset = độ lệch giữa đồng hồ server và đồng hồ máy người dùng, đo kiểu NTP
 *    (có bù một nửa round-trip time). Nhờ vậy dù máy người dùng chỉnh sai giờ, countdown vẫn đúng.
 * 3. Page Visibility API: khi tab bị ẩn thì dừng tick (tiết kiệm CPU/pin);
 *    khi tab hiện lại => resyncTimerWithServer() rồi tính lại ngay lập tức.
 * 4. Tick được canh đúng mốc giây (delay = remaining % 1000) nên số giây đổi đúng lúc,
 *    không bị nhảy cóc 2 giây.
 *
 * @param {string|number|Date|null|undefined} deadline  Mốc hết hạn SLA (tuyệt đối)
 * @param {{ startedAt?: string|number|Date, syncUrl?: string }} [options]
 */
export function useAppealSLATimer(deadline, { startedAt, syncUrl = '/api/time' } = {}) {
  // Đổi về số (ms) để làm dependency ổn định, không phụ thuộc kiểu dữ liệu truyền vào
  const deadlineMs = deadline != null ? new Date(deadline).getTime() : null;
  const startedAtMs = startedAt != null ? new Date(startedAt).getTime() : null;

  const offsetRef = useRef(0); // serverNow - clientNow (ms)
  const timeoutRef = useRef(null);
  const syncIdRef = useRef(0); // bỏ qua kết quả của các lần sync cũ bị chồng nhau

  const [remainingMs, setRemainingMs] = useState(() =>
    deadlineMs == null ? null : Math.max(0, deadlineMs - Date.now())
  );
  const [sync, setSync] = useState({
    status: 'idle', // 'idle' | 'syncing' | 'synced' | 'offline'
    offsetMs: 0,
    rttMs: null,
    lastSyncAt: null,
    error: null,
  });

  // Tính lại thời gian còn lại từ đồng hồ tuyệt đối + lên lịch tick kế tiếp đúng mốc giây
  const tick = useCallback(() => {
    clearTimeout(timeoutRef.current);
    if (deadlineMs == null) return;

    const serverNow = Date.now() + offsetRef.current;
    const remaining = Math.max(0, deadlineMs - serverNow);
    setRemainingMs(remaining);

    if (remaining === 0) return; // đã quá hạn, dừng hẳn
    if (document.visibilityState === 'hidden') return; // tab ẩn: ngủ, chờ visibilitychange

    const delay = remaining % 1000 || 1000;
    timeoutRef.current = setTimeout(tick, delay + 5); // +5ms để chắc chắn đã qua mốc giây
  }, [deadlineMs]);

  // Đồng bộ với đồng hồ server (kiểu NTP đơn giản)
  const resyncTimerWithServer = useCallback(async () => {
    const syncId = ++syncIdRef.current;
    setSync((s) => ({ ...s, status: 'syncing' }));

    try {
      const t0 = performance.now();
      const res = await fetch(syncUrl, { cache: 'no-store' });
      const t1 = performance.now();
      const clientAtResponse = Date.now();
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { now: serverTime } = await res.json();
      if (typeof serverTime !== 'number') throw new Error('Phản hồi /api/time không hợp lệ');

      if (syncId !== syncIdRef.current) return; // đã có lần sync mới hơn

      const rtt = t1 - t0;
      // Giả định thời gian đi = thời gian về => lúc nhận phản hồi, server đang ở serverTime + rtt/2
      const offset = serverTime + rtt / 2 - clientAtResponse;
      offsetRef.current = offset;

      setSync({
        status: 'synced',
        offsetMs: Math.round(offset),
        rttMs: Math.round(rtt),
        lastSyncAt: Date.now() + offset,
        error: null,
      });
    } catch (err) {
      if (syncId !== syncIdRef.current) return;
      // Mất kết nối: giữ offset cũ, vẫn đếm theo đồng hồ hệ thống
      setSync((s) => ({ ...s, status: 'offline', error: err.message }));
    } finally {
      if (syncId === syncIdRef.current) tick();
    }
  }, [syncUrl, tick]);

  // Khởi động (và khởi động lại khi đổi deadline, ví dụ chuyển từ hồ sơ Himass sang TanVuu)
  useEffect(() => {
    if (deadlineMs == null) {
      setRemainingMs(null);
      return undefined;
    }
    tick(); // hiển thị ngay theo đồng hồ máy
    resyncTimerWithServer(); // rồi chỉnh lại theo server
    return () => clearTimeout(timeoutRef.current);
  }, [deadlineMs, tick, resyncTimerWithServer]);

  // High-precision countdown hook with zero tab-drift using Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') resyncTimerWithServer();
      else clearTimeout(timeoutRef.current); // tab ẩn => ngừng tick
    }; // Recalculates remaining time against absolute system clock timestamps

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [resyncTimerWithServer]);

  // ---------- Giá trị suy ra (derived) ----------
  const totalSeconds = remainingMs == null ? null : Math.ceil(remainingMs / 1000);
  const days = totalSeconds == null ? null : Math.floor(totalSeconds / 86400);
  const hours = totalSeconds == null ? null : Math.floor((totalSeconds % 86400) / 3600);
  const minutes = totalSeconds == null ? null : Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds == null ? null : totalSeconds % 60;

  let level = 'unknown';
  if (remainingMs != null) {
    if (remainingMs === 0) level = 'breached';
    else if (remainingMs < HOUR) level = 'critical';
    else if (remainingMs < 24 * HOUR) level = 'warning';
    else level = 'ok';
  }

  let progress = null; // tỉ lệ thời gian SLA đã trôi qua (0 → 1)
  if (remainingMs != null && startedAtMs != null && deadlineMs > startedAtMs) {
    const total = deadlineMs - startedAtMs;
    progress = Math.min(1, Math.max(0, 1 - remainingMs / total));
  }

  return {
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    level,
    progress,
    isBreached: level === 'breached',
    sync,
    resync: resyncTimerWithServer,
  };
}

export default useAppealSLATimer;
