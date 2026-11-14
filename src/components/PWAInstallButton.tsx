import React, { useState } from 'react';
import { Download, Smartphone, Share, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  fullWidth?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  fullWidth = false,
}) => {
  const { canPromptNatively, isIOS, isInstalled, promptInstall } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <div className="px-3.5 py-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-2">
        <Check className="w-4 h-4 text-blue-400 shrink-0" />
        <span>App Installed on Device</span>
      </div>
    );
  }

  const handleClick = async () => {
    if (canPromptNatively) {
      await promptInstall();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          compact
            ? 'h-9 sm:h-10 px-2.5 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all active:scale-95 shrink-0'
            : `${fullWidth ? 'w-full' : ''} py-2.5 px-4 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20 active:scale-95 flex items-center justify-center gap-2 min-h-[44px]`
        }
        title="Install COZY_ESPORTS App on Phone"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span>{compact ? 'App' : 'Install App on Phone'}</span>
      </button>

      {showGuide && (
        <div
          data-modal="true"
          onClick={e => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
        >
          <div className="relative w-full max-w-sm bg-[#0a0f1d] border border-blue-500/40 rounded-2xl p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-white text-sm">
                    Install COZY_ESPORTS App
                  </h3>
                  <span className="text-[11px] text-blue-400 font-semibold">
                    Free · Works like an APK on Phone
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-2 text-xs text-slate-300 bg-[#070b14] border border-slate-800 p-3.5 rounded-xl">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-blue-400" />
                  iPhone / iPad Safari Steps:
                </p>
                <p>1. Tap the <strong>Share</strong> icon at the bottom of Safari.</p>
                <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
                <p>3. Tap <strong>Add</strong> — icon will appear on your home screen.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300 bg-[#070b14] border border-slate-800 p-3.5 rounded-xl">
                <p className="font-bold text-white">Android (Vivo Y16 / Chrome) Steps:</p>
                <p>1. Browser ke top-right <strong>3 dots (⋮)</strong> menu par tap karein.</p>
                <p>2. <strong>&quot;Install app&quot;</strong> ya <strong>&quot;Add to Home screen&quot;</strong> select karein.</p>
                <p>3. <strong>Install</strong> dabayein — bina Play Store ke app phone me install ho jayega.</p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-red-600 to-blue-600 text-white font-black text-xs uppercase rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
