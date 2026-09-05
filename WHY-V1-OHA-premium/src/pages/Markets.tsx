import type { Lang, UserProfile } from "../lib/types";
import TradingViewWidget from "../components/TradingViewWidget";

const copy = {
  en: { title: "Markets", note: "Live data via TradingView — real forex, metals and index prices, not a mock." },
  tr: { title: "Markets", note: "TradingView üzerinden canlı veri — gerçek forex, metal ve endeks fiyatları, mock değil." },
};

export default function Markets({ profile }: { profile: UserProfile }) {
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

      <div className="card" style={{ marginBottom: 14, padding: "6px 4px" }}>
        <TradingViewWidget
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          height={54}
          config={{
            symbols: [
              { proName: "FX:EURUSD", title: "EUR/USD" },
              { proName: "FX:GBPUSD", title: "GBP/USD" },
              { proName: "FX:USDJPY", title: "USD/JPY" },
              { proName: "FX:AUDUSD", title: "AUD/USD" },
              { proName: "FX:USDCAD", title: "USD/CAD" },
              { proName: "FX:USDCHF", title: "USD/CHF" },
              { proName: "OANDA:XAUUSD", title: "Gold" },
              { proName: "CRYPTO:BTCUSD", title: "BTC/USD" },
            ],
            showSymbolLogo: true,
            isTransparent: true,
            displayMode: "adaptive",
            colorTheme: tvTheme,
            locale: tvLocale,
          }}
        />
      </div>

      <div className="card">
        <TradingViewWidget
          scriptSrc="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
          height={500}
          config={{
            colorTheme: tvTheme,
            dateRange: "12M",
            showChart: true,
            locale: tvLocale,
            isTransparent: true,
            showSymbolLogo: true,
            showFloatingTooltip: false,
            width: "100%",
            height: "500",
            plotLineColorGrowing: "rgba(41, 98, 255, 1)",
            plotLineColorFalling: "rgba(41, 98, 255, 1)",
            plotLineColorGrowingBottom: "rgba(41, 98, 255, 0)",
            plotLineColorFallingBottom: "rgba(41, 98, 255, 0)",
            belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
            belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
            belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
            belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
            symbolActiveColor: "rgba(41, 98, 255, 0.12)",
            tabs: [
              {
                title: "Forex",
                originalTitle: "Forex",
                symbols: [
                  { s: "FX:EURUSD" }, { s: "FX:GBPUSD" }, { s: "FX:USDJPY" }, { s: "FX:AUDUSD" },
                  { s: "FX:USDCAD" }, { s: "FX:USDCHF" }, { s: "FX:NZDUSD" }, { s: "FX:EURJPY" },
                ],
              },
              {
                title: "Commodities",
                originalTitle: "Commodities",
                symbols: [
                  { s: "OANDA:XAUUSD" }, { s: "OANDA:XAGUSD" }, { s: "TVC:USOIL" }, { s: "TVC:UKOIL" },
                ],
              },
              {
                title: "Indices",
                originalTitle: "Indices",
                symbols: [
                  { s: "FOREXCOM:SPXUSD" }, { s: "FOREXCOM:NSXUSD" }, { s: "FOREXCOM:DJI" }, { s: "TVC:DXY" },
                ],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
