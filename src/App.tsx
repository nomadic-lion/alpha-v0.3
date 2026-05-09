/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import CommandCenter from './components/CommandCenter';
import Documentation from './components/Documentation';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'docs'>('main');

  return (
    <div className="flex flex-col min-h-screen bg-[#050507] text-white">
      {currentPage === 'main' ? <CommandCenter /> : <Documentation />}
      
      {/* GLOBAL FOOTER */}
      <footer className="border-t border-white/5 bg-black/40 py-6 px-4 md:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase text-center md:text-left leading-relaxed max-w-3xl">
            <strong className="text-gray-400">Disclaimer:</strong> The data and analytics provided by Quant Alpha are for informational and educational purposes only and do not constitute financial advice. Trading foreign exchange on margin carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results.
          </p>
          <div className="flex gap-6 shrink-0">
            <button 
              onClick={() => setCurrentPage('main')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${currentPage === 'main' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Matrix
            </button>
            <button 
              onClick={() => setCurrentPage('docs')}
              className={`text-[11px] font-mono uppercase tracking-widest transition-colors ${currentPage === 'docs' ? 'text-neon-cyan' : 'text-gray-500 hover:text-gray-300'}`}
            >
              Documentation & FAQ
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
