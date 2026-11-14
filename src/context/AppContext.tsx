import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import {
  Tournament,
  Player,
  UserProfile,
  WalletTransaction,
  TopupRequest,
  WithdrawalRequest,
  AdminConfig,
  GameType,
  RedeemCode,
  AdminAlertLog,
  ServerEmailStatus,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_ADMIN_CONFIG,
  INITIAL_TOURNAMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_TOPUP_REQUESTS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_REDEEM_CODES,
} from '../data/initialData';
import { sendBrowserNotification, requestNotificationPermission } from '../utils/notifications';

export interface ToastAlert {
  id: string;
  title: string;
  body: string;
  type: 'payment' | 'match' | 'system';
}

const ADMIN_EMAILS = ['nk6931390@gmail.com', 'cozypixelboy@gmail.com'];
const ADMIN_RECIPIENT_EMAIL = 'cozypixelboy@gmail.com';

const STORAGE_KEYS = {
  ADMIN_PIN_OVERRIDE: 'cozy_esports_pin_override_v4',
  DEV_SESSION: 'cozy_esports_dev_session_v4',
  NOTIFICATIONS: 'cozy_esports_notifs_enabled_v4',
};

function logFirestoreError(error: unknown, op: OperationType, path: string | null) {
  try {
    handleFirestoreError(error, op, path);
  } catch {
    // Already logged formatted FirestoreErrorInfo JSON inside handleFirestoreError
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(obj) as Array<keyof T>).forEach(key => {
    if (obj[key] !== undefined) {
      out[key] = obj[key];
    }
  });
  return out;
}

function getCreatedMillis(data: Record<string, unknown>): number {
  const ts = data.createdAt as { toMillis?: () => number } | undefined;
  if (ts && typeof ts.toMillis === 'function') {
    return ts.toMillis();
  }
  return 0;
}

