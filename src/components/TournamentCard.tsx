import React from 'react';
import { Tournament } from '../types';
import { useApp } from '../context/AppContext';
import { Trophy, Users, Clock, Key, CheckCircle, Flame, ArrowUpRight } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const { user, setSelectedTournament } = useApp();

  const playerCount = Math.max(tournament.registeredPlayers.length, tournament.registeredCount ?? 0);
  const isRegistered = tournament.registeredPlayers.some(p => p.id === user.id);
  const slotsLeft = tournament.maxSlots - playerCount;
  const isFull = slotsLeft <= 0;
  const progressPercent = Math.min(100, Math.round((playerCount / tournament.maxSlots) * 100));

  const gameStyle = {
    bgmi: {
      tag: 'BGMI',
      border: 'border-red-500/50 text-red-400 bg-red-600/20',
      glow: 'shadow-red-600/10',
    },
    freefire: {
      tag: 'FREE FIRE',
      border: 'border-blue-500/50 text-blue-400 bg-blue-600/20',
      glow: 'shadow-blue-600/10',
    },
    minecraft: {
      tag: 'MINECRAFT',
      border: 'border-cyan-500/50 text-cyan-400 bg-cyan-600/20',
      glow: 'shadow-cyan-600/10',
    },
    codm: {
      tag: 'CODM',
      border: 'border-blue-500/50 text-blue-400 bg-blue-600/20',
      glow: 'shadow-blue-600/10',
    },
    all: {
      tag: 'ESPORTS',
      border: 'border-red-500/50 text-white bg-red-600/20',
      glow: 'shadow-red-600/10',
    },
  }[tournament.game] || {
    tag: 'ESPORTS',
    border: 'border-red-500/50 text-red-400 bg-red-600/20',
    glow: 'shadow-red-600/10',
  };

  const gameImage =
    tournament.image ||
    (tournament.game === 'bgmi'
      ? '/assets/aistudio/image_1b72c6fb.png'
      : tournament.game === 'freefire'
      ? '/assets/aistudio/image_d453b33c.png'
      : tournament.game === 'minecraft'
      ? '/assets/aistudio/image_d27cd744.png'
      : undefined);

  return (
    <div
      onClick={() => setSelectedTournament(tournament)}
      className="group relative bg-[#0b101f] hover:bg-[#0f172a] border border-slate-800 hover:border-red-500/60 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between shadow-md hover:shadow-xl select-none"
    >
      {/* Top Poster: Compact height for phones */}
      <div className="relative w-full h-20 sm:h-28 overflow-hidden bg-slate-950 shrink-0">
        {gameImage ? (
          <img
            src={gameImage}
            alt={tournament.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950/60 via-[#0b101f] to-blue-950/60" />
        )}

        {/* Gradient shadow overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b101f] via-[#0b101f]/30 to-black/30" />

        {/* Top-left Game Tag */}
        <span
          className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-black tracking-wider uppercase text-[7px] sm:text-[8px] border shadow-sm ${gameStyle.border}`}
        >
          {gameStyle.tag}
        </span>

        {/* Top-right Start Time */}
        <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 text-[7px] sm:text-[8px] text-white font-bold bg-black/85 px-1.5 py-0.5 rounded border border-white/10 shadow-sm">
          <Clock className="w-2 h-2 text-red-400" />
          <span className="truncate max-w-[65px] sm:max-w-[85px]">{tournament.startTime}</span>
        </div>

        {/* Bottom map & format strip over image */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] sm:text-[9px]">
          <span className="text-white font-bold drop-shadow truncate max-w-[70%]">
            {tournament.map}
          </span>
          <span className="px-1 py-0.2 bg-black/85 rounded text-[7px] sm:text-[8px] font-mono uppercase text-blue-300 font-bold border border-blue-500/30">
            {tournament.format}
          </span>
        </div>
      </div>

      {/* Bottom Half: Match Details & Actions (Compact for Mobile) */}
      <div className="p-2 sm:p-2.5 space-y-1.5 sm:space-y-2 flex-1 flex flex-col justify-between">
        <div>
          {/* Card Title */}
          <h3 className="font-display text-[11px] sm:text-xs font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-tight">
            {tournament.title}
          </h3>
        </div>

        {/* Compact Economics (Prize & Entry) */}
        <div className="flex items-center justify-between px-2 py-1 bg-[#060913] rounded-lg border border-slate-800/80 text-[10px]">
          <span className="font-code font-black text-blue-400 flex items-center gap-0.5">
            <Trophy className="w-2.5 h-2.5 text-blue-400" />
            ₹{tournament.prizePool}
          </span>
          <span className="font-code font-bold text-white text-[9px] sm:text-[10px]">
            {tournament.entryFee} <span className="text-[8px] text-red-400 font-bold">Coins</span>
          </span>
        </div>

        {/* Compact Slot Meter & Action State */}
        <div className="space-y-1 sm:space-y-1.5">
          <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-medium text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5 text-slate-400" />
              <span>{playerCount}/{tournament.maxSlots}</span>
            </span>
            <span className={slotsLeft <= 5 && slotsLeft > 0 ? 'text-red-400 font-bold' : isFull ? 'text-slate-500' : 'text-blue-400 font-bold'}>
              {isFull ? 'Full' : `${slotsLeft} left`}
            </span>
          </div>

          {/* Slim progress bar */}
          <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                progressPercent >= 90 ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Action CTA */}
          <div className="pt-0.5">
            {isRegistered ? (
              <div className="w-full py-1 sm:py-1.5 px-1.5 bg-blue-950/60 border border-blue-500/50 text-blue-300 rounded-lg text-[9px] sm:text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm">
                <CheckCircle className="w-2.5 h-2.5 text-blue-400" />
                <span>Joined</span>
              </div>
            ) : isFull ? (
              <div className="w-full py-1 sm:py-1.5 px-1.5 bg-slate-800 text-slate-500 rounded-lg text-[9px] sm:text-[10px] font-bold text-center">
                Slots Full
              </div>
            ) : (
              <div className="w-full py-1 sm:py-1.5 px-1.5 bg-gradient-to-r from-red-600 to-blue-600 group-hover:from-red-500 group-hover:to-blue-500 text-white rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all shadow-md shadow-red-600/15">
                <span>View &amp; Join</span>
                <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
