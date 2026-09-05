import type { DecisionRecord } from "./types";

function dayKey(iso: string) {
  return new Date(iso).toDateString();
}

export function computeStreak(records: DecisionRecord[]) {
  if (records.length === 0) return { current: 0, longest: 0 };
  const oneDay = 86400000;
  const today = new Date().setHours(0, 0, 0, 0);
  const days = Array.from(new Set(records.map((r) => dayKey(r.createdAt))))
    .map((d) => new Date(d).setHours(0, 0, 0, 0))
    .sort((a, b) => b - a);

  let current = 0;
  if (days[0] === today || days[0] === today - oneDay) {
    let cursor = days[0];
    for (const d of days) {
      if (d === cursor) { current += 1; cursor -= oneDay; }
      else break;
    }
  }

  let longest = 1;
  let run = 1;
  const asc = [...days].sort((a, b) => a - b);
  for (let i = 1; i < asc.length; i++) {
    if (asc[i] - asc[i - 1] === oneDay) { run += 1; longest = Math.max(longest, run); }
    else run = 1;
  }
  longest = Math.max(longest, current);

  return { current, longest };
}

export type Achievement = { id: string; unlocked: boolean; progress: number; target: number };

export function computeAchievements(records: DecisionRecord[]): Achievement[] {
  const total = records.length;
  const readyCount = records.filter((r) => r.decision === "ready").length;
  const { longest } = computeStreak(records);
  const goodRisk = records.filter((r) => (r.rr ?? 0) >= 2).length;

  return [
    { id: "decisions_100", progress: Math.min(total, 100), target: 100, unlocked: total >= 100 },
    { id: "validated_50", progress: Math.min(readyCount, 50), target: 50, unlocked: readyCount >= 50 },
    { id: "discipline_30", progress: Math.min(longest, 30), target: 30, unlocked: longest >= 30 },
    { id: "risk_master_20", progress: Math.min(goodRisk, 20), target: 20, unlocked: goodRisk >= 20 },
  ];
}

export function computeDayOfWeekScores(records: DecisionRecord[], lang: "en" | "tr") {
  const labels = lang === "en"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  const buckets = Array.from({ length: 7 }, () => [] as number[]);
  records.forEach((r) => {
    const day = new Date(r.createdAt).getDay();
    buckets[day].push(r.score);
  });
  return labels.map((label, i) => ({
    label,
    avg: buckets[i].length ? Math.round(buckets[i].reduce((s, v) => s + v, 0) / buckets[i].length) : 0,
    count: buckets[i].length,
  }));
}
