import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowDownRight, ShieldCheck, AlertCircle, CheckCircle2, Clock, Landmark, Coins, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';

export const WithdrawModal: React.FC = () => {
  const {
    isWithdrawModalOpen,
    setIsWithdrawModalOpen,
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    withdrawalRequests,
    requestWithdrawal,
    adminConfig,
  } = useApp();

  const [coinsToWithdraw, setCoinsToWithdraw] = useState<number>(Math.min(user.coins, 100));
  const [customCoins, setCustomCoins] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'history'>('request');

  if (!isWithdrawModalOpen) return null;

  const finalCoins = customCoins ? parseInt(customCoins, 10) || 0 : coinsToWithdraw;
  const inrAmount = finalCoins * (adminConfig.coinRate || 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!isGoogleSignedIn) {
      setErrorMsg('Please continue with Google Sign-In first to request withdrawals.');
      return;
    }
    if (finalCoins < 1) {
      setErrorMsg('Please enter at least 1 coin to withdraw.');
      return;
    }
    if (finalCoins > user.coins) {
      setErrorMsg(`Insufficient coins! Your current balance is ${user.coins} coins.`);
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. yourname@okhdfcbank or 9876543210@paytm).');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    const res = await requestWithdrawal(finalCoins, upiId.trim());
    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg(res.message);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#ef4444', '#3b82f6', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const userWithdrawals = withdrawalRequests.filter(w => w.userId === user.id);

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setIsWithdrawModalOpen(false);
          setSuccessMsg('');
          setErrorMsg('');
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-md"
    >
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#0e1424] border border-blue-500/40 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="relative p-4 sm:p-5 bg-gradient-to-r from-[#0d1322] via-[#10192e] to-[#0d1322] border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[11px]">
                  ₹
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400">
                  Real Money Payout · ₹1 = 1 Coin
                </span>
              </div>

              <h2 className="font-display text-lg sm:text-2xl font-black text-white">
                Withdraw Coins to UPI
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Convert your tournament winnings into real cash sent directly to your PhonePe, Google Pay, or Paytm.
              </p>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsWithdrawModalOpen(false);
                setSuccessMsg('');
                setErrorMsg('');
              }}
              aria-label="Close withdraw modal"
              className="relative z-30 w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-2 mt-3.5">
            <button
              onClick={() => {
                setActiveSubTab('request');
                setSuccessMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeSubTab === 'request'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              Withdraw Coins
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-800/60'
              }`}
            >
              <span>Payout History</span>
              {userWithdrawals.length > 0 && (
                <span className="px-1.5 py-0.2 bg-black/40 rounded-full text-[10px] font-mono">
                  {userWithdrawals.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-300 text-sm">
          {activeSubTab === 'history' ? (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">
                Your UPI Withdrawal History
              </h3>
              {userWithdrawals.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-[#080d19] rounded-2xl border border-slate-800">
                  <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p>No withdrawal requests submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userWithdrawals.map(w => (
                    <div
                      key={w.id}
                      className="p-3.5 bg-[#080d19] border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-code text-base">
                            ₹{w.inrAmount}
                          </span>
                          <span className="text-slate-500">&larr;</span>
                          <span className="text-blue-400 font-bold font-code text-base">
                            {w.coins} Coins
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-cyan-300 text-[11px] bg-slate-900 px-2 py-0.5 rounded">
                            UPI: {w.upiId}
                          </span>
                          <span className="text-slate-600">·</span>
                          <span className="text-[11px]">{w.requestedAt}</span>
                        </div>
                      </div>

                      <div>
                        {w.status === 'completed' ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-blue-950/40 border border-blue-500/30 text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Transferred
                          </span>
                        ) : w.status === 'rejected' ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-red-950/40 border border-red-500/30 text-red-400 flex items-center gap-1">
                            <X className="w-3.5 h-3.5" />
                            Cancelled (Refunded)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-red-950/40 border border-red-500/30 text-red-400 flex items-center gap-1 animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                            Processing Transfer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : successMsg ? (
            <div className="p-6 bg-blue-950/20 border border-blue-500/40 rounded-3xl text-center space-y-4">
              <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-black text-white">
                  Withdrawal Requested!
                </h3>
                <p className="text-slate-200 text-sm mt-1 max-w-sm mx-auto">
                  <strong className="text-blue-400 font-bold">₹{inrAmount}</strong> ({finalCoins} Coins) has been submitted for payout to <strong className="text-white font-mono">{upiId}</strong>.
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  The organizer will transfer the money to your UPI account. Coins will remain reserved.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSuccessMsg('');
                    setIsWithdrawModalOpen(false);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isGoogleSignedIn && (
                <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex items-center justify-between gap-3">
                  <span className="text-xs text-blue-200 font-semibold">
                    Sign in with Google to withdraw online coins.
                  </span>
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}

              {/* Balance Card */}
              <div className="p-4 bg-[#080d19] border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Available Coin Balance
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-code font-black text-2xl text-white">
                      {user.coins}
                    </span>
                    <span className="text-xs text-blue-400 font-bold uppercase">
                      Coins (= ₹{user.coins * (adminConfig.coinRate || 1)} INR)
                    </span>
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                  <Coins className="w-5 h-5" />
                </div>
              </div>

              {/* Step 1: Select Coins to Withdraw */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Step 1: Coins to Withdraw (1 Coin = ₹1) *
                  </label>
                  <span className="text-xs text-blue-400 font-mono font-bold">
                    Payout: ₹{inrAmount}
                  </span>
                </div>

                {/* Preset Pills */}
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100, user.coins].map((amt, idx) => {
                    const isAll = idx === 3;
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={amt <= 0}
                        onClick={() => {
                          setCoinsToWithdraw(amt);
                          setCustomCoins('');
                        }}
                        className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                          (customCoins === '' && coinsToWithdraw === amt && amt > 0)
                            ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white border-blue-400 font-bold shadow-md'
                            : amt <= 0
                            ? 'bg-[#0a0e19] border-slate-850 text-slate-600 cursor-not-allowed'
                            : 'bg-[#101728] border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="font-code text-xs font-bold block">
                          {isAll ? 'All' : `${amt}`}
                        </span>
                        <span className="text-[9px] block opacity-80">
                          ₹{amt}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Coins Input */}
                <div className="flex items-center gap-2 bg-[#101728] border border-slate-800 focus-within:border-blue-500 rounded-xl px-3 h-10 transition-colors">
                  <span className="text-slate-400 text-xs font-bold shrink-0">
                    Coins:
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max={user.coins}
                    placeholder={`Max ${user.coins} coins`}
                    value={customCoins}
                    onChange={e => {
                      setCustomCoins(e.target.value);
                      if (e.target.value) {
                        setCoinsToWithdraw(parseInt(e.target.value, 10) || 0);
                      }
                    }}
                    className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-code"
                  />
                </div>
              </div>

              {/* Step 2: Enter Player's UPI ID */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Step 2: Your UPI ID (GPay / PhonePe / Paytm) *
                  </label>
                  <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5" />
                    Direct Bank Transfer
                  </span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                  value={upiId}
                  onChange={e => {
                    setUpiId(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-[#101728] border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter the exact UPI ID where you want to receive your money. The organizer will transfer ₹{inrAmount} directly to this address.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 rounded-xl flex items-center gap-2 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={user.coins < 1 || isSubmitting || !isGoogleSignedIn}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  user.coins < 1 || isSubmitting || !isGoogleSignedIn
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white shadow-red-600/20 active:scale-[0.98]'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isSubmitting ? 'Submitting...' : `Request Real Money Payout (₹${inrAmount})`}
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
