import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Bell,
  FileText,
  Lock,
  CheckCircle2,
  Save,
  Gamepad2,
  ShieldCheck,
  AlertTriangle,
  BellRing,
  Mail,
  ChevronRight,
  Swords,
  PlusCircle,
  ArrowDownRight,
  Bot,
  Trophy,
  RotateCcw,
  LogIn,
  LogOut,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PWAInstallButton } from './PWAInstallButton';

export const SettingsView: React.FC = () => {
  const {
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    signOutUser,
    tournaments,
    updateUserProfile,
    notificationsEnabled,
    enableNotifications,
    triggerNotification,
    isDevMode,
    setIsDevLoginModalOpen,
    setIsDevDashboardOpen,
    lockDevMode,
    resetAllData,
    simulateFiveMinuteNotification,
    setActiveTab,
    setMatchesSubTab,
    setIsRechargeModalOpen,
    setIsWithdrawModalOpen,
    setIsAIAssistantOpen,
  } = useApp();

  // Gamer profile state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bgmiIgn, setBgmiIgn] = useState(user.bgmiIgn);
  const [bgmiId, setBgmiId] = useState(user.bgmiId);
  const [freefireIgn, setFreefireIgn] = useState(user.freefireIgn);
  const [freefireId, setFreefireId] = useState(user.freefireId);
  const [minecraftUsername, setMinecraftUsername] = useState(user.minecraftUsername);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setBgmiIgn(user.bgmiIgn);
    setBgmiId(user.bgmiId);
    setFreefireIgn(user.freefireIgn);
    setFreefireId(user.freefireId);
    setMinecraftUsername(user.minecraftUsername);
  }, [
    user.id,
    user.name,
    user.email,
    user.phone,
    user.bgmiIgn,
    user.bgmiId,
    user.freefireIgn,
    user.freefireId,
    user.minecraftUsername,
  ]);

  // Active expanded section (clean list-item drawer behavior)
  const [expandedSection, setExpandedSection] = useState<'none' | 'profile' | 'notifications' | 'agreements'>('none');
  const [confirmReset, setConfirmReset] = useState(false);

  const joinedCount = tournaments.filter(t =>
    t.registeredPlayers.some(p => p.id === user.id)
  ).length;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name: name.trim() || user.name,
      email: email.trim(),
      phone: phone.trim(),
      bgmiIgn: bgmiIgn.trim(),
      bgmiId: bgmiId.trim(),
      freefireIgn: freefireIgn.trim(),
      freefireId: freefireId.trim(),
      minecraftUsername: minecraftUsername.trim(),
      ign: bgmiIgn.trim() || freefireIgn.trim() || user.name,
      gameUid: bgmiId.trim() || freefireId.trim(),
    });

    setProfileSaved(true);
    triggerNotification('Gamer Profile Saved', 'Your in-game IDs and Gmail have been updated.');

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#ef4444', '#3b82f6', '#ffffff'],
      });
    } catch {
      // ignore
    }

    setTimeout(() => setProfileSaved(false), 3000);
  };

  const toggleSection = (section: 'profile' | 'notifications' | 'agreements') => {
    setExpandedSection(prev => (prev === section ? 'none' : section));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 1. Profile Identity Card (Clean Video-Inspired Layout) */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90 shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-red-500/40 shadow-md shadow-red-600/20 shrink-0 bg-black">
            <img
              src="/assets/aistudio/Neon_Red_COZY_Esports_Mascot_be8e3250.png"
              alt="COZY_ESPORTS Profile"
              decoding="async"
              className="w-full h-full object-cover object-center scale-[1.12]"
            />
          </div>

          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-400 block">
              Gamer Profile
            </span>
            <h2 className="font-display text-base sm:text-lg font-black text-white truncate">
              {user.name}
            </h2>
            <div className="flex items-center gap-2 text-xs mt-0.5">
              <span className="font-code font-bold text-blue-400 tabular-nums">
                {user.coins}.00 Coins
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400 truncate text-[11px]">
                {user.email || 'Add Gmail'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isGoogleSignedIn ? (
            <button
              type="button"
              onClick={() => signOutUser()}
              className="px-3 py-2 bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
              title="Sign out Google Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Google Sign In</span>
            </button>
          )}
          <button
            onClick={() => toggleSection('profile')}
            className="px-3 py-2 bg-gradient-to-r from-red-600/20 to-blue-600/20 hover:from-red-600/30 hover:to-blue-600/30 border border-red-500/30 text-white text-xs font-bold rounded-xl shrink-0 transition-all"
          >
            {expandedSection === 'profile' ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Install COZY_ESPORTS App Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-blue-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-bold text-white text-xs sm:text-sm">
            Download &amp; Install COZY_ESPORTS App (Free)
          </h3>
          <p className="text-[11px] text-slate-400">
            Vivo Y16 &amp; sabhi Android phones par Play Store ke bina standalone app install karein.
          </p>
        </div>
        <div className="shrink-0">
          <PWAInstallButton />
        </div>
      </div>

      {/* 2. Account Stats 3-Column Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3 px-1">
          Account Overview
        </span>
        <div className="grid grid-cols-3 divide-x divide-slate-800/80 text-center">
          <div className="px-2">
            <Swords className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <span className="font-code font-black text-base text-white tabular-nums block">
              {joinedCount}
            </span>
            <span className="text-[10px] text-slate-400 block">Matches Joined</span>
          </div>

          <div className="px-2">
            <Trophy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="font-code font-black text-base text-white tabular-nums block">
              ₹{user.coins}
            </span>
            <span className="text-[10px] text-slate-400 block">Cash Value</span>
          </div>

          <div className="px-2">
            <Bell className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <span className="font-code font-black text-base text-white block">
              {notificationsEnabled ? 'ON' : 'OFF'}
            </span>
            <span className="text-[10px] text-slate-400 block">5-Min Alerts</span>
          </div>
        </div>
      </div>

      {/* 3. Settings & Quick Alert Toggle */}
      <div className="rounded-2xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Settings
          </span>
        </div>

        {/* My Profile Row */}
        <button
          onClick={() => toggleSection('profile')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors border-b border-slate-800/60 min-h-[52px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-600/15 text-red-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold text-white block">My Profile &amp; Game IDs</span>
              <span className="text-[11px] text-slate-400 block">Gmail, BGMI, Free Fire &amp; Minecraft</span>
            </div>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-400 transition-transform ${
              expandedSection === 'profile' ? 'rotate-90 text-red-400' : ''
            }`}
          />
        </button>

        {/* Expanded Profile Editor */}
        {expandedSection === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-4 sm:p-5 bg-[#070b14]/80 border-b border-slate-800/80 space-y-4">
            {profileSaved && (
              <div className="p-3 bg-blue-950/50 border border-blue-500/50 text-blue-300 rounded-xl flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-blue-400" />
                <span>Gamer credentials saved!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Player Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. NexusKiller"
                  className="w-full bg-[#101625] border border-slate-750 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Gmail Address (Primary ID) *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-[#101625] border border-slate-750 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Phone Number <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-[#101625] border border-slate-750 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* BGMI IDs */}
            <div className="p-3 bg-[#0a0f1d] border border-red-500/25 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                BGMI (Battlegrounds Mobile India)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={bgmiIgn}
                  onChange={e => setBgmiIgn(e.target.value)}
                  placeholder="BGMI IGN (e.g. Mortal_OP)"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={bgmiId}
                  onChange={e => setBgmiId(e.target.value)}
                  placeholder="BGMI Character UID"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-red-500 rounded-lg px-3 py-1.5 text-xs text-red-300 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Free Fire IDs */}
            <div className="p-3 bg-[#0a0f1d] border border-blue-500/25 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                Free Fire MAX
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={freefireIgn}
                  onChange={e => setFreefireIgn(e.target.value)}
                  placeholder="Free Fire IGN"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                />
                <input
                  type="text"
                  value={freefireId}
                  onChange={e => setFreefireId(e.target.value)}
                  placeholder="Free Fire UID"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-blue-300 font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Minecraft Gamertag */}
            <div className="p-3 bg-[#0a0f1d] border border-slate-750 rounded-xl space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Minecraft (Java &amp; Bedrock)
              </span>
              <input
                type="text"
                value={minecraftUsername}
                onChange={e => setMinecraftUsername(e.target.value)}
                placeholder="Minecraft Username / Gamertag"
                className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Profile</span>
            </button>
          </form>
        )}

        {/* Quick Notifications Toggle Row (Video Toggle Style) */}
        <div className="px-4 py-3.5 flex items-center justify-between min-h-[52px]">
          <button
            type="button"
            onClick={() => toggleSection('notifications')}
            className="flex items-center gap-3 text-left flex-1"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">5-Min Match &amp; Payment Alerts</span>
              <span className="text-[11px] text-slate-400 block">Push notification before match starts</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => enableNotifications()}
            aria-label="Toggle Notifications"
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center shrink-0 ${
              notificationsEnabled ? 'bg-gradient-to-r from-red-600 to-blue-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-sm block" />
          </button>
        </div>

        {expandedSection === 'notifications' && (
          <div className="p-4 bg-[#070b14]/80 border-t border-slate-800/80 space-y-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={enableNotifications}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors"
              >
                {notificationsEnabled ? 'Alerts Active' : 'Enable Browser Alerts'}
              </button>
              <button
                type="button"
                onClick={() => simulateFiveMinuteNotification()}
                className="px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>Test 5-Min Push Alert</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              Joining the room on time is your own responsibility; no refunds for missing match start.
            </p>
          </div>
        )}
      </div>

      {/* 4. Quick Shortcuts Grid (2-Column Clean Menu like Video's Card) */}
      <div className="p-4 rounded-2xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90 space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Quick Actions
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              setMatchesSubTab('joined');
              setActiveTab('matches');
            }}
            className="p-3 rounded-xl bg-[#0f1628]/80 hover:bg-[#141d34] border border-slate-800/80 flex items-center gap-2.5 text-left transition-colors min-h-[48px]"
          >
            <Gamepad2 className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">My Matches</span>
          </button>

          <button
            onClick={() => setIsRechargeModalOpen(true)}
            className="p-3 rounded-xl bg-[#0f1628]/80 hover:bg-[#141d34] border border-slate-800/80 flex items-center gap-2.5 text-left transition-colors min-h-[48px]"
          >
            <PlusCircle className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">Add Coins</span>
          </button>

          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="p-3 rounded-xl bg-[#0f1628]/80 hover:bg-[#141d34] border border-slate-800/80 flex items-center gap-2.5 text-left transition-colors min-h-[48px]"
          >
            <ArrowDownRight className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">Withdraw UPI</span>
          </button>

          <button
            onClick={() => setIsAIAssistantOpen(true)}
            className="p-3 rounded-xl bg-[#0f1628]/80 hover:bg-[#141d34] border border-slate-800/80 flex items-center gap-2.5 text-left transition-colors min-h-[48px]"
          >
            <Bot className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-bold text-white truncate">AI Safety Coach</span>
          </button>
        </div>
      </div>

      {/* 5. Platform Information Clean List */}
      <div className="rounded-2xl bg-[#0a0f1d]/95 md:backdrop-blur-md border border-slate-800/90 overflow-hidden divide-y divide-slate-800/60">
        <div className="px-4 py-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Information
          </span>
        </div>

        {/* Terms & Fair Play Accordion Row */}
        <div>
          <button
            onClick={() => toggleSection('agreements')}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-white">Terms, Fair Play &amp; No-Refund Policy</span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-slate-400 transition-transform ${
                expandedSection === 'agreements' ? 'rotate-90 text-red-400' : ''
              }`}
            />
          </button>

          {expandedSection === 'agreements' && (
            <div className="p-4 bg-[#070b14]/80 border-t border-slate-800/80 space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-[#0a0f1d] rounded-xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-blue-400 text-[11px] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  1. 1 INR = 1 Cozy Coin Policy
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Coins maintain a strict 1:1 exchange rate via verified UPI QR payments. Submitting false or duplicate UTR numbers results in permanent account ban.
                </p>
              </div>

              <div className="p-3 bg-[#0a0f1d] rounded-xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-red-400 text-[11px] uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  2. Fair Play &amp; Anti-Cheat
                </h4>
                <p className="text-slate-300 text-[11px]">
                  BGMI: Mobile only (no emulators/iPads). Free Fire MAX: Gun attributes disabled. Minecraft: Max 15 CPS, no hacked clients.
                </p>
              </div>

              <div className="p-3 bg-red-950/20 rounded-xl border border-red-500/40 space-y-1">
                <h4 className="font-bold text-red-400 text-[11px] uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  3. Player Responsibility (Strict No-Refund)
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Entering the room on time before match start is solely your responsibility. No coins or money will be refunded if you fail to join on time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Official Support Email */}
        <a
          href="mailto:cozypixelboy@gmail.com"
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <span className="text-xs sm:text-sm font-bold text-white block">Customer Support</span>
              <span className="text-[11px] text-blue-400 font-mono">cozypixelboy@gmail.com</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </a>

        {/* Organizer Access */}
        {isDevMode ? (
          <div className="px-4 py-3 flex items-center justify-between gap-2 min-h-[48px]">
            <button
              onClick={() => setIsDevDashboardOpen(true)}
              className="flex items-center gap-3 text-left flex-1"
            >
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-white">Open Organizer Console</span>
            </button>
            <button
              onClick={lockDevMode}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg"
            >
              Lock
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsDevLoginModalOpen(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-900/50 transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-red-400" />
              <span className="text-xs sm:text-sm font-bold text-white">Organizer Portal Login</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}

        {/* Reset Local Data (WebView-safe 2-tap confirm) */}
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
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-950/20 transition-colors min-h-[48px]"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span className="text-xs sm:text-sm font-bold text-red-400">
              {confirmReset ? 'Tap again to confirm Reset' : 'Reset Local Data'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
