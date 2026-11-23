/**
 * Disproportionality Derived Matrix
 * ------------------------------------------------------------------
 * Hàm THUẦN (pure): cùng input => cùng output, không gọi API, không đọc Date.now().
 * Được gọi trong lúc render qua useMemo, KHÔNG lưu kết quả vào state.
 *
 * Ý tưởng: so sánh mức án thực tế (sanctionDays) với mức án chuẩn theo khung
 * (BASELINE_DAYS) cho cùng mức độ vi phạm (severity 1–5).
 *   ratio = applied / baseline
 *   ratio > 1.5   => "Quá nặng" (không tương xứng, có cơ sở kháng nghị)
 *   ratio < 0.67  => "Quá nhẹ"
 *   còn lại       => "Tương xứng"
 */

export const SEVERITY_LEVELS = [1, 2, 3, 4, 5];

// Khung án chuẩn (số ngày khoá) theo mức độ vi phạm
export const BASELINE_DAYS = { 1: 1, 2: 3, 3: 7, 4: 14, 5: 30 };

export const THRESHOLDS = { excessive: 1.5, lenient: 0.67 };

export const VERDICT = {
  EXCESSIVE: 'EXCESSIVE',
  PROPORTIONATE: 'PROPORTIONATE',
  LENIENT: 'LENIENT',
};

export const VERDICT_LABEL = {
  EXCESSIVE: 'Quá nặng',
  PROPORTIONATE: 'Tương xứng',
  LENIENT: 'Quá nhẹ',
};

export function classifyRatio(ratio) {
  if (ratio > THRESHOLDS.excessive) return VERDICT.EXCESSIVE;
  if (ratio < THRESHOLDS.lenient) return VERDICT.LENIENT;
  return VERDICT.PROPORTIONATE;
}

const sum = (arr, pick) => arr.reduce((acc, item) => acc + pick(item), 0);

export function computeMatrix(dossierData) {
  if (!dossierData?.incidents?.length) return null;

  // 1. Từng vụ việc: so với khung chuẩn
  const rows = dossierData.incidents.map((incident) => {
    const baselineDays = BASELINE_DAYS[incident.severity];
    const ratio = incident.sanctionDays / baselineDays;
    return {
      ...incident,
      baselineDays,
      ratio,
      deltaDays: incident.sanctionDays - baselineDays,
      verdict: classifyRatio(ratio),
    };
  });

  // 2. Ma trận 2 chiều: loại vi phạm × mức độ (1–5)
  const categories = [...new Set(rows.map((r) => r.category))];
  const grid = categories.map((category) => ({
    category,
    cells: SEVERITY_LEVELS.map((severity) => {
      const hits = rows.filter((r) => r.category === category && r.severity === severity);
      if (hits.length === 0) {
        return { severity, count: 0, applied: 0, baseline: 0, ratio: null, verdict: null };
      }
      const applied = sum(hits, (r) => r.sanctionDays);
      const baseline = sum(hits, (r) => r.baselineDays);
      const ratio = applied / baseline;
      return { severity, count: hits.length, applied, baseline, ratio, verdict: classifyRatio(ratio) };
    }),
  }));

  // 3. Tổng hợp
  const totalApplied = sum(rows, (r) => r.sanctionDays);
  const totalBaseline = sum(rows, (r) => r.baselineDays);
  const index = totalApplied / totalBaseline; // chỉ số bất tương xứng tổng
  const counts = {
    EXCESSIVE: rows.filter((r) => r.verdict === VERDICT.EXCESSIVE).length,
    PROPORTIONATE: rows.filter((r) => r.verdict === VERDICT.PROPORTIONATE).length,
    LENIENT: rows.filter((r) => r.verdict === VERDICT.LENIENT).length,
  };
  const excessiveShare = counts.EXCESSIVE / rows.length;

  let appealStrength = 'Yếu';
  if (index > THRESHOLDS.excessive || excessiveShare >= 0.5) appealStrength = 'Mạnh';
  else if (counts.EXCESSIVE > 0) appealStrength = 'Trung bình';

  return {
    rows,
    grid,
    severityLevels: SEVERITY_LEVELS,
    summary: {
      totalApplied,
      totalBaseline,
      excessDays: totalApplied - totalBaseline,
      index,
      overallVerdict: classifyRatio(index),
      counts,
      excessiveShare,
      appealStrength,
    },
  };
}

export default computeMatrix;
