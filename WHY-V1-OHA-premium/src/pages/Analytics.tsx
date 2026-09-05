import { useMemo } from "react";
import type { Lang, UserProfile } from "../lib/types";
import { useDecisions } from "../lib/useDecisions";
import { computeAnalytics } from "../lib/analytics";
import { computeDayOfWeekScores } from "../lib/streaks";

const copy = {
  en: {
    title: "Trader Analytics", empty: "Log a few decisions in the Journal to unlock analytics.",
    quality: "Decision Quality", winRate: "Win Rate", total: "Total Decisions", trend: "30-Day Trend",
    favorite: "Most Traded Pair", breakdown: "Decision Breakdown", ready: "READY", pause: "PAUSE", unclear: "UNCLEAR", invalid: "INVALID",
    calendar: "Performance by Day", calendarSub: "Average decision score for each day of the week.",
  },
  tr: {
    title: "Trader Analytics", empty: "Analytics açılması için Journal'a birkaç karar kaydet.",
    quality: "Decision Quality", winRate: "Win Rate", total: "Toplam Karar", trend: "30 Günlük Trend",
    favorite: "En Çok İşlem Yapılan Pair", breakdown: "Karar Dağılımı", ready: "READY", pause: "PAUSE", unclear: "UNCLEAR", invalid: "INVALID",
    calendar: "Güne Göre Performans", calendarSub: "Haftanın her günü için ortalama decision score.",
  },
};

export default function Analytics({ profile }: { profile: UserProfile }) {
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const { decisions } = useDecisions();
  const stats = useMemo(() => computeAnalytics(decisions), [decisions]);
  const dayScores = useMemo(() => computeDayOfWeekScores(decisions, lang), [decisions, lang]);

  if (decisions.length === 0) {
    return (
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 0 }}>{t.title}</h1>
        <div className="card"><p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13.5 }}>{t.empty}</p></div>
      </div>
    );
  }

  const cards = [
    { label: t.quality, value: `${stats.avgScore}/100` },
    { label: t.winRate, value: `${stats.winRate}%` },
    { label: t.total, value: stats.total },
    { label: t.trend, value: `${stats.trend > 0 ? "+" : ""}${stats.trend}%` },
    { label: t.favorite, value: stats.favoritePair },
  ];

  const breakdown = [
    { key: "ready", label: t.ready, value: stats.readyCount, color: "var(--positive)" },
    { key: "unclear", label: t.unclear, value: stats.unclearCount, color: "var(--warning)" },
    { key: "pause", label: t.pause, value: stats.pauseCount, color: "var(--negative)" },
    { key: "invalid", label: t.invalid, value: stats.invalidCount, color: "var(--negative)" },
  ];
  const maxCount = Math.max(1, ...breakdown.map((b) => b.value));
  const maxDayScore = Math.max(1, ...dayScores.map((d) => d.avg));

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 0 }}>{t.title}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 16 }}>
        {cards.map((c) => (
          <div className="card" key={c.label}>
            <div className="card-label">{c.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700 }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-label" style={{ marginBottom: 4 }}>{t.calendar}</div>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--text-muted)" }}>{t.calendarSub}</p>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 130 }}>
          {dayScores.map((d) => (
            <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
              <span style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-faint)" }}>{d.count > 0 ? d.avg : "—"}</span>
              <div
                style={{
                  width: "100%", borderRadius: 6, background: d.count > 0 ? "var(--accent)" : "var(--bg-soft)",
                  height: d.count > 0 ? `${Math.max(6, (d.avg / maxDayScore) * 88)}%` : "6%",
                  opacity: d.count > 0 ? 0.55 + 0.45 * (d.avg / maxDayScore) : 1,
                  transition: "height .3s ease",
                }}
              />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-faint)" }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-label">{t.breakdown}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {breakdown.map((b) => (
            <div key={b.key}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: b.color }}>{b.label}</span>
                <span style={{ color: "var(--text-faint)" }}>{b.value}</span>
              </div>
              <div style={{ height: 6, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ width: `${(b.value / maxCount) * 100}%`, height: "100%", background: b.color, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
