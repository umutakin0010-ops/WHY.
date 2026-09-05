import { useMemo, useState } from "react";
import { Check, Flame, Trophy, Cloud, HardDrive, LogOut } from "lucide-react";
import type { AccentTheme, Lang, ThemeMode, UserProfile } from "../lib/types";
import { useDecisions } from "../lib/useDecisions";
import { computeAnalytics } from "../lib/analytics";
import { computeAchievements, computeStreak } from "../lib/streaks";
import { useAuth } from "../lib/auth";

const ACHIEVEMENT_META: Record<string, { title: Record<Lang, string>; icon: string }> = {
  decisions_100: { title: { en: "100 Decisions", tr: "100 Karar" }, icon: "🧠" },
  validated_50: { title: { en: "50 Validated Theses", tr: "50 Onaylı Thesis" }, icon: "✅" },
  discipline_30: { title: { en: "30-Day Discipline", tr: "30 Günlük Disiplin" }, icon: "🔥" },
  risk_master_20: { title: { en: "Risk Master", tr: "Risk Master" }, icon: "🎯" },
};

const ACCENTS: { value: AccentTheme; swatch: string; label: Record<Lang, string> }[] = [
  { value: "amber", swatch: "#d97f19", label: { en: "Amber", tr: "Amber" } },
  { value: "crimson", swatch: "#c22f47", label: { en: "Crimson", tr: "Crimson" } },
  { value: "blue", swatch: "#2b5fd9", label: { en: "Deep Blue", tr: "Deep Blue" } },
  { value: "emerald", swatch: "#12965f", label: { en: "Emerald", tr: "Emerald" } },
];

const copy = {
  en: {
    title: "Profile", username: "Username", memberSince: "Member since", theme: "Theme", light: "Light", dark: "Dark",
    language: "Language", stats: "Your stats", decisions: "Decisions", avgScore: "Avg score", winRate: "Win rate",
    localNote: "This profile lives on this device (local storage) — no login required, no data leaves your browser.",
    save: "Save", accent: "Accent color",
    streak: "Current streak", longest: "Longest streak", days: "days", achievements: "Achievements",
    account: "Account", signedInAs: "Signed in as", signOut: "Sign out", notSignedIn: "Not signed in — data stays on this device only.",
    signIn: "Sign in to sync", cloudSynced: "Cloud sync active",
  },
  tr: {
    title: "Profil", username: "Kullanıcı adı", memberSince: "Üyelik tarihi", theme: "Tema", light: "Light", dark: "Dark",
    language: "Dil", stats: "İstatistiklerin", decisions: "Karar", avgScore: "Ort. skor", winRate: "Win rate",
    localNote: "Bu profil bu cihazda (local storage) tutulur — login gerekmez, veri tarayıcından dışarı çıkmaz.",
    save: "Kaydet", accent: "Vurgu rengi",
    streak: "Güncel streak", longest: "En uzun streak", days: "gün", achievements: "Achievements",
    account: "Hesap", signedInAs: "Giriş yapıldı", signOut: "Çıkış yap", notSignedIn: "Giriş yapılmadı — veri sadece bu cihazda.",
    signIn: "Senkronize etmek için giriş yap", cloudSynced: "Cloud sync aktif",
  },
};

