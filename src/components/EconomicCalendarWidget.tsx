import React, { useEffect, useRef, memo } from 'react';

const EconomicCalendarWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    if (container.current) {
        container.current.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      isTransparent: true,
      width: "100%",
      height: "100%",
      locale: "en",
      importanceFilter: "-1,0,1",
      currencyFilter: "USD,EUR,GBP,JPY,CAD,AUD,NZD,CHF"
    });
    
    if (container.current) {
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} ref={container}></div>
    </div>
  );
};

export default memo(EconomicCalendarWidget);
