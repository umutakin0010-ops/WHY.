import { useState, type KeyboardEvent } from "react";
import { Mail, Lock, Eye, EyeOff, HardDrive, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Layers } from "lucide-react";
import { useAuth } from "../lib/auth";
import { translateAuthError } from "../lib/authErrors";
import type { Lang } from "../lib/types";
import "./Auth.css";

const copy = {
  en: {
    tagline: "Decision Clarity Protocol",
    headline: "Trade with a clear <em>why</em>, not a hunch.",
    sub: "Sign in to keep your decision journal, setups, and settings the same across every device.",
    signIn: "Sign In", signUp: "Sign Up", email: "Email", password: "Password",
    signInAction: "Sign in", signUpAction: "Create account",
    continueLocal: "Continue without an account", localSub: "Your data stays on this device only.",
    checkEmail: "Check your inbox to confirm your account, then sign in.",
    passwordHint: "At least 6 characters.",
    orDivider: "or",
    f1t: "Cross-device sync", f1s: "Decisions, setups and settings follow you everywhere.",
    f2t: "Private by design", f2s: "Row-level security means only you can ever see your data.",
    f3t: "Nothing lost switching", f3s: "Keep working locally, or go cloud whenever you're ready.",
  },
  tr: {
    tagline: "Decision Clarity Protokolü",
    headline: "Tahminle değil, net bir <em>why</em> ile trade et.",
    sub: "Giriş yap, journal'ın, setup'ların ve ayarların her cihazda aynı kalsın.",
    signIn: "Giriş Yap", signUp: "Kayıt Ol", email: "E-posta", password: "Şifre",
    signInAction: "Giriş yap", signUpAction: "Hesap oluştur",
    continueLocal: "Hesapsız devam et", localSub: "Verilerin sadece bu cihazda kalır.",
    checkEmail: "Hesabını onaylamak için e-postana bak, sonra giriş yap.",
    passwordHint: "En az 6 karakter olmalı.",
    orDivider: "veya",
    f1t: "Cihazlar arası senkron", f1s: "Kararların, setup'ların ve ayarların her yerde seninle.",
    f2t: "Tasarımdan gelen gizlilik", f2s: "Row-level security ile verini sadece sen görebilirsin.",
    f3t: "Geçişte hiçbir şey kaybolmaz", f3s: "İstersen local çalışmaya devam et, hazır olunca cloud'a geç.",
  },
};

export default function Auth({ lang, onContinueLocal }: { lang: Lang; onContinueLocal: () => void }) {
  const { signIn, signUp } = useAuth();
  const t = copy[lang];
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const switchMode = (next: "in" | "up") => {
    setMode(next); setError(null); setInfo(null);
  };

  const submit = async () => {
    setError(null); setInfo(null); setBusy(true);
    const result = mode === "in" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) { setError(translateAuthError(result.error, lang)); return; }
    if (mode === "up") setInfo(t.checkEmail);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && email && password && !busy) submit();
  };

  const features = [
    { icon: <RefreshCw size={16} />, title: t.f1t, sub: t.f1s },
    { icon: <ShieldCheck size={16} />, title: t.f2t, sub: t.f2s },
    { icon: <Layers size={16} />, title: t.f3t, sub: t.f3s },
  ];

  return (
    <div className="auth-shell">
      <div className="auth-showcase sweep-field">
        <div className="auth-showcase-glow" />
        <div className="auth-showcase-mark">WHY<span>.</span> — {t.tagline}</div>
        <h1 dangerouslySetInnerHTML={{ __html: t.headline }} />
        <p className="auth-showcase-sub">{t.sub}</p>
        <div className="auth-feature-list">
          {features.map((f, i) => (
            <div className="auth-feature" style={{ animationDelay: `${0.08 + i * 0.08}s` }} key={i}>
              <div className="auth-feature-icon">{f.icon}</div>
              <div className="auth-feature-copy">
                <strong>{f.title}</strong>
                <span>{f.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="card bracket auth-card">
          <div className="auth-brand-mobile">
            <div className="mark">WHY<span>.</span></div>
            <div className="tag">{t.tagline}</div>
          </div>

          <div className="auth-tabs">
            <div className="auth-tab-indicator" style={{ transform: mode === "up" ? "translateX(100%)" : "translateX(0)" }} />
            <button className={`auth-tab ${mode === "in" ? "active" : ""}`} onClick={() => switchMode("in")}>{t.signIn}</button>
            <button className={`auth-tab ${mode === "up" ? "active" : ""}`} onClick={() => switchMode("up")}>{t.signUp}</button>
          </div>

          {error && (
            <div className="auth-banner error"><AlertCircle size={15} /><span>{error}</span></div>
          )}
          {info && (
            <div className="auth-banner info"><CheckCircle2 size={15} /><span>{info}</span></div>
          )}

          <div className="auth-field">
            <label>{t.email}</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="leading-icon" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={onKeyDown} placeholder="you@example.com" autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field" style={{ marginBottom: 6 }}>
            <label>{t.password}</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="leading-icon" />
              <input
                type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKeyDown} placeholder="••••••••" autoComplete={mode === "in" ? "current-password" : "new-password"}
              />
              <button type="button" className="auth-toggle-visibility" onClick={() => setShowPassword((v) => !v)} tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          {mode === "up" && <p className="auth-hint">{t.passwordHint}</p>}

          <button className="btn btn-primary auth-submit" onClick={submit} disabled={busy || !email || !password}>
            {busy ? <span className="spinner" /> : <ArrowRight size={15} />}
            {mode === "in" ? t.signInAction : t.signUpAction}
          </button>

          <div className="auth-divider"><div className="line" /><span>{t.orDivider}</span><div className="line" /></div>

          <div className="auth-local-cta">
            <button className="btn btn-ghost btn-sm" onClick={onContinueLocal}>
              <HardDrive size={13} /> {t.continueLocal}
            </button>
            <p className="auth-local-sub">{t.localSub}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
