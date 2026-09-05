import type { Lang, UserProfile } from "../lib/types";
import TradingViewWidget from "../components/TradingViewWidget";

const copy = {
  en: { title: "Forex News", note: "Live economic calendar via TradingView — real scheduled events and real impact ratings." },
  tr: { title: "Forex Haberleri", note: "TradingView üzerinden canlı ekonomik takvim — gerçek zamanlanmış event'ler, gerçek etki seviyeleri." },
};

export default function News({ profile }: { profile: UserProfile }) {
  const lang: Lang = profile.lang;
  const t = copy[lang];
  const tvTheme = profile.theme === "dark" ? "dark" : "light";
  const tvLocale = lang === "tr" ? "tr" : "en";

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, marginTop: 0 }}>{t.title}</h1>
      <div className="card" style={{ marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-faint)" }}>{t.note}</p>
      </div>

      <div className="card">
        <TradingViewWidget
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
          height={650}
          config={{
            colorTheme: tvTheme,
            isTransparent: true,
            width: "100%",
            height: "650",
            locale: tvLocale,
            importanceFilter: "-1,0,1",
            countryFilter: "us,eu,gb,jp,au,ca,ch,nz,cn",
          }}
        />
      </div>
    </div>
  );
}
