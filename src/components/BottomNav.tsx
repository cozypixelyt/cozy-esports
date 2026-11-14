import React from 'react';
import { useApp } from '../context/AppContext';
import { Swords, Wallet, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d1a]/98 border-t border-red-500/20 pb-safe shadow-2xl">
      <div className="grid grid-cols-3 items-center h-16 px-2 sm:px-4">
        {/* Tab 1: Matches (Deadly Red) */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
            activeTab === 'matches'
              ? 'text-red-400 font-bold scale-105 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-tight mt-1">My Matches</span>
        </button>

        {/* Tab 2: Wallet (Electric Blue) */}
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
            activeTab === 'wallet'
              ? 'text-blue-400 font-bold scale-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-tight mt-1">My Wallet</span>
        </button>

        {/* Tab 3: Settings (Dual Blend) */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
            activeTab === 'settings'
              ? 'text-white font-bold scale-105 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[11px] font-bold tracking-tight mt-1">Settings</span>
        </button>
      </div>
    </nav>
  );
};
