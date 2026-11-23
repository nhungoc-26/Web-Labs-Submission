// Dữ liệu mẫu cho bài tập. Deadline được tính TƯƠNG ĐỐI theo lúc khởi động dev server
// => lần nào chạy cũng có countdown để xem, và F5 trang không làm reset đồng hồ.
const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const iso = (ms) => new Date(ms).toISOString();

export function buildDossiers(serverStartedAt) {
  const t = serverStartedAt;

  return {
    himass: {
      user: 'Himass',
      team: 'Team Bình Minh',
      role: 'Đi rừng',
      appeal: {
        id: 'APL-2026-0417',
        slaHours: 48,
        filedAt: iso(t - 12 * HOUR),
        deadline: iso(t + 36 * HOUR),
        status: 'Đang xem xét',
        reason: 'Án khoá chat cho 2 vụ ngôn từ mức nhẹ cao gấp nhiều lần khung án chuẩn.',
      },
      incidents: [
        { id: 'H-01', date: iso(t - 20 * DAY), category: 'Ngôn từ độc hại', severity: 2, sanctionDays: 14, evidence: 'Log chat trận #88121' },
        { id: 'H-02', date: iso(t - 15 * DAY), category: 'Bỏ trận (AFK)', severity: 1, sanctionDays: 1, evidence: 'Mất kết nối 4 phút' },
        { id: 'H-03', date: iso(t - 9 * DAY), category: 'Phá game', severity: 3, sanctionDays: 7, evidence: '3 báo cáo từ đồng đội' },
        { id: 'H-04', date: iso(t - 3 * DAY), category: 'Ngôn từ độc hại', severity: 1, sanctionDays: 3, evidence: 'Log chat trận #90417' },
      ],
    },

    tanvuu: {
      user: 'TanVuu',
      team: 'Team Bình Minh',
      role: 'Xạ thủ',
      appeal: {
        id: 'APL-2026-0422',
        slaHours: 48,
        filedAt: iso(t + 45 * MIN - 48 * HOUR),
        deadline: iso(t + 45 * MIN),
        status: 'Chờ hội đồng',
        reason: 'Án nghi vấn gian lận dựa trên báo cáo tự động, chưa có xác minh thủ công.',
      },
      incidents: [
        { id: 'T-01', date: iso(t - 25 * DAY), category: 'Nghi vấn gian lận', severity: 4, sanctionDays: 30, evidence: 'Hệ thống tự động gắn cờ' },
        { id: 'T-02', date: iso(t - 18 * DAY), category: 'Bỏ trận (AFK)', severity: 2, sanctionDays: 3, evidence: 'Thoát trận phút 12' },
        { id: 'T-03', date: iso(t - 11 * DAY), category: 'Bỏ trận (AFK)', severity: 2, sanctionDays: 7, evidence: 'Thoát trận phút 20' },
        { id: 'T-04', date: iso(t - 6 * DAY), category: 'Phá game', severity: 3, sanctionDays: 3, evidence: '2 báo cáo từ đối thủ' },
        { id: 'T-05', date: iso(t - 2 * DAY), category: 'Ngôn từ độc hại', severity: 3, sanctionDays: 7, evidence: 'Log chat trận #91002' },
      ],
    },
  };
}
