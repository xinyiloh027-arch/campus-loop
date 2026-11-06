import { 
  Listing, 
  TradeRequest, 
  UserProfile, 
  Review, 
  ChatConversation, 
  CartItem,
  RentalItem,
  RentalRequest
} from '../types';

/**
 * Real Marketplace Data Layer:
 * All fake accounts, sample products, simulated rentals, hardcoded chats,
 * and demonstration transactions have been removed.
 * All listings and transactions come from actual registered UTM students.
 */

export const INITIAL_LISTINGS: Listing[] = [];

export const INITIAL_CART: CartItem[] = [];

export const INITIAL_TRADE_REQUESTS: TradeRequest[] = [];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  studentId: '',
  email: '',
  faculty: 'Faculty of Computing (FC)',
  dorm: 'Kolej Rahman Putra (KRP)',
  contactHandle: '',
  avatarUrl: '',
  verifiedStudent: false,
  role: 'both',
  verifiedTransactionsCount: 0,
  savedListingIds: [],
};

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_CHAT_CONVERSATIONS: ChatConversation[] = [];

export const POPULAR_CAMPUS_LOCATIONS: string[] = [
  'Perpustakaan Sultanah Zanariah (PSZ - Central Library)',
  'Student Union Building (SUB)',
  'Faculty of Computing (FC Block N28)',
  'Faculty of Electrical Engineering (FKE Block P08)',
  'Faculty of Mechanical Engineering (FKM Block E)',
  'Faculty of Civil Engineering (FKA)',
  'Faculty of Science (FS Block C)',
  'Faculty of Social Sciences & Humanities (FSSH)',
  'Kolej Rahman Putra (KRP Cafeteria)',
  'Kolej Tun Dr Ismail (KTDI Foyer)',
  'Kolej Tuanku Canselor (KTC)',
  'Kolej Datin Seri Endon (KDSE)',
  'Kolej Perdana (KP)',
  'Meranti Arcade & Food Court',
  'UTM Sports Complex / Stadium',
  'Other Campus Location',
];

export const INITIAL_RENTAL_ITEMS: RentalItem[] = [];

export const INITIAL_RENTAL_REQUESTS: RentalRequest[] = [];
