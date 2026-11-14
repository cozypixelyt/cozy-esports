import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { GameType, MatchFormat } from '../types';
import {
  X,
  PlusCircle,
  Key,
  Trash2,
  CheckCircle,
  XCircle,
  Coins,
  Settings,
  Sparkles,
  Lock,
  Ticket,
  Copy,
  RefreshCw,
  Mail,
  LogIn,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { copyToClipboard } from '../utils/clipboard';

export const DevDashboardModal: React.FC = () => {
  const {
    isDevDashboardOpen,
    setIsDevDashboardOpen,
    lockDevMode,
    tournaments,
    createTournament,
    updateTournament,
    deleteTournament,
    topupRequests,
    approveTopupRequest,
    rejectTopupRequest,
    withdrawalRequests,
    approveWithdrawal,
    rejectWithdrawal,
    redeemCodes,
    createRedeemCode,
    deleteRedeemCode,
    adminInjectCoins,
    adminConfig,
    updateAdminConfig,
    user,
    isFirebaseAdmin,
    signInWithGoogle,
    adminAlerts,
    serverEmailStatus,
    sendTestAdminAlert,
    resetAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'codes' | 'topups' | 'withdrawals' | 'rooms' | 'alerts' | 'settings'>('create');

  // Create Tournament Form State
  const [game, setGame] = useState<GameType>('bgmi');
  const [title, setTitle] = useState('');
  const [map, setMap] = useState('Erangel');
  const [format, setFormat] = useState<MatchFormat>('Squad');
  const [entryFee, setEntryFee] = useState(40);
  const [prizePool, setPrizePool] = useState(1000);
  const [rank1, setRank1] = useState(500);
  const [rank2, setRank2] = useState(300);
  const [rank3, setRank3] = useState(150);
  const [perKill, setPerKill] = useState(10);
  const [maxSlots, setMaxSlots] = useState(48);
  const [startTime, setStartTime] = useState('Today, 09:30 PM IST');
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [rulesText, setRulesText] = useState(
    '1. Mobile players only (No Emulators).\n2. Room ID shared 15 mins before match.\n3. Hacker or teaming results in instant ban.'
  );
  const [formSuccess, setFormSuccess] = useState('');

  // Redeem Code Generator State
  const [newCodeText, setNewCodeText] = useState('');
  const [newCodeCoins, setNewCodeCoins] = useState(50);
  const [newCodeMaxUses, setNewCodeMaxUses] = useState(10);
  const [codeFeedback, setCodeFeedback] = useState('');

  // Wallet Injector state
  const [injectAmount, setInjectAmount] = useState(100);
  const [injectReason, setInjectReason] = useState('Organizer Tournament Reward');
  const [injectSuccess, setInjectSuccess] = useState('');

  // Settings State
  const [newUpiId, setNewUpiId] = useState(adminConfig.upiId);
  const [newUpiName, setNewUpiName] = useState(adminConfig.upiName);
  const [newPin, setNewPin] = useState(adminConfig.pin);
  const [autoVerifyUpi, setAutoVerifyUpi] = useState(adminConfig.autoVerifyUpi ?? true);
  const [maxAutoVerifyInr, setMaxAutoVerifyInr] = useState(adminConfig.maxAutoVerifyInr ?? 50000);
  const [configSavedMsg, setConfigSavedMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // Alert Test State
  const [alertFeedback, setAlertFeedback] = useState('');
  const [isTestingAlert, setIsTestingAlert] = useState(false);

  useEffect(() => {
    setNewUpiId(adminConfig.upiId);
    setNewUpiName(adminConfig.upiName);
    setNewPin(adminConfig.pin);
    setAutoVerifyUpi(adminConfig.autoVerifyUpi ?? true);
    setMaxAutoVerifyInr(adminConfig.maxAutoVerifyInr ?? 50000);
  }, [adminConfig]);

  if (!isDevDashboardOpen) return null;

  const pendingRequests = topupRequests.filter(r => r.status === 'pending');
  const pendingWithdrawals = withdrawalRequests.filter(w => w.status === 'pending');

  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    setNewCodeText(`COZY${suffix}`);
    setCodeFeedback('');
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await createRedeemCode(newCodeText, newCodeCoins, newCodeMaxUses);
    setCodeFeedback(res.message);
    if (res.success) {
      setNewCodeText('');
    }
    setTimeout(() => setCodeFeedback(''), 3500);
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rulesArray = rulesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const created = await createTournament({
      title: title.trim(),
      game,
      map: map.trim() || 'Custom Arena',
      format,
      entryFee: Number(entryFee),
      prizePool: Number(prizePool),
      prizeBreakdown: {
        rank1: Number(rank1),
        rank2: Number(rank2),
        rank3: Number(rank3),
        perKill: Number(perKill),
      },
      maxSlots: Number(maxSlots),
      startTime: startTime.trim(),
      startTimestamp: Date.now() + 3600 * 1000 * 2,
      status: 'upcoming',
      roomId: roomId.trim() || undefined,
      roomPassword: roomPassword.trim() || undefined,
      credentialsVisibleBeforeMinutes: 15,
      rules: rulesArray.length > 0 ? rulesArray : ['Standard fair-play rules apply.'],
      bannerGradient: 'from-red-600/30 via-slate-900 to-slate-950',
      serverRegion: 'India',
      image:
        game === 'bgmi'
          ? '/assets/aistudio/image_1b72c6fb.png'
          : game === 'freefire'
          ? '/assets/aistudio/image_d453b33c.png'
          : game === 'minecraft'
          ? '/assets/aistudio/image_d27cd744.png'
          : '/assets/aistudio/image_1b72c6fb.png',
    });

    if (!created) return;

    setFormSuccess('Published Online!');
    setTitle('');
    setRoomId('');
    setRoomPassword('');

    try {
      confetti({
        particleCount: 50,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#3b82f6', '#ffffff'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => setFormSuccess(''), 3500);
  };

  const handleInjectCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminInjectCoins(injectAmount, injectReason);
    setInjectSuccess(`+${injectAmount} Coins credited!`);
    setTimeout(() => setInjectSuccess(''), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateAdminConfig({
      upiId: newUpiId.trim(),
      upiName: newUpiName.trim(),
      pin: newPin.trim(),
      autoVerifyUpi,
      maxAutoVerifyInr: Number(maxAutoVerifyInr || 0),
    });
    setConfigSavedMsg('Saved!');
    setTimeout(() => setConfigSavedMsg(''), 3000);
  };

  const handleTestAlert = async () => {
    if (isTestingAlert) return;
    setIsTestingAlert(true);
    const res = await sendTestAdminAlert();
    setIsTestingAlert(false);
    setAlertFeedback(res.message);
    setTimeout(() => setAlertFeedback(''), 5000);
  };

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) setIsDevDashboardOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-md"
    >
      {/* Compact Classic Mobile-First Console Window */}
      <div className="relative w-full max-w-md sm:max-w-xl bg-[#0a0f1d] border border-red-500/35 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Compact Sticky Top Header */}
        <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 bg-[#0e1526] border-b border-slate-800/90 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-500/40 shrink-0 bg-black">
              <img
                src="/assets/aistudio/Neon_Red_COZY_Esports_Mascot_be8e3250.png"
                alt="COZY_ESPORTS Logo"
                decoding="async"
                className="w-full h-full object-cover object-center scale-[1.12]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-sm sm:text-base font-black text-white truncate">
                  Developer Console
                </h2>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                Host · Codes · Top-ups · Payouts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={lockDevMode}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 min-h-[34px]"
              title="Lock Developer Mode"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDevDashboardOpen(false)}
              className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/35 text-red-300 hover:text-white border border-red-500/40 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 min-h-[34px]"
              title="Cancel & Close Console"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* Classic Compact Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800/80 bg-[#070b14] overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'create'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'codes'
                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('topups')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'topups'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Top-ups</span>
            {pendingRequests.length > 0 && (
              <span className="px-1.5 bg-black/40 text-white rounded-full text-[10px] font-mono">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'withdrawals'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Payouts</span>
            {pendingWithdrawals.length > 0 && (
              <span className="px-1.5 bg-red-600 text-white rounded-full text-[10px] font-mono">
                {pendingWithdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Rooms</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Alerts</span>
            {adminAlerts.length > 0 && (
              <span className="px-1.5 bg-black/40 text-white rounded-full text-[10px] font-mono">
                {adminAlerts.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-[#0d1424]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>UPI &amp; PIN</span>
          </button>
        </div>

        {/* Scrollable Compact Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4 flex-1 text-slate-300 text-xs">
          {!isFirebaseAdmin && (
            <div className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <span className="font-bold text-white text-[11px] block">
                  Online Organizer Auth Required
                </span>
                <span className="text-[10px] text-blue-200 block">
                  Sign in with <strong>cozypixelboy@gmail.com</strong> to publish tournaments, approve codes, and view live alerts across devices.
                </span>
              </div>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
          {/* TAB 1: CREATE TOURNAMENT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateTournament} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm">
                  Publish Tournament
                </h3>
                {formSuccess && (
                  <span className="text-[11px] text-blue-300 font-bold bg-blue-950/60 border border-blue-500/40 px-2.5 py-0.5 rounded-lg">
                    {formSuccess}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'minecraft', label: 'Minecraft' },
                  { id: 'freefire', label: 'Free Fire' },
                  { id: 'bgmi', label: 'BGMI' },
                ].map(g => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGame(g.id as GameType);
                      if (g.id === 'bgmi') setMap('Erangel');
                      if (g.id === 'freefire') setMap('Bermuda');
                      if (g.id === 'minecraft') setMap('Bedwars 4v4');
                    }}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                      game === g.id
                        ? 'bg-red-600 text-white border-red-500 shadow-sm'
                        : 'bg-[#101625] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                placeholder="Tournament Title (e.g. Night Cup Squad)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Map"
                  value={map}
                  onChange={e => setMap(e.target.value)}
                  className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />

                <select
                  value={format}
                  onChange={e => setFormat(e.target.value as MatchFormat)}
                  className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Solo">Solo</option>
                  <option value="Duo">Duo</option>
                  <option value="Squad">Squad</option>
                </select>

                <input
                  type="text"
                  required
                  placeholder="Time (e.g. 9:30 PM)"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="col-span-2 sm:col-span-1 w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#070b14] border border-slate-800/80 p-2.5 rounded-xl">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Entry (Coins)</label>
                  <input
                    type="number"
                    min="0"
                    value={entryFee}
                    onChange={e => setEntryFee(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-red-400 font-bold font-code"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Prize Pool</label>
                  <input
                    type="number"
                    min="0"
                    value={prizePool}
                    onChange={e => setPrizePool(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-bold font-code"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Per Kill</label>
                  <input
                    type="number"
                    min="0"
                    value={perKill}
                    onChange={e => setPerKill(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold font-code"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Max Slots</label>
                  <input
                    type="number"
                    min="2"
                    max="100"
                    value={maxSlots}
                    onChange={e => setMaxSlots(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold font-code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">1st Prize</label>
                  <input
                    type="number"
                    value={rank1}
                    onChange={e => setRank1(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-code"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">2nd Prize</label>
                  <input
                    type="number"
                    value={rank2}
                    onChange={e => setRank2(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-code"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">3rd Prize</label>
                  <input
                    type="number"
                    value={rank3}
                    onChange={e => setRank3(Number(e.target.value))}
                    className="w-full bg-[#101625] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Room ID / IP (Optional)"
                  value={roomId}
                  onChange={e => setRoomId(e.target.value)}
                  className="w-full bg-[#101625] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Room Pass (Optional)"
                  value={roomPassword}
                  onChange={e => setRoomPassword(e.target.value)}
                  className="w-full bg-[#101625] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <textarea
                rows={2}
                value={rulesText}
                onChange={e => setRulesText(e.target.value)}
                placeholder="Match Rules (one per line)"
                className="w-full bg-[#101625] border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-[11px] text-white focus:outline-none font-mono"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 min-h-[42px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publish Live</span>
              </button>
            </form>
          )}

          {/* TAB: REDEEM CODES GENERATOR */}
          {activeTab === 'codes' && (
            <div className="space-y-3.5">
              <form
                onSubmit={handleCreateCode}
                className="p-3.5 bg-[#070b14] border border-blue-500/30 rounded-xl space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-white text-sm">
                    Create Redeem Code
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateRandomCode}
                    className="text-[11px] text-blue-400 hover:text-white font-bold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto Code</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  value={newCodeText}
                  onChange={e => setNewCodeText(e.target.value.toUpperCase())}
                  placeholder="Code (e.g. COZY50)"
                  className="w-full bg-[#101625] border border-slate-700 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white font-code uppercase tracking-wider focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Coins Value</label>
                    <input
                      type="number"
                      min="1"
                      value={newCodeCoins}
                      onChange={e => setNewCodeCoins(Number(e.target.value))}
                      className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-code font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Max Users</label>
                    <input
                      type="number"
                      min="1"
                      value={newCodeMaxUses}
                      onChange={e => setNewCodeMaxUses(Number(e.target.value))}
                      className="w-full bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-code font-bold"
                    />
                  </div>
                </div>

                {codeFeedback && (
                  <p className="text-[11px] font-bold text-blue-400">{codeFeedback}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white font-black text-xs uppercase rounded-xl"
                >
                  Generate Redeem Code
                </button>
              </form>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Active Codes ({redeemCodes.length})
                </h4>
                {redeemCodes.length === 0 ? (
                  <div className="p-5 text-center text-slate-500 text-xs bg-[#070b14] rounded-xl border border-slate-800">
                    No redeem codes created yet.
                  </div>
                ) : (
                  redeemCodes.map(rc => (
                    <div
                      key={rc.id}
                      className="p-3 bg-[#070b14] border border-slate-800 rounded-xl flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-code font-black text-white text-xs tracking-wider">
                            {rc.code}
                          </span>
                          <span className="text-[11px] font-bold text-blue-400">
                            +{rc.coins} Coins
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          Used: {rc.usedBy.length}/{rc.maxUses}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(rc.code)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRedeemCode(rc.id)}
                          className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg"
                          title="Delete Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TOP-UPS (UPI & GOOGLE PLAY CODES) */}
          {activeTab === 'topups' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm">
                  Top-up &amp; Play Code Approvals
                </h3>
                <span className="px-2 py-0.5 bg-red-500/20 text-red-300 rounded-lg text-[11px] font-mono font-bold">
                  {pendingRequests.length} Pending
                </span>
              </div>

              {topupRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#070b14] rounded-xl border border-slate-800">
                  No payment submissions yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topupRequests.map(req => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-1.5">
                          {req.paymentMethod === 'play_code' && (
                            <span className="px-1.5 py-0.5 rounded bg-red-600/25 border border-red-500/40 text-red-300 text-[9px] font-black uppercase shrink-0">
                              PLAY CODE
                            </span>
                          )}
                          <span className="font-bold text-white text-xs truncate">
                            {req.userName} ({req.userIgn})
                          </span>
                        </div>
                        <span className="font-code font-bold text-blue-400 text-xs shrink-0">
                          ₹{req.inrAmount} (+{req.coins} C)
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                        <span className="truncate">
                          {req.paymentMethod === 'play_code' ? 'Code: ' : 'UTR: '}
                          <strong className="text-white">{req.utr}</strong>
                          {req.userEmail ? ` · ${req.userEmail}` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(req.utr)}
                          className="text-blue-400 underline shrink-0"
                        >
                          Copy
                        </button>
                      </div>

                      {req.status === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => approveTopupRequest(req.id)}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => rejectTopupRequest(req.id)}
                            className="flex-1 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-500/30 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-bold block ${
                            req.status === 'approved' ? 'text-blue-400' : 'text-red-400'
                          }`}
                        >
                          {req.status === 'approved' ? 'Approved & Credited' : 'Rejected'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYOUTS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-white text-sm">
                  Player UPI Payouts
                </h3>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-lg text-[11px] font-mono font-bold">
                  {pendingWithdrawals.length} Pending
                </span>
              </div>

              {withdrawalRequests.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#070b14] rounded-xl border border-slate-800">
                  No withdrawal requests yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {withdrawalRequests.map(w => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-[#070b14] border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate">
                          {w.userName} ({w.userIgn})
                        </span>
                        <span className="font-code font-bold text-blue-400 text-xs shrink-0">
                          ₹{w.inrAmount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300 font-mono">
                        <span className="truncate">UPI: {w.upiId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(w.upiId)}
                          className="text-blue-400 underline shrink-0"
                        >
                          Copy
                        </button>
                      </div>

                      {w.status === 'pending' ? (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => approveWithdrawal(w.id, `UPI_${Date.now().toString().slice(-6)}`)}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] rounded-lg flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(w.id, 'Invalid UPI ID')}
                            className="flex-1 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-500/30 font-bold text-[11px] rounded-lg flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Refund</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`text-[11px] font-bold block ${
                            w.status === 'completed' ? 'text-blue-400' : 'text-red-400'
                          }`}
                        >
                          {w.status === 'completed' ? `Paid (${w.payoutRef})` : 'Rejected & Refunded'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ROOMS */}
          {activeTab === 'rooms' && (
            <div className="space-y-3">
              <h3 className="font-display font-bold text-white text-sm">
                Active Matches &amp; Room Pass
              </h3>

              {tournaments.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-[#070b14] rounded-xl border border-slate-800">
                  No active tournaments. Create one in the Create tab.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tournaments.map(t => (
                    <div
                      key={t.id}
                      className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase text-red-400">
                            {t.game} · {t.registeredPlayers.length}/{t.maxSlots}
                          </span>
                          <h4 className="font-bold text-white text-xs truncate">{t.title}</h4>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <select
                            value={t.status}
                            onChange={e => updateTournament(t.id, { status: e.target.value as any })}
                            className="bg-slate-900 border border-slate-700 text-[11px] text-white rounded-lg px-2 py-1"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Done</option>
                          </select>
                          <button
                            onClick={() => deleteTournament(t.id)}
                            className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={t.roomId || ''}
                          onChange={e => updateTournament(t.id, { roomId: e.target.value })}
                          placeholder="Room ID"
                          className="w-full bg-[#121828] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-red-400 font-mono font-bold"
                        />
                        <input
                          type="text"
                          value={t.roomPassword || ''}
                          onChange={e => updateTournament(t.id, { roomPassword: e.target.value })}
                          placeholder="Room Pass"
                          className="w-full bg-[#121828] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: GMAIL ALERTS (cozypixelboy@gmail.com) */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              <div className="p-3 bg-[#070b14] border border-blue-500/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display font-bold text-white text-sm truncate">
                      Gmail Notifications &rarr; cozypixelboy@gmail.com
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {serverEmailStatus.smtpConfigured
                        ? 'Live SMTP Relay Active (Emails dispatch automatically)'
                        : 'Console Sync Active · Configure SMTP secrets in hosting env for automatic inbox emails'}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                      serverEmailStatus.smtpConfigured
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        : 'bg-red-600/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {serverEmailStatus.smtpConfigured ? 'SMTP LIVE' : 'LOG + MAILTO'}
                  </span>
                </div>

                {alertFeedback && (
                  <p className="text-[11px] text-blue-300 font-semibold">{alertFeedback}</p>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isTestingAlert}
                    onClick={handleTestAlert}
                    className="flex-1 py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingAlert ? 'Testing...' : 'Send Test Alert'}</span>
                  </button>
                  <a
                    href="mailto:cozypixelboy@gmail.com?subject=COZY_ESPORTS%20Notification%20Test"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
                  >
                    Open Gmail
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recent Online Alerts ({adminAlerts.length})
                </h4>
                {adminAlerts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs bg-[#070b14] rounded-xl border border-slate-800">
                    No payment or withdrawal alerts logged yet.
                  </div>
                ) : (
                  adminAlerts.map(al => (
                    <div
                      key={al.id}
                      className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white text-xs truncate">{al.subject}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0 ${
                            al.emailDispatched
                              ? 'bg-blue-950/50 text-blue-300 border border-blue-500/40'
                              : 'bg-red-950/50 text-red-300 border border-red-500/40'
                          }`}
                        >
                          {al.emailDispatched ? 'Emailed' : 'Logged'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{al.summary}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                        <span>{al.timestamp || 'Just now'}</span>
                        <a
                          href={`mailto:cozypixelboy@gmail.com?subject=${encodeURIComponent(al.subject)}&body=${encodeURIComponent(al.summary)}`}
                          className="text-blue-400 underline"
                        >
                          Forward Gmail
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: UPI & PIN SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <form onSubmit={handleInjectCoins} className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">Grant Coins ({user.name})</span>
                  {injectSuccess && <span className="text-[11px] text-blue-400 font-bold">{injectSuccess}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={injectAmount}
                    onChange={e => setInjectAmount(Number(e.target.value))}
                    className="w-24 bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-red-400 font-code font-bold"
                  />
                  <input
                    type="text"
                    value={injectReason}
                    onChange={e => setInjectReason(e.target.value)}
                    placeholder="Reason"
                    className="flex-1 bg-[#101625] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold text-xs rounded-xl"
                >
                  Grant Coins
                </button>
              </form>

              <form onSubmit={handleSaveSettings} className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs block">
                    Admin UPI, Auto-Verify &amp; Key
                  </span>
                  {configSavedMsg && (
                    <span className="text-[11px] text-blue-400 font-bold">{configSavedMsg}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={newUpiId}
                  onChange={e => setNewUpiId(e.target.value)}
                  placeholder="Admin UPI ID"
                  className="w-full bg-[#101625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newUpiName}
                    onChange={e => setNewUpiName(e.target.value)}
                    placeholder="Payee Name"
                    className="w-full bg-[#101625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={newPin}
                    onChange={e => setNewPin(e.target.value)}
                    placeholder="Developer Key"
                    className="w-full bg-[#101625] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                {/* Auto-Verify Unique 12-Digit UPI Toggle & Max Amount */}
                <div className="p-2.5 bg-[#0d1424] border border-blue-500/25 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white block">
                        Auto-Verify 12-Digit UPI UTRs
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Automatically credit coins when organizer is away
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoVerifyUpi(!autoVerifyUpi)}
                      aria-label="Toggle Auto-Verify UPI"
                      className={`w-10 h-5 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
                        autoVerifyUpi ? 'bg-gradient-to-r from-red-600 to-blue-600 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow-sm block" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">Max Auto-Verify Amount (₹):</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="50000"
                      value={maxAutoVerifyInr}
                      onChange={e => setMaxAutoVerifyInr(Number(e.target.value))}
                      className="w-24 bg-[#101625] border border-slate-700 rounded-lg px-2 py-1 text-xs text-blue-400 font-code font-bold text-right"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl"
                  >
                    Save Config Online
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!confirmReset) {
                        setConfirmReset(true);
                        setTimeout(() => setConfirmReset(false), 3500);
                      } else {
                        setConfirmReset(false);
                        resetAllData();
                      }
                    }}
                    className="px-3 py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/30 text-xs rounded-xl"
                  >
                    {confirmReset ? 'Confirm?' : 'Reset'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
