import React from 'react';
import { useApp } from '../context/AppContext';
import { Swords, Wallet, Settings, Plus, Lock, Shield, Bell, Menu, LogIn } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    isDevMode,
    setIsDevLoginModalOpen,
    setIsDevDashboardOpen,
    setIsRechargeModalOpen,
    activeTab,
    setActiveTab,
    notificationsEnabled,
    enableNotifications,
    topupRequests,
    setIsSidebarOpen,
  } = useApp();

  const pendingRequestsCount = topupRequests.filter(r => r.status === 'pending').length;
  const firstName = (user.name || 'Gamer').split(' ')[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d1a]/95 md:backdrop-blur-md border-b border-red-500/20 shadow-lg shadow-black/40">
      <div className="max-w-[1500px] mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Zone 1: Clickable Mascot Logo + Brand Wordmark (Opens Sidebar Drawer) */}
        <div className="flex items-center gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2 cursor-pointer group select-none min-h-[44px] pr-1 text-left"
            title="Open Games & Navigation Menu"
          >
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-red-500/50 shadow-md shadow-red-600/30 group-hover:scale-105 group-hover:border-red-400 transition-all shrink-0 bg-black">
              <img
                src="/assets/aistudio/Neon_Red_COZY_Esports_Mascot_be8e3250.png"
                alt="COZY_ESPORTS Logo"
                decoding="async"
                className="w-full h-full object-cover object-center scale-[1.12]"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#080d1a]/90 border-tl rounded-tl-md flex items-center justify-center">
                <Menu className="w-2.5 h-2.5 text-red-400" />
              </span>
            </div>
            <div className="min-w-0">
              <span className="font-display text-sm sm:text-base font-black tracking-tight text-white uppercase flex items-center leading-none">
                COZY<span className="text-red-500">_ESPORTS</span>
              </span>
              <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1 mt-0.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                <span className="truncate">
                  {isGoogleSignedIn ? `Hi, ${firstName}` : 'Online · Sign In'}
                </span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Desktop 3 Clean Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-4 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'matches'
                ? 'bg-red-600/15 text-red-400 border border-red-500/40 shadow-sm shadow-red-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Matches</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'wallet'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>My Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-red-600/15 to-blue-600/15 text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Zone 3: Install App / Sign In, Bell, Clean Coin Pill & Organizer Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isGoogleSignedIn ? (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="h-9 sm:h-10 px-2.5 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95"
              title="Sign in with Google to save coins & matches online"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <div className="hidden sm:block">
              <PWAInstallButton compact />
            </div>
          )}

          <button
            onClick={() => enableNotifications()}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition-all flex items-center justify-center ${
              notificationsEnabled
                ? 'bg-red-950/40 border-red-500/40 text-red-400 shadow-sm'
                : 'bg-[#101625] border-slate-700/80 text-slate-400 hover:text-white'
            }`}
            title={notificationsEnabled ? '5-Min Match & Payment alerts active' : 'Enable 5-min match notifications'}
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Clean Video-Style Coin Pill */}
          <div className="flex items-center bg-[#101728] border border-blue-500/35 hover:border-red-500/40 rounded-xl p-0.5 sm:p-1 transition-colors shadow-sm">
            <button
              onClick={() => setActiveTab('wallet')}
              className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-200 min-h-[32px]"
              title="Your Cozy Coins Balance (1 Coin = ₹1)"
            >
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-[10px]">
                ©
              </span>
              <span className="font-code font-bold text-white tabular-nums text-xs sm:text-sm">
                {user.coins}
              </span>
            </button>

            <button
              onClick={() => setIsRechargeModalOpen(true)}
              className="px-2 py-1 sm:px-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-[10px] sm:text-xs rounded-lg transition-transform active:scale-95 flex items-center gap-0.5 shadow-sm shadow-red-600/20 min-h-[30px]"
              title="Add Coins via UPI QR"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>

          {/* Organizer Console Button (Blinking Red Light when Developer Mode is active) */}
          {isDevMode ? (
            <button
              onClick={() => setIsDevDashboardOpen(true)}
              className="relative w-9 h-9 sm:w-auto sm:h-10 sm:px-3 bg-gradient-to-r from-red-600/25 to-blue-600/25 hover:from-red-600/40 hover:to-blue-600/40 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 border border-red-500/60"
              title="Developer Mode Active — Tap to Open Console"
            >
              <Shield className="w-4 h-4 text-red-400 shrink-0" />
              <span className="hidden sm:inline font-mono uppercase text-[11px]">Console</span>
              {/* Blinking Red Status Light */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-90" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-[#080d1a] shadow-[0_0_8px_rgba(239,68,68,0.95)]" />
              </span>
              {pendingRequestsCount > 0 && (
                <span className="hidden sm:flex w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsDevLoginModalOpen(true)}
              className="w-9 h-9 sm:w-auto sm:h-10 sm:px-2.5 bg-[#101625] hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-500/30 rounded-xl transition-all flex items-center justify-center gap-1 text-xs"
              title="Organizer Portal Login"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px]">Organizer</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
