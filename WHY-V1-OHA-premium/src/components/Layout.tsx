import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Zap, LayoutGrid, BookOpen, BarChart3, LineChart, Newspaper, Wrench, User, Moon, Sun, Globe2, Layers,
} from "lucide-react";
import type { Lang, ThemeMode, UserProfile } from "../lib/types";

const NAV = [
  { to: "/", label: { en: "Lobby", tr: "Lobby" }, sub: { en: "Market & overview", tr: "Market & genel" }, icon: LayoutGrid, end: true },
  { to: "/why", label: { en: "WHY", tr: "WHY" }, sub: { en: "New decision", tr: "Yeni karar" }, icon: Zap },
  { to: "/journal", label: { en: "Journal", tr: "Journal" }, sub: { en: "Decision history", tr: "Karar geçmişi" }, icon: BookOpen },
  { to: "/setups", label: { en: "Setups", tr: "Setups" }, sub: { en: "Saved setups", tr: "Kayıtlı setup'lar" }, icon: Layers },
  { to: "/analytics", label: { en: "Analytics", tr: "Analytics" }, sub: { en: "Trader intelligence", tr: "Trader zekası" }, icon: BarChart3 },
  { to: "/markets", label: { en: "Markets", tr: "Markets" }, sub: { en: "Market data", tr: "Piyasa verisi" }, icon: LineChart },
  { to: "/news", label: { en: "News", tr: "News" }, sub: { en: "Macro / news", tr: "Makro / haber" }, icon: Newspaper },
  { to: "/tools", label: { en: "Tools", tr: "Tools" }, sub: { en: "Calculator / checklist", tr: "Hesaplayıcı / checklist" }, icon: Wrench },
];

export default function Layout({
  profile, onToggleTheme, onToggleLang,
}: {
  profile: UserProfile;
  onToggleTheme: () => void;
  onToggleLang: () => void;
}) {
  const navigate = useNavigate();
  const lang: Lang = profile.lang;
  const theme: ThemeMode = profile.theme;
  const initials = profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">WHY<span>.</span></span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                <Icon size={17} />
                <span>
                  {item.label[lang]}
                  <span className="sub">{item.sub[lang]}</span>
                </span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <button className="sidebar-user" onClick={() => navigate("/profile")} style={{ width: "100%", border: "none", background: "transparent", textAlign: "left" }}>
            <span className="avatar">{initials}</span>
            <span className="sidebar-user-meta">
              <strong>{profile.username}</strong>
              <span>{lang === "en" ? "View profile" : "Profili gör"}</span>
            </span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <span className="topbar-title" />
          <div className="topbar-actions">
            <button className="icon-btn" onClick={onToggleLang} title="EN / TR">
              <Globe2 size={16} />
            </button>
            <button className="icon-btn" onClick={onToggleTheme} title={lang === "en" ? "Toggle theme" : "Temayı değiştir"}>
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="icon-btn" onClick={() => navigate("/profile")}>
              <User size={16} />
            </button>
          </div>
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
