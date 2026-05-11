import React from 'react';
import { BookOpen, ShieldAlert, Target, HelpCircle, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const markdownContent = `
## The Mathematics of Currency Strength

Traditional currency quoted pairs (e.g., EUR/USD) only reveal the relative value between two base assets. If the EUR/USD chart exhibits an uptrend, it is mathematically ambiguous whether the Euro is strengthening or the US Dollar is weakening.

**Quant Alpha** solves this dimensional ambiguity by decomposing the raw pair prices into independent, isolated, and absolute currency strengths.

### 1. Anchoring the Baseline (USD)

To establish a relational matrix, we must define an anchor. The US Dollar (USD), acting as the global reserve currency, serves as our value anchor.

* $V_{USD} = 1.0$ (The baseline value)
* The isolated value of any other currency $c$ is its direct or inverse rate to the USD: $V_c = Price(c/USD)$

### 2. Matrix Derivation (Constructing the 28 Pairs)

By tracking the primary 7 major pairs in real-time (EUR/USD, GBP/USD, AUD/USD, NZD/USD, USD/JPY, USD/CHF, USD/CAD), the engine can synthetically derive the pricing data for all other combinations (the crosses) with extremely low latency.

For any pair Base/Quote (e.g., EUR/GBP):

$$ Price(Base/Quote) = \\frac{V_{Base}}{V_{Quote}} $$

This gives us the current, unified snapshot of 28 currency pairs.

### 3. Strength Calculation (% Change)

Currency strength is the isolated percentage change of a currency's value against the entire basket over a selected timeframe (e.g., 1H, 1D, 1W).

1. **Snapshots:** The system logs the opening values $V_{c, open}$ at the specific lookback time, and tracks the current values $V_{c, current}$.
2. **Relative Momentum:** The percentage change of the pair $c_i/c_j$ over the time window is evaluated.
3. **Overall Matrix Strength:** A currency's absolute strength is calculated as the arithmetic mean of its percentage changes against **all 7 other reference currencies**.

If the CAD shows a strength of \`+0.75%\`, it signifies that the Canadian Dollar has appreciated by an average of 0.75% against the complete basket of global majors within the active timeframe.
`;

export default function Documentation() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full selection:bg-neon-cyan/30">
      <div className="glass-panel p-6 md:p-10 rounded-2xl border border-white/5 flex flex-col gap-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-3 text-neon-cyan mb-2">
            <BookOpen size={24} />
            <span className="font-mono text-sm tracking-widest uppercase">System Documentation</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white flex items-center gap-2">
             Quant<span className="font-light text-neon-cyan opacity-90">Alpha</span> Engine
          </h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-3xl">
            Welcome to the internal documentation portal for the Quant Alpha engine. Below you will find detailed breakdowns of the mathematical model, system limitations, and answers to frequently asked questions regarding the relative strength algorithm.
          </p>
        </div>

        {/* Calculations Explanation */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <Activity size={20} className="text-neon-amber" />
            <h2 className="text-lg font-mono text-white tracking-widest uppercase">Algorithm & Mathematics</h2>
          </div>
          <div className="markdown-body prose prose-invert prose-headings:font-normal prose-h2:text-white prose-h3:text-gray-300 prose-p:text-gray-400 prose-a:text-neon-cyan max-w-none font-sans text-sm md:text-base leading-relaxed">
            <ReactMarkdown>{markdownContent}</ReactMarkdown>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="flex flex-col gap-6 mt-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <HelpCircle size={20} className="text-neon-green" />
            <h2 className="text-lg font-mono text-white tracking-widest uppercase">Frequently Asked Questions</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <h3 className="text-white font-medium text-lg">Why does the 1 Hour (1H) timeframe sometimes show zero data?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The market is closed over the weekend. If you are viewing the dashboard on a Sunday, retrieving the data for the "last 1 hour" will return a completely flat line as no ticks have been executed on the exchange. The engine mathematically handles weekends by truncating data outside the active session.
              </p>
            </div>
            
            <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <h3 className="text-white font-medium text-lg">How often does the data update?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                We poll via Twelve Data REST API. Ticks are generally refreshed on the chart per every new tick registered by the REST endpoint. 
              </p>
            </div>

            <div className="bg-black/40 p-5 rounded-xl border border-white/5 flex flex-col gap-2">
              <h3 className="text-white font-medium text-lg">What does the Alpha Signal actually indicate?</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                The Alpha Signal is a mechanical combination of the strongest currency arrayed against the weakest currency in the matrix basket. It purely highlights relative momentum divergence. It does not factor in support/resistance, market context, or fundamental events. Do not trade purely off this mechanical divergence.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimers & Risk Warnings */}
        <section className="flex flex-col gap-6 mt-4 opacity-80">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <ShieldAlert size={20} className="text-gray-500" />
            <h2 className="text-lg font-mono text-gray-400 tracking-widest uppercase">Important Disclaimers</h2>
          </div>
          <div className="bg-[#050507] p-6 rounded-xl border border-white/5 flex flex-col gap-4 text-xs font-mono text-gray-500 leading-relaxed uppercase tracking-wider">
            <p>
              <strong>High Risk Warning:</strong> Foreign exchange trading on margin carries a high level of risk that may not be suitable for all investors. Leverage can work against you as well as for you. Before deciding to trade foreign exchange, you should carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you may sustain a loss of some or all of your initial investment; therefore, you should not invest money that you cannot afford to lose.
            </p>
            <p>
              <strong>Data Accuracy:</strong> While the Quant Alpha engine utilizes institutional-grade mathematical models logic, the raw tick data is subject to the stability, latency, and accuracy of the upstream data provider. We make no guarantees that the data depicted matches execution prices offered by brokers.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
}
