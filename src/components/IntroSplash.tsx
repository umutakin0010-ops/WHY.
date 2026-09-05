import { useEffect, useState } from "react";
import type { Lang } from "../lib/types";
import "./IntroSplash.css";

const SEEN_KEY = "why.intro.seen.v2";

export default function IntroSplash({ lang }: { lang: Lang }) {
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SEEN_KEY));
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    if (!visible) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    const timer = window.setTimeout(() => setVisible(false), 3150);
    return () => window.clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`intro-splash${skip ? " skip" : ""}`} onAnimationEnd={(e) => { if (e.animationName === "intro-exit") setVisible(false); }}>
      <div className="intro-grid" />
      <div className="intro-scan" />
      <div className="intro-stage">
        <span className="intro-corner tl" />
        <span className="intro-corner tr" />
        <span className="intro-corner bl" />
        <span className="intro-corner br" />
        <div className="intro-mark">WHY<span>.</span></div>
        <div className="intro-beam" />
        <div className="intro-tag">{lang === "en" ? "Decision Clarity Protocol" : "Decision Clarity Protokolü"}</div>
      </div>
      <button className="intro-skip" onClick={() => setSkip(true)}>{lang === "en" ? "SKIP" : "GEÇ"}</button>
    </div>
  );
}
