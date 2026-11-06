/**
 * CampusLoop Real Data & Persistence Service
 * 
 * Connected to Firebase Cloud Firestore with automatic real-time sync.
 * All fake demo products, simulated rentals, mock reviews, and pre-seeded
 * transactions have been completely removed.
 */

import { 
  Listing, 
  TradeRequest, 
  UserProfile, 
  Review, 
  ChatConversation, 
  ChatMessage, 
  CartItem,
  RentalItem,
  RentalRequest,
  RentalStatus,
  DepositStatus,
  CampusNotification,
  UserRole
} from '../types';

import { 
  initFirebase, 
  isFirebaseConfigured,
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from './firebase';

const LISTINGS_KEY = 'campusloop_real_listings_v1';
const REQUESTS_KEY = 'campusloop_real_trade_requests_v1';
const PROFILE_KEY = 'campusloop_real_user_profile_v1';
const REVIEWS_KEY = 'campusloop_real_reviews_v1';
const CHATS_KEY = 'campusloop_real_chats_v1';
const CART_KEY = 'campusloop_real_cart_v1';
const RENTAL_ITEMS_KEY = 'campusloop_real_rental_items_v1';
const RENTAL_REQUESTS_KEY = 'campusloop_real_rental_requests_v1';
const NOTIFICATIONS_KEY = 'campusloop_real_notifications_v1';

// Legacy keys from prototype with fake items that must be cleaned up
const LEGACY_STORAGE_KEYS = [
  'campusloop_listings_v4',
  'campusloop_trade_requests_v4',
  'campusloop_user_profile_v4',
  'campusloop_reviews_v4',
  'campusloop_chats_v4',
  'campusloop_cart_v4',
  'campusloop_rental_items_v1',
  'campusloop_rental_requests_v1',
  'campusloop_notifications_v3',
  'campusloop_budget_transactions_v3',
  'campusloop_savings_goals_v3'
];

function cleanupLegacyMockStorage() {
  try {
    LEGACY_STORAGE_KEYS.forEach(k => localStorage.removeItem(k));
  } catch {}
}

cleanupLegacyMockStorage();

export const storageService = {
  // --- LISTINGS ---
  getListings(): Listing[] {
    try {
      const stored = localStorage.getItem(LISTINGS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read listings from localStorage:', e);
    }
    return [];
  },

  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'status' | 'isUserCreated'>): Promise<Listing> {
    const newListing: Listing = {
      ...listingData,
      id: `list-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Active',
      isUserCreated: true,
    };

    // 1. Firebase Firestore sync if connected
    const { db } = initFirebase();
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'listings'), newListing);
        newListing.id = docRef.id;
      } catch (err) {
        console.warn('Firestore listing write warning:', err);
      }
    }

    // 2. Local state update
    const current = this.getListings();
    const updated = [newListing, ...current];
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save listing locally:', e);
    }
    return newListing;
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    const { db } = initFirebase();
    if (db) {
      try {
        await updateDoc(doc(db, 'listings', id), updates);
      } catch (err) {
        console.warn('Firestore listing update warning:', err);
      }
    }

    const current = this.getListings();
    let updatedItem: Listing | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        updatedItem = { ...item, ...updates };
        return updatedItem;
      }
      return item;
    });

    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch {}
    return updatedItem;
  },

  async deleteListing(id: string): Promise<void> {
    const { db } = initFirebase();
    if (db) {
      try {
        await deleteDoc(doc(db, 'listings', id));
      } catch (err) {
        console.warn('Firestore listing delete warning:', err);
      }
    }

    const current = this.getListings();
    const updated = current.filter(item => item.id !== id);
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch {}
  },

  subscribeToListings(callback: (listings: Listing[]) => void): () => void {
    const { db } = initFirebase();
    if (db) {
      try {
        const q = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items: Listing[] = [];
          snapshot.forEach(docSnap => {
            items.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          // Cache locally
          localStorage.setItem(LISTINGS_KEY, JSON.stringify(items));
          callback(items);
        }, (err) => {
          console.warn('Firestore listings subscription fallback:', err);
          callback(this.getListings());
        });
        return unsubscribe;
      } catch (e) {
        console.warn('Failed to subscribe to Firestore listings:', e);
      }
    }

    // Default to local listings
    callback(this.getListings());
    return () => {};
  },

  // --- RENTAL ITEMS ---
  getRentalItems(): RentalItem[] {
    try {
      const stored = localStorage.getItem(RENTAL_ITEMS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read rental items:', e);
    }
    return [];
  },

  saveRentalItems(items: RentalItem[]): RentalItem[] {
    try {
      localStorage.setItem(RENTAL_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save rental items:', e);
    }
    return items;
  },

  async createRentalItem(itemData: Omit<RentalItem, 'id' | 'createdAt'>): Promise<RentalItem> {
    const newItem: RentalItem = {
      ...itemData,
      id: `rent-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const { db } = initFirebase();
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'rentals'), newItem);
        newItem.id = docRef.id;
      } catch (err) {
        console.warn('Firestore rental write warning:', err);
      }
    }

    const items = this.getRentalItems();
    const updated = [newItem, ...items];
    this.saveRentalItems(updated);
    return newItem;
  },

  async updateRentalItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem | null> {
    const { db } = initFirebase();
    if (db) {
      try {
        await updateDoc(doc(db, 'rentals', id), updates);
      } catch (err) {
        console.warn('Firestore rental update warning:', err);
      }
    }

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

  async deleteRentalItem(id: string): Promise<void> {
    const { db } = initFirebase();
    if (db) {
      try {
        await deleteDoc(doc(db, 'rentals', id));
      } catch (err) {
        console.warn('Firestore rental delete warning:', err);
      }
    }

    const items = this.getRentalItems();
    const updated = items.filter((item) => item.id !== id);
    this.saveRentalItems(updated);
  },

  subscribeToRentalItems(callback: (items: RentalItem[]) => void): () => void {
    const { db } = initFirebase();
    if (db) {
      try {
        const q = query(collection(db, 'rentals'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items: RentalItem[] = [];
          snapshot.forEach(docSnap => {
            items.push({ id: docSnap.id, ...(docSnap.data() as any) });
          });
          this.saveRentalItems(items);
          callback(items);
        }, (err) => {
          console.warn('Firestore rentals subscription fallback:', err);
          callback(this.getRentalItems());
        });
        return unsubscribe;
      } catch (e) {
        console.warn('Failed to subscribe to Firestore rentals:', e);
      }
    }

    callback(this.getRentalItems());
    return () => {};
  },

  // --- TRADE / PURCHASE REQUESTS ---
  getTradeRequests(): TradeRequest[] {
    try {
      const stored = localStorage.getItem(REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read trade requests:', e);
    }
    return [];
  },

  saveTradeRequests(requests: TradeRequest[]): TradeRequest[] {
    try {
      localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
    } catch {}
    return requests;
  },

  async createTradeRequest(data: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>): Promise<TradeRequest> {
    const newRequest: TradeRequest = {
      ...data,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      isSentByCurrentUser: true,
    };

    const { db } = initFirebase();
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'trades'), newRequest);
        newRequest.id = docRef.id;
      } catch (err) {
        console.warn('Firestore trade write warning:', err);
      }
    }

    const current = this.getTradeRequests();
    const updated = [newRequest, ...current];
    this.saveTradeRequests(updated);

    this.addCampusNotification(
      'New Purchase Request!',
      `${newRequest.buyerName} requested to purchase "${newRequest.listingTitle}" for RM ${newRequest.offeredPrice}.`,
      'trade_request',
      'me'
    );

    return newRequest;
  },

  async updateTradeRequestStatus(requestId: string, status: TradeRequest['status']): Promise<TradeRequest[]> {
    const { db } = initFirebase();
    if (db) {
      try {
        await updateDoc(doc(db, 'trades', requestId), { status });
      } catch (err) {
        console.warn('Firestore trade status update warning:', err);
      }
    }

    const current = this.getTradeRequests();
    const updated = current.map(req => {
      if (req.id === requestId) {
        const updatedReq = { ...req, status };
        if (status === 'Accepted') {
          this.addCampusNotification(
            'Purchase Request Accepted!',
            `The seller accepted your request for "${req.listingTitle}". Coordinate campus meetup in Chat!`,
            'trade_request',
            'chat'
          );
        } else if (status === 'Rejected') {
          this.addCampusNotification(
            'Purchase Request Declined',
            `Your request for "${req.listingTitle}" was declined by the seller.`,
            'trade_request',
            'mall'
          );
        }
        return updatedReq;
      }
      return req;
    });

    this.saveTradeRequests(updated);
    return updated;
  },

  updateRequestStatus(requestId: string, status: TradeRequest['status']): TradeRequest[] {
    this.updateTradeRequestStatus(requestId, status);
    return this.getTradeRequests();
  },

  // --- RENTAL REQUESTS & WORKFLOW ---
  getRentalRequests(): RentalRequest[] {
    try {
      const stored = localStorage.getItem(RENTAL_REQUESTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read rental requests:', e);
    }
    return [];
  },

  saveRentalRequests(requests: RentalRequest[]): RentalRequest[] {
    try {
      localStorage.setItem(RENTAL_REQUESTS_KEY, JSON.stringify(requests));
    } catch (e) {
      console.error('Failed to save rental requests:', e);
    }
    return requests;
  },

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

      return targetStart <= reqReturn && targetReturn >= reqStart;
    });
  },

  async createRentalRequest(requestData: Omit<RentalRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<RentalRequest> {
    const newReq: RentalRequest = {
      ...requestData,
      id: `rental-req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { db } = initFirebase();
    if (db) {
      try {
        const docRef = await addDoc(collection(db, 'rentalRequests'), newReq);
        newReq.id = docRef.id;
      } catch (err) {
        console.warn('Firestore rental request write warning:', err);
      }
    }

    const requests = this.getRentalRequests();
    const updated = [newReq, ...requests];
    this.saveRentalRequests(updated);

    this.addCampusNotification(
      'New Rental Request!',
      `${newReq.renterName} requested to rent "${newReq.rentalItemName}" from ${newReq.startDate} to ${newReq.returnDate}.`,
      'rental_request',
      'rent',
      newReq.id
    );

    return newReq;
  },

  async updateRentalRequestStatus(id: string, status: RentalStatus, extraData?: Partial<RentalRequest>): Promise<RentalRequest | null> {
    const now = new Date().toISOString();
    const payload = { status, updatedAt: now, ...(extraData || {}) };

    const { db } = initFirebase();
    if (db) {
      try {
        await updateDoc(doc(db, 'rentalRequests', id), payload);
      } catch (err) {
        console.warn('Firestore rental request status update warning:', err);
      }
    }

    const requests = this.getRentalRequests();
    let updatedReq: RentalRequest | null = null;

    const updated = requests.map((req) => {
      if (req.id === id) {
        updatedReq = { ...req, ...payload };

        if (status === 'Approved' || status === 'Rented Out') {
          this.updateRentalItem(req.rentalItemId, { isAvailable: false });
        } else if (status === 'Completed' || status === 'Rejected' || status === 'Cancelled') {
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

      if (status === 'Approved') {
        this.addCampusNotification(
          'Rental Request Approved!',
          `Your rental request for "${(updatedReq as RentalRequest).rentalItemName}" was approved. Please arrange campus handover.`,
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

  recordHandoverCondition(id: string, notes: string): Promise<RentalRequest | null> {
    return this.updateRentalRequestStatus(id, 'Rented Out', {
      depositStatus: 'Paid',
      handoverConditionNotes: notes,
      handoverConfirmedAt: new Date().toISOString(),
    });
  },

  confirmRenterReturn(id: string): Promise<RentalRequest | null> {
    return this.updateRentalRequestStatus(id, 'Inspection Pending', {
      returnReportedAt: new Date().toISOString(),
    });
  },

  recordReturnInspection(
    id: string, 
    returnNotes: string, 
    passed: boolean, 
    proposedDeduction = 0, 
    deductionReason?: string
  ): Promise<RentalRequest | null> {
    if (passed) {
      return this.updateRentalRequestStatus(id, 'Refund Pending', {
        inspectionPassed: true,
        returnConditionNotes: returnNotes,
        proposedDeduction: 0,
      });
    } else {
      return this.updateRentalRequestStatus(id, 'Dispute', {
        depositStatus: 'Dispute',
        inspectionPassed: false,
        returnConditionNotes: returnNotes,
        proposedDeduction,
        deductionReason: deductionReason || 'Condition damage or missing accessories',
        disputeNotes: `Owner reported issue: "${deductionReason}". Proposed deduction: RM ${proposedDeduction}.`,
      });
    }
  },

  resolveDispute(id: string, agreedRefundAmount: number, disputeNotes: string, renterResponse?: string): Promise<RentalRequest | null> {
    return this.updateRentalRequestStatus(id, 'Refund Pending', {
      depositStatus: 'Refund Pending',
      refundAmount: agreedRefundAmount,
      disputeNotes,
      renterDisputeResponse: renterResponse,
    });
  },

  approveDepositRefund(id: string, refundAmount: number): Promise<RentalRequest | null> {
    return this.updateRentalRequestStatus(id, 'Completed', {
      depositStatus: 'Refunded',
      refundAmount,
      refundDate: new Date().toISOString(),
    });
  },

  // --- CART MANAGEMENT ---
  getCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read cart:', e);
    }
    return [];
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

  // --- CHAT CONVERSATIONS ---
  getChatConversations(): ChatConversation[] {
    try {
      const stored = localStorage.getItem(CHATS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read chat conversations:', e);
    }
    return [];
  },

  saveChatConversations(convos: ChatConversation[]): ChatConversation[] {
    try {
      localStorage.setItem(CHATS_KEY, JSON.stringify(convos));
    } catch {}
    return convos;
  },

  createOrGetConversation(
    otherUserId: string, 
    otherUserName: string, 
    currentUserId: string, 
    currentUserName: string,
    listing?: Listing
  ): ChatConversation {
    const convos = this.getChatConversations();
    const existing = convos.find(c => 
      c.participants?.some(p => p.id === otherUserId) || c.id === `chat-${otherUserId}`
    );

    if (existing) {
      return existing;
    }

    const newConvo: ChatConversation = {
      id: `chat-${Date.now()}`,
      type: 'direct',
      name: otherUserName,
      participants: [
        { id: otherUserId, name: otherUserName, role: 'Peer' },
        { id: currentUserId, name: currentUserName, role: 'Me' }
      ],
      lastMessage: listing ? `Hi! I'm inquiring about "${listing.title}".` : 'Started a conversation.',
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: listing ? [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUserId,
          senderName: currentUserName,
          text: `Hi! I'm inquiring about "${listing.title}".`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sharedListing: {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            imageUrl: listing.imageUrl
          }
        }
      ] : []
    };

    const updated = [newConvo, ...convos];
    this.saveChatConversations(updated);
    return newConvo;
  },

  sendChatMessage(
    conversationId: string, 
    text: string, 
    senderIdOrListing?: string | ChatMessage['sharedListing'], 
    senderName = 'Me', 
    sharedListing?: ChatMessage['sharedListing']
  ): ChatConversation[] {
    let actualSenderId = 'user-current';
    let actualSenderName = senderName;
    let actualSharedListing = sharedListing;

    if (typeof senderIdOrListing === 'object' && senderIdOrListing !== null) {
      actualSharedListing = senderIdOrListing;
    } else if (typeof senderIdOrListing === 'string') {
      actualSenderId = senderIdOrListing;
    }

    const convos = this.getChatConversations();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updated = convos.map(c => {
      if (c.id === conversationId) {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: actualSenderId,
          senderName: actualSenderName,
          text,
          timestamp: timeStr,
          sharedListing: actualSharedListing
        };
        return {
          ...c,
          lastMessage: text,
          lastMessageTime: timeStr,
          messages: [...(c.messages || []), newMsg]
        };
      }
      return c;
    });

    return this.saveChatConversations(updated);
  },

  // --- VIRTUAL PET & SAVINGS HELPERS ---
  getVirtualPet(): any {
    try {
      const stored = localStorage.getItem('campusloop_real_pet_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: 'Boba',
      level: 1,
      exp: 15,
      hunger: 80,
      happiness: 85,
      energy: 90,
      mood: 'happy',
      petType: 'kitten',
      lastFed: 'Today',
      equippedItem: null,
      unlockedItems: []
    };
  },

  updateVirtualPet(pet: any): any {
    try {
      localStorage.setItem('campusloop_real_pet_v1', JSON.stringify(pet));
    } catch {}
    return pet;
  },

  getSavingsGoals(): any[] {
    try {
      const stored = localStorage.getItem('campusloop_real_savings_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  },

  saveSavingsGoals(goals: any[]): any[] {
    try {
      localStorage.setItem('campusloop_real_savings_v1', JSON.stringify(goals));
    } catch {}
    return goals;
  },

  // --- USER PROFILE ---
  getUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read user profile:', e);
    }
    return {
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

  // --- REVIEWS ---
  getReviews(): Review[] {
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read reviews:', e);
    }
    return [];
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
    } catch {}
    return updated;
  },

  // --- NOTIFICATIONS ---
  getNotifications(): CampusNotification[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read notifications:', e);
    }
    return [];
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

  // Clear all data for clean reset without fake data
  resetPrototypeData() {
    localStorage.removeItem(LISTINGS_KEY);
    localStorage.removeItem(REQUESTS_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(REVIEWS_KEY);
    localStorage.removeItem(CHATS_KEY);
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(RENTAL_ITEMS_KEY);
    localStorage.removeItem(RENTAL_REQUESTS_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    return {
      listings: [],
      requests: [],
      profile: this.getUserProfile(),
      reviews: [],
      chats: [],
      cart: [],
      rentalItems: [],
      rentalRequests: [],
    };
  }
};
