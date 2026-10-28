/**
 * CampusLoop Storage Service (Frontend Prototype Layer)
 * 
 * NOTE FOR BEGINNER PROGRAMMERS:
 * -------------------------------------------------------------
 * This service manages state using browser `localStorage`.
 * Your created listings, reviews, trade requests, chats, budget entries,
 * savings goals, and virtual pet progress survive page refreshes!
 */

import { 
  Listing, 
  TradeRequest, 
  UserProfile, 
  Review, 
  ChatConversation, 
  ChatMessage, 
  VirtualPet, 
  BudgetTransaction, 
  BudgetSettings,
  UserRole,
  SavingsGoal,
  CampusNotification,
  BorrowRequest
} from '../types';

import { 
  INITIAL_LISTINGS, 
  INITIAL_TRADE_REQUESTS, 
  INITIAL_USER_PROFILE, 
  INITIAL_REVIEWS, 
  INITIAL_CHAT_CONVERSATIONS, 
  INITIAL_VIRTUAL_PET, 
  INITIAL_BUDGET_SETTINGS, 
  INITIAL_BUDGET_TRANSACTIONS 
} from '../data/mockData';

const LISTINGS_KEY = 'campusloop_listings_v3';
const REQUESTS_KEY = 'campusloop_trade_requests_v3';
const PROFILE_KEY = 'campusloop_user_profile_v3';
const REVIEWS_KEY = 'campusloop_reviews_v3';
const CHATS_KEY = 'campusloop_chats_v3';
const PET_KEY = 'campusloop_virtual_pet_v3';
const BUDGET_TX_KEY = 'campusloop_budget_transactions_v3';
const BUDGET_SETTINGS_KEY = 'campusloop_budget_settings_v3';
const SAVINGS_KEY = 'campusloop_savings_goals_v3';
const NOTIFICATIONS_KEY = 'campusloop_notifications_v3';
const BORROW_KEY = 'campusloop_borrow_requests_v3';

const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Next Semester Textbooks Fund',
    targetAmount: 200,
    currentAmount: 85,
    deadline: 'End of Semester',
    category: 'Textbooks',
    plantStage: 'growing',
    rewardPetItem: "Dean's Scholar Cap",
    isCompleted: false,
  },
  {
    id: 'goal-2',
    title: 'Dorm Mini Air Cooler',
    targetAmount: 90,
    currentAmount: 90,
    deadline: 'Midterm Break',
    category: 'Dorm Essentials',
    plantStage: 'bloomed',
    rewardPetItem: 'Peach Ribbon Bow',
    isCompleted: true,
  }
];

const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif-1',
    type: 'trade_request',
    title: 'Trade Request Accepted!',
    message: 'Danial Hakim accepted your request for "Calculus: Early Transcendentals (8th Ed)". Meetup at Central Library.',
    createdAt: '10 mins ago',
    timestamp: '10 mins ago',
    isRead: false,
    read: false,
    linkTab: 'my-requests',
  },
  {
    id: 'notif-2',
    type: 'price_alert',
    title: 'Price Benchmark Insight',
    message: 'New listing "Logitech MX Master 3S" is priced RM 80 below Shopee/Lazada market retail.',
    createdAt: '1 hour ago',
    timestamp: '1 hour ago',
    isRead: false,
    read: false,
    linkTab: 'pricing',
  },
  {
    id: 'notif-3',
    type: 'borrow_reminder',
    title: 'Borrow Item Due Soon',
    message: 'Scientific Calculator Casio fx-570EX is scheduled for return to Hafiz Rahim tomorrow.',
    createdAt: 'Yesterday',
    timestamp: 'Yesterday',
    isRead: true,
    read: true,
    linkTab: 'borrow',
  }
];

