import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, ArrowDownRight, TrendingUp, BookOpen, BarChart3, Zap, Flame } from "lucide-react";
import type { Lang, UserProfile } from "../lib/types";
import { useDecisions } from "../lib/useDecisions";
import { computeAnalytics } from "../lib/analytics";
import { computeStreak } from "../lib/streaks";
import { QUOTES } from "../lib/mockData";
import TradingViewWidget from "../components/TradingViewWidget";

const copy = {
  en: {
    greeting: "Good day",
    score: "Decision Score",
    startNew: "Start New Decision",
    openJournal: "Open Journal",
    analytics: "Analytics",
    pulse: "Market Pulse",
    news: "Forex News",
    yourDay: "Your Day",
    decisions: "decisions",
    thought: "Trader's Thought",
    recent: "Recent decisions",
    empty: "No decisions logged yet. Run your first WHY protocol to populate your journal.",
    viewAll: "View all",
    startSub: "Run the full protocol",
  },
  tr: {
    greeting: "Günaydın",
    score: "Decision Score",
    startNew: "Yeni Karar Başlat",
    openJournal: "Journal'ı Aç",
    analytics: "Analytics",
    pulse: "Market Pulse",
    news: "Forex Haberleri",
    yourDay: "Bugünün",
    decisions: "karar",
    thought: "Trader'ın Düşüncesi",
    recent: "Son kararlar",
    empty: "Henüz kayıtlı karar yok. Journal'ını doldurmak için ilk WHY protokolünü çalıştır.",
    viewAll: "Tümünü gör",
    startSub: "Tüm protokolü çalıştır",
  },
};

export default function Lobby({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const tvTheme = profile.theme === "dark" ? "dark" : "light";
  const tvLocale = lang === "tr" ? "tr" : "en";
  const { decisions } = useDecisions();
  const stats = useMemo(() => computeAnalytics(decisions), [decisions]);
  const streak = useMemo(() => computeStreak(decisions), [decisions]);
  const todayCount = decisions.filter((d) => new Date(d.createdAt).toDateString() === new Date().toDateString()).length;
  const quote = useMemo(() => {
    const list = QUOTES[lang];
    return list[Math.floor(Math.random() * list.length)];
  }, [lang]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="rise-in" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 3.6vw, 38px)", letterSpacing: "-.03em", margin: 0, fontWeight: 800 }}>
            {t.greeting}, {profile.username}
          </h1>
          <p style={{ color: "var(--text-muted)", margin: "6px 0 0", fontSize: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span>{t.yourDay}: {todayCount} {t.decisions}</span>
            {streak.current > 0 && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--accent)", fontWeight: 700, fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                <Flame size={13} />{streak.current}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/journal")}><BookOpen size={14} /> {t.openJournal}</button>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/analytics")}><BarChart3 size={14} /> {t.analytics}</button>
        </div>
      </div>

      <div
        className="rise-in"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "minmax(108px, auto)",
          gap: 14,
          animationDelay: ".08s",
        }}
      >
        {/* Big amber CTA tile */}
        <div
          className="card bracket"
          onClick={() => navigate("/why")}
          style={{
            gridColumn: "span 2", gridRow: "span 2", cursor: "pointer",
            background: "linear-gradient(155deg, var(--accent-soft), transparent 70%)",
            display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 210,
          }}
        >
          <div>
            <div className="card-label" style={{ color: "var(--accent)" }}>WHY</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(22px, 2.6vw, 28px)", fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.15, marginTop: 4 }}>
              {t.startNew}
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 12.5, margin: "8px 0 0" }}>{t.startSub}</p>
          </div>
          <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => navigate("/why")}>
            {lang === "en" ? "Enter" : "Başla"} <ArrowRight size={16} />
          </button>
        </div>

        {/* Score tile */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="card-label">{t.score}</div>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 34, fontWeight: 700 }}>{stats.avgScore || "—"}</div>
            {stats.trend !== 0 && (
              <span className={`pill ${stats.trend > 0 ? "pill-positive" : "pill-negative"}`}>
                {stats.trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(stats.trend)}%
              </span>
            )}
          </div>
        </div>

        {/* Trader's Thought — tall accent tile */}
        <div className="card" style={{ gridRow: "span 2", background: "linear-gradient(200deg, var(--accent-soft), transparent 65%)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="card-label" style={{ color: "var(--accent)" }}><Zap size={11} style={{ marginRight: 4, verticalAlign: -1.5 }} />{t.thought}</div>
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 16, lineHeight: 1.5, fontWeight: 700 }}>
            "{quote}"
          </p>
        </div>

        {/* Market pulse — live TradingView ticker */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="card-label" style={{ marginBottom: 0 }}><TrendingUp size={12} style={{ marginRight: 5, verticalAlign: -2 }} />{t.pulse}</div>
            <button className="btn btn-ghost btn-sm" style={{ height: 26, padding: "0 8px" }} onClick={() => navigate("/markets")}><ArrowRight size={12} /></button>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", marginTop: 6 }}>
            <TradingViewWidget
              scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
              height={44}
              config={{
                symbols: [
                  { proName: "FX:EURUSD", title: "EUR/USD" },
                  { proName: "FX:GBPUSD", title: "GBP/USD" },
                  { proName: "FX:USDJPY", title: "USD/JPY" },
                  { proName: "OANDA:XAUUSD", title: "Gold" },
                  { proName: "CRYPTO:BTCUSD", title: "BTC/USD" },
                ],
                showSymbolLogo: false,
                isTransparent: true,
                displayMode: "compact",
                colorTheme: tvTheme,
                locale: tvLocale,
              }}
            />
          </div>
        </div>

        {/* News — live TradingView economic calendar, high-impact only */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div className="card-label" style={{ marginBottom: 0 }}>{t.news}</div>
            <button className="btn btn-ghost btn-sm" style={{ height: 26, padding: "0 8px" }} onClick={() => navigate("/news")}><ArrowRight size={12} /></button>
          </div>
          <TradingViewWidget
            scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
            height={190}
            config={{
              colorTheme: tvTheme,
              isTransparent: true,
              width: "100%",
              height: "190",
              locale: tvLocale,
              importanceFilter: "1",
              countryFilter: "us,eu,gb,jp,au,ca,ch,nz,cn",
            }}
          />
        </div>
      </div>

      <div className="card rise-in" style={{ animationDelay: ".2s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="card-label" style={{ marginBottom: 0 }}>{t.recent}</div>
          {decisions.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/journal")}>{t.viewAll}</button>
          )}
        </div>
        {decisions.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: 13.5, margin: 0 }}>{t.empty}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {decisions.slice(0, 5).map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 2px", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>{d.pair}</span>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{new Date(d.createdAt).toLocaleDateString()}</span>
                <span className={`pill ${d.decision === "ready" ? "pill-positive" : d.decision === "unclear" ? "pill-warning" : "pill-negative"}`}>
                  {d.decision.toUpperCase()}
                </span>
                <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)" }}>{d.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
