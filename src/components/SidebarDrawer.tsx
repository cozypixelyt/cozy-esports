import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Swords,
  Layers,
  Wallet,
  Settings,
  Shield,
  HelpCircle,
  ChevronRight,
  Mail,
  LogIn,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PWAInstallButton } from './PWAInstallButton';

export const SidebarDrawer: React.FC = () => {
  const {
    isSidebarOpen,
    setIsSidebarOpen,
    activeFilter,
    setActiveFilter,
    matchesSubTab,
    setMatchesSubTab,
    activeTab,
    setActiveTab,
    tournaments,
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    signOutUser,
    isDevMode,
    setIsDevDashboardOpen,
    setIsDevLoginModalOpen,
    setIsAIAssistantOpen,
  } = useApp();

  const joinedCount = tournaments.filter(t =>
    t.registeredPlayers.some(p => p.id === user.id)
  ).length;

  const counts = {
    all: tournaments.length,
    minecraft: tournaments.filter(t => t.game === 'minecraft').length,
    freefire: tournaments.filter(t => t.game === 'freefire').length,
    bgmi: tournaments.filter(t => t.game === 'bgmi').length,
  };

  const handleSelectGame = (game: 'minecraft' | 'freefire' | 'bgmi') => {
    setActiveFilter(game);
    setMatchesSubTab('all');
    setActiveTab('matches');
    setIsSidebarOpen(false);
  };

  const handleSelectSubTab = (sub: 'all' | 'joined') => {
    setMatchesSubTab(sub);
    setActiveTab('matches');
    if (sub === 'all') {
      setActiveFilter('all');
    }
    setIsSidebarOpen(false);
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 md:backdrop-blur-sm"
          />

          {/* Simple Smooth Sliding Sidebar Panel */}
          <motion.div
            key="sidebar-panel"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[300px] sm:max-w-xs bg-[#090e1a]/98 md:backdrop-blur-xl border-r border-red-500/30 h-full flex flex-col justify-between shadow-2xl z-10 overflow-hidden will-change-transform"
          >
            {/* Top Brand Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-red-950/40 via-[#0e1526] to-[#090e1a] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-red-500/50 shadow-lg shadow-red-600/30 shrink-0 bg-black">
                  <img
                    src="/assets/aistudio/Neon_Red_COZY_Esports_Mascot_be8e3250.png"
                    alt="COZY_ESPORTS Logo"
                    decoding="async"
                    className="w-full h-full object-cover object-center scale-[1.12]"
                  />
                </div>
                <div>
                  <h2 className="font-display text-base font-black tracking-tight text-white uppercase flex items-center gap-1">
                    COZY<span className="text-red-500">_ESPORTS</span>
                  </h2>
                  <span className="text-[10px] text-blue-400 font-semibold block -mt-0.5">
                    Navigation &amp; Circuit
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-5 flex-1 text-slate-300 text-xs">
              {/* Group 1: Match Navigation */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 tracking-wider">
                  Tournament Hub
                </span>

                <button
                  onClick={() => handleSelectSubTab('all')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold transition-all min-h-[44px] ${
                    activeTab === 'matches' && matchesSubTab === 'all' && activeFilter === 'all'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 font-black'
                      : 'bg-[#0f1628]/80 hover:bg-[#131d33] text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="text-xs">All Tournaments</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 font-mono tabular-nums">
                    {counts.all}
                  </span>
                </button>

                <button
                  onClick={() => handleSelectSubTab('joined')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold transition-all min-h-[44px] ${
                    activeTab === 'matches' && matchesSubTab === 'joined'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30 font-black'
                      : 'bg-[#0f1628]/80 hover:bg-[#131d33] text-slate-300 border border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span className="text-xs">My Matches</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/30 font-mono font-bold tabular-nums">
                    {joinedCount}
                  </span>
                </button>
              </div>

              {/* Group 2: Games Circuit (Ordered: Minecraft, Free Fire, BGMI) */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 tracking-wider">
                  Games Category
                </span>

                {/* 1. MINECRAFT */}
                <button
                  onClick={() => handleSelectGame('minecraft')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    activeFilter === 'minecraft' && matchesSubTab === 'all'
                      ? 'bg-gradient-to-r from-red-950/80 to-[#121c33] border-red-500/60 shadow-lg shadow-red-600/20'
                      : 'bg-[#0c1222] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-500/40 shadow-sm shrink-0 bg-black">
                      <img
                        src="/assets/aistudio/image_d27cd744.png"
                        alt="Minecraft"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-bold text-white text-xs block leading-tight">
                        Minecraft
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Bedwars · SkyWars · PvP
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30 font-mono font-bold tabular-nums">
                      {counts.minecraft}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>

                {/* 2. FREE FIRE */}
                <button
                  onClick={() => handleSelectGame('freefire')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    activeFilter === 'freefire' && matchesSubTab === 'all'
                      ? 'bg-gradient-to-r from-blue-950/80 to-[#121c33] border-blue-500/60 shadow-lg shadow-blue-600/20'
                      : 'bg-[#0c1222] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-blue-500/40 shadow-sm shrink-0 bg-black">
                      <img
                        src="/assets/aistudio/image_d453b33c.png"
                        alt="Free Fire"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-bold text-white text-xs block leading-tight">
                        Free Fire MAX
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Bermuda · Clash Squad
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-500/30 font-mono font-bold tabular-nums">
                      {counts.freefire}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>

                {/* 3. BGMI */}
                <button
                  onClick={() => handleSelectGame('bgmi')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    activeFilter === 'bgmi' && matchesSubTab === 'all'
                      ? 'bg-gradient-to-r from-red-950/80 to-[#121c33] border-red-500/60 shadow-lg shadow-red-600/20'
                      : 'bg-[#0c1222] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-red-500/40 shadow-sm shrink-0 bg-black">
                      <img
                        src="/assets/aistudio/image_1b72c6fb.png"
                        alt="BGMI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-bold text-white text-xs block leading-tight">
                        BGMI
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Battlegrounds Mobile India
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-950/60 text-red-300 border border-red-500/30 font-mono font-bold tabular-nums">
                      {counts.bgmi}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </button>
              </div>

              {/* Group 3: Quick Navigation */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 block px-2 tracking-wider">
                  Quick Shortcuts
                </span>

                <button
                  onClick={() => {
                    setActiveTab('wallet');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'wallet' ? 'bg-blue-600/20 text-blue-300' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    <span>My Wallet</span>
                  </div>
                  <span className="font-code text-blue-300 font-bold tabular-nums">{user.coins} C</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left font-semibold transition-colors min-h-[44px] ${
                    activeTab === 'settings' ? 'bg-red-600/20 text-red-300' : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-red-400" />
                    <span>Profile &amp; Settings</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </button>

                <button
                  onClick={() => {
                    setIsAIAssistantOpen(true);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-left font-semibold hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors min-h-[44px]"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span>AI Safety Coach</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 bg-blue-950/60 text-blue-300 rounded font-mono">24/7</span>
                </button>

                {/* Install App & Google Account */}
                <div className="pt-2 space-y-2">
                  <PWAInstallButton fullWidth />

                  {isGoogleSignedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        signOutUser();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-[#111728] hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl font-bold flex items-center justify-between text-xs transition-colors min-h-[44px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        <span className="truncate">{user.email || 'Google Account'}</span>
                      </div>
                      <span className="text-[10px] text-red-400 shrink-0">Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        signInWithGoogle();
                        setIsSidebarOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 rounded-xl font-bold flex items-center gap-2 text-xs transition-colors min-h-[44px]"
                    >
                      <LogIn className="w-3.5 h-3.5 shrink-0" />
                      <span>Continue with Google</span>
                    </button>
                  )}
                </div>

                {/* Organizer Access */}
                <div className="pt-1">
                  {isDevMode ? (
                    <button
                      onClick={() => {
                        setIsDevDashboardOpen(true);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-bold flex items-center justify-between text-xs shadow-md min-h-[44px]"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Organizer Console</span>
                      </div>
                      <span className="text-[9px] px-1.5 bg-black/40 rounded font-mono">LIVE</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsDevLoginModalOpen(true);
                        setIsSidebarOpen(false);
                      }}
                      className="w-full py-2.5 px-3 bg-[#111728] hover:bg-slate-800 text-red-400 border border-red-500/30 rounded-xl font-bold flex items-center gap-2 text-xs transition-colors min-h-[44px]"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Organizer Portal Login</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-3.5 bg-[#070b14] border-t border-slate-800/90 text-center shrink-0 space-y-1.5">
              <a
                href="mailto:cozypixelboy@gmail.com"
                className="text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>cozypixelboy@gmail.com</span>
              </a>
              <span className="text-[10px] text-slate-400 block font-mono">
                COZY_ESPORTS · Red &amp; Blue Edition
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
