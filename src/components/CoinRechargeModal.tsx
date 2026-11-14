import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Clock,
  Check,
  Ticket,
  Gift,
  Info,
  LogIn,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CoinRechargeModal: React.FC = () => {
  const {
    isRechargeModalOpen,
    setIsRechargeModalOpen,
    adminConfig,
    requestCoinTopup,
    submitPlayCodeTopup,
    redeemCozyCode,
    topupRequests,
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    isDevMode,
    approveTopupRequest,
  } = useApp();

  const [selectedAmount, setSelectedAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'pay' | 'redeem' | 'history'>('pay');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [successHeadline, setSuccessHeadline] = useState('Coins Added!');
  const [successDetail, setSuccessDetail] = useState('');
  const [formError, setFormError] = useState('');
  const [fastMode, setFastMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redeem Code states
  const [cozyCodeInput, setCozyCodeInput] = useState('');
  const [cozyCodeError, setCozyCodeError] = useState('');
  const [playCodeAmount, setPlayCodeAmount] = useState<number>(50);
  const [playCodeInput, setPlayCodeInput] = useState('');
  const [playCodeGmail, setPlayCodeGmail] = useState(user.email || '');
  const [playCodeError, setPlayCodeError] = useState('');

  useEffect(() => {
    if (user.email) {
      setPlayCodeGmail(user.email);
    }
  }, [user.email]);

  if (!isRechargeModalOpen) return null;

  const finalAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const coinsToReceive = Math.floor(finalAmount * (adminConfig.coinRate || 1));

  const fireBrandConfetti = () => {
    try {
      confetti({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#3b82f6', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!finalAmount || finalAmount < 1) {
      setFormError('Please select or enter a valid recharge amount.');
      return;
    }
    const cleanUtr = utrNumber.replace(/\D/g, '');
    if (cleanUtr.length !== 12) {
      setFormError('Please enter an exact 12-digit numeric UPI UTR / Reference ID.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    const res = await requestCoinTopup(finalAmount, cleanUtr, fastMode);
    setIsSubmitting(false);

    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setSuccessHeadline(res.autoVerified ? 'Payment Auto-Verified!' : 'Request Submitted!');
    setSuccessDetail(res.message);
    setSubmissionSuccess(true);
    setUtrNumber('');
    fireBrandConfetti();
  };

  const handleRedeemCozyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setCozyCodeError('');
    setIsSubmitting(true);
    const res = await redeemCozyCode(cozyCodeInput);
    setIsSubmitting(false);
    if (!res.success) {
      setCozyCodeError(res.message);
      return;
    }

    setCozyCodeInput('');
    setSuccessHeadline('Redeem Code Applied!');
    setSuccessDetail(res.message);
    setSubmissionSuccess(true);
    fireBrandConfetti();
  };

  const handleSubmitPlayCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setPlayCodeError('');
    setIsSubmitting(true);
    const res = await submitPlayCodeTopup(playCodeAmount, playCodeInput, playCodeGmail);
    setIsSubmitting(false);
    if (!res.success) {
      setPlayCodeError(res.message);
      return;
    }

    setPlayCodeInput('');
    setSuccessHeadline('Play Code Sent for Verification!');
    setSuccessDetail(res.message);
    setSubmissionSuccess(true);
    fireBrandConfetti();
  };

  const userRequests = topupRequests.filter(r => r.userId === user.id);

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) {
          setIsRechargeModalOpen(false);
          setSubmissionSuccess(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-md"
    >
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#0a0f1d] border border-red-500/35 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="relative p-4 sm:p-5 bg-[#0e1526] border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-5 h-5 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-[11px]">
                  ₹
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider text-red-400">
                  Cozy Coin Recharge · ₹1 = 1 Coin
                </span>
              </div>

              <h2 className="font-display text-lg sm:text-xl font-black text-white">
                Add Coins to Wallet
              </h2>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsRechargeModalOpen(false);
                setSubmissionSuccess(false);
              }}
              aria-label="Close recharge modal"
              className="relative z-30 w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Sub Navigation */}
          <div className="flex items-center gap-1.5 mt-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => {
                setActiveSubTab('pay');
                setSubmissionSuccess(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeSubTab === 'pay'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-[#141c30]'
              }`}
            >
              UPI QR
            </button>
            <button
              onClick={() => {
                setActiveSubTab('redeem');
                setSubmissionSuccess(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 whitespace-nowrap ${
                activeSubTab === 'redeem'
                  ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-[#141c30]'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Redeem Code</span>
            </button>
            <button
              onClick={() => {
                setActiveSubTab('history');
                setSubmissionSuccess(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'history'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-[#141c30]'
              }`}
            >
              <span>History</span>
              {userRequests.length > 0 && (
                <span className="px-1.5 bg-black/30 rounded-full text-[10px] font-code">
                  {userRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-300 text-xs">
          {!isGoogleSignedIn && !submissionSuccess && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-2xl flex items-center justify-between gap-2.5">
              <span className="text-[11px] text-blue-200 font-semibold leading-snug">
                Sign in with Google so coins &amp; codes save to your online wallet.
              </span>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
          {submissionSuccess ? (
            <div className="p-5 sm:p-6 bg-blue-950/20 border border-blue-500/40 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-500/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display text-lg font-black text-white">
                  {successHeadline}
                </h3>
                <p className="text-slate-200 text-xs mt-1 max-w-xs mx-auto">
                  {successDetail}
                </p>
                <span className="text-xs text-slate-400 font-mono block mt-2">
                  Current Balance: <strong className="text-white font-bold">{user.coins} Coins</strong>
                </span>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setSubmissionSuccess(false);
                    setIsRechargeModalOpen(false);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Done
                </button>
                <button
                  onClick={() => setSubmissionSuccess(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
                >
                  Add More
                </button>
              </div>
            </div>
          ) : activeSubTab === 'redeem' ? (
            <div className="space-y-4">
              {/* Option A: Instant Cozy Gift / Redeem Code */}
              <form
                onSubmit={handleRedeemCozyCode}
                className="p-4 bg-[#070b14] border border-blue-500/30 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-blue-400" />
                    <h3 className="font-display font-bold text-white text-sm">
                      Cozy Redeem Code (Instant)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-950/50 px-2 py-0.5 rounded-md border border-blue-500/30">
                    Auto Credit
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  Organizer se mila hua Cozy Code daalo — coins turant wallet me add ho jayenge.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cozyCodeInput}
                    onChange={e => {
                      setCozyCodeInput(e.target.value.toUpperCase());
                      setCozyCodeError('');
                    }}
                    placeholder="Enter Code (e.g. COZY50)"
                    className="flex-1 bg-[#101625] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2.5 text-xs text-white font-code uppercase tracking-wider focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !isGoogleSignedIn}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase rounded-xl transition-all active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Wait...' : 'Redeem'}
                  </button>
                </div>

                {cozyCodeError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{cozyCodeError}</span>
                  </p>
                )}
              </form>

              {/* Option B: Google Play Redeem Code Submission */}
              <form
                onSubmit={handleSubmitPlayCode}
                className="p-4 bg-[#070b14] border border-red-500/30 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-red-400" />
                    <h3 className="font-display font-bold text-white text-sm">
                      Google Play Redeem Code
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-red-400 bg-red-950/50 px-2 py-0.5 rounded-md border border-red-500/30">
                    Organizer Verify
                  </span>
                </div>

                <div className="p-2.5 bg-[#0d1424] border border-slate-800 rounded-xl flex items-start gap-2 text-[11px] text-slate-400">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    Browser web apps Google Play Gmail balance ko directly auto-charge nahi kar sakte. Aap apna Google Play Redeem Code &amp; Gmail submit kar sakte ho — Organizer verify karke coins add karega.
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 30, 50, 100].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPlayCodeAmount(amt)}
                      className={`py-2 rounded-xl border text-center font-code text-xs font-bold transition-all ${
                        playCodeAmount === amt
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-[#101625] border-slate-800 text-slate-300'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  required
                  value={playCodeInput}
                  onChange={e => {
                    setPlayCodeInput(e.target.value.toUpperCase());
                    setPlayCodeError('');
                  }}
                  placeholder="16-Digit Google Play Code (e.g. ABCD-1234-EFGH-5678)"
                  className="w-full bg-[#101625] border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-code uppercase tracking-wider focus:outline-none"
                />

                <input
                  type="email"
                  required
                  value={playCodeGmail}
                  onChange={e => {
                    setPlayCodeGmail(e.target.value);
                    setPlayCodeError('');
                  }}
                  placeholder="Your Gmail (e.g. name@gmail.com)"
                  className="w-full bg-[#101625] border border-slate-700 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />

                {playCodeError && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{playCodeError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !isGoogleSignedIn}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : `Submit Play Code (₹${playCodeAmount} = ${playCodeAmount} Coins)`}
                </button>
              </form>
            </div>
          ) : activeSubTab === 'history' ? (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-xs uppercase tracking-wider">
                Recharge &amp; Code History
              </h3>
              {userRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-[#070b14] rounded-2xl border border-slate-800">
                  <Clock className="w-7 h-7 text-slate-600 mx-auto mb-2" />
                  <p>No recharge submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {userRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-3 bg-[#070b14] border border-slate-800 rounded-2xl flex items-center justify-between gap-2.5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white font-code text-sm">
                            ₹{req.inrAmount}
                          </span>
                          <span className="text-slate-500">&rarr;</span>
                          <span className="text-blue-400 font-bold font-code text-sm">
                            {req.coins} Coins
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                          {req.paymentMethod === 'play_code' ? 'Play Code: ' : 'UTR: '}
                          {req.utr} · {req.submittedAt}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {req.status === 'approved' ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-950/40 border border-blue-500/30 text-blue-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Added
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-950/40 border border-red-500/30 text-red-400">
                            Rejected
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-red-950/40 border border-red-500/30 text-red-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}

                        {isDevMode && req.status === 'pending' && (
                          <button
                            onClick={() => approveTopupRequest(req.id)}
                            className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* STEP 1: Select Amount */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    1. Select Amount (₹1 = 1 Coin)
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  {[20, 50, 100, 200].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        selectedAmount === amt && !customAmount
                          ? 'bg-red-600 text-white border-red-500 font-bold shadow-sm'
                          : 'bg-[#101625] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-code text-xs font-bold block">₹{amt}</span>
                      <span className="text-[10px] block opacity-80">{amt} C</span>
                    </button>
                  ))}
                </div>

                <input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  placeholder="Custom ₹ Amount (e.g. 150)"
                  value={customAmount}
                  onChange={e => {
                    setCustomAmount(e.target.value);
                    if (e.target.value) {
                      setSelectedAmount(parseInt(e.target.value, 10) || 0);
                    }
                  }}
                  className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-code"
                />
              </div>

              {/* STEP 2: QR Code */}
              <div className="space-y-2.5 bg-[#070b14] border border-slate-800 p-3.5 rounded-2xl text-center">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    2. Scan QR to Pay ₹{finalAmount}
                  </span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    PhonePe · GPay · Paytm
                  </span>
                </div>

                <div className="inline-block p-2.5 bg-black rounded-2xl border border-red-500/40">
                  <img
                    src="/assets/qr_code_clean.png"
                    alt="Official Payment QR Code"
                    decoding="async"
                    className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-xl mx-auto block contrast-125"
                  />
                </div>
              </div>

              {/* STEP 3: Submit UTR */}
              <form onSubmit={handleSubmitUtr} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    3. Enter 12-Digit UTR *
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-blue-400 font-bold select-none">
                    <input
                      type="checkbox"
                      checked={fastMode}
                      onChange={e => setFastMode(e.target.checked)}
                      className="rounded border-slate-700 text-red-600 focus:ring-0"
                    />
                    <span>Auto-Verify UTR</span>
                  </label>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  required
                  placeholder="12-digit UTR / Ref Number (digits only)"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-code tracking-wider"
                />

                <p className="text-[10px] text-slate-400">
                  Unique 12-digit UTR auto-credits coins online &amp; alerts organizer ({adminConfig.supportEmail}).
                </p>

                {formError && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {formError}
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !isGoogleSignedIn}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 min-h-[42px] disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isSubmitting ? 'Verifying UTR Online...' : `Verify & Add ${coinsToReceive} Coins`}
                  </span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
