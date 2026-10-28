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
  BorrowRequest,
  CartItem,
  RentalItem,
  RentalRequest,
  RentalStatus,
  DepositStatus
} from '../types';

import { 
  INITIAL_LISTINGS, 
  INITIAL_TRADE_REQUESTS, 
  INITIAL_USER_PROFILE, 
  INITIAL_REVIEWS, 
  INITIAL_CHAT_CONVERSATIONS, 
  INITIAL_CART,
  INITIAL_RENTAL_ITEMS,
  INITIAL_RENTAL_REQUESTS
} from '../data/mockData';

const LISTINGS_KEY = 'campusloop_listings_v4';
const REQUESTS_KEY = 'campusloop_trade_requests_v4';
const PROFILE_KEY = 'campusloop_user_profile_v4';
const REVIEWS_KEY = 'campusloop_reviews_v4';
const CHATS_KEY = 'campusloop_chats_v4';
const CART_KEY = 'campusloop_cart_v4';
const RENTAL_ITEMS_KEY = 'campusloop_rental_items_v1';
const RENTAL_REQUESTS_KEY = 'campusloop_rental_requests_v1';
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

  createGroupChat(groupName: string, members: string[]): ChatConversation {
    const convos = this.getChatConversations();
    const newGroup: ChatConversation = {
      id: `chat-group-${Date.now()}`,
      type: 'group',
      name: groupName,
      avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=120&q=80',
      participants: [
        { id: 'user-current', name: 'Alex Tan', role: 'Student' },
        ...members.map((m, idx) => ({ id: `member-${Date.now()}-${idx}`, name: m, role: 'Student' })),
      ],
      lastMessage: 'Group conversation created',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      isBlocked: false,
      messages: [],
    };
    const updated = [newGroup, ...convos];
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to create group chat:', e);
    }
    return newGroup;
  },

  blockChat(conversationId: string): ChatConversation[] {
    const convos = this.getChatConversations();
    const updated = convos.map(c => {
      if (c.id === conversationId) {
        return { ...c, isBlocked: !c.isBlocked };
      }
      return c;
    });
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to block/unblock chat:', e);
    }
    return updated;
  },

  // --- PET & GOALS HELPERS (COMPATIBILITY) ---
  getVirtualPet(): VirtualPet {
    try {
      const stored = localStorage.getItem(PET_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    const defaultPet: VirtualPet = {
      name: 'Mochi',
      type: 'kitten',
      petType: 'kitten',
      mood: 'happy',
      hunger: 80,
      energy: 80,
      happiness: 90,
      level: 1,
      exp: 10,
      accessory: 'grad_cap',
      lastFed: 'Recently',
      lastPlayed: 'Recently',
      achievements: []
    };
    return defaultPet;
  },

  updateVirtualPet(pet: VirtualPet): VirtualPet {
    try {
      localStorage.setItem(PET_KEY, JSON.stringify(pet));
    } catch {}
    return pet;
  },

  getSavingsGoals(): SavingsGoal[] {
    try {
      const stored = localStorage.getItem(SAVINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveSavingsGoals(goals: SavingsGoal[]): SavingsGoal[] {
    try {
      localStorage.setItem(SAVINGS_KEY, JSON.stringify(goals));
    } catch {}
    return goals;
  },

  // --- CART MANAGEMENT ---
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read cart:', e);
    }
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(INITIAL_CART));
    } catch {}
    return INITIAL_CART;
  },

  saveCart(cart: CartItem[]): CartItem[] {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
    return cart;
  },

  addToCart(listing: Listing, quantity = 1): CartItem[] {
    const cart = this.getCart();
    const existingIndex = cart.findIndex((i) => i.listingId === listing.id);
    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = cart.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + quantity, selected: true }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        listingId: listing.id,
        listing,
        quantity,
        selected: true,
        addedAt: new Date().toISOString()
      };
      updated = [newItem, ...cart];
    }
    return this.saveCart(updated);
  },

  removeFromCart(listingId: string): CartItem[] {
    const cart = this.getCart();
    const updated = cart.filter((i) => i.listingId !== listingId);
    return this.saveCart(updated);
  },

  updateCartQuantity(listingId: string, quantity: number): CartItem[] {
    const cart = this.getCart();
    if (quantity <= 0) {
      return this.removeFromCart(listingId);
    }
    const updated = cart.map((i) => (i.listingId === listingId ? { ...i, quantity } : i));
    return this.saveCart(updated);
  },

  toggleSelectCartItem(listingId: string): CartItem[] {
    const cart = this.getCart();
    const updated = cart.map((i) => (i.listingId === listingId ? { ...i, selected: !i.selected } : i));
    return this.saveCart(updated);
  },

  selectAllCartItems(selected: boolean): CartItem[] {
    const cart = this.getCart();
    const updated = cart.map((i) => ({ ...i, selected }));
    return this.saveCart(updated);
  },

  clearSelectedCartItems(): CartItem[] {
    const cart = this.getCart();
    const updated = cart.filter((i) => !i.selected);
    return this.saveCart(updated);
  },

  clearCart(): CartItem[] {
    return this.saveCart([]);
  },

  // --- RENTAL ITEMS MANAGEMENT ---
  getRentalItems(): RentalItem[] {
    try {
      const stored = localStorage.getItem(RENTAL_ITEMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read rental items:', e);
    }
    try {
      localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(INITIAL_RENTAL_ITEMS));
    } catch {}
    return INITIAL_RENTAL_ITEMS;
  },

  saveRentalItems(items: RentalItem[]): RentalItem[] {
    try {
      localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save rental items:', e);
    }
    return items;
  },

  createRentalItem(itemData: Omit<RentalItem, 'id' | 'createdAt'>): RentalItem {
    const items = this.getRentalItems();
    const newItem: RentalItem = {
      ...itemData,
      id: `rent-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    this.saveRentalItems(updated);
    return newItem;
  },

  updateRentalItem(id: string, updates: Partial<RentalItem>): RentalItem | null {
    const items = this.getRentalItems();
    let updatedItem: RentalItem | null = null;
    const updated = items.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });
    if (updatedItem) {
      this.saveRentalItems(updated);
    }
    return updatedItem;
  },

  deleteRentalItem(id: string): void {
    const items = this.getRentalItems();
    const updated = items.filter((item) => item.id !== id);
    this.saveRentalItems(updated);
  },

  // --- RENTAL REQUESTS & WORKFLOW ---
  getRentalRequests(): RentalRequest[] {
    try {
      const stored = localStorage.getItem(RENTAL_REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read rental requests:', e);
    }
    try {
      localStorage.setItem(RENTAL_REQUESTS_KEY, JSON.stringify(INITIAL_RENTAL_REQUESTS));
    } catch {}
    return INITIAL_RENTAL_REQUESTS;
  },

  saveRentalRequests(requests: RentalRequest[]): RentalRequest[] {
    try {
      localStorage.setItem(RENTAL_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save rental requests:', e);
    }
    return requests;
  },

  // Check overlapping approved/active rental bookings for the same item and dates
  checkRentalOverlap(rentalItemId: string, startDate: string, returnDate: string, excludeRequestId?: string): boolean {
    const requests = this.getRentalRequests();
    const activeBlockingStatuses: RentalStatus[] = [
      'Approved',
      'Ready for Handover',
      'Rented Out',
      'Return Pending',
      'Inspection Pending'
    ];

    const targetStart = new Date(startDate).getTime();
    const targetReturn = new Date(returnDate).getTime();

    return requests.some((req) => {
      if (req.rentalItemId !== rentalItemId) return false;
      if (excludeRequestId && req.id === excludeRequestId) return false;
      if (!activeBlockingStatuses.includes(req.status)) return false;

      const reqStart = new Date(req.startDate).getTime();
      const reqReturn = new Date(req.returnDate).getTime();

      // Check if [targetStart, targetReturn] overlaps with [reqStart, reqReturn]
      return targetStart <= reqReturn && targetReturn >= reqStart;
    });
  },

  createRentalRequest(requestData: Omit<RentalRequest, 'id' | 'createdAt' | 'updatedAt'>): RentalRequest {
    const requests = this.getRentalRequests();
    const newReq: RentalRequest = {
      ...requestData,
      id: `rental-req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newReq, ...requests];
    this.saveRentalRequests(updated);

    // Create notification for owner
    this.addCampusNotification(
      'New Rental Request!',
      `${newReq.renterName} requested to rent "${newReq.rentalItemName}" from ${newReq.startDate} to ${newReq.returnDate}.`,
      'rental_request',
      'rent',
      newReq.id
    );

    return newReq;
  },

  updateRentalRequestStatus(id: string, status: RentalStatus, extraData?: Partial<RentalRequest>): RentalRequest | null {
    const requests = this.getRentalRequests();
    let updatedReq: RentalRequest | null = null;
    const now = new Date().toISOString();

    const updated = requests.map((req) => {
      if (req.id === id) {
        updatedReq = {
          ...req,
          status,
          updatedAt: now,
          ...(extraData || {}),
        };

        // If status transitions to Approved, mark item availability if needed
        if (status === 'Approved' || status === 'Rented Out') {
          this.updateRentalItem(req.rentalItemId, { isAvailable: false });
        } else if (status === 'Completed' || status === 'Rejected' || status === 'Cancelled') {
          // If no other active booking, set item back to available
          const hasOtherActive = this.getRentalRequests().some(
            (other) => other.id !== id && other.rentalItemId === req.rentalItemId && 
              ['Approved', 'Rented Out', 'Ready for Handover', 'Return Pending'].includes(other.status)
          );
          if (!hasOtherActive) {
            this.updateRentalItem(req.rentalItemId, { isAvailable: true });
          }
        }

        return updatedReq;
      }
      return req;
    });

    if (updatedReq) {
      this.saveRentalRequests(updated);

      // Notification triggers based on status
      if (status === 'Approved') {
        this.addCampusNotification(
          'Rental Request Approved!',
          `Your rental request for "${(updatedReq as RentalRequest).rentalItemName}" was approved. Please arrange handover.`,
          'rental_approved',
          'rent',
          id
        );
      } else if (status === 'Rejected') {
        this.addCampusNotification(
          'Rental Request Declined',
          `Your rental request for "${(updatedReq as RentalRequest).rentalItemName}" was declined by the owner.`,
          'rental_rejected',
          'rent',
          id
        );
      }
    }
    return updatedReq;
  },

  // Record item condition at campus handover
  recordHandoverCondition(id: string, notes: string): RentalRequest | null {
    return this.updateRentalRequestStatus(id, 'Rented Out', {
      depositStatus: 'Paid',
      handoverConditionNotes: notes,
      handoverConfirmedAt: new Date().toISOString(),
    });
  },

  // Renter reports return
  confirmRenterReturn(id: string): RentalRequest | null {
    return this.updateRentalRequestStatus(id, 'Inspection Pending', {
      returnReportedAt: new Date().toISOString(),
    });
  },

  // Owner inspects returned item
  recordReturnInspection(
    id: string, 
    returnNotes: string, 
    passed: boolean, 
    proposedDeduction = 0, 
    deductionReason?: string
  ): RentalRequest | null {
    if (passed) {
      // Inspection passed: full deposit refund approved
      return this.updateRentalRequestStatus(id, 'Refund Pending', {
        inspectionPassed: true,
        returnConditionNotes: returnNotes,
        proposedDeduction: 0,
        refundAmount: undefined, // will be approved next
      });
    } else {
      // Damage or missing items reported: initiate Dispute flow
      const updated = this.updateRentalRequestStatus(id, 'Dispute', {
        depositStatus: 'Dispute',
        inspectionPassed: false,
        returnConditionNotes: returnNotes,
        proposedDeduction,
        deductionReason: deductionReason || 'Condition damage or missing accessories',
        disputeNotes: `Owner reported issue: "${deductionReason}". Proposed deduction: RM ${proposedDeduction}.`,
      });

      this.addCampusNotification(
        'Rental Inspection Dispute',
        `A deduction of RM ${proposedDeduction} was proposed for "${updated?.rentalItemName}". Please review the inspection notes.`,
        'rental_dispute',
        'rent',
        id
      );

      return updated;
    }
  },

  // Renter and Owner resolve dispute
  resolveDispute(id: string, agreedRefundAmount: number, disputeNotes: string, renterResponse?: string): RentalRequest | null {
    return this.updateRentalRequestStatus(id, 'Refund Pending', {
      depositStatus: 'Refund Pending',
      refundAmount: agreedRefundAmount,
      disputeNotes,
      renterDisputeResponse: renterResponse,
    });
  },

  // Owner approves deposit refund
  approveDepositRefund(id: string, refundAmount: number): RentalRequest | null {
    const updated = this.updateRentalRequestStatus(id, 'Completed', {
      depositStatus: 'Refunded',
      refundAmount,
      refundDate: new Date().toISOString(),
    });

    this.addCampusNotification(
      'Deposit Refund Approved! 💸',
      `Deposit refund of RM ${refundAmount.toFixed(2)} has been recorded for "${updated?.rentalItemName}".`,
      'rental_refunded',
      'me',
      id
    );

    return updated;
  },

  // --- NOTIFICATIONS MANAGEMENT ---
  getNotifications(): CampusNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read notifications:', e);
    }
    try {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
    } catch {}
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

  markNotificationAsRead(id: string): CampusNotification[] {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) =>
      n.id === id ? { ...n, isRead: true, read: true } : n
    );
    return this.saveNotifications(updated);
  },

  markAllNotificationsAsRead(): CampusNotification[] {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => ({ ...n, isRead: true, read: true }));
    return this.saveNotifications(updated);
  },

  clearAllNotifications(): CampusNotification[] {
    return this.saveNotifications([]);
  },

  // Notification helper
  addCampusNotification(
    title: string, 
    message: string, 
    type: any, 
    linkTab = 'rent',
    relatedRentalId?: string
  ): CampusNotification {
    const notifs = this.getNotifications();
    const newNotif: CampusNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      read: false,
      createdAt: 'Just now',
      timestamp: 'Just now',
      linkTab,
      relatedRentalId,
    };
    const updated = [newNotif, ...notifs];
    this.saveNotifications(updated);
    return newNotif;
  },

  // --- PROTOTYPE RESET ---
  resetPrototypeData() {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(INITIAL_LISTINGS));
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(INITIAL_TRADE_REQUESTS));
    localStorage.setItem(PROFILE_KEY, JSON.stringify(INITIAL_USER_PROFILE));
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(INITIAL_REVIEWS));
    localStorage.setItem(CHATS_KEY, JSON.stringify(INITIAL_CHAT_CONVERSATIONS));
    localStorage.setItem(CART_KEY, JSON.stringify(INITIAL_CART));
    localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(INITIAL_RENTAL_ITEMS));
    localStorage.setItem(RENTAL_REQUESTS_KEY, JSON.stringify(INITIAL_RENTAL_REQUESTS));
    return {
      listings: INITIAL_LISTINGS,
      requests: INITIAL_TRADE_REQUESTS,
      profile: INITIAL_USER_PROFILE,
      reviews: INITIAL_REVIEWS,
      chats: INITIAL_CHAT_CONVERSATIONS,
      cart: INITIAL_CART,
      rentalItems: INITIAL_RENTAL_ITEMS,
      rentalRequests: INITIAL_RENTAL_REQUESTS,
    };
  }
};
