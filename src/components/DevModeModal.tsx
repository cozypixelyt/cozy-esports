import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, KeyRound, AlertCircle, ShieldAlert } from 'lucide-react';

export const DevModeModal: React.FC = () => {
  const { isDevLoginModalOpen, setIsDevLoginModalOpen, unlockDevMode, setIsDevDashboardOpen } = useApp();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isDevLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Please enter developer security key.');
      return;
    }
    const res = unlockDevMode(pin);
    if (res.success) {
      setErrorMsg('');
      setPin('');
      setIsDevLoginModalOpen(false);
      setIsDevDashboardOpen(true);
    } else {
      setErrorMsg('Invalid Developer Key. Access Denied.');
    }
  };

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setIsDevLoginModalOpen(false);
          setErrorMsg('');
          setPin('');
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 md:backdrop-blur-md"
    >
      <div className="relative w-full max-w-sm bg-[#0e1424] border border-slate-800 rounded-3xl shadow-2xl p-6 text-center">
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setIsDevLoginModalOpen(false);
            setErrorMsg('');
            setPin('');
          }}
          aria-label="Close developer login modal"
          className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-500/10">
          <Lock className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="font-display text-xl font-black text-white">
          Developer Access
        </h3>
        <p className="text-slate-400 text-xs mt-1">
          Authorized organizers only. Enter the 6-digit key to manage scrims, create tournaments, and view player rosters.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              maxLength={8}
              placeholder="••••••"
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              className="w-full text-center text-2xl font-code font-bold tracking-widest bg-[#080c16] border border-slate-750 focus:border-red-500 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none"
            />
            {errorMsg && (
              <span className="text-xs text-red-400 mt-2 block flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Verify &amp; Unlock Console</span>
          </button>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldAlert className="w-3 h-3 text-slate-400" />
            <span>Developer credentials are restricted to organizers.</span>
          </p>
        </form>
      </div>
    </div>
  );
};