export default function Profile({
  profile, onUpdate, onRequestSignIn,
}: {
  profile: UserProfile;
  onUpdate: (p: UserProfile) => void;
  onRequestSignIn?: () => void;
}) {
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const [username, setUsername] = useState(profile.username);
  const decisions = useDecisions().decisions;
  const stats = useMemo(() => computeAnalytics(decisions), [decisions]);
  const streak = useMemo(() => computeStreak(decisions), [decisions]);
  const achievements = useMemo(() => computeAchievements(decisions), [decisions]);
  const { user, cloudEnabled, signOut } = useAuth();

  const setTheme = (theme: ThemeMode) => onUpdate({ ...profile, theme });
  const setAccent = (accent: AccentTheme) => onUpdate({ ...profile, accent });
  const setLang = (l: Lang) => onUpdate({ ...profile, lang: l });
  const save = () => onUpdate({ ...profile, username: username.trim() || "Trader" });

  return (
    <div style={{ maxWidth: 560 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 0 }}>{t.title}</h1>

      <div className="card" style={{ marginBottom: 14, display: "flex", gap: 16, alignItems: "center" }}>
        <span className="avatar" style={{ width: 54, height: 54, fontSize: 18 }}>{profile.username.slice(0, 2).toUpperCase()}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{profile.username}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-faint)" }}>{t.memberSince}: {new Date(profile.memberSince).toLocaleDateString()}</div>
        </div>
      </div>

      {cloudEnabled && (
        <div className="card" style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {user ? <Cloud size={16} color="var(--accent)" /> : <HardDrive size={16} color="var(--text-faint)" />}
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{user ? t.cloudSynced : t.notSignedIn}</div>
              {user && <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.signedInAs} {user.email}</div>}
            </div>
          </div>
          {user ? (
            <button className="btn btn-secondary btn-sm" onClick={() => signOut()}><LogOut size={13} />{t.signOut}</button>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onRequestSignIn}>{t.signIn}</button>
          )}
        </div>
      )}

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-label">{t.stats}</div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{stats.total}</div><div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.decisions}</div></div>
          <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{stats.avgScore}</div><div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.avgScore}</div></div>
          <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{stats.winRate}%</div><div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.winRate}</div></div>
          <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, color: streak.current > 0 ? "var(--accent)" : "var(--text)" }}>{streak.current > 0 && <Flame size={16} />}{streak.current}</div><div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.streak}</div></div>
          <div><div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700 }}>{streak.longest}</div><div style={{ fontSize: 11, color: "var(--text-faint)" }}>{t.longest}</div></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card-label"><Trophy size={11} style={{ marginRight: 5, verticalAlign: -1.5 }} />{t.achievements}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
          {achievements.map((a) => {
            const meta = ACHIEVEMENT_META[a.id];
            return (
              <div key={a.id} style={{
                padding: "12px 12px", borderRadius: 12, border: `1px solid ${a.unlocked ? "var(--accent)" : "var(--border)"}`,
                background: a.unlocked ? "var(--accent-soft)" : "var(--card-soft)", opacity: a.unlocked ? 1 : 0.65,
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{meta.icon}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>{meta.title[lang]}</div>
                <div style={{ height: 4, background: "var(--bg-soft)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${(a.progress / a.target) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginTop: 5, fontFamily: "var(--font-mono)" }}>{a.progress}/{a.target}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div className="card-label">{t.username}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} style={{ flex: 1, height: 38, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card-soft)", color: "var(--text)", padding: "0 12px", fontSize: 13.5 }} />
            <button className="btn btn-primary btn-sm" onClick={save}>{t.save}</button>
          </div>
        </div>
        <div>
          <div className="card-label">{t.theme}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn btn-sm ${profile.theme === "light" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTheme("light")}>{t.light}</button>
            <button className={`btn btn-sm ${profile.theme === "dark" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTheme("dark")}>{t.dark}</button>
          </div>
        </div>
        <div>
          <div className="card-label">{t.accent}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {ACCENTS.map((a) => {
              const selected = profile.accent === a.value;
              return (
                <button
                  key={a.value}
                  onClick={() => setAccent(a.value)}
                  title={a.label[lang]}
                  style={{
                    width: 36, height: 36, borderRadius: "50%", background: a.swatch, border: selected ? "2px solid var(--text)" : "2px solid transparent",
                    display: "grid", placeItems: "center", boxShadow: selected ? "0 0 0 2px var(--card), 0 0 0 4px var(--text)" : "none",
                    transition: ".15s ease", cursor: "pointer", padding: 0,
                  }}
                >
                  {selected && <Check size={15} color="#fff" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="card-label">{t.language}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={`btn btn-sm ${profile.lang === "en" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLang("en")}>EN</button>
            <button className={`btn btn-sm ${profile.lang === "tr" ? "btn-primary" : "btn-secondary"}`} onClick={() => setLang("tr")}>TR</button>
          </div>
        </div>
      </div>

      <p style={{ fontSize: 11.5, color: "var(--text-faint)", lineHeight: 1.6 }}>{t.localNote}</p>
    </div>
  );
}
