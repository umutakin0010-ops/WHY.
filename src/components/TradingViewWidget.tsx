import { memo, useEffect, useRef } from "react";

type Props = {
  scriptSrc: string;
  config: Record<string, unknown>;
  height?: number | string;
};

function TradingViewWidget({ scriptSrc, config, height = 400 }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const configKey = JSON.stringify(config);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    el.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = configKey;
    el.appendChild(script);

    return () => { el.innerHTML = ""; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptSrc, configKey]);

  return <div className="tradingview-widget-container" ref={container} style={{ height, width: "100%" }} />;
}

export default memo(TradingViewWidget);
