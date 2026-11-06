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

export interface FacultyOption {
  fullName: string;
  name: string;
  abbr: string;
}

export const UTM_FACULTIES: FacultyOption[] = [
  { fullName: 'Azman Hashim International Business School (AHIBS)', name: 'Azman Hashim International Business School', abbr: 'AHIBS' },
  { fullName: 'Faculty of Artificial Intelligence (FAI)', name: 'Faculty of Artificial Intelligence', abbr: 'FAI' },
  { fullName: 'Faculty of Built Environment and Surveying (FABU)', name: 'Faculty of Built Environment and Surveying', abbr: 'FABU' },
  { fullName: 'Faculty of Chemical and Energy Engineering (FCEE)', name: 'Faculty of Chemical and Energy Engineering', abbr: 'FCEE' },
  { fullName: 'Faculty of Computing (FC)', name: 'Faculty of Computing', abbr: 'FC' },
  { fullName: 'Faculty of Educational Sciences and Technology (FEST)', name: 'Faculty of Educational Sciences and Technology', abbr: 'FEST' },
  { fullName: 'Faculty of Electrical Engineering (FKE)', name: 'Faculty of Electrical Engineering', abbr: 'FKE' },
  { fullName: 'Faculty of Management (FM)', name: 'Faculty of Management', abbr: 'FM' },
  { fullName: 'Faculty of Mechanical Engineering (FKM)', name: 'Faculty of Mechanical Engineering', abbr: 'FKM' },
  { fullName: 'Faculty of Civil Engineering (FKA)', name: 'Faculty of Civil Engineering', abbr: 'FKA' },
  { fullName: 'Faculty of Science (FS)', name: 'Faculty of Science', abbr: 'FS' },
  { fullName: 'Faculty of Social Sciences and Humanities (FSSH)', name: 'Faculty of Social Sciences and Humanities', abbr: 'FSSH' },
  { fullName: 'Malaysia-Japan International Institute of Technology (MJIIT)', name: 'Malaysia-Japan International Institute of Technology', abbr: 'MJIIT' },
];
