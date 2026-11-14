import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserCheck, Check, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';

export const GamerLoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    user,
    isGoogleSignedIn,
    signInWithGoogle,
    updateUserProfile,
  } = useApp();

  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bgmiIgn, setBgmiIgn] = useState(user.bgmiIgn || '');
  const [bgmiId, setBgmiId] = useState(user.bgmiId || '');
  const [freefireIgn, setFreefireIgn] = useState(user.freefireIgn || '');
  const [freefireId, setFreefireId] = useState(user.freefireId || '');
  const [minecraftUsername, setMinecraftUsername] = useState(user.minecraftUsername || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setBgmiIgn(user.bgmiIgn || '');
    setBgmiId(user.bgmiId || '');
    setFreefireIgn(user.freefireIgn || '');
    setFreefireId(user.freefireId || '');
    setMinecraftUsername(user.minecraftUsername || '');
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

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      name: name.trim() || 'Gamer',
      email: email.trim(),
      phone: phone.trim() || '',
      bgmiIgn: bgmiIgn.trim() || 'BGMI_Pro',
      bgmiId: bgmiId.trim() || '5182940291',
      freefireIgn: freefireIgn.trim() || 'FF_Sniper',
      freefireId: freefireId.trim() || '9281749201',
      minecraftUsername: minecraftUsername.trim() || 'MC_Player',
      ign: bgmiIgn.trim() || freefireIgn.trim() || minecraftUsername.trim() || name.trim(),
      gameUid: bgmiId.trim() || freefireId.trim() || minecraftUsername.trim(),
      isLoggedIn: true,
    });

    setSavedSuccess(true);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setSavedSuccess(false);
      setIsLoginModalOpen(false);
    }, 1200);
  };

  return (
    <div
      data-modal="true"
      onClick={e => {
        if (e.target === e.currentTarget) setIsLoginModalOpen(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/85 md:backdrop-blur-md"
    >
      <div className="relative w-full max-w-xl bg-[#0b0f19] border border-blue-500/30 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="relative p-4 sm:p-6 bg-gradient-to-r from-slate-900 via-[#131a2c] to-[#0b0f19] border-b border-slate-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg overflow-hidden border border-red-500/50 shadow-sm shrink-0 bg-black">
                  <img
                    src="/assets/aistudio/Neon_Red_COZY_Esports_Mascot_be8e3250.png"
                    alt="COZY_ESPORTS Logo"
                    decoding="async"
                    className="w-full h-full object-cover object-center scale-[1.12]"
                  />
                </div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400 truncate">
                  COZY_ESPORTS · Gamer Authentication
                </span>
              </div>

              <h2 className="font-display text-lg sm:text-2xl font-black text-white">
                Gamer Login &amp; In-Game IDs
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Enter your BGMI, Free Fire, and Minecraft usernames and IDs once so you can join tournaments instantly!
              </p>
            </div>

            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setIsLoginModalOpen(false);
              }}
              aria-label="Close gamer login modal"
              className="relative z-30 w-9 h-9 shrink-0 flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/90 hover:bg-red-600/80 border border-slate-700 hover:border-red-400 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-300 text-xs">
          {savedSuccess && (
            <div className="p-3 bg-blue-950/50 border border-blue-500/50 text-blue-300 rounded-xl flex items-center gap-2 font-bold">
              <Check className="w-4 h-4" />
              <span>Gamer profile and in-game IDs saved successfully!</span>
            </div>
          )}

          {!isGoogleSignedIn ? (
            <div className="p-3.5 bg-blue-950/30 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-white text-xs block">Online Google Account Sync</span>
                <span className="text-[11px] text-slate-400">
                  Sign in with Google to save Cozy Coins &amp; tournament slots online.
                </span>
              </div>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Continue with Google</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-blue-950/20 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs">
              <span className="text-blue-300 font-bold">Signed in online as {user.email}</span>
              <Check className="w-4 h-4 text-blue-400" />
            </div>
          )}

          {/* Account Basics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#0a0e19] border border-slate-800 p-4 rounded-2xl">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Player / Gamer Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. NexusKiller, Amit"
                className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                Gmail Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. player@gmail.com"
                className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Phone Number <span className="text-[10px] text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="e.g. 9876543210 (Optional)"
                className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none font-mono placeholder-slate-600"
              />
            </div>
          </div>

          {/* BGMI In-Game ID */}
          <div className="bg-[#0a0e19] border border-red-500/20 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                BGMI (Battlegrounds Mobile India)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  BGMI In-Game Name (IGN) *
                </label>
                <input
                  type="text"
                  required
                  value={bgmiIgn}
                  onChange={e => setBgmiIgn(e.target.value)}
                  placeholder="e.g. Mortal_OP, Jonathan_Head"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  BGMI Character ID (Numeric UID) *
                </label>
                <input
                  type="text"
                  required
                  value={bgmiId}
                  onChange={e => setBgmiId(e.target.value)}
                  placeholder="e.g. 5182940291 (10 digits)"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-red-300 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Free Fire In-Game ID */}
          <div className="bg-[#0a0e19] border border-blue-500/20 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Free Fire MAX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Free Fire Username (IGN) *
                </label>
                <input
                  type="text"
                  required
                  value={freefireIgn}
                  onChange={e => setFreefireIgn(e.target.value)}
                  placeholder="e.g. RaiStar_99, Ajjubhai_YT"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Free Fire Player UID (Numeric) *
                </label>
                <input
                  type="text"
                  required
                  value={freefireId}
                  onChange={e => setFreefireId(e.target.value)}
                  placeholder="e.g. 9281749201 (9-10 digits)"
                  className="w-full bg-[#121828] border border-slate-750 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-blue-300 font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Minecraft Gamertag */}
          <div className="bg-[#0a0e19] border border-red-500/20 p-4 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                Minecraft (Java &amp; Bedrock)
              </span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Minecraft Username / Xbox Gamertag *
              </label>
              <input
                type="text"
                required
                value={minecraftUsername}
                onChange={e => setMinecraftUsername(e.target.value)}
                placeholder="e.g. TechnoBlade_Fan, CozyCrafter"
                className="w-full bg-[#121828] border border-slate-750 focus:border-red-500 rounded-xl px-3.5 py-2 text-xs text-red-300 font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Used for server whitelist and Bedwars/SkyWars stats tracking.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-red-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Save Profile &amp; Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