interface AppContextType {
  user: UserProfile;
  firebaseUser: FirebaseUser | null;
  authLoading: boolean;
  isGoogleSignedIn: boolean;
  isFirebaseAdmin: boolean;
  tournaments: Tournament[];
  transactions: WalletTransaction[];
  topupRequests: TopupRequest[];
  withdrawalRequests: WithdrawalRequest[];
  redeemCodes: RedeemCode[];
  adminConfig: AdminConfig;
  adminAlerts: AdminAlertLog[];
  serverEmailStatus: ServerEmailStatus;
  refreshEmailStatus: () => Promise<void>;
  sendTestAdminAlert: () => Promise<{ success: boolean; dispatched: boolean; message: string }>;
  isDevMode: boolean;
  activeFilter: GameType;
  setActiveFilter: (filter: GameType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTournament: Tournament | null;
  setSelectedTournament: (t: Tournament | null) => void;
  isRechargeModalOpen: boolean;
  setIsRechargeModalOpen: (open: boolean) => void;
  isWithdrawModalOpen: boolean;
  setIsWithdrawModalOpen: (open: boolean) => void;
  isDevLoginModalOpen: boolean;
  setIsDevLoginModalOpen: (open: boolean) => void;
  isDevDashboardOpen: boolean;
  setIsDevDashboardOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  activeTab: 'matches' | 'wallet' | 'settings';
  setActiveTab: (tab: 'matches' | 'wallet' | 'settings') => void;
  matchesSubTab: 'all' | 'joined';
  setMatchesSubTab: (sub: 'all' | 'joined') => void;
  swipeDirection: 'left' | 'right';
  setSwipeDirection: (dir: 'left' | 'right') => void;

  notificationsEnabled: boolean;
  enableNotifications: () => Promise<boolean>;
  toastNotification: ToastAlert | null;
  dismissToast: () => void;
  triggerNotification: (title: string, body: string, type?: 'payment' | 'match') => void;
  simulateFiveMinuteNotification: (tournamentId?: string) => void;

  signInWithGoogle: () => Promise<{ success: boolean; message: string }>;
  signOutUser: () => Promise<void>;

  unlockDevMode: (pin: string) => { success: boolean; message: string };
  lockDevMode: () => void;
  updateAdminConfig: (updates: Partial<AdminConfig>) => Promise<void>;
  createTournament: (data: Omit<Tournament, 'id' | 'registeredPlayers'>) => Promise<Tournament | null>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  joinTournament: (
    tournamentId: string,
    playerDetails?: { ign?: string; gameUid?: string }
  ) => Promise<{ success: boolean; message: string }>;
  leaveTournament: (tournamentId: string) => { success: boolean; message: string };
  requestCoinTopup: (
    inrAmount: number,
    utr: string,
    fastAutoApprove?: boolean
  ) => Promise<{ success: boolean; autoVerified?: boolean; message: string }>;
  submitPlayCodeTopup: (
    inrAmount: number,
    playCode: string,
    gmail: string
  ) => Promise<{ success: boolean; message: string }>;
  approveTopupRequest: (requestId: string) => Promise<void>;
  rejectTopupRequest: (requestId: string, notes?: string) => Promise<void>;
  createRedeemCode: (
    code: string,
    coins: number,
    maxUses: number
  ) => Promise<{ success: boolean; message: string }>;
  deleteRedeemCode: (id: string) => Promise<void>;
  redeemCozyCode: (
    code: string
  ) => Promise<{ success: boolean; message: string; coinsAdded?: number }>;
  requestWithdrawal: (
    coins: number,
    upiId: string
  ) => Promise<{ success: boolean; message: string }>;
  approveWithdrawal: (requestId: string, payoutRef?: string) => Promise<void>;
  rejectWithdrawal: (requestId: string, reason?: string) => Promise<void>;
  adminInjectCoins: (coinsAmount: number, reason: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  getGamerCredentialsForGame: (game: GameType) => { ign: string; gameUid: string };
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState(false);

  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [baseTournaments, setBaseTournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  const [playersMap, setPlayersMap] = useState<Record<string, Player[]>>({});
  const [secretsMap, setSecretsMap] = useState<Record<string, { roomId?: string; roomPassword?: string }>>({});

  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [topupRequests, setTopupRequests] = useState<TopupRequest[]>(INITIAL_TOPUP_REQUESTS);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>(INITIAL_REDEEM_CODES);
  const [adminAlerts, setAdminAlerts] = useState<AdminAlertLog[]>([]);

  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    let savedPin = INITIAL_ADMIN_CONFIG.pin;
    try {
      const p = localStorage.getItem(STORAGE_KEYS.ADMIN_PIN_OVERRIDE);
      if (p) savedPin = p;
    } catch {
      // ignore
    }
    return { ...INITIAL_ADMIN_CONFIG, pin: savedPin };
  });

  const [serverEmailStatus, setServerEmailStatus] = useState<ServerEmailStatus>({
    smtpConfigured: false,
    adminEmail: ADMIN_RECIPIENT_EMAIL,
    recentAlerts: [],
  });

  const [isDevMode, setIsDevMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.DEV_SESSION) === 'true';
    } catch {
      return false;
    }
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) === 'true' ||
        (typeof Notification !== 'undefined' && Notification.permission === 'granted')
      );
    } catch {
      return false;
    }
  });

  const [toastNotification, setToastNotification] = useState<ToastAlert | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeFilter, setActiveFilter] = useState<GameType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDevLoginModalOpen, setIsDevLoginModalOpen] = useState(false);
  const [isDevDashboardOpen, setIsDevDashboardOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [activeTab, setActiveTabState] = useState<'matches' | 'wallet' | 'settings'>('matches');
  const [matchesSubTab, setMatchesSubTab] = useState<'all' | 'joined'>('all');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right'>('right');

  // Combine public tournaments + players + room secrets
  const tournaments: Tournament[] = React.useMemo(() => {
    return baseTournaments.map(t => ({
      ...t,
      registeredPlayers: playersMap[t.id] || [],
      roomId: secretsMap[t.id]?.roomId ?? t.roomId,
      roomPassword: secretsMap[t.id]?.roomPassword ?? t.roomPassword,
    }));
  }, [baseTournaments, playersMap, secretsMap]);

  const setActiveTab = (newTab: 'matches' | 'wallet' | 'settings') => {
    const tabOrder = ['matches', 'wallet', 'settings'];
    const oldIdx = tabOrder.indexOf(activeTab);
    const newIdx = tabOrder.indexOf(newTab);
    if (newIdx > oldIdx) setSwipeDirection('left');
    else if (newIdx < oldIdx) setSwipeDirection('right');
    setActiveTabState(newTab);
  };

  // Notification Trigger
  const triggerNotification = useCallback(
    (title: string, body: string, type: 'payment' | 'match' = 'payment') => {
      sendBrowserNotification(title, body, type);
      const newToast: ToastAlert = {
        id: `toast_${Date.now()}`,
        title,
        body,
        type,
      };
      setToastNotification(newToast);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToastNotification(null);
      }, 6000);
    },
    []
  );

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastNotification(null);
  };

  const enableNotifications = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, String(granted));
    } catch {
      // ignore
    }
    if (granted) {
      triggerNotification(
        'Match & Payment Alerts Enabled!',
        'You will receive 5-minute pre-match notifications with custom Room ID and Password.',
        'payment'
      );
    }
    return granted;
  };

  // Server Email Alert Status
  const refreshEmailStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/email-status');
      if (res.ok) {
        const data = (await res.json()) as ServerEmailStatus;
        setServerEmailStatus(data);
      }
    } catch {
      // ignore offline
    }
  }, []);

  useEffect(() => {
    refreshEmailStatus();
  }, [refreshEmailStatus]);

  // Dispatch Alert to backend Gmail endpoint + Firestore /adminAlerts
  const dispatchAdminAlert = useCallback(
    async (
      eventType: string,
      subject: string,
      summary: string,
      details: Record<string, unknown>
    ): Promise<{ dispatched: boolean }> => {
      let dispatched = false;
      try {
        const res = await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType, subject, summary, details }),
        });
        if (res.ok) {
          const data = await res.json();
          dispatched = Boolean(data.dispatched);
        }
      } catch {
        // ignore network failures on alert relay
      }

      if (auth.currentUser) {
        const alertId = `al_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        try {
          await setDoc(doc(db, 'adminAlerts', alertId), {
            id: alertId,
            userId: auth.currentUser.uid,
            eventType: eventType.slice(0, 40),
            subject: subject.slice(0, 160),
            summary: summary.slice(0, 500),
            recipient: ADMIN_RECIPIENT_EMAIL,
            emailDispatched: dispatched,
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          logFirestoreError(err, OperationType.CREATE, `adminAlerts/${alertId}`);
        }
      }

      refreshEmailStatus();
      return { dispatched };
    },
    [refreshEmailStatus]
  );

  const sendTestAdminAlert = async (): Promise<{
    success: boolean;
    dispatched: boolean;
    message: string;
  }> => {
    const res = await dispatchAdminAlert(
      'test_alert',
      'Test Notification — COZY_ESPORTS Online System',
      `Live test alert triggered by ${user.name} (${user.email || 'no-email'}). Alerts go to ${ADMIN_RECIPIENT_EMAIL}.`,
      {
        TriggeredBy: user.name,
        Email: user.email || 'N/A',
        TargetEmail: ADMIN_RECIPIENT_EMAIL,
        Time: new Date().toLocaleString('en-IN'),
      }
    );
    return {
      success: true,
      dispatched: res.dispatched,
      message: res.dispatched
        ? `Test email dispatched to ${ADMIN_RECIPIENT_EMAIL}!`
        : `Alert logged in Console! Set SMTP_USER & SMTP_PASS secrets on host to deliver to ${ADMIN_RECIPIENT_EMAIL} inbox automatically.`,
    };
  };

  // Google Sign-In / Sign-Out
  const signInWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      triggerNotification(
        'Signed In with Google!',
        `Welcome ${cred.user.displayName || cred.user.email}! Your online wallet is synced.`,
        'payment'
      );
      return { success: true, message: 'Signed in successfully!' };
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { success: true, message: 'Redirecting to Google Sign-In...' };
        } catch (redirErr) {
          return {
            success: false,
            message: redirErr instanceof Error ? redirErr.message : 'Google Sign-In failed.',
          };
        }
      }
      if (code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Google Sign-In popup was closed before completing.' };
      }
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Google Sign-In failed.',
      };
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setIsDevMode(false);
      sessionStorage.removeItem(STORAGE_KEYS.DEV_SESSION);
      setIsDevDashboardOpen(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Public Firestore Listeners: config/app & tournaments
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'config', 'app'),
      snap => {
        if (snap.exists()) {
          const data = snap.data();
          setAdminConfig(prev => ({
            ...prev,
            upiId: typeof data.upiId === 'string' ? data.upiId : prev.upiId,
            upiName: typeof data.upiName === 'string' ? data.upiName : prev.upiName,
            supportPhone: typeof data.supportPhone === 'string' ? data.supportPhone : prev.supportPhone,
            supportEmail: typeof data.supportEmail === 'string' ? data.supportEmail : prev.supportEmail,
            coinRate: typeof data.coinRate === 'number' ? data.coinRate : prev.coinRate,
            autoVerifyUpi: typeof data.autoVerifyUpi === 'boolean' ? data.autoVerifyUpi : true,
            maxAutoVerifyInr: typeof data.maxAutoVerifyInr === 'number' ? data.maxAutoVerifyInr : 50000,
          }));
        }
      },
      err => logFirestoreError(err, OperationType.GET, 'config/app')
    );

    const unsubTours = onSnapshot(
      collection(db, 'tournaments'),
      snap => {
        const list: Array<{ item: Tournament; ts: number }> = [];
        snap.forEach(d => {
          const data = d.data();
          const item: Tournament = {
            id: d.id,
            title: String(data.title || ''),
            game: (data.game || 'bgmi') as GameType,
            map: String(data.map || 'Custom'),
            format: (data.format || 'Squad') as Tournament['format'],
            entryFee: Number(data.entryFee || 0),
            prizePool: Number(data.prizePool || 0),
            prizeBreakdown: data.prizeBreakdown || { rank1: 0, rank2: 0, rank3: 0, perKill: 0 },
            maxSlots: Number(data.maxSlots || 48),
            registeredCount: Number(data.registeredCount || 0),
            registeredPlayers: [],
            startTime: String(data.startTime || 'Upcoming'),
            startTimestamp: Number(data.startTimestamp || Date.now()),
            status: (data.status || 'upcoming') as Tournament['status'],
            credentialsVisibleBeforeMinutes: Number(data.credentialsVisibleBeforeMinutes || 15),
            rules: Array.isArray(data.rules) ? data.rules : [],
            bannerGradient: String(data.bannerGradient || 'from-red-600/30 via-slate-900 to-slate-950'),
            serverRegion: data.serverRegion ? String(data.serverRegion) : undefined,
            version: data.version ? String(data.version) : undefined,
            tag: data.tag ? String(data.tag) : undefined,
            image: data.image ? String(data.image) : undefined,
          };
          list.push({ item, ts: getCreatedMillis(data) });
        });
        list.sort((a, b) => b.ts - a.ts);
        setBaseTournaments(list.map(x => x.item));
      },
      err => logFirestoreError(err, OperationType.LIST, 'tournaments')
    );

    return () => {
      unsubConfig();
      unsubTours();
    };
  }, []);

  // Firebase Auth & User / Admin Firestore Subscriptions
  useEffect(() => {
    let cleanupUserSubs: Array<() => void> = [];

    const unsubAuth = onAuthStateChanged(auth, async fbUser => {
      cleanupUserSubs.forEach(fn => fn());
      cleanupUserSubs = [];

      setFirebaseUser(fbUser);

      if (!fbUser) {
        setIsFirebaseAdmin(false);
        setUser(INITIAL_USER);
        setTransactions([]);
        setTopupRequests([]);
        setWithdrawalRequests([]);
        setRedeemCodes([]);
        setAdminAlerts([]);
        setPlayersMap({});
        setSecretsMap({});
        setAuthLoading(false);
        return;
      }

      // Determine Organizer Admin role
      const emailLower = (fbUser.email || '').toLowerCase();
      let adminDetected = ADMIN_EMAILS.includes(emailLower);
      if (!adminDetected) {
        try {
          const adminDoc = await getDoc(doc(db, 'admins', fbUser.uid));
          adminDetected = adminDoc.exists();
        } catch {
          // Non-admin
        }
      }
      setIsFirebaseAdmin(adminDetected);

      // Ensure user profile exists in /users/{uid}
      const userRef = doc(db, 'users', fbUser.uid);
      try {
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            uid: fbUser.uid,
            name: (fbUser.displayName || 'Esports Player').slice(0, 80),
            email: (fbUser.email || 'player@cozyesports.gg').slice(0, 150),
            phone: '',
            coins: 0,
            avatar: (fbUser.photoURL || INITIAL_USER.avatar).slice(0, 500),
            bgmiIgn: INITIAL_USER.bgmiIgn,
            bgmiId: INITIAL_USER.bgmiId,
            freefireIgn: INITIAL_USER.freefireIgn,
            freefireId: INITIAL_USER.freefireId,
            minecraftUsername: INITIAL_USER.minecraftUsername,
            ign: INITIAL_USER.bgmiIgn,
            gameUid: INITIAL_USER.bgmiId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        logFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }

      // Seed /config/app once if Admin opens and it doesn't exist
      if (adminDetected) {
        try {
          const cfgSnap = await getDoc(doc(db, 'config', 'app'));
          if (!cfgSnap.exists()) {
            await setDoc(doc(db, 'config', 'app'), {
              upiId: INITIAL_ADMIN_CONFIG.upiId,
              upiName: INITIAL_ADMIN_CONFIG.upiName,
              supportPhone: INITIAL_ADMIN_CONFIG.supportPhone,
              supportEmail: ADMIN_RECIPIENT_EMAIL,
              coinRate: 1,
              autoVerifyUpi: true,
              maxAutoVerifyInr: 50000,
              updatedAt: serverTimestamp(),
            });
          }
        } catch (err) {
          logFirestoreError(err, OperationType.WRITE, 'config/app');
        }
      }

      // Live User Profile Subscription
      cleanupUserSubs.push(
        onSnapshot(
          userRef,
          snap => {
            if (snap.exists()) {
              const d = snap.data();
              setUser({
                id: fbUser.uid,
                name: String(d.name || fbUser.displayName || 'Esports Player'),
                email: String(d.email || fbUser.email || ''),
                phone: String(d.phone || ''),
                coins: Number(d.coins || 0),
                avatar: String(d.avatar || fbUser.photoURL || INITIAL_USER.avatar),
                isLoggedIn: true,
                bgmiIgn: String(d.bgmiIgn || INITIAL_USER.bgmiIgn),
                bgmiId: String(d.bgmiId || INITIAL_USER.bgmiId),
                freefireIgn: String(d.freefireIgn || INITIAL_USER.freefireIgn),
                freefireId: String(d.freefireId || INITIAL_USER.freefireId),
                minecraftUsername: String(d.minecraftUsername || INITIAL_USER.minecraftUsername),
                ign: String(d.ign || d.bgmiIgn || INITIAL_USER.bgmiIgn),
                gameUid: String(d.gameUid || d.bgmiId || INITIAL_USER.bgmiId),
              });
            }
          },
          err => logFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`)
        )
      );

      // Live Wallet Transactions Subscription
      const txQuery = adminDetected
        ? collection(db, 'transactions')
        : query(collection(db, 'transactions'), where('userId', '==', fbUser.uid));
      cleanupUserSubs.push(
        onSnapshot(
          txQuery,
          snap => {
            const items: Array<{ item: WalletTransaction; ts: number }> = [];
            snap.forEach(d => {
              const data = d.data();
              items.push({
                ts: getCreatedMillis(data),
                item: {
                  id: d.id,
                  userId: String(data.userId || ''),
                  type: data.type as WalletTransaction['type'],
                  amount: Number(data.amount || 0),
                  coins: Number(data.coins || 0),
                  title: String(data.title || ''),
                  description: String(data.description || ''),
                  timestamp: String(data.timestamp || 'Just now'),
                  status: data.status as WalletTransaction['status'],
                  utr: data.utr ? String(data.utr) : undefined,
                  upiId: data.upiId ? String(data.upiId) : undefined,
                },
              });
            });
            items.sort((a, b) => b.ts - a.ts);
            setTransactions(items.map(x => x.item));
          },
          err => logFirestoreError(err, OperationType.LIST, 'transactions')
        )
      );

      // Live Top-up Requests Subscription
      const topupQuery = adminDetected
        ? collection(db, 'topupRequests')
        : query(collection(db, 'topupRequests'), where('userId', '==', fbUser.uid));
      cleanupUserSubs.push(
        onSnapshot(
          topupQuery,
          snap => {
            const items: Array<{ item: TopupRequest; ts: number }> = [];
            snap.forEach(d => {
              const data = d.data();
              items.push({
                ts: getCreatedMillis(data),
                item: {
                  id: d.id,
                  userId: String(data.userId || ''),
                  userName: String(data.userName || ''),
                  userIgn: String(data.userIgn || ''),
                  userEmail: data.userEmail ? String(data.userEmail) : undefined,
                  inrAmount: Number(data.inrAmount || 0),
                  coins: Number(data.coins || 0),
                  utr: String(data.utr || ''),
                  paymentMethod: (data.paymentMethod || 'upi') as TopupRequest['paymentMethod'],
                  status: data.status as TopupRequest['status'],
                  submittedAt: String(data.submittedAt || 'Just now'),
                  notes: data.notes ? String(data.notes) : undefined,
                },
              });
            });
            items.sort((a, b) => b.ts - a.ts);
            setTopupRequests(items.map(x => x.item));
          },
          err => logFirestoreError(err, OperationType.LIST, 'topupRequests')
        )
      );

      // Live Withdrawal Requests Subscription
      const wdQuery = adminDetected
        ? collection(db, 'withdrawalRequests')
        : query(collection(db, 'withdrawalRequests'), where('userId', '==', fbUser.uid));
      cleanupUserSubs.push(
        onSnapshot(
          wdQuery,
          snap => {
            const items: Array<{ item: WithdrawalRequest; ts: number }> = [];
            snap.forEach(d => {
              const data = d.data();
              items.push({
                ts: getCreatedMillis(data),
                item: {
                  id: d.id,
                  userId: String(data.userId || ''),
                  userName: String(data.userName || ''),
                  userIgn: String(data.userIgn || ''),
                  coins: Number(data.coins || 0),
                  inrAmount: Number(data.inrAmount || 0),
                  upiId: String(data.upiId || ''),
                  status: data.status as WithdrawalRequest['status'],
                  requestedAt: String(data.requestedAt || 'Just now'),
                  payoutRef: data.payoutRef ? String(data.payoutRef) : undefined,
                  notes: data.notes ? String(data.notes) : undefined,
                },
              });
            });
            items.sort((a, b) => b.ts - a.ts);
            setWithdrawalRequests(items.map(x => x.item));
          },
          err => logFirestoreError(err, OperationType.LIST, 'withdrawalRequests')
        )
      );

      // Admin-only subscriptions: redeemCodes & adminAlerts
      if (adminDetected) {
        cleanupUserSubs.push(
          onSnapshot(
            collection(db, 'redeemCodes'),
            snap => {
              const items: RedeemCode[] = [];
              snap.forEach(d => {
                const data = d.data();
                items.push({
                  id: d.id,
                  code: String(data.code || d.id),
                  coins: Number(data.coins || 0),
                  maxUses: Number(data.maxUses || 1),
                  usedBy: Array.isArray(data.usedBy) ? data.usedBy : [],
                  createdAt: String(data.createdAt || 'Active'),
                  active: Boolean(data.active),
                });
              });
              setRedeemCodes(items);
            },
            err => logFirestoreError(err, OperationType.LIST, 'redeemCodes')
          )
        );

        cleanupUserSubs.push(
          onSnapshot(
            collection(db, 'adminAlerts'),
            snap => {
              const items: Array<{ item: AdminAlertLog; ts: number }> = [];
              snap.forEach(d => {
                const data = d.data();
                const ms = getCreatedMillis(data);
                items.push({
                  ts: ms,
                  item: {
                    id: d.id,
                    userId: String(data.userId || ''),
                    eventType: String(data.eventType || 'system'),
                    subject: String(data.subject || ''),
                    summary: String(data.summary || ''),
                    recipient: String(data.recipient || ADMIN_RECIPIENT_EMAIL),
                    emailDispatched: Boolean(data.emailDispatched),
                    timestamp: ms ? new Date(ms).toLocaleString('en-IN') : 'Just now',
                  },
                });
              });
              items.sort((a, b) => b.ts - a.ts);
              setAdminAlerts(items.map(x => x.item));
            },
            err => logFirestoreError(err, OperationType.LIST, 'adminAlerts')
          )
        );
      }

      setAuthLoading(false);
    });

    return () => {
      cleanupUserSubs.forEach(fn => fn());
      unsubAuth();
    };
  }, []);

  // Live Tournament Players & Conditional Room Secrets Subscriptions
  const tournamentIdsKey = baseTournaments.map(t => t.id).join(',');
  useEffect(() => {
    if (!firebaseUser || baseTournaments.length === 0) {
      setPlayersMap({});
      return;
    }

    const unsubs: Array<() => void> = [];
    baseTournaments.forEach(t => {
      const u = onSnapshot(
        collection(db, 'tournaments', t.id, 'players'),
        snap => {
          const players: Player[] = [];
          snap.forEach(d => {
            const p = d.data();
            players.push({
              id: d.id,
              name: String(p.name || 'Player'),
              ign: String(p.ign || 'Player'),
              gameUid: String(p.gameUid || ''),
              joinedAt: String(p.joinedAt || 'Just now'),
              avatar: p.avatar ? String(p.avatar) : undefined,
            });
          });
          setPlayersMap(prev => ({ ...prev, [t.id]: players }));
        },
        err => logFirestoreError(err, OperationType.LIST, `tournaments/${t.id}/players`)
      );
      unsubs.push(u);
    });

    return () => unsubs.forEach(fn => fn());
  }, [firebaseUser?.uid, tournamentIdsKey]);

  const joinedOrAdminTournamentIds = React.useMemo(() => {
    if (!firebaseUser) return '';
    return baseTournaments
      .filter(t => isFirebaseAdmin || (playersMap[t.id] || []).some(p => p.id === firebaseUser.uid))
      .map(t => t.id)
      .join(',');
  }, [firebaseUser?.uid, isFirebaseAdmin, baseTournaments, playersMap]);

  useEffect(() => {
    if (!firebaseUser || !joinedOrAdminTournamentIds) {
      setSecretsMap({});
      return;
    }

    const ids = joinedOrAdminTournamentIds.split(',').filter(Boolean);
    const unsubs: Array<() => void> = [];
    ids.forEach(tId => {
      const u = onSnapshot(
        doc(db, 'tournaments', tId, 'secrets', 'room'),
        snap => {
          if (snap.exists()) {
            const s = snap.data();
            setSecretsMap(prev => ({
              ...prev,
              [tId]: {
                roomId: s.roomId ? String(s.roomId) : undefined,
                roomPassword: s.roomPassword ? String(s.roomPassword) : undefined,
              },
            }));
          }
        },
        err => logFirestoreError(err, OperationType.GET, `tournaments/${tId}/secrets/room`)
      );
      unsubs.push(u);
    });

    return () => unsubs.forEach(fn => fn());
  }, [firebaseUser?.uid, joinedOrAdminTournamentIds]);

  // Sync selectedTournament modal with live tournament updates
  useEffect(() => {
    if (selectedTournament) {
      const updated = tournaments.find(t => t.id === selectedTournament.id);
      if (updated) setSelectedTournament(updated);
    }
  }, [tournaments]);

  // 5-Minute Match Alert Background Checker
  const alertedMatchesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const checkUpcomingMatches = () => {
      const now = Date.now();
      const fiveMins = 5 * 60 * 1000;
      tournaments.forEach(t => {
        const isJoined = t.registeredPlayers.some(p => p.id === user.id);
        if (isJoined && t.status !== 'completed') {
          const timeLeft = t.startTimestamp - now;
          if (timeLeft > 0 && timeLeft <= fiveMins && !alertedMatchesRef.current.has(t.id)) {
            alertedMatchesRef.current.add(t.id);
            triggerNotification(
              `Match Starts in 5 Minutes: ${t.title}!`,
              `Room ID: ${t.roomId || 'Available in App'} | Password: ${t.roomPassword || 'Unlocked'}. Joining on time is your responsibility!`,
              'match'
            );
          }
        }
      });
    };

    const interval = setInterval(checkUpcomingMatches, 10000);
    checkUpcomingMatches();
    return () => clearInterval(interval);
  }, [tournaments, user.id, triggerNotification]);

  const simulateFiveMinuteNotification = (tournamentId?: string) => {
    const targetTour = tournamentId
      ? tournaments.find(t => t.id === tournamentId)
      : tournaments.find(t => t.registeredPlayers.some(p => p.id === user.id)) || tournaments[0];

    const title = targetTour ? targetTour.title : 'BGMI Pro Squad Scrims';
    const roomId = targetTour?.roomId || '8492019';
    const roomPass = targetTour?.roomPassword || 'cozy99';

    triggerNotification(
      `Match Starts in 5 Minutes: ${title}!`,
      `Room ID: ${roomId} | Password: ${roomPass}. Join room on time — no refunds for late entry.`,
      'match'
    );
  };

  // Developer Mode PIN Unlock
  const unlockDevMode = (pin: string) => {
    const normalized = pin.trim();
    if (normalized === '456877' || normalized === adminConfig.pin) {
      setIsDevMode(true);
      sessionStorage.setItem(STORAGE_KEYS.DEV_SESSION, 'true');
      triggerNotification('Developer Mode Unlocked', 'Organizer Console is now active.', 'match');
      return { success: true, message: 'Developer mode activated successfully!' };
    }
    return { success: false, message: 'Invalid Developer Key. Access denied.' };
  };

  const lockDevMode = () => {
    setIsDevMode(false);
    sessionStorage.removeItem(STORAGE_KEYS.DEV_SESSION);
    setIsDevDashboardOpen(false);
  };

  const updateAdminConfig = async (updates: Partial<AdminConfig>) => {
    const merged: AdminConfig = { ...adminConfig, ...updates };
    setAdminConfig(merged);
    if (updates.pin) {
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PIN_OVERRIDE, updates.pin);
      } catch {
        // ignore
      }
    }
    if (firebaseUser && isFirebaseAdmin) {
      try {
        await setDoc(doc(db, 'config', 'app'), {
          upiId: merged.upiId.slice(0, 120),
          upiName: merged.upiName.slice(0, 120),
          supportPhone: merged.supportPhone.slice(0, 80),
          supportEmail: ADMIN_RECIPIENT_EMAIL,
          coinRate: Number(merged.coinRate || 1),
          autoVerifyUpi: Boolean(merged.autoVerifyUpi),
          maxAutoVerifyInr: Number(merged.maxAutoVerifyInr ?? 50000),
          updatedAt: serverTimestamp(),
        });
        triggerNotification('Config Saved Online', 'UPI & Auto-Verification rules updated live.', 'payment');
      } catch (err) {
        logFirestoreError(err, OperationType.WRITE, 'config/app');
      }
    }
  };

  const getGamerCredentialsForGame = (game: GameType): { ign: string; gameUid: string } => {
    if (game === 'bgmi') {
      return {
        ign: user.bgmiIgn || user.ign || user.name || 'BGMI_Player',
        gameUid: user.bgmiId || user.gameUid || '5182940291',
      };
    }
    if (game === 'freefire') {
      return {
        ign: user.freefireIgn || user.ign || user.name || 'FF_Player',
        gameUid: user.freefireId || user.gameUid || '9281749201',
      };
    }
    if (game === 'minecraft') {
      return {
        ign: user.minecraftUsername || user.ign || user.name || 'MC_Crafter',
        gameUid: user.minecraftUsername || 'mc_gamertag',
      };
    }
    return {
      ign: user.ign || user.name || 'Gamer',
      gameUid: user.gameUid || 'UID123456',
    };
  };

  // Tournament Creation (Admin Online)
  const createTournament = async (
    data: Omit<Tournament, 'id' | 'registeredPlayers'>
  ): Promise<Tournament | null> => {
    if (!firebaseUser || !isFirebaseAdmin) {
      triggerNotification(
        'Organizer Gmail Required',
        `Sign in with Organizer Google account (${ADMIN_RECIPIENT_EMAIL}) to publish tournaments live.`,
        'match'
      );
      return null;
    }

    const id = `tour_${data.game}_${Date.now()}`;
    const newTournament: Tournament = {
      ...data,
      id,
      registeredCount: 0,
      registeredPlayers: [],
    };

    try {
      const batch = writeBatch(db);
      const publicPayload = stripUndefined({
        id,
        title: data.title.trim().slice(0, 120),
        game: data.game,
        map: data.map.trim().slice(0, 60),
        format: data.format,
        entryFee: Number(data.entryFee),
        prizePool: Number(data.prizePool),
        prizeBreakdown: data.prizeBreakdown,
        maxSlots: Number(data.maxSlots),
        registeredCount: 0,
        startTime: data.startTime.trim().slice(0, 80),
        startTimestamp: Number(data.startTimestamp),
        status: data.status,
        credentialsVisibleBeforeMinutes: Number(data.credentialsVisibleBeforeMinutes || 15),
        rules: (data.rules || []).slice(0, 20),
        bannerGradient: data.bannerGradient.slice(0, 120),
        serverRegion: data.serverRegion ? data.serverRegion.slice(0, 40) : undefined,
        version: data.version ? data.version.slice(0, 60) : undefined,
        tag: data.tag ? data.tag.slice(0, 40) : undefined,
        image: data.image ? data.image.slice(0, 500) : undefined,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'tournaments', id), publicPayload);

      const secretPayload = stripUndefined({
        roomId: data.roomId ? data.roomId.slice(0, 120) : undefined,
        roomPassword: data.roomPassword ? data.roomPassword.slice(0, 120) : undefined,
        updatedAt: serverTimestamp(),
      });
      batch.set(doc(db, 'tournaments', id, 'secrets', 'room'), secretPayload);

      await batch.commit();
      triggerNotification('Tournament Published Live!', `"${data.title}" is now visible to all players.`, 'match');
      return newTournament;
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `tournaments/${id}`);
      return null;
    }
  };

  const updateTournament = async (id: string, updates: Partial<Tournament>) => {
    if (!firebaseUser || !isFirebaseAdmin) return;

    const { roomId, roomPassword, registeredPlayers: _rp, ...publicUpdates } = updates;
    try {
      const batch = writeBatch(db);
      const cleanPublic = stripUndefined(publicUpdates as Record<string, unknown>);
      if (Object.keys(cleanPublic).length > 0) {
        batch.update(doc(db, 'tournaments', id), {
          ...cleanPublic,
          updatedAt: serverTimestamp(),
        });
      }

      if (roomId !== undefined || roomPassword !== undefined) {
        const existingSecret = secretsMap[id] || {};
        const nextRoomId = roomId !== undefined ? roomId : existingSecret.roomId;
        const nextRoomPass = roomPassword !== undefined ? roomPassword : existingSecret.roomPassword;
        batch.set(
          doc(db, 'tournaments', id, 'secrets', 'room'),
          stripUndefined({
            roomId: nextRoomId ? nextRoomId.slice(0, 120) : undefined,
            roomPassword: nextRoomPass ? nextRoomPass.slice(0, 120) : undefined,
            updatedAt: serverTimestamp(),
          })
        );
      }

      await batch.commit();
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `tournaments/${id}`);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    try {
      try {
        await deleteDoc(doc(db, 'tournaments', id, 'secrets', 'room'));
      } catch {
        // ignore if absent
      }
      await deleteDoc(doc(db, 'tournaments', id));
      if (selectedTournament?.id === id) setSelectedTournament(null);
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `tournaments/${id}`);
    }
  };

  // Join Tournament (Atomic Transaction)
  const joinTournament = async (
    tournamentId: string,
    playerDetails?: { ign?: string; gameUid?: string }
  ): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) {
      return { success: false, message: 'Please continue with Google Sign-In first to join tournaments.' };
    }

    const tour = tournaments.find(t => t.id === tournamentId);
    if (!tour) return { success: false, message: 'Tournament not found.' };

    const defaultCredentials = getGamerCredentialsForGame(tour.game);
    const ign = (playerDetails?.ign?.trim() || defaultCredentials.ign).slice(0, 60);
    const gameUid = (playerDetails?.gameUid?.trim() || defaultCredentials.gameUid).slice(0, 60);

    try {
      await runTransaction(db, async tx => {
        const tourRef = doc(db, 'tournaments', tournamentId);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const playerRef = doc(db, 'tournaments', tournamentId, 'players', firebaseUser.uid);

        const [tourSnap, userSnap, playerSnap] = await Promise.all([
          tx.get(tourRef),
          tx.get(userRef),
          tx.get(playerRef),
        ]);

        if (!tourSnap.exists()) throw new Error('Tournament not found.');
        if (!userSnap.exists()) throw new Error('Player profile not initialized yet.');
        if (playerSnap.exists()) throw new Error('You have already joined this tournament!');

        const tData = tourSnap.data();
        const currentReg = Number(tData.registeredCount || 0);
        const maxSlots = Number(tData.maxSlots || 48);
        if (currentReg >= maxSlots) throw new Error('Tournament slots are completely full!');

        const currentCoins = Number(userSnap.data().coins || 0);
        const fee = Number(tData.entryFee || 0);
        if (currentCoins < fee) {
          throw new Error(
            `Insufficient Cozy Coins! You have ${currentCoins} coins, but entry fee is ${fee} coins.`
          );
        }

        const txId = `tx_entry_${Date.now()}`;
        if (fee > 0) {
          tx.update(userRef, {
            coins: currentCoins - fee,
            lastActionId: tournamentId,
            updatedAt: serverTimestamp(),
          });
        }

        tx.set(playerRef, {
          id: firebaseUser.uid,
          name: user.name.slice(0, 80),
          ign,
          gameUid,
          joinedAt: new Date().toLocaleString('en-IN'),
          avatar: (user.avatar || '').slice(0, 500),
          createdAt: serverTimestamp(),
        });

        tx.update(tourRef, {
          registeredCount: currentReg + 1,
          updatedAt: serverTimestamp(),
        });

        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'entry_fee',
          amount: 0,
          coins: -fee,
          title: `Entry Fee: ${tour.title}`.slice(0, 140),
          description: `Registered as ${ign} (ID: ${gameUid})`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      });

      triggerNotification(
        `Slot Secured: ${tour.title}!`,
        `Entry fee of ${tour.entryFee} coins deducted. Room credentials unlocked!`,
        'match'
      );

      dispatchAdminAlert(
        'tournament_join',
        `Player Joined: ${tour.title}`,
        `${user.name} (${ign} / ${gameUid}) joined "${tour.title}" for ${tour.entryFee} Coins.`,
        {
          Player: user.name,
          Email: firebaseUser.email || '',
          IGN: ign,
          UID: gameUid,
          Tournament: tour.title,
          FeeCoins: tour.entryFee,
        }
      );

      return { success: true, message: `Successfully joined ${tour.title}! Room details are unlocked.` };
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `tournaments/${tournamentId}`);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unable to join tournament right now.',
      };
    }
  };

  const leaveTournament = (tournamentId: string): { success: boolean; message: string } => {
    const tour = tournaments.find(t => t.id === tournamentId);
    if (!tour) return { success: false, message: 'Tournament not found' };
    const isRegistered = tour.registeredPlayers.some(p => p.id === user.id);
    if (!isRegistered) return { success: false, message: 'You are not registered in this tournament' };

    triggerNotification(
      'Attendance Policy Notice',
      'Joining the custom room on time is strictly your own responsibility. Entry fees are non-refundable.',
      'match'
    );

    return {
      success: false,
      message:
        'Slot reserved! Please remember: if you are unable to join the room on time, it is solely your responsibility and entry fees are non-refundable.',
    };
  };

  // Automatic 12-Digit UTR Payment Verification + Server Gmail Alert
  const requestCoinTopup = async (
    inrAmount: number,
    utr: string,
    fastAutoApprove: boolean = true
  ): Promise<{ success: boolean; autoVerified?: boolean; message: string }> => {
    if (!firebaseUser) {
      return {
        success: false,
        message: 'Please continue with Google Sign-In first so coins are saved to your online account.',
      };
    }

    const cleanUtr = utr.trim();
    const rate = adminConfig.coinRate || 1;
    const amount = Math.floor(Number(inrAmount));
    const coins = Math.floor(amount * rate);

    if (!amount || amount < 1 || amount > 50000) {
      return { success: false, message: 'Recharge amount must be between ₹1 and ₹50,000.' };
    }

    if (!/^\d{12}$/.test(cleanUtr)) {
      return {
        success: false,
        message: 'Please enter an exact 12-digit numeric UPI UTR / Reference number.',
      };
    }

    const maxAuto = adminConfig.maxAutoVerifyInr ?? 50000;
    const canAutoVerify =
      Boolean(fastAutoApprove) && adminConfig.autoVerifyUpi !== false && amount <= maxAuto;

    const reqId = `req_${Date.now()}`;
    const txId = `tx_req_${Date.now()}`;

    try {
      // Check UTR uniqueness before committing
      const usedSnap = await getDoc(doc(db, 'usedUtrs', cleanUtr));
      if (usedSnap.exists()) {
        dispatchAdminAlert(
          'duplicate_utr_blocked',
          `Blocked Duplicate UTR: ${cleanUtr}`,
          `${user.name} (${firebaseUser.email}) tried to reuse 12-digit UTR ${cleanUtr} for ₹${amount}.`,
          {
            Player: user.name,
            Email: firebaseUser.email || '',
            UTR: cleanUtr,
            AttemptedAmount: `₹${amount}`,
          }
        );
        return {
          success: false,
          message: 'This 12-digit UTR has already been redeemed! Duplicate UTR submissions are blocked.',
        };
      }

      if (canAutoVerify) {
        const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
        const currentCoins = Number(userSnap.data()?.coins ?? user.coins ?? 0);

        const batch = writeBatch(db);
        batch.set(doc(db, 'usedUtrs', cleanUtr), {
          utr: cleanUtr,
          userId: firebaseUser.uid,
          inrAmount: amount,
          createdAt: serverTimestamp(),
        });

        batch.set(doc(db, 'topupRequests', reqId), {
          id: reqId,
          userId: firebaseUser.uid,
          userName: user.name.slice(0, 80),
          userIgn: (user.ign || user.bgmiIgn || user.freefireIgn || user.name).slice(0, 60),
          userEmail: (firebaseUser.email || user.email || '').slice(0, 150),
          inrAmount: amount,
          coins,
          utr: cleanUtr,
          paymentMethod: 'upi',
          status: 'approved',
          submittedAt: new Date().toLocaleString('en-IN'),
          notes: `Auto-verified 12-digit UTR (₹${amount})`.slice(0, 240),
          createdAt: serverTimestamp(),
        });

        batch.update(doc(db, 'users', firebaseUser.uid), {
          coins: currentCoins + coins,
          lastActionId: reqId,
          updatedAt: serverTimestamp(),
        });

        batch.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'topup',
          amount,
          coins,
          title: `UPI Auto Recharge (₹${amount})`.slice(0, 140),
          description: `Auto-Verified UTR: ${cleanUtr} · +${coins} Coins Added`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          utr: cleanUtr,
          createdAt: serverTimestamp(),
        });

        await batch.commit();

        triggerNotification(
          'Payment Auto-Verified!',
          `₹${amount} UTR verified. ${coins} Cozy Coins credited online!`,
          'payment'
        );

        dispatchAdminAlert(
          'upi_auto_verified',
          `Auto-Verified UPI Recharge: ₹${amount} (+${coins} Coins)`,
          `${user.name} (${firebaseUser.email}) received ${coins} Cozy Coins automatically via 12-digit UTR ${cleanUtr}.`,
          {
            Player: user.name,
            Email: firebaseUser.email || '',
            AmountINR: `₹${amount}`,
            CoinsCredited: coins,
            UTR: cleanUtr,
            Verification: 'Automatic (Unique 12-digit UTR)',
          }
        );

        return {
          success: true,
          autoVerified: true,
          message: `${coins} Cozy Coins auto-verified & added to your online wallet!`,
        };
      } else {
        // Pending Organizer Verification
        const batch = writeBatch(db);
        batch.set(doc(db, 'topupRequests', reqId), {
          id: reqId,
          userId: firebaseUser.uid,
          userName: user.name.slice(0, 80),
          userIgn: (user.ign || user.bgmiIgn || user.freefireIgn || user.name).slice(0, 60),
          userEmail: (firebaseUser.email || user.email || '').slice(0, 150),
          inrAmount: amount,
          coins,
          utr: cleanUtr,
          paymentMethod: 'upi',
          status: 'pending',
          submittedAt: new Date().toLocaleString('en-IN'),
          notes: `Submitted ₹${amount} via UPI QR (Manual verify)`.slice(0, 240),
          createdAt: serverTimestamp(),
        });

        batch.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'topup',
          amount,
          coins,
          title: `UPI Coin Top-up (₹${amount})`.slice(0, 140),
          description: `UTR: ${cleanUtr} · Pending verification`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'pending',
          utr: cleanUtr,
          createdAt: serverTimestamp(),
        });

        await batch.commit();

        triggerNotification(
          'UTR Submitted for Verification',
          `₹${amount} UTR sent to Organizer (${ADMIN_RECIPIENT_EMAIL}).`,
          'payment'
        );

        dispatchAdminAlert(
          'upi_pending_review',
          `Pending UPI Verification: ₹${amount}`,
          `${user.name} (${firebaseUser.email}) submitted UTR ${cleanUtr} for ₹${amount} (${coins} Coins) awaiting approval.`,
          {
            Player: user.name,
            Email: firebaseUser.email || '',
            AmountINR: `₹${amount}`,
            Coins: coins,
            UTR: cleanUtr,
          }
        );

        return {
          success: true,
          autoVerified: false,
          message: `UTR submitted! Organizer (${ADMIN_RECIPIENT_EMAIL}) notified for approval.`,
        };
      }
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `topupRequests/${reqId}`);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unable to process UTR right now.',
      };
    }
  };

  // Submit Google Play Redeem Code (Always Pending + Alert Email to cozypixelboy@gmail.com)
  const submitPlayCodeTopup = async (
    inrAmount: number,
    playCode: string,
    gmail: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) {
      return {
        success: false,
        message: 'Please continue with Google Sign-In first so we can credit your online account.',
      };
    }

    const cleanCode = playCode.trim().toUpperCase().replace(/\s+/g, '');
    const cleanEmail = gmail.trim();

    if (!inrAmount || inrAmount < 10) {
      return { success: false, message: 'Minimum Google Play Redeem Code amount is ₹10.' };
    }
    if (cleanCode.length < 12) {
      return { success: false, message: 'Please enter a valid Google Play Redeem Code (12-16 characters).' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter your valid Gmail address.' };
    }

    const coins = Math.floor(inrAmount * (adminConfig.coinRate || 1));
    const reqId = `req_play_${Date.now()}`;
    const txId = `tx_play_${Date.now()}`;

    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'topupRequests', reqId), {
        id: reqId,
        userId: firebaseUser.uid,
        userName: user.name.slice(0, 80),
        userIgn: (user.ign || user.bgmiIgn || user.freefireIgn || user.name).slice(0, 60),
        userEmail: cleanEmail.slice(0, 150),
        inrAmount,
        coins,
        utr: cleanCode.slice(0, 64),
        paymentMethod: 'play_code',
        status: 'pending',
        submittedAt: new Date().toLocaleString('en-IN'),
        notes: `Google Play Code (${cleanEmail}) · ₹${inrAmount}`.slice(0, 240),
        createdAt: serverTimestamp(),
      });

      batch.set(doc(db, 'transactions', txId), {
        id: txId,
        userId: firebaseUser.uid,
        type: 'topup',
        amount: inrAmount,
        coins,
        title: `Play Store Code (₹${inrAmount})`.slice(0, 140),
        description: `Code: ${cleanCode} · Pending organizer verification`.slice(0, 280),
        timestamp: new Date().toLocaleString('en-IN'),
        status: 'pending',
        utr: cleanCode.slice(0, 64),
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      triggerNotification(
        'Google Play Code Submitted!',
        `₹${inrAmount} Play Code sent to Organizer. Coins will credit once verified.`,
        'payment'
      );

      dispatchAdminAlert(
        'play_code_submit',
        `New Google Play Code: ₹${inrAmount} (${user.name})`,
        `${user.name} submitted Google Play Code "${cleanCode}" for ₹${inrAmount} (${coins} Coins) using ${cleanEmail}.`,
        {
          Player: user.name,
          PlayerGmail: cleanEmail,
          PlayCode: cleanCode,
          AmountINR: `₹${inrAmount}`,
          CoinsRequested: coins,
        }
      );

      return {
        success: true,
        message: `Google Play Code sent to Organizer! ${coins} Cozy Coins will credit after verification.`,
      };
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `topupRequests/${reqId}`);
      return { success: false, message: 'Failed to submit Play Code online.' };
    }
  };

  // Admin Approves Pending Top-up (Cross-User Atomic Transaction)
  const approveTopupRequest = async (requestId: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    const req = topupRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'pending') return;

    try {
      await runTransaction(db, async tx => {
        const reqRef = doc(db, 'topupRequests', requestId);
        const targetUserRef = doc(db, 'users', req.userId);
        const [reqSnap, userSnap] = await Promise.all([tx.get(reqRef), tx.get(targetUserRef)]);

        if (!reqSnap.exists()) throw new Error('Request no longer exists.');
        if (reqSnap.data().status !== 'pending') return;

        tx.update(reqRef, {
          status: 'approved',
          notes: `Approved by Organizer (${firebaseUser.email})`.slice(0, 240),
        });

        if (userSnap.exists()) {
          const curCoins = Number(userSnap.data().coins || 0);
          tx.update(targetUserRef, {
            coins: curCoins + req.coins,
            lastActionId: requestId,
            updatedAt: serverTimestamp(),
          });
        }

        const txId = `tx_ap_${Date.now()}`;
        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: req.userId,
          type: 'topup',
          amount: req.inrAmount,
          coins: req.coins,
          title: `Approved Credit: ₹${req.inrAmount}`.slice(0, 140),
          description: `Verified by Organizer (${req.utr}) · +${req.coins} Coins`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          utr: req.utr,
          createdAt: serverTimestamp(),
        });
      });

      triggerNotification(
        'Top-up Approved!',
        `+${req.coins} Coins credited to ${req.userName}.`,
        'payment'
      );
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `topupRequests/${requestId}`);
    }
  };

  const rejectTopupRequest = async (requestId: string, notes?: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    try {
      await updateDoc(doc(db, 'topupRequests', requestId), {
        status: 'rejected',
        notes: (notes || 'Verification failed').slice(0, 240),
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `topupRequests/${requestId}`);
    }
  };

  // Organizer Creates Redeem Code (Stored with code as doc ID for fast player lookup)
  const createRedeemCode = async (
    rawCode: string,
    coins: number,
    maxUses: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser || !isFirebaseAdmin) {
      return {
        success: false,
        message: `Sign in with Organizer Google account (${ADMIN_RECIPIENT_EMAIL}) to publish redeem codes online.`,
      };
    }

    const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (code.length < 4 || code.length > 32) {
      return { success: false, message: 'Code must be 4–32 letters/numbers (A-Z, 0-9, -, _).' };
    }
    if (!coins || coins < 1) {
      return { success: false, message: 'Coin value must be at least 1.' };
    }
    if (!maxUses || maxUses < 1) {
      return { success: false, message: 'Max uses must be at least 1.' };
    }

    try {
      const codeRef = doc(db, 'redeemCodes', code);
      const existing = await getDoc(codeRef);
      if (existing.exists()) {
        return { success: false, message: `Code "${code}" already exists.` };
      }

      await setDoc(codeRef, {
        id: code,
        code,
        coins: Math.floor(coins),
        maxUses: Math.floor(maxUses),
        usedBy: [],
        createdAt: new Date().toLocaleString('en-IN'),
        active: true,
      });

      return { success: true, message: `Redeem code ${code} (${coins} Coins) published live!` };
    } catch (err) {
      logFirestoreError(err, OperationType.CREATE, `redeemCodes/${code}`);
      return { success: false, message: 'Unable to create code right now.' };
    }
  };

  const deleteRedeemCode = async (id: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    try {
      await deleteDoc(doc(db, 'redeemCodes', id));
    } catch (err) {
      logFirestoreError(err, OperationType.DELETE, `redeemCodes/${id}`);
    }
  };

  // Player Redeems Cozy Code Online (Atomic Transaction)
  const redeemCozyCode = async (
    rawCode: string
  ): Promise<{ success: boolean; message: string; coinsAdded?: number }> => {
    if (!firebaseUser) {
      return {
        success: false,
        message: 'Please continue with Google Sign-In first to redeem gift codes.',
      };
    }

    const code = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!code || code.length < 4) {
      return { success: false, message: 'Please enter a valid Cozy Redeem Code.' };
    }

    try {
      const added = await runTransaction(db, async tx => {
        const codeRef = doc(db, 'redeemCodes', code);
        const userRef = doc(db, 'users', firebaseUser.uid);

        const [codeSnap, userSnap] = await Promise.all([tx.get(codeRef), tx.get(userRef)]);
        if (!codeSnap.exists()) throw new Error('Invalid or expired Cozy Redeem Code.');

        const cData = codeSnap.data();
        if (!cData.active) throw new Error('This redeem code is no longer active.');

        const usedBy: string[] = Array.isArray(cData.usedBy) ? cData.usedBy : [];
        if (usedBy.includes(firebaseUser.uid)) {
          throw new Error('You have already redeemed this code.');
        }
        if (usedBy.length >= Number(cData.maxUses || 1)) {
          throw new Error('This redeem code has reached its maximum usage limit.');
        }

        const rewardCoins = Number(cData.coins || 0);
        const curCoins = Number(userSnap.data()?.coins || 0);
        const txId = `tx_redeem_${Date.now()}`;

        tx.update(codeRef, {
          usedBy: [...usedBy, firebaseUser.uid],
        });

        tx.update(userRef, {
          coins: curCoins + rewardCoins,
          lastActionId: code,
          updatedAt: serverTimestamp(),
        });

        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'topup',
          amount: rewardCoins * (adminConfig.coinRate || 1),
          coins: rewardCoins,
          title: `Redeem Code: ${code}`.slice(0, 140),
          description: `Instant Gift Code Redeemed (+${rewardCoins} Coins)`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          utr: code,
          createdAt: serverTimestamp(),
        });

        return rewardCoins;
      });

      triggerNotification(
        `Code Redeemed! +${added} Coins`,
        `Cozy Code "${code}" credited ${added} Coins to your wallet!`,
        'payment'
      );

      dispatchAdminAlert(
        'redeem_code_used',
        `Gift Code Redeemed: ${code} (+${added} Coins)`,
        `${user.name} (${firebaseUser.email}) redeemed Cozy Code ${code} for +${added} Coins.`,
        {
          Player: user.name,
          Email: firebaseUser.email || '',
          Code: code,
          CoinsAdded: added,
        }
      );

      return {
        success: true,
        message: `${added} Cozy Coins added from code ${code}!`,
        coinsAdded: added,
      };
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `redeemCodes/${code}`);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unable to redeem code right now.',
      };
    }
  };

  // Player Requests UPI Withdrawal (Atomic Balance Deduction + Gmail Alert)
  const requestWithdrawal = async (
    coins: number,
    upiId: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!firebaseUser) {
      return {
        success: false,
        message: 'Please continue with Google Sign-In first to request withdrawals.',
      };
    }

    const cleanUpi = upiId.trim();
    const coinVal = Math.floor(Number(coins));
    if (!coinVal || coinVal < 1) {
      return { success: false, message: 'Please enter at least 1 coin to withdraw.' };
    }
    if (!cleanUpi || !cleanUpi.includes('@') || cleanUpi.length < 4) {
      return {
        success: false,
        message: 'Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm).',
      };
    }

    const inrAmount = coinVal * (adminConfig.coinRate || 1);
    const wdId = `wd_${Date.now()}`;
    const txId = `tx_wd_${Date.now()}`;

    try {
      await runTransaction(db, async tx => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await tx.get(userRef);
        const curCoins = Number(userSnap.data()?.coins || 0);

        if (coinVal > curCoins) {
          throw new Error(`Insufficient balance! You have ${curCoins} coins.`);
        }

        tx.update(userRef, {
          coins: curCoins - coinVal,
          lastActionId: wdId,
          updatedAt: serverTimestamp(),
        });

        tx.set(doc(db, 'withdrawalRequests', wdId), {
          id: wdId,
          userId: firebaseUser.uid,
          userName: user.name.slice(0, 80),
          userIgn: (user.ign || user.bgmiIgn || user.freefireIgn || user.name).slice(0, 60),
          coins: coinVal,
          inrAmount,
          upiId: cleanUpi.slice(0, 120),
          status: 'pending',
          requestedAt: new Date().toLocaleString('en-IN'),
          notes: `Withdrawal payout to ${cleanUpi}`.slice(0, 240),
          createdAt: serverTimestamp(),
        });

        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'withdrawal',
          amount: inrAmount,
          coins: -coinVal,
          title: `UPI Payout Request (₹${inrAmount})`.slice(0, 140),
          description: `To ${cleanUpi} · Pending organizer transfer`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'pending',
          upiId: cleanUpi.slice(0, 120),
          createdAt: serverTimestamp(),
        });
      });

      triggerNotification(
        'Withdrawal Request Submitted!',
        `₹${inrAmount} requested to UPI ID: ${cleanUpi}.`,
        'payment'
      );

      dispatchAdminAlert(
        'withdrawal_request',
        `New UPI Withdrawal: ₹${inrAmount} (${user.name})`,
        `${user.name} (${firebaseUser.email}) requested ₹${inrAmount} (${coinVal} Coins) payout to UPI: ${cleanUpi}.`,
        {
          Player: user.name,
          Email: firebaseUser.email || '',
          AmountINR: `₹${inrAmount}`,
          Coins: coinVal,
          PlayerUPI: cleanUpi,
        }
      );

      return {
        success: true,
        message: `Withdrawal of ₹${inrAmount} (${coinVal} Coins) submitted! Organizer has been alerted.`,
      };
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `withdrawalRequests/${wdId}`);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Unable to submit withdrawal.',
      };
    }
  };

  const approveWithdrawal = async (requestId: string, payoutRef?: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    const req = withdrawalRequests.find(r => r.id === requestId);
    if (!req) return;
    const refStr = (payoutRef || `UPI_${Date.now().toString().slice(-6)}`).slice(0, 80);

    try {
      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status: 'completed',
        payoutRef: refStr,
        notes: `Paid by Organizer (${refStr})`.slice(0, 240),
      });
      triggerNotification('Withdrawal Marked Paid!', `₹${req.inrAmount} to ${req.upiId} completed.`, 'payment');
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `withdrawalRequests/${requestId}`);
    }
  };

  const rejectWithdrawal = async (requestId: string, reason?: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    const req = withdrawalRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'pending') return;

    try {
      await runTransaction(db, async tx => {
        const wdRef = doc(db, 'withdrawalRequests', requestId);
        const targetUserRef = doc(db, 'users', req.userId);
        const [wdSnap, userSnap] = await Promise.all([tx.get(wdRef), tx.get(targetUserRef)]);

        if (!wdSnap.exists() || wdSnap.data().status !== 'pending') return;

        tx.update(wdRef, {
          status: 'rejected',
          notes: (reason || 'Invalid UPI ID - Refunded').slice(0, 240),
        });

        if (userSnap.exists()) {
          const curCoins = Number(userSnap.data().coins || 0);
          tx.update(targetUserRef, {
            coins: curCoins + req.coins,
            updatedAt: serverTimestamp(),
          });
        }

        const txId = `tx_rf_${Date.now()}`;
        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: req.userId,
          type: 'refund',
          amount: req.inrAmount,
          coins: req.coins,
          title: `Withdrawal Refunded (+${req.coins} Coins)`.slice(0, 140),
          description: `${reason || 'Invalid UPI ID'} · Coins returned`.slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          upiId: req.upiId,
          createdAt: serverTimestamp(),
        });
      });

      triggerNotification('Withdrawal Cancelled & Coins Refunded', `${req.coins} Coins returned.`, 'payment');
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `withdrawalRequests/${requestId}`);
    }
  };

  // Admin Grants Coins
  const adminInjectCoins = async (coinsAmount: number, reason: string) => {
    if (!firebaseUser || !isFirebaseAdmin) return;
    const delta = Math.floor(Number(coinsAmount));
    if (!delta) return;

    try {
      await runTransaction(db, async tx => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await tx.get(userRef);
        const curCoins = Number(snap.data()?.coins || 0);
        const nextCoins = Math.max(0, curCoins + delta);

        tx.update(userRef, {
          coins: nextCoins,
          updatedAt: serverTimestamp(),
        });

        const txId = `tx_admin_${Date.now()}`;
        tx.set(doc(db, 'transactions', txId), {
          id: txId,
          userId: firebaseUser.uid,
          type: 'admin_grant',
          amount: 0,
          coins: delta,
          title: delta >= 0 ? 'Admin Coin Grant' : 'Admin Coin Adjustment',
          description: (reason || 'Direct developer credit').slice(0, 280),
          timestamp: new Date().toLocaleString('en-IN'),
          status: 'completed',
          createdAt: serverTimestamp(),
        });
      });

      triggerNotification('Wallet Balance Updated', `${delta > 0 ? '+' : ''}${delta} Coins: ${reason}`, 'payment');
    } catch (err) {
      logFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}`);
    }
  };

  // Update User Profile (Allowed Profile Fields Only)
  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    if (!firebaseUser) return;

    const allowedPayload = stripUndefined({
      name: updates.name !== undefined ? String(updates.name).trim().slice(0, 80) : undefined,
      email: updates.email !== undefined ? String(updates.email).trim().slice(0, 150) : undefined,
      phone: updates.phone !== undefined ? String(updates.phone).trim().slice(0, 24) : undefined,
      bgmiIgn: updates.bgmiIgn !== undefined ? String(updates.bgmiIgn).trim().slice(0, 60) : undefined,
      bgmiId: updates.bgmiId !== undefined ? String(updates.bgmiId).trim().slice(0, 40) : undefined,
      freefireIgn: updates.freefireIgn !== undefined ? String(updates.freefireIgn).trim().slice(0, 60) : undefined,
      freefireId: updates.freefireId !== undefined ? String(updates.freefireId).trim().slice(0, 40) : undefined,
      minecraftUsername:
        updates.minecraftUsername !== undefined
          ? String(updates.minecraftUsername).trim().slice(0, 60)
          : undefined,
      ign: updates.ign !== undefined ? String(updates.ign).trim().slice(0, 60) : undefined,
      gameUid: updates.gameUid !== undefined ? String(updates.gameUid).trim().slice(0, 40) : undefined,
      avatar: updates.avatar !== undefined ? String(updates.avatar).trim().slice(0, 500) : undefined,
    });

    if (Object.keys(allowedPayload).length === 0) return;

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        ...allowedPayload,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      logFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_PIN_OVERRIDE);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      sessionStorage.removeItem(STORAGE_KEYS.DEV_SESSION);
    } catch {
      // ignore
    }
    setAdminConfig(INITIAL_ADMIN_CONFIG);
    setIsDevMode(false);
    setSelectedTournament(null);
    triggerNotification('Local Cache Cleared', 'Online Firebase records remain safely synced.', 'payment');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
        authLoading,
        isGoogleSignedIn: Boolean(firebaseUser),
        isFirebaseAdmin,
        tournaments,
        transactions,
        topupRequests,
        withdrawalRequests,
        redeemCodes,
        adminConfig,
        adminAlerts,
        serverEmailStatus,
        refreshEmailStatus,
        sendTestAdminAlert,
        isDevMode,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        selectedTournament,
        setSelectedTournament,
        isRechargeModalOpen,
        setIsRechargeModalOpen,
        isWithdrawModalOpen,
        setIsWithdrawModalOpen,
        isDevLoginModalOpen,
        setIsDevLoginModalOpen,
        isDevDashboardOpen,
        setIsDevDashboardOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isAIAssistantOpen,
        setIsAIAssistantOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        activeTab,
        setActiveTab,
        matchesSubTab,
        setMatchesSubTab,
        swipeDirection,
        setSwipeDirection,
        notificationsEnabled,
        enableNotifications,
        toastNotification,
        dismissToast,
        triggerNotification,
        simulateFiveMinuteNotification,
        signInWithGoogle,
        signOutUser,
        unlockDevMode,
        lockDevMode,
        updateAdminConfig,
        createTournament,
        updateTournament,
        deleteTournament,
        joinTournament,
        leaveTournament,
        requestCoinTopup,
        submitPlayCodeTopup,
        approveTopupRequest,
        rejectTopupRequest,
        createRedeemCode,
        deleteRedeemCode,
        redeemCozyCode,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        adminInjectCoins,
        updateUserProfile,
        getGamerCredentialsForGame,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
