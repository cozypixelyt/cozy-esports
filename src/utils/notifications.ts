/**
 * Browser-based notification and sound alert system for COZY_ESPORTS
 */

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  type: 'payment' | 'match' | 'system';
}

// Synthesize pleasant chime using Web Audio API
export const playNotificationChime = (type: 'payment' | 'match' | 'default' = 'default') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'payment') {
      // Upbeat double-tone ding (coins success)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.setValueAtTime(880, now + 0.1); // A5
      osc2.frequency.setValueAtTime(1174.66, now + 0.1); // D6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.1);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else {
      // Alert chime for matches (Deadly urgency dual tone)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.setValueAtTime(880.00, now + 0.12); // A5
      osc2.frequency.setValueAtTime(1046.50, now + 0.24); // C6

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    }
  } catch (err) {
    console.warn('Audio playback error (browser user-interaction required):', err);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendBrowserNotification = (title: string, body: string, type: 'payment' | 'match' | 'default' = 'default') => {
  // Always play sound chime
  playNotificationChime(type);

  // If system notifications are granted, show browser push notification
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/assets/qr_code_clean.png',
        badge: '/assets/qr_code_clean.png',
      });
    } catch (err) {
      console.warn('Notification construction error:', err);
    }
  }
};

// Simulation of 5-minute pre-match alert using browser Notification API
export const simulateFiveMinutePushAlert = (matchTitle: string = 'BGMI Squad Scrims Night Cup', roomId: string = '8492019', roomPass: string = 'cozy99') => {
  const title = `🚨 Match Starts in 5 Minutes: ${matchTitle}!`;
  const body = `Room ID: ${roomId} | Password: ${roomPass}. It is strictly your responsibility to join the room on time—no refunds for missing match start!`;
  sendBrowserNotification(title, body, 'match');
  return { title, body };
};
