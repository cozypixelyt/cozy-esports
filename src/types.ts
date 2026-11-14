export type GameType = 'bgmi' | 'freefire' | 'minecraft' | 'codm' | 'all';

export type MatchFormat = 'Solo' | 'Duo' | 'Squad';

export type MatchStatus = 'upcoming' | 'live' | 'completed';

export interface Player {
  id: string;
  name: string;
  ign: string; // In-game name
  gameUid: string; // In-game UID
  joinedAt: string;
  avatar?: string;
}

export interface PrizeBreakdown {
  rank1: number;
  rank2: number;
  rank3: number;
  perKill: number;
}

export interface Tournament {
  id: string;
  title: string;
  game: GameType;
  map: string;
  format: MatchFormat;
  entryFee: number; // in Cozy Coins
  prizePool: number; // in Cozy Coins
  prizeBreakdown: PrizeBreakdown;
  maxSlots: number;
  registeredCount?: number;
  registeredPlayers: Player[];
  startTime: string; // e.g. "Today, 08:30 PM"
  startTimestamp: number; // unix epoch ms
  status: MatchStatus;
  roomId?: string;
  roomPassword?: string;
  credentialsVisibleBeforeMinutes: number;
  rules: string[];
  bannerGradient: string;
  serverRegion?: string;
  version?: string; // For Minecraft e.g. "1.20+ Java/Bedrock"
  tag?: string; // e.g. "Full Map", "Custom Cup"
  image?: string;
}

export type TransactionType = 'topup' | 'entry_fee' | 'prize' | 'admin_grant' | 'refund' | 'withdrawal';

export interface WalletTransaction {
  id: string;
  userId?: string;
  type: TransactionType;
  amount: number; // in INR if applicable or 0
  coins: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'rejected';
  utr?: string;
  upiId?: string;
}

export interface TopupRequest {
  id: string;
  userId: string;
  userName: string;
  userIgn: string;
  userEmail?: string;
  inrAmount: number;
  coins: number;
  utr: string;
  paymentMethod?: 'upi' | 'play_code';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
}

export interface RedeemCode {
  id: string;
  code: string;
  coins: number;
  maxUses: number;
  usedBy: string[];
  createdAt: string;
  active: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userIgn: string;
  coins: number;
  inrAmount: number;
  upiId: string;
  status: 'pending' | 'completed' | 'rejected';
  requestedAt: string;
  payoutRef?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  coins: number;
  avatar: string;
  isLoggedIn: boolean;

  // Game IDs per user request
  bgmiIgn: string;
  bgmiId: string;
  freefireIgn: string;
  freefireId: string;
  minecraftUsername: string;

  // Fallbacks
  ign?: string;
  gameUid?: string;
}

export interface AdminConfig {
  pin: string;
  upiId: string;
  upiName: string;
  supportPhone: string;
  supportEmail: string;
  coinRate: number; // 1 INR = 1 Coin
  autoVerifyUpi: boolean;
  maxAutoVerifyInr: number;
}

export interface AdminAlertLog {
  id: string;
  userId: string;
  eventType: string;
  subject: string;
  summary: string;
  recipient: string;
  emailDispatched: boolean;
  timestamp?: string;
}

export interface ServerEmailStatus {
  smtpConfigured: boolean;
  adminEmail: string;
  recentAlerts?: Array<{
    id: string;
    eventType: string;
    subject: string;
    summary: string;
    recipient: string;
    dispatched: boolean;
    reason?: string;
    timestamp: string;
  }>;
}
