import type { DecisionRecord } from "./types";

export function computeAnalytics(records: DecisionRecord[]) {
  const total = records.length;
  const withResult = records.filter((r) => r.result === "win" || r.result === "loss");
  const wins = withResult.filter((r) => r.result === "win").length;
  const winRate = withResult.length ? Math.round((wins / withResult.length) * 100) : 0;

  const avgScore = total ? Math.round(records.reduce((sum, r) => sum + r.score, 0) / total) : 0;

  const last30 = records.slice(0, 30);
  const prior30 = records.slice(30, 60);
  const last30Avg = last30.length ? last30.reduce((s, r) => s + r.score, 0) / last30.length : 0;
  const prior30Avg = prior30.length ? prior30.reduce((s, r) => s + r.score, 0) / prior30.length : 0;
  const trend = prior30.length ? Math.round(((last30Avg - prior30Avg) / prior30Avg) * 100) : 0;

  const pairCounts: Record<string, number> = {};
  records.forEach((r) => {
    pairCounts[r.pair] = (pairCounts[r.pair] || 0) + 1;
  });
  const favoritePair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const readyCount = records.filter((r) => r.decision === "ready").length;
  const unclearCount = records.filter((r) => r.decision === "unclear").length;
  const pauseCount = records.filter((r) => r.decision === "pause").length;
  const invalidCount = records.filter((r) => r.decision === "invalid").length;

  return {
    total,
    winRate,
    avgScore,
    trend,
    favoritePair,
    readyCount,
    unclearCount,
    pauseCount,
    invalidCount,
  };
}
