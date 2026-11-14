import React from 'react';
import { useApp } from '../context/AppContext';
import { Gamepad2, Key, Trophy, Users, Clock, AlertCircle, BellRing } from 'lucide-react';

export const MyMatchesView: React.FC = () => {
  const { user, tournaments, setSelectedTournament, setActiveTab, setMatchesSubTab, simulateFiveMinuteNotification } = useApp();

  const joinedTournaments = tournaments.filter(t =>
    t.registeredPlayers.some(p => p.id === user.id)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 bg-gradient-to-r from-blue-950/40 via-[#101726] to-red-950/40 border border-red-500/30 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Registered Tournaments</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white">
            My Registered Matches
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Access your custom match Room ID &amp; Password. Entering the custom room on time is your own responsibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-center min-w-[70px]">
            <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Joined
            </span>
            <span className="font-code font-bold text-blue-400 text-base sm:text-lg">
              {joinedTournaments.length}
            </span>
          </div>

          <button
            onClick={() => {
              setActiveTab('matches');
              setMatchesSubTab('all');
            }}
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
          >
            Find Matches
          </button>
        </div>
      </div>

      {/* Tournaments List */}
      {joinedTournaments.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[#0a0e19] border border-slate-800 rounded-2xl space-y-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-white">
              No Registered Tournaments Yet
            </h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
              You haven't joined any match yet. Browse upcoming tournaments for BGMI, Free Fire, or Minecraft and claim your slot!
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab('matches');
              setMatchesSubTab('all');
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Explore Active Tournaments
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {joinedTournaments.map(t => (
            <div
              key={t.id}
              onClick={() => setSelectedTournament(t)}
              className="p-5 bg-[#101625] hover:bg-[#141b2c] border border-red-500/30 hover:border-blue-500/40 rounded-2xl cursor-pointer transition-all shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600/20 text-red-400 border border-red-500/30">
                    {t.game.toUpperCase()}
                  </span>
                  <span className="text-blue-400 font-semibold text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                    Slot Confirmed
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-white hover:text-red-400 transition-colors">
                  {t.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span>{t.map}</span>
                  <span>·</span>
                  <span>{t.format}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    {t.startTime}
                  </span>
                </div>

                {/* Player Responsibility Notice */}
                <div className="mt-2.5 text-[10px] text-red-300/90 bg-red-950/30 border border-red-500/30 rounded-lg p-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>Entering room on time is your responsibility · No refunds for late arrivals.</span>
                </div>
              </div>

              {/* Room ID and Password Box */}
              <div className="p-3 bg-[#0a0e19] border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    <span>Room ID:</span>
                  </span>
                  <span className="font-code font-bold text-blue-300 text-sm select-all">
                    {t.roomId || 'Publishing 15m prior'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-800/80 pt-2">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-red-400" />
                    <span>Password:</span>
                  </span>
                  <span className="font-code font-bold text-red-300 text-sm select-all">
                    {t.roomPassword || 'Publishing 15m prior'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedTournament(t);
                  }}
                  className="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                >
                  <span>Room &amp; Rules</span>
                </button>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    simulateFiveMinuteNotification(t.id);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                  title="Simulate push notification 5 minutes before match"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  <span>Test 5m Push</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
