import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trophy, Users, Shield, Copy, Check, Lock, Unlock, Clock, AlertCircle, ArrowRight, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';
import { copyToClipboard } from '../utils/clipboard';

export const TournamentDetailModal: React.FC = () => {
  const {
    selectedTournament,
    setSelectedTournament,
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    joinTournament,
    leaveTournament,
    setIsRechargeModalOpen,
    isDevMode,
    updateTournament,
    getGamerCredentialsForGame,
  } = useApp();

  const credentials = selectedTournament ? getGamerCredentialsForGame(selectedTournament.game) : { ign: '', gameUid: '' };
  const [ign, setIgn] = useState(credentials.ign);
  const [gameUid, setGameUid] = useState(credentials.gameUid);
  const [copiedField, setCopiedField] = useState<'room' | 'pass' | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditingCredentials, setIsEditingCredentials] = useState(false);
  const [editRoomId, setEditRoomId] = useState('');
  const [editRoomPass, setEditRoomPass] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Keep synced with tournament game
  React.useEffect(() => {
    if (selectedTournament) {
      const creds = getGamerCredentialsForGame(selectedTournament.game);
      setIgn(creds.ign);
      setGameUid(creds.gameUid);
      setFeedbackMsg(null);
    }
  }, [selectedTournament?.id]);

  if (!selectedTournament) return null;

  const playerCount = Math.max(
    selectedTournament.registeredPlayers.length,
    selectedTournament.registeredCount ?? 0
  );
  const isRegistered = selectedTournament.registeredPlayers.some(p => p.id === user.id);
  const slotsLeft = selectedTournament.maxSlots - playerCount;
  const isFull = slotsLeft <= 0;
  const hasEnoughCoins = user.coins >= selectedTournament.entryFee;

  const handleCopy = (text: string, field: 'room' | 'pass') => {
    copyToClipboard(text).then(ok => {
      if (ok) {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }
    });
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isJoining) return;
    if (!ign.trim() || !gameUid.trim()) {
      setFeedbackMsg({ type: 'error', text: 'Please enter your In-Game Name (IGN) and Game UID.' });
      return;
    }

    setIsJoining(true);
    const res = await joinTournament(selectedTournament.id, { ign, gameUid });
    setIsJoining(false);
    if (res.success) {
      setFeedbackMsg({ type: 'success', text: res.message });
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#3b82f6', '#ffffff'],
        });
      } catch {
        // ignore
      }
    } else {
      setFeedbackMsg({ type: 'error', text: res.message });
    }
  };

  const handleLeave = () => {
    const res = leaveTournament(selectedTournament.id);
    setFeedbackMsg({ type: 'error', text: res.message });
  };

  const handleSaveDevCredentials = async () => {
    await updateTournament(selectedTournament.id, {
      roomId: editRoomId || selectedTournament.roomId,
      roomPassword: editRoomPass || selectedTournament.roomPassword,
    });
    setIsEditingCredentials(false);
    setFeedbackMsg({ type: 'success', text: 'Room ID & Password updated for all participants!' });
  };

  const gameImage =
    selectedTournament.image ||
    (selectedTournament.game === 'bgmi'
      ? '/assets/aistudio/image_1b72c6fb.png'
      : selectedTournament.game === 'freefire'
      ? '/assets/aistudio/image_d453b33c.png'
      : selectedTournament.game === 'minecraft'
      ? '/assets/aistudio/image_d27cd744.png'
      : undefined);

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) setSelectedTournament(null);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-sm"
    >
      <div className="relative w-full max-w-2xl bg-[#0f1523] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header Bar */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-slate-900 to-[#141b2c] border-b border-slate-800 shrink-0 overflow-hidden">
          {gameImage && (
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
              <img src={gameImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1523] via-[#0f1523]/70 to-transparent" />
            </div>
          )}

          <div className="relative z-20 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs mb-1.5">
                <span className="font-bold uppercase tracking-wider text-red-400">
                  {selectedTournament.game.toUpperCase()}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-medium truncate">{selectedTournament.map}</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-semibold">{selectedTournament.format}</span>
              </div>

              <h2 className="font-display text-lg sm:text-2xl font-black text-white leading-tight">
                {selectedTournament.title}
              </h2>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setSelectedTournament(null);
              }}
              aria-label="Close tournament details"
              className="relative z-30 w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-red-400" />
              <span>{selectedTournament.startTime}</span>
            </span>
            {selectedTournament.serverRegion && (
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>{selectedTournament.serverRegion}</span>
              </span>
            )}
            {selectedTournament.version && (
              <span className="text-blue-400 font-code">
                {selectedTournament.version}
              </span>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* Feedback Banner */}
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium ${
                feedbackMsg.type === 'success'
                  ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              <span>{feedbackMsg.text}</span>
              <button onClick={() => setFeedbackMsg(null)} className="underline ml-2">
                Dismiss
              </button>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 bg-[#0a0e19] border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Prize
              </span>
              <span className="font-code font-bold text-blue-400 text-lg flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-blue-400" />
                {selectedTournament.prizePool}
              </span>
            </div>

            <div className="p-3 bg-[#0a0e19] border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Entry Fee
              </span>
              <span className="font-code font-bold text-white text-lg">
                {selectedTournament.entryFee} <span className="text-xs text-red-400 font-normal">Coins</span>
              </span>
            </div>

            <div className="p-3 bg-[#0a0e19] border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Per Kill
              </span>
              <span className="font-code font-bold text-blue-400 text-lg">
                +{selectedTournament.prizeBreakdown.perKill} <span className="text-xs text-slate-400 font-normal">Coins</span>
              </span>
            </div>

            <div className="p-3 bg-[#0a0e19] border border-slate-800 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Slots Available
              </span>
              <span className="font-code font-bold text-slate-200 text-lg">
                {playerCount} / {selectedTournament.maxSlots}
              </span>
            </div>
          </div>

          {/* PROTECTED ROOM ID & PASSWORD SECTION */}
          <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isRegistered || isDevMode ? (
                  <Unlock className="w-5 h-5 text-blue-400" />
                ) : (
                  <Lock className="w-5 h-5 text-red-400" />
                )}
                <h3 className="font-display font-bold text-white text-base">
                  Custom Match Room Credentials
                </h3>
              </div>

              {isDevMode && (
                <button
                  onClick={() => {
                    setEditRoomId(selectedTournament.roomId || '');
                    setEditRoomPass(selectedTournament.roomPassword || '');
                    setIsEditingCredentials(!isEditingCredentials);
                  }}
                  className="text-xs font-mono text-red-400 hover:text-red-300 underline"
                >
                  {isEditingCredentials ? 'Cancel Edit' : '[Dev: Broadcast Room Details]'}
                </button>
              )}
            </div>

            {/* Dev Editing Form */}
            {isDevMode && isEditingCredentials ? (
              <div className="p-3.5 bg-slate-900 border border-red-500/30 rounded-xl space-y-3 mb-4">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  Broadcast Room ID &amp; Password to Players
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Room ID / Server IP</label>
                    <input
                      type="text"
                      value={editRoomId}
                      onChange={e => setEditRoomId(e.target.value)}
                      placeholder="e.g. 7482910 or mc.cozy.net"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Room Password / Whitelist</label>
                    <input
                      type="text"
                      value={editRoomPass}
                      onChange={e => setEditRoomPass(e.target.value)}
                      placeholder="e.g. 1234 or pass"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveDevCredentials}
                  className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  Save &amp; Broadcast Credentials
                </button>
              </div>
            ) : null}

            {/* Display Unlocked Credentials */}
            {isRegistered || isDevMode ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Room ID Box */}
                  <div className="bg-[#121828] border border-slate-750 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Room ID / Server IP
                      </span>
                      <span className="font-code font-bold text-white text-base select-all">
                        {selectedTournament.roomId || 'To be shared 15m prior'}
                      </span>
                    </div>
                    {selectedTournament.roomId && (
                      <button
                        onClick={() => handleCopy(selectedTournament.roomId!, 'room')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Copy Room ID"
                      >
                        {copiedField === 'room' ? (
                          <Check className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Room Password Box */}
                  <div className="bg-[#121828] border border-slate-750 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Room Password
                      </span>
                      <span className="font-code font-bold text-blue-300 text-base select-all">
                        {selectedTournament.roomPassword || 'To be shared 15m prior'}
                      </span>
                    </div>
                    {selectedTournament.roomPassword && (
                      <button
                        onClick={() => handleCopy(selectedTournament.roomPassword!, 'pass')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Copy Password"
                      >
                        {copiedField === 'pass' ? (
                          <Check className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-blue-300 bg-blue-950/20 border border-blue-500/20 rounded-xl p-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>
                    Open {selectedTournament.game.toUpperCase()} &rarr; Custom Match Room &rarr; Enter credentials 10 minutes before start time.
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-4 text-center space-y-2">
                <p className="text-slate-300 text-xs sm:text-sm">
                  Room ID &amp; Password are encrypted. Join tournament with {selectedTournament.entryFee} Cozy Coins to unlock credentials immediately.
                </p>
                <span className="text-[11px] text-slate-500 block">
                  Credentials also automatically reveal {selectedTournament.credentialsVisibleBeforeMinutes} minutes before match start.
                </span>
              </div>
            )}
          </div>

          {/* Prize Breakdown */}
          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-blue-400" />
              Prize Distribution
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-[#121828] border border-red-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">1st Place (Winner)</span>
                <span className="font-code font-bold text-red-400 text-base">
                  {selectedTournament.prizeBreakdown.rank1} Coins
                </span>
              </div>
              <div className="p-2.5 bg-[#121828] border border-blue-500/30 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">2nd Place</span>
                <span className="font-code font-bold text-blue-300 text-base">
                  {selectedTournament.prizeBreakdown.rank2} Coins
                </span>
              </div>
              <div className="p-2.5 bg-[#121828] border border-slate-800 rounded-xl">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">3rd Place</span>
                <span className="font-code font-bold text-slate-300 text-base">
                  {selectedTournament.prizeBreakdown.rank3} Coins
                </span>
              </div>
            </div>
          </div>
          {/* Rules List */}
          <div>
            <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400" />
              Match Rules &amp; Guidelines
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400 list-disc list-inside">
              {selectedTournament.rules.map((rule, idx) => (
                <li key={idx} className="leading-relaxed">
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          {/* Registered Players List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                Registered Competitors ({playerCount} / {selectedTournament.maxSlots})
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                {slotsLeft} slots remaining
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto bg-[#0a0e19] border border-slate-800 rounded-xl divide-y divide-slate-800/80">
              {selectedTournament.registeredPlayers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No competitors registered yet. Be the first to claim a slot!
                </div>
              ) : (
                selectedTournament.registeredPlayers.map((player, idx) => (
                  <div key={player.id} className="p-2.5 px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-code text-slate-500 text-[11px] w-5">#{idx + 1}</span>
                      <span className="font-bold text-slate-200">{player.ign}</span>
                      {player.id === user.id && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-red-600/20 text-red-400 rounded font-semibold border border-red-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 font-code text-[11px]">
                      UID: {player.gameUid}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer / Join or Leave Action */}
        <div className="p-4 sm:p-5 bg-gradient-to-t from-slate-950 via-[#0f1523] to-[#0f1523] border-t border-slate-800 shrink-0">
          {isRegistered ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-blue-400 flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-400" />
                <span>You have secured a slot for this match.</span>
              </div>
              <button
                onClick={handleLeave}
                className="w-full sm:w-auto px-4 py-2 bg-red-950/30 hover:bg-red-900/40 text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel Slot
              </button>
            </div>
          ) : isFull ? (
            <div className="text-center py-2 text-slate-400 text-xs">
              All {selectedTournament.maxSlots} slots are filled for this tournament.
            </div>
          ) : (
            <form onSubmit={handleJoin} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">
                    Your In-Game Name (IGN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ign}
                    onChange={e => setIgn(e.target.value)}
                    placeholder="e.g. Mortal_OP, TechnoGamer"
                    className="w-full bg-[#131926] border border-slate-750 focus:border-red-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">
                    Game UID / Player ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={gameUid}
                    onChange={e => setGameUid(e.target.value)}
                    placeholder="e.g. 5129482910 or mc_gamertag"
                    className="w-full bg-[#131926] border border-slate-750 focus:border-red-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <div className="text-xs text-slate-400 flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                  <span>Entry Fee: <strong className="text-white font-code">{selectedTournament.entryFee} Coins</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>Wallet: <strong className="text-blue-400 font-code">{user.coins} Coins</strong></span>
                </div>

                {!isGoogleSignedIn ? (
                  <button
                    type="button"
                    onClick={() => signInWithGoogle()}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Continue with Google to Join</span>
                  </button>
                ) : hasEnoughCoins ? (
                  <button
                    type="submit"
                    disabled={isJoining}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <span>
                      {isJoining ? 'Securing Slot...' : `Pay ${selectedTournament.entryFee} Coins & Join`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTournament(null);
                      setIsRechargeModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>Need Coins? Recharge via QR</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