export const storageService = {
  // --- LISTINGS ---
  getListings(): Listing[] {
    try {
      const stored = localStorage.getItem(LISTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read listings from localStorage:', e);
    }
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
    return INITIAL_LISTINGS;
  },

  createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'status' | 'isUserCreated'>): Listing {
    const currentListings = this.getListings();
    const newListing: Listing = {
      ...listingData,
      id: `list-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
      isUserCreated: true,
    };
    const updated = [newListing, ...currentListings];
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save listing:', e);
    }
    return newListing;
  },

  // --- TRADE REQUESTS ---
  getTradeRequests(): TradeRequest[] {
    try {
      const stored = localStorage.getItem(REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read trade requests:', e);
    }
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_TRADE_REQUESTS));
    return INITIAL_TRADE_REQUESTS;
  },

  createTradeRequest(data: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>): TradeRequest {
    const current = this.getTradeRequests();
    const newRequest: TradeRequest = {
      ...data,
      id: `req-user-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      isSentByCurrentUser: true,
    };
    const updated = [newRequest, ...current];
    try {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save trade request:', e);
    }
    return newRequest;
  },

  updateRequestStatus(requestId: string, status: TradeRequest['status']): TradeRequest[] {
    const current = this.getTradeRequests();
    const updated = current.map(req => req.id === requestId ? { ...req, status } : req);
    try {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update request status:', e);
    }
    return updated;
  },

  updateTradeRequestStatus(requestId: string, status: TradeRequest['status']): TradeRequest[] {
    return this.updateRequestStatus(requestId, status);
  },

  // --- REVIEWS ---
  getReviews(): Review[] {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read reviews:', e);
    }
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  },

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const current = this.getReviews();
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRev, ...current];
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save review:', e);
    }
    return newRev;
  },

  reportReview(reviewId: string): Review[] {
    const current = this.getReviews();
    const updated = current.map(r => r.id === reviewId ? { ...r, reported: true } : r);
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to report review:', e);
    }
    return updated;
  },

  // --- USER PROFILE & ROLE ---
  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read user profile:', e);
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
    return INITIAL_USER_PROFILE;
  },

  updateUserProfile(updatedProfile: UserProfile): UserProfile {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch (e) {
      console.error('Failed to update user profile:', e);
    }
    return updatedProfile;
  },

  updateUserRole(role: UserRole): UserProfile {
    const profile = this.getUserProfile();
    const updated = { ...profile, role };
    return this.updateUserProfile(updated);
  },

  setUserRole(role: UserRole): UserProfile {
    return this.updateUserRole(role);
  },

  toggleSaveListing(listingId: string): string[] {
    const profile = this.getUserProfile();
    const favs = profile.savedListingIds || [];
    const exists = favs.includes(listingId);
    const updatedFavs = exists ? favs.filter(id => id !== listingId) : [...favs, listingId];
    this.updateUserProfile({ ...profile, savedListingIds: updatedFavs });
    return updatedFavs;
  },

  toggleFavorite(listingId: string): string[] {
    return this.toggleSaveListing(listingId);
  },

  // --- CHAT CONVERSATIONS ---
  getChatConversations(): ChatConversation[] {
    try {
      const stored = localStorage.getItem(CHATS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read chat conversations:', e);
    }
    localStorage.setItem(CHATS_KEY, JSON.stringify(INITIAL_CHAT_CONVERSATIONS));
    return INITIAL_CHAT_CONVERSATIONS;
  },

  sendChatMessage(conversationId: string, text: string, sharedListing?: ChatMessage['sharedListing']): ChatConversation[] {
    const convos = this.getChatConversations();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = convos.map(c => {
      if (c.id === conversationId) {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: 'user-current',
          senderName: 'Alex Tan',
          text,
          timestamp: timeStr,
          sharedListing,
        };
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: timeStr,
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });

    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save message:', e);
    }
    return updated;
  },

  sendMessage(conversationId: string, text: string, sharedListing?: any): ChatConversation[] {
    return this.sendChatMessage(conversationId, text, sharedListing);
  },

  // --- VIRTUAL PET ---
  getVirtualPet(): VirtualPet {
    try {
      const stored = localStorage.getItem(PET_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read virtual pet:', e);
    }
    const defaultPet: VirtualPet = {
      ...INITIAL_VIRTUAL_PET,
      name: 'Mochi',
      type: 'kitten',
      petType: 'kitten',
      mood: 'happy',
      accessory: 'grad_cap',
    };
    localStorage.setItem(PET_KEY, JSON.stringify(defaultPet));
    return defaultPet;
  },

  updateVirtualPet(pet: VirtualPet): VirtualPet {
    try {
      localStorage.setItem(PET_KEY, JSON.stringify(pet));
    } catch (e) {
      console.error('Failed to save virtual pet:', e);
    }
    return pet;
  },

  // --- SAVINGS GOALS (POCKET GARDEN) ---
  getSavingsGoals(): SavingsGoal[] {
    try {
      const stored = localStorage.getItem(SAVINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read savings goals:', e);
    }
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(INITIAL_SAVINGS_GOALS));
    return INITIAL_SAVINGS_GOALS;
  },

  saveSavingsGoals(goals: SavingsGoal[]): SavingsGoal[] {
    try {
      localStorage.setItem(SAVINGS_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Failed to save savings goals:', e);
    }
    return goals;
  },

  // --- NOTIFICATIONS ---
  getNotifications(): CampusNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read notifications:', e);
    }
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  },

  saveNotifications(notifs: CampusNotification[]): CampusNotification[] {
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
    return notifs;
  },

  // --- BUDGET & FINANCE ---
  getBudgetTransactions(): BudgetTransaction[] {
    try {
      const stored = localStorage.getItem(BUDGET_TX_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read budget transactions:', e);
    }
    localStorage.setItem(BUDGET_TX_KEY, JSON.stringify(INITIAL_BUDGET_TRANSACTIONS));
    return INITIAL_BUDGET_TRANSACTIONS;
  },

  addBudgetTransaction(tx: Omit<BudgetTransaction, 'id'>): BudgetTransaction {
    const current = this.getBudgetTransactions();
    const newTx: BudgetTransaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    const updated = [newTx, ...current];
    try {
      localStorage.setItem(BUDGET_TX_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save transaction:', e);
    }
    return newTx;
  },

  deleteBudgetTransaction(txId: string): BudgetTransaction[] {
    const current = this.getBudgetTransactions();
    const updated = current.filter(t => t.id !== txId);
    try {
      localStorage.setItem(BUDGET_TX_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete transaction:', e);
    }
    return updated;
  },

  getBudgetSettings(): BudgetSettings {
    try {
      const stored = localStorage.getItem(BUDGET_SETTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read budget settings:', e);
    }
    localStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(INITIAL_BUDGET_SETTINGS));
    return INITIAL_BUDGET_SETTINGS;
  },

  updateBudgetSettings(settings: BudgetSettings): BudgetSettings {
    try {
      localStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save budget settings:', e);
    }
    return settings;
  },

  // --- PROTOTYPE RESET ---
  resetPrototypeData() {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_TRADE_REQUESTS));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(CHATS_KEY, JSON.stringify(INITIAL_CHAT_CONVERSATIONS));
    localStorage.setItem(PET_KEY, JSON.stringify(INITIAL_VIRTUAL_PET));
    localStorage.setItem(BUDGET_TX_KEY, JSON.stringify(INITIAL_BUDGET_TRANSACTIONS));
    localStorage.setItem(BUDGET_SETTINGS_KEY, JSON.stringify(INITIAL_BUDGET_SETTINGS));
    localStorage.setItem(SAVINGS_KEY, JSON.stringify(INITIAL_SAVINGS_GOALS));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    return {
      listings: INITIAL_LISTINGS,
      requests: INITIAL_TRADE_REQUESTS,
      profile: INITIAL_USER_PROFILE,
      reviews: INITIAL_REVIEWS,
      chats: INITIAL_CHAT_CONVERSATIONS,
      pet: INITIAL_VIRTUAL_PET,
      transactions: INITIAL_BUDGET_TRANSACTIONS,
      budgetSettings: INITIAL_BUDGET_SETTINGS,
      savingsGoals: INITIAL_SAVINGS_GOALS,
      notifications: INITIAL_NOTIFICATIONS,
    };
  }
};
