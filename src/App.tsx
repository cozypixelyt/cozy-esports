/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { GameFilterBar } from './components/GameFilterBar';
import { TournamentCard } from './components/TournamentCard';
import { TournamentDetailModal } from './components/TournamentDetailModal';
import { CoinRechargeModal } from './components/CoinRechargeModal';
import { DevModeModal } from './components/DevModeModal';
import { DevDashboardModal } from './components/DevDashboardModal';
import { GamerLoginModal } from './components/GamerLoginModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { WithdrawModal } from './components/WithdrawModal';
import { MyMatchesView } from './components/MyMatchesView';
import { WalletView } from './components/WalletView';
import { SettingsView } from './components/SettingsView';
import { SidebarDrawer } from './components/SidebarDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  ShieldCheck,
  Bot,
  Zap,
  Swords,
  Bell,
  X,
} from 'lucide-react';

const TAB_ORDER: Array<'matches' | 'wallet' | 'settings'> = ['matches', 'wallet', 'settings'];

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    matchesSubTab,
    setMatchesSubTab,
    tournaments,
    activeFilter,
    searchQuery,
    isDevMode,
    setIsDevDashboardOpen,
    setIsDevLoginModalOpen,
    setIsAIAssistantOpen,
    setIsRechargeModalOpen,
    toastNotification,
    dismissToast,
    user,
    selectedTournament,
    isRechargeModalOpen,
    isWithdrawModalOpen,
    isDevLoginModalOpen,
    isDevDashboardOpen,
    isLoginModalOpen,
    isAIAssistantOpen,
    isSidebarOpen,
  } = useApp();

  const anyOverlayOpen = Boolean(
    selectedTournament ||
      isRechargeModalOpen ||
      isWithdrawModalOpen ||
      isDevLoginModalOpen ||
      isDevDashboardOpen ||
      isLoginModalOpen ||
      isAIAssistantOpen ||
      isSidebarOpen
  );

  // True 1:1 ViewPager Horizontal Slide & Real-time Touch Drag Tracking (GPU CSS Translate3d for Vivo Y16 & Old Phones)
  const tabIndex = TAB_ORDER.indexOf(activeTab);
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const pagerViewportRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const gestureLock = useRef<'none' | 'horizontal' | 'vertical'>('none');

  useEffect(() => {
    if (window.scrollY > 100) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches || e.touches.length === 0) return;
    const target = e.target as HTMLElement | null;
    if (
      anyOverlayOpen ||
      (target && typeof target.closest === 'function' && (
        target.closest('[data-modal="true"]') ||
        target.closest('.no-scrollbar') ||
        target.closest('input, textarea, select') ||
        target.closest('[data-no-swipe="true"]')
      ))
    ) {
      touchStartX.current = null;
      touchStartY.current = null;
      gestureLock.current = 'none';
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    gestureLock.current = 'none';
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    if (!e.touches || e.touches.length === 0) return;
    if (gestureLock.current === 'vertical') return;

    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    if (gestureLock.current === 'none') {
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        if (Math.abs(dx) > Math.abs(dy) * 1.15) {
          gestureLock.current = 'horizontal';
          setIsDragging(true);
        } else {
          gestureLock.current = 'vertical';
          return;
        }
      } else {
        return;
      }
    }

    // Rubber-band resistance at first/last tab edges
    const atLeftEdge = tabIndex === 0 && dx > 0;
    const atRightEdge = tabIndex === TAB_ORDER.length - 1 && dx < 0;
    const effectiveDx = atLeftEdge || atRightEdge ? dx * 0.22 : dx;
    setDragOffsetPx(effectiveDx);
  };

  const finishDrag = (endX?: number) => {
    if (gestureLock.current === 'horizontal' && touchStartX.current !== null) {
      const dx = endX !== undefined ? endX - touchStartX.current : dragOffsetPx;
      if (dx < -52 && tabIndex < TAB_ORDER.length - 1) {
        setActiveTab(TAB_ORDER[tabIndex + 1]);
      } else if (dx > 52 && tabIndex > 0) {
        setActiveTab(TAB_ORDER[tabIndex - 1]);
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    gestureLock.current = 'none';
    setIsDragging(false);
    setDragOffsetPx(0);
  };

  const viewportWidth = pagerViewportRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
  const dragPercent = isDragging && viewportWidth > 0 ? (dragOffsetPx / viewportWidth) * 100 : 0;
  const pagerTranslateX = -(tabIndex * 100) + dragPercent;

  // Filter tournaments by game and search query (memoized for smooth 60fps swipe on Vivo Y16)
  const filteredTournaments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tournaments.filter(t => {
      const matchesGame = activeFilter === 'all' || t.game === activeFilter;
      if (!matchesGame) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.map.toLowerCase().includes(q) ||
        t.format.toLowerCase().includes(q)
      );
    });
  }, [tournaments, activeFilter, searchQuery]);

  const joinedCount = useMemo(
    () => tournaments.filter(t => t.registeredPlayers.some(p => p.id === user.id)).length,
    [tournaments, user.id]
  );

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={e => finishDrag(e.changedTouches[0]?.clientX)}
      onTouchCancel={() => finishDrag()}
      className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white pb-20 md:pb-8 overflow-x-hidden relative"
    >
      {/* Responsive Cinematic Blood Moon Background Theme (Single active source saves RAM on Vivo Y16 & old phones) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transform-gpu">
        <picture className="block w-full h-full">
          <source
            media="(min-width: 768px)"
            srcSet="/assets/aistudio/Crimson_Nether_Moon_Over_Lava_Valley_9a5a99c2.png"
          />
          <img
            src="/assets/aistudio/Blood_Moon_Minecraft_Cliffside_78740e15.png"
            alt="COZY_ESPORTS Background"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
        </picture>

        {/* Cinematic Vignette & Ambient Readability Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/70 via-[#070b14]/50 to-[#070b14]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.22),transparent_70%)]" />
      </div>

      {/* Real-time In-App Toast Alert */}
      {toastNotification && (
        <div className="fixed top-3 inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md p-3.5 sm:p-4 rounded-2xl bg-[#0b1020]/95 border border-red-500/50 shadow-2xl shadow-red-500/20 flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-display font-bold text-xs sm:text-sm text-white">
                  {toastNotification.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {toastNotification.body}
                </p>
              </div>
            </div>

            <button
              onClick={dismissToast}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 1-Row Responsive Header */}
      <Header />

      {/* Fluid Widescreen / Phone-Optimized Container */}
      <main className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex-1 w-full space-y-3.5 sm:space-y-4">
        {/* True Side-by-Side Horizontal ViewPager Container */}
        <div ref={pagerViewportRef} className="overflow-hidden w-full">
          <div
            style={{
              WebkitTransform: `translate3d(${pagerTranslateX}%, 0, 0)`,
              transform: `translate3d(${pagerTranslateX}%, 0, 0)`,
              WebkitTransition: isDragging ? 'none' : '-webkit-transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
              transition: isDragging ? 'none' : 'transform 240ms cubic-bezier(0.22, 1, 0.36, 1)',
              willChange: isDragging ? 'transform' : 'auto',
            }}
            className="flex w-full items-start"
          >
            {/* ================= PANE 0: MY MATCHES ================= */}
            <div
              className={`w-full shrink-0 px-0.5 ${
                activeTab !== 'matches'
                  ? 'max-h-[calc(100vh-145px)] overflow-hidden pointer-events-none select-none'
                  : ''
              }`}
            >
              <div className="space-y-3.5 sm:space-y-4">
                {matchesSubTab === 'joined' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                          My Joined Matches
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 font-mono font-bold border border-blue-500/30 tabular-nums">
                          {joinedCount}
                        </span>
                      </div>
                      <button
                        onClick={() => setMatchesSubTab('all')}
                        className="text-xs text-red-400 hover:text-white font-bold transition-colors min-h-[36px] px-2"
                      >
                        &larr; View All Tournaments
                      </button>
                    </div>
                    <MyMatchesView />
                  </div>
                ) : (
                  <>
                    {/* Game Filter Bar (All Games, Minecraft, Free Fire + Search) */}
                    <GameFilterBar />

                    {/* Clean Empty Tournaments Card */}
                    {filteredTournaments.length === 0 ? (
                      <div className="p-8 sm:p-12 text-center bg-[#0c121e]/92 border border-slate-800/80 rounded-3xl max-w-sm mx-auto shadow-2xl my-8 space-y-4">
                        <div className="w-12 h-12 bg-red-600/20 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-md">
                          <Swords className="w-6 h-6 stroke-[2]" />
                        </div>
                        <h3 className="font-display font-black text-lg sm:text-xl text-white">
                          No Tournaments Available
                        </h3>
                        <div className="pt-1 flex justify-center">
                          <button
                            onClick={() => setIsRechargeModalOpen(true)}
                            className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            <span>Add Coins</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {filteredTournaments.map(tournament => (
                          <TournamentCard key={tournament.id} tournament={tournament} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ================= PANE 1: MY WALLET ================= */}
            <div
              className={`w-full shrink-0 px-0.5 ${
                activeTab !== 'wallet'
                  ? 'max-h-[calc(100vh-145px)] overflow-hidden pointer-events-none select-none'
                  : ''
              }`}
            >
              <WalletView />
            </div>

            {/* ================= PANE 2: SETTINGS ================= */}
            <div
              className={`w-full shrink-0 px-0.5 ${
                activeTab !== 'settings'
                  ? 'max-h-[calc(100vh-145px)] overflow-hidden pointer-events-none select-none'
                  : ''
              }`}
            >
              <SettingsView />
            </div>
          </div>
        </div>
      </main>

      {/* Floating AI Safety Assistant Trigger */}
      <button
        onClick={() => setIsAIAssistantOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-30 p-3 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-2xl shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all active:scale-95 border border-red-400/40"
        title="Open AI Help & Safety"
      >
        <Bot className="w-5 h-5" />
        <span className="font-bold text-xs hidden sm:inline">AI Coach</span>
      </button>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#060912]/95 py-6 sm:py-8 text-xs text-slate-400 mt-10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="font-display font-black text-sm text-white tracking-wider">
              COZY<span className="text-red-500">_ESPORTS</span>
            </span>
            <span>·</span>
            <span className="text-blue-400">Real Money Esports · ₹1 = 1 Cozy Coin</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Anti-Cheat &amp; Fair Play Enforced</span>
            </span>
            <span>·</span>
            <button
              onClick={() => {
                if (isDevMode) {
                  setIsDevDashboardOpen(true);
                } else {
                  setIsDevLoginModalOpen(true);
                }
              }}
              className="text-red-400 hover:text-red-300 font-mono font-semibold"
            >
              {isDevMode ? 'Organizer Console (Active)' : 'Organizer Portal'}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SidebarDrawer />
      <TournamentDetailModal />
      <CoinRechargeModal />
      <WithdrawModal />
      <DevModeModal />
      <DevDashboardModal />
      <GamerLoginModal />
      <AIAssistantModal />

      {/* Mobile Offline/Online Sync Pill */}
      <OfflineIndicator />

      {/* Mobile Bottom Navigation (Only 3 Tabs: My Matches, My Wallet, Settings) */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
