import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ArrowDownRight, Shield, Coins } from 'lucide-react';

export const WalletView: React.FC = () => {
  const {
    user,
    setIsRechargeModalOpen,
    setIsWithdrawModalOpen,
    adminConfig,
    isDevMode,
    setIsDevDashboardOpen,
  } = useApp();

  const rate = adminConfig.coinRate || 1;

  return (
    <div className="max-w-md mx-auto py-4 space-y-4">
      {/* Clean Single Coin Action Card (No Total Balance / Credit / Payout / History clutter) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90 shadow-2xl text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-md">
          <Coins className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-code font-black text-4xl text-white tabular-nums tracking-tight">
              {user.coins}
            </span>
            <span className="font-display font-bold text-sm text-red-400 uppercase">
              Coins
            </span>
          </div>
          <p className="text-xs text-slate-400 font-code tabular-nums">
            1 Cozy Coin = ₹{rate} · ₹{(user.coins * rate).toFixed(0)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/25 active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Coins</span>
          </button>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="w-full py-3 px-4 bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 border border-blue-500/40 hover:border-blue-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <ArrowDownRight className="w-4 h-4 text-blue-400 stroke-[2.5]" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {isDevMode && (
        <button
          onClick={() => setIsDevDashboardOpen(true)}
          className="w-full py-3 px-4 bg-gradient-to-r from-red-600/20 to-blue-600/20 hover:from-red-600/30 hover:to-blue-600/30 border border-red-500/30 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <Shield className="w-4 h-4 text-red-400" />
          <span>Open Organizer Console</span>
        </button>
      )}
    </div>
  );
};
