import { Tournament, UserProfile, WalletTransaction, TopupRequest, WithdrawalRequest, AdminConfig, RedeemCode } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr_gamer_main',
  name: 'Esports Player',
  phone: '',
  email: 'player@cozyesports.gg',
  coins: 0, // Real money testing: starts with 0 coins, recharges 1 Rupee = 1 Coin
  avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  isLoggedIn: true,
  bgmiIgn: 'CozyHunter',
  bgmiId: '5182940291',
  freefireIgn: 'CozyFire',
  freefireId: '9281749201',
  minecraftUsername: 'CozyCrafter',
  ign: 'CozyHunter',
  gameUid: '5182940291',
};

export const INITIAL_ADMIN_CONFIG: AdminConfig = {
  pin: '456877',
  upiId: 'cozyesports@upi',
  upiName: 'Cozy Esports Organizer',
  supportPhone: 'COZY_ESPORTS 24/7 Live Desk',
  supportEmail: 'cozypixelboy@gmail.com',
  coinRate: 1, // 1 INR = 1 Coin
  autoVerifyUpi: true,
  maxAutoVerifyInr: 50000,
};

// All fake tournaments removed as explicitly requested by user
export const INITIAL_TOURNAMENTS: Tournament[] = [];

// Clean initial transaction history
export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

// Clean top-up requests
export const INITIAL_TOPUP_REQUESTS: TopupRequest[] = [];

// Clean withdrawal requests
export const INITIAL_WITHDRAWAL_REQUESTS: WithdrawalRequest[] = [];

// Clean redeem codes (Organizer creates live codes in Console)
export const INITIAL_REDEEM_CODES: RedeemCode[] = [];
