import React from 'react';
import { useApp } from '../context/AppContext';
import { GameType } from '../types';
import { Search, Flame, X } from 'lucide-react';

interface GameFilterOption {
  id: GameType;
  label: string;
  icon: React.ReactNode;
  count: number;
}

export const GameFilterBar: React.FC = () => {
  const {
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    tournaments,
  } = useApp();

  const counts = {
    all: tournaments.length,
    bgmi: tournaments.filter(t => t.game === 'bgmi').length,
    freefire: tournaments.filter(t => t.game === 'freefire').length,
    minecraft: tournaments.filter(t => t.game === 'minecraft').length,
    codm: tournaments.filter(t => t.game === 'codm').length,
  };

  const filterOptions: GameFilterOption[] = [
    { id: 'all', label: 'All Games', icon: <Flame className="w-3.5 h-3.5 text-red-400" />, count: counts.all },
    {
      id: 'minecraft',
      label: 'Minecraft',
      icon: <img src="/assets/aistudio/image_d27cd744.png" alt="Minecraft" className="w-4 h-4 rounded-sm object-cover" />,
      count: counts.minecraft,
    },
    {
      id: 'freefire',
      label: 'Free Fire',
      icon: <img src="/assets/aistudio/image_d453b33c.png" alt="Free Fire" className="w-4 h-4 rounded-sm object-cover" />,
      count: counts.freefire,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Horizontal Game Selector Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0c121e] border border-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          {filterOptions.map(option => {
            const isActive = activeFilter === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {option.icon}
                <span>{option.label}</span>
                <span
                  className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-code leading-none ${
                    isActive ? 'bg-black/40 text-white font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input with perfectly centered Flexbox icon */}
        <div className="flex items-center gap-2 min-w-[200px] sm:min-w-[260px] bg-[#0c121e] border border-slate-800 focus-within:border-red-500/50 rounded-xl px-3 h-10 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search map, mode, title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none leading-normal"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
