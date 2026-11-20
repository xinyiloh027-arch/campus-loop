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
  RequestStatus,
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
  deleteField,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  runTransaction,
  handleFirestoreError,
  OperationType
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

function isValidCalendarDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (y < 2024 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && (date.getUTCMonth() + 1) === m && date.getUTCDate() === d;
}

function calculateRentalDays(startDate: string, returnDate: string): number {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ry, rm, rd] = returnDate.split('-').map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const returnUtc = Date.UTC(ry, rm - 1, rd);
  const diffDays = Math.round((returnUtc - startUtc) / 86400000);
  return Math.max(1, diffDays);
}

export const storageService = {
  // Helpers
  isValidCalendarDate,
  calculateRentalDays,
  // --- LISTINGS ---
  getListings(): Listing[] {
    try {
      const stored = localStorage.getItem(LISTINGS_KEY);
      if (stored) {
        const parsed: Listing[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Normalize quantity properties
          return parsed.map((item) => {
            const originalQty = typeof item.originalQuantity === 'number' && item.originalQuantity > 0 
              ? Math.floor(item.originalQuantity) 
              : 1;
            const remainingQty = typeof item.remainingQuantity === 'number' 
              ? Math.max(0, Math.floor(item.remainingQuantity)) 
              : (item.status === 'Sold' ? 0 : originalQty);
            const status = remainingQty === 0 ? 'Sold' : item.status;
            return {
              ...item,
              originalQuantity: originalQty,
              remainingQuantity: remainingQty,
              status,
            };
          });
        }
      }
    } catch (e) {
      console.warn('Could not read listings from localStorage:', e);
    }
    return [];
  },

  saveListings(listings: Listing[]): Listing[] {
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
    } catch (e) {
      console.error('Failed to save listings locally:', e);
    }
    return listings;
  },

  async createListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'status' | 'isUserCreated'> & {
    originalQuantity?: number;
    remainingQuantity?: number;
    status?: Listing['status'];
  }): Promise<Listing> {
    const rawQty = typeof listingData.originalQuantity === 'number' && listingData.originalQuantity > 0
      ? Math.floor(listingData.originalQuantity)
      : 1;
    const remainingQty = typeof listingData.remainingQuantity === 'number'
      ? Math.max(0, Math.floor(listingData.remainingQuantity))
      : rawQty;

    const { auth, db } = initFirebase();

    // 1. Explicit check: verify Firestore database connectivity
    if (!db) {
      const err = new Error('Firestore database is not initialized. Please verify your Firebase configuration.');
      console.error(err.message);
      throw err;
    }

    // 2. Explicit check: verify Firebase Authentication state
    const currentUser = auth?.currentUser;
    if (!currentUser) {
      const errMsg = 'Unauthenticated Firestore upload: You must be actively signed into Firebase Authentication to publish listings to the shared Firestore database. Your current session is using local offline credentials.';
      console.error(errMsg);
      throw new Error(errMsg);
    }

    // 3. Explicit check: verify Email Verification status for security rules
    if (!currentUser.emailVerified) {
      const errMsg = `Unverified UTM Email: Your email address (${currentUser.email || ''}) is not yet marked verified in Firebase Authentication. Security rules require request.auth.token.email_verified == true. Please check your inbox and verify your email.`;
      console.error(errMsg);
      throw new Error(errMsg);
    }

    // 4. Generate authoritative Firestore document reference
    const listingsCol = collection(db, 'listings');
    const docRef = doc(listingsCol);
    const finalId = docRef.id;

    // Strict identity enforcement: sellerId must match Firebase Auth UID
    const newListing: Listing = {
      ...listingData,
      id: finalId,
      sellerId: currentUser.uid,
      createdAt: new Date().toISOString(),
      originalQuantity: rawQty,
      remainingQuantity: remainingQty,
      status: remainingQty === 0 ? 'Sold' : (listingData.status || 'Active'),
      isUserCreated: true,
    };

    // 5. Sanitize Firestore document payload (strip undefined keys to avoid SDK crashes and rule rejections)
    const firestorePayload: Record<string, any> = {};
    for (const [key, value] of Object.entries(newListing)) {
      if (value !== undefined && value !== null) {
        firestorePayload[key] = value;
      }
    }

    // 6. Write to Firestore with ID token refresh & strict error handling
    try {
      await currentUser.getIdToken(true);
      await setDoc(docRef, firestorePayload);
      console.info('Listing successfully persisted to Firestore with ID:', finalId);
    } catch (err: any) {
      console.error('Firestore listing write error:', err);
      handleFirestoreError(err, OperationType.CREATE, `listings/${finalId}`);
      throw err;
    }

    // 7. Update local cache after confirmed Firestore write
    const current = this.getListings();
    const updated = [newListing, ...current.filter((item) => item.id !== finalId)];
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save listing locally:', e);
    }
    return newListing;
  },

  async updateListing(id: string, updates: Partial<Listing>): Promise<Listing | null> {
    const current = this.getListings();
    let updatedItem: Listing | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        const origQty = typeof updates.originalQuantity === 'number' 
          ? Math.max(1, Math.floor(updates.originalQuantity)) 
          : (item.originalQuantity || 1);
        
        let remQty = typeof updates.remainingQuantity === 'number'
          ? Math.max(0, Math.floor(updates.remainingQuantity))
          : (item.remainingQuantity !== undefined ? item.remainingQuantity : origQty);

        let newStatus = updates.status || item.status;
        if (remQty === 0) {
          newStatus = 'Sold';
        } else if (newStatus === 'Sold' && remQty > 0) {
          newStatus = 'Active';
        }

        updatedItem = {
          ...item,
          ...updates,
          originalQuantity: origQty,
          remainingQuantity: remQty,
          status: newStatus,
        };
        return updatedItem;
      }
      return item;
    });

    const { auth, db } = initFirebase();
    if (db && auth?.currentUser && updatedItem) {
      try {
        await updateDoc(doc(db, 'listings', id), updatedItem);
      } catch (err) {
        console.warn('Firestore listing update warning:', err);
      }
    }

    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch {}
    return updatedItem;
  },

  async deleteListing(id: string, sellerId?: string): Promise<{ success: boolean; error?: string }> {
    const current = this.getListings();
    const target = current.find(item => item.id === id);
    if (sellerId && target && target.sellerId && target.sellerId !== sellerId) {
      return { success: false, error: 'Unauthorized: Only the seller can delete this listing.' };
    }
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, 'listings', id));
      } catch (err) {
        console.warn('Firestore listing delete warning:', err);
      }
    }

    const updated = current.filter(item => item.id !== id);
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(updated));
    } catch {}
    return { success: true };
  },

  async fetchListings(): Promise<Listing[]> {
    const { db } = initFirebase();
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'listings'));
        const items: Listing[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            ...(data as any),
            id: docSnap.id,
          });
        });
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        localStorage.setItem(LISTINGS_KEY, JSON.stringify(items));
        return items;
      } catch (err) {
        console.warn('Firestore fetchListings warning:', err);
      }
    }
    return this.getListings();
  },

  subscribeToListings(callback: (listings: Listing[]) => void): () => void {
    const { db } = initFirebase();
    if (db) {
      try {
        const q = query(collection(db, 'listings'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items: Listing[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            items.push({
              ...(data as any),
              id: docSnap.id,
            });
          });
          items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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

  

subscribeToTradeRequests(callback: (trades: TradeRequest[]) => void): () => void {
  const { auth, db } = initFirebase();
  const currentUser = auth?.currentUser;

  if (!db || !currentUser) {
    callback([]);
    return () => {};
  }

  const buyerTrades = new Map<string, TradeRequest>();
  const sellerTrades = new Map<string, TradeRequest>();

  const emitTrades = () => {
    const combined = new Map<string, TradeRequest>();

    buyerTrades.forEach((trade, id) => {
      combined.set(id, {
        ...trade,
        isSentByCurrentUser: true,
      });
    });

    sellerTrades.forEach((trade, id) => {
      combined.set(id, {
        ...trade,
        isSentByCurrentUser: false,
      });
    });

    const items = Array.from(combined.values());

    items.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    localStorage.setItem(REQUESTS_KEY, JSON.stringify(items));
    callback(items);
  };

  try {
    // Listen only to requests sent by the current user.
    const buyerQuery = query(
      collection(db, 'trades'),
      where('buyerId', '==', currentUser.uid)
    );

    // Listen only to requests received by the current user.
    const sellerQuery = query(
      collection(db, 'trades'),
      where('sellerId', '==', currentUser.uid)
    );

    const unsubscribeBuyer = onSnapshot(
      buyerQuery,
      (snapshot) => {
        buyerTrades.clear();

        snapshot.forEach((docSnap) => {
          buyerTrades.set(docSnap.id, {
            ...(docSnap.data() as TradeRequest),
            id: docSnap.id,
          });
        });

        emitTrades();
      },
      (err) => {
        console.error('Buyer trade subscription failed:', err);
      }
    );

    const unsubscribeSeller = onSnapshot(
      sellerQuery,
      (snapshot) => {
        sellerTrades.clear();

        snapshot.forEach((docSnap) => {
          sellerTrades.set(docSnap.id, {
            ...(docSnap.data() as TradeRequest),
            id: docSnap.id,
          });
        });

        emitTrades();
      },
      (err) => {
        console.error('Seller trade subscription failed:', err);
      }
    );

    return () => {
      unsubscribeBuyer();
      unsubscribeSeller();
    };
  } catch (error) {
    console.error('Failed to subscribe to trade requests:', error);
    callback([]);
    return () => {};
  }
},


subscribeToNotifications(callback: (notifications: CampusNotification[]) => void): () => void {
  const { auth, db } = initFirebase();
  const currentUser = auth?.currentUser;

  if (!db || !currentUser) {
    callback([]);
    return () => {};
  }

  try {
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const remoteNotifications: CampusNotification[] = [];

        snapshot.forEach((docSnap) => {
          remoteNotifications.push({
            ...(docSnap.data() as CampusNotification),
            id: docSnap.id,
          });
        });

        remoteNotifications.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );

        const localNotifications = this.getNotifications();

        const merged = [
          ...remoteNotifications,
          ...localNotifications.filter(
            (local) =>
              !remoteNotifications.some((remote) => remote.id === local.id)
          ),
        ];

        callback(merged);
      },
      (err) => {
        console.error('Firestore notifications subscription failed:', err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error('Failed to subscribe to Firestore notifications:', err);
    callback(this.getNotifications());
    return () => {};
  }
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
    const { auth, db } = initFirebase();
    const activeOwnerId = auth?.currentUser?.uid || itemData.ownerId || 'uid';

    const rentalsCol = db ? collection(db, 'rentals') : null;
    const docRef = rentalsCol ? doc(rentalsCol) : null;
    const finalId = docRef ? docRef.id : `rent-${Date.now()}`;

    const newItem: RentalItem = {
      ...itemData,
      id: finalId,
      ownerId: activeOwnerId,
      createdAt: new Date().toISOString(),
    };

    if (db && docRef && auth?.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        await setDoc(docRef, newItem);
        console.info('Rental successfully persisted to Firestore with ID:', finalId);
      } catch (err) {
        console.error('Firestore rental write error:', err);
        throw err;
      }
    }

    const items = this.getRentalItems();
    const updated = [newItem, ...items.filter((item) => item.id !== finalId)];
    this.saveRentalItems(updated);
    return newItem;
  },

  async updateRentalItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem | null> {
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
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
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
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

  async fetchRentalItems(): Promise<RentalItem[]> {
    const { db } = initFirebase();
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'rentals'));
        const items: RentalItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            ...(data as any),
            id: docSnap.id,
          });
        });
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        this.saveRentalItems(items);
        return items;
      } catch (err) {
        console.warn('Firestore fetchRentalItems warning:', err);
      }
    }
    return this.getRentalItems();
  },

  subscribeToRentalItems(callback: (items: RentalItem[]) => void): () => void {
    const { db } = initFirebase();
    if (db) {
      try {
        const q = query(collection(db, 'rentals'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const items: RentalItem[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            items.push({
              ...(data as any),
              id: docSnap.id,
            });
          });
          items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
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
      if (stored) {
        const parsed: TradeRequest[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map((req) => ({
            ...req,
            quantity: typeof req.quantity === 'number' && req.quantity > 0 ? Math.floor(req.quantity) : 1,
            totalPrice: typeof req.totalPrice === 'number' ? req.totalPrice : (req.offeredPrice * (req.quantity || 1)),
          }));
        }
      }
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


  async createTradeRequest(data: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'> & {
    quantity?: number;
    totalPrice?: number;
    status?: RequestStatus;
  }): Promise<TradeRequest> {
    const { auth, db } = initFirebase();
    const firebaseUser = auth?.currentUser;

    if (!db || !firebaseUser) {
      throw new Error('You must be signed in to submit a purchase request.');
    }

    if (!firebaseUser.emailVerified) {
      throw new Error('Please verify your UTM email before submitting a purchase request.');
    }

    if (data.buyerId !== firebaseUser.uid) {
      throw new Error('Your account could not be verified. Please sign in again.');
    }

    if (!data.sellerId || data.sellerId === firebaseUser.uid) {
      throw new Error('Invalid seller account. Please refresh the listing and try again.');
    }

    const qty =
      typeof data.quantity === 'number' && data.quantity > 0
        ? Math.floor(data.quantity)
        : 1;

    const total =
      typeof data.totalPrice === 'number'
        ? data.totalPrice
        : data.offeredPrice * qty;

    const newRequest: TradeRequest = {
      ...data,
      id: '',
      createdAt: new Date().toISOString(),
      quantity: qty,
      totalPrice: total,
      status: data.status || 'Pending Seller Response',
      isSentByCurrentUser: true,
    };

    // STEP 1: Save the actual purchase request to Firestore.
    const tradeRef = doc(collection(db, 'trades'));
    newRequest.id = tradeRef.id;

    await setDoc(tradeRef, newRequest);

    // STEP 2: Notify the actual seller after the trade has been saved.
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId: newRequest.sellerId,
        senderId: firebaseUser.uid,
        buyerId: firebaseUser.uid,
        sellerId: newRequest.sellerId,
        type: 'purchase_request',
        title: 'New Purchase Request!',
        message: `${newRequest.buyerName} requested to buy ${qty}x "${newRequest.listingTitle}" for RM ${total.toFixed(2)}. (Ref #${newRequest.id.slice(-6)})`,
        isRead: false,
        read: false,
        createdAt: new Date().toISOString(),
        relatedRequestId: newRequest.id,
        relatedListingId: newRequest.listingId,
        linkTab: 'me',
      });
    } catch (notificationError) {
      console.error('Seller notification delivery failed:', notificationError);

      throw new Error(
        `Your purchase request was saved, but the seller notification could not be delivered. Please contact the seller before submitting again.`
      );
    }

    // STEP 3: Update the buyer's local request list.
    const current = this.getTradeRequests();
    const updated = [
      newRequest,
      ...current.filter((request) => request.id !== newRequest.id),
    ];

    this.saveTradeRequests(updated);

    this.addCampusNotification(
      'Purchase Request Sent!',
      `Your request for "${newRequest.listingTitle}" was submitted successfully.`,
      'purchase_request_sent',
      'me'
    );

    return newRequest;
  },

  
  
  async updateTradeRequestStatus(
    requestId: string,
    status: TradeRequest['status'],
    extra?: Partial<TradeRequest>,
    requireRemote = false
  ): Promise<TradeRequest[]> {
    const current = this.getTradeRequests();
    const target = current.find(req => req.id === requestId);

    if (!target) {
      throw new Error('Purchase request not found.');
    }

    const { auth, db } = initFirebase();
    const isSignedIn = !!auth?.currentUser;

    if (requireRemote && (!db || !isSignedIn)) {
      throw new Error(
        'Unable to connect to the database. Please sign in again and retry.'
      );
    }

    if (db && isSignedIn) {
      const firestoreUpdates: Record<string, any> = { status };

      for (const [key, value] of Object.entries(extra || {})) {
        if (value !== undefined) {
          firestoreUpdates[key] = value;
        }
      }

      if (status === 'Payment Under Review') {
        firestoreUpdates.rejectionReason = deleteField();
      }

      try {
        await updateDoc(doc(db, 'trades', requestId), firestoreUpdates);
      } catch (err) {
        console.error('Firestore trade status update failed:', err);
        throw new Error(
          'Your transaction could not be updated in the database. Please try again.'
        );
      }
    }

    const cleanExtra = Object.fromEntries(
      Object.entries(extra || {}).filter(([, value]) => value !== undefined)
    );

    const updated = current.map(req => {
      if (req.id !== requestId) return req;

      const updatedReq = { ...req };

      if (status === 'Payment Under Review') {
        delete updatedReq.rejectionReason;
      }

      return {
        ...updatedReq,
        ...cleanExtra,
        status
      };
    });

    this.saveTradeRequests(updated);

    if (status === 'Accepted' || status === 'Approved') {
      this.addCampusNotification(
        'Purchase Request Approved!',
        `The seller approved your purchase for "${target.listingTitle}". Coordinate campus meetup in Chat!`,
        'trade_request',
        'chat'
      );
    } else if (status === 'Rejected') {
      this.addCampusNotification(
        'Purchase Request Declined',
        `Your request for "${target.listingTitle}" was declined by the seller.`,
        'trade_request',
        'mall'
      );
    } else if (status === 'Payment Proof Rejected') {
      this.addCampusNotification(
        'Payment Proof Needs Revision',
        `Payment proof for "${target.listingTitle}" was rejected: ${extra?.rejectionReason || 'Please upload a clear screenshot.'}`,
        'trade_request',
        'me'
      );
    }

    return updated;
  },



   
  
  /**
   * Seller ONLY: Accept a pending purchase offer.
   * Atomically updates the trade and notifies the actual buyer.
   * Does NOT deduct stock or confirm payment.
   */
  async acceptPurchaseOffer(
    requestId: string
  ): Promise<TradeRequest> {
    const { auth, db } = initFirebase();
    const firebaseUser = auth?.currentUser;

    if (!db || !firebaseUser) {
      throw new Error('Please sign in again before accepting this offer.');
    }

    if (!firebaseUser.emailVerified) {
      throw new Error('Please verify your UTM email before continuing.');
    }

    const now = new Date().toISOString();
    const tradeRef = doc(db, 'trades', requestId);
    const notificationRef = doc(collection(db, 'notifications'));

    let updated: TradeRequest | null = null;

    await runTransaction(db, async (tx) => {
      const tradeSnap = await tx.get(tradeRef);

      if (!tradeSnap.exists()) {
        throw new Error('Purchase request not found.');
      }

      const tradeData = tradeSnap.data() as TradeRequest;

      if (tradeData.sellerId !== firebaseUser.uid) {
        throw new Error('Unauthorized: Only the actual seller can accept this offer.');
      }

      if (!tradeData.buyerId || tradeData.buyerId === firebaseUser.uid) {
        throw new Error('The buyer information is invalid.');
      }

      if (
        tradeData.status !== 'Pending Seller Response' &&
        tradeData.status !== 'Pending'
      ) {
        throw new Error('This offer is no longer awaiting seller acceptance.');
      }

      // Accept the offer. No payment confirmation or stock deduction here.
      tx.update(tradeRef, {
        status: 'Chat / Payment Arrangement',
      });

      // Notify the actual buyer through Firestore.
      tx.set(notificationRef, {
        recipientId: tradeData.buyerId,
        senderId: firebaseUser.uid,
        buyerId: tradeData.buyerId,
        sellerId: firebaseUser.uid,
        type: 'purchase_accepted',
        title: 'Purchase Request Accepted!',
        message: `The seller accepted your offer for "${tradeData.listingTitle}". Please arrange payment and campus handover in Chat.`,
        isRead: false,
        read: false,
        createdAt: now,
        relatedRequestId: requestId,
        relatedListingId: tradeData.listingId,
        linkTab: 'chat',
      });

      updated = {
        ...tradeData,
        status: 'Chat / Payment Arrangement',
      };
    });

    if (!updated) {
      throw new Error('The offer could not be accepted. Please try again.');
    }

    // Update the local cache only after Firestore succeeds.
    const current = this.getTradeRequests();
    const updatedList = current.map((request) =>
      request.id === requestId ? updated! : request
    );

    this.saveTradeRequests(updatedList);

    return updated;
  },

  /**
   * Buyer declares payment made.
   * Atomically updates the trade and notifies the actual seller.
   * CampusLoop does not verify or process the payment.
   */
  async declarePaymentMade(
    requestId: string,
    paymentMethod = 'DuitNow QR'
  ): Promise<TradeRequest | null> {
    const { auth, db } = initFirebase();
    const firebaseUser = auth?.currentUser;

    if (!db || !firebaseUser) {
      throw new Error('Please sign in again before declaring payment.');
    }

    if (!firebaseUser.emailVerified) {
      throw new Error('Please verify your UTM email before continuing.');
    }

    const method = paymentMethod.trim();

    if (!method || method.length > 100) {
      throw new Error('Please select a valid payment method.');
    }

    const now = new Date().toISOString();
    const tradeRef = doc(db, 'trades', requestId);
    const notificationRef = doc(collection(db, 'notifications'));

    const updated = await runTransaction(db, async (tx) => {
      const tradeSnap = await tx.get(tradeRef);

      if (!tradeSnap.exists()) {
        throw new Error('Purchase request not found. Please refresh and try again.');
      }

      const tradeData = tradeSnap.data() as TradeRequest;

      if (tradeData.buyerId !== firebaseUser.uid) {
        throw new Error('Only the actual buyer can declare payment.');
      }

      if (!tradeData.sellerId || tradeData.sellerId === firebaseUser.uid) {
        throw new Error('The seller information is invalid.');
      }

      const allowedSourceStates = [
        'Pending Seller Response',
        'Pending',
        'Chat / Payment Arrangement',
      ];

      if (!allowedSourceStates.includes(tradeData.status)) {
        throw new Error(
          `Payment cannot be declared while the request is "${tradeData.status}".`
        );
      }

      const updatedTrade: TradeRequest = {
        ...tradeData,
        status: 'Payment Under Review',
        paymentDeclaredAt: now,
        paymentMethod: method,
      };

      tx.update(tradeRef, {
        status: 'Payment Under Review',
        paymentDeclaredAt: now,
        paymentMethod: method,
      });

      tx.set(notificationRef, {
        recipientId: tradeData.sellerId,
        senderId: firebaseUser.uid,
        buyerId: firebaseUser.uid,
        sellerId: tradeData.sellerId,
        type: 'payment_declared',
        title: 'Buyer Declared Payment',
        message: `${tradeData.buyerName} says they have paid RM ${(tradeData.totalPrice || tradeData.offeredPrice).toFixed(2)} for "${tradeData.listingTitle}". Please independently check your account before confirming receipt.`,
        isRead: false,
        read: false,
        createdAt: now,
        relatedRequestId: requestId,
        relatedListingId: tradeData.listingId,
        linkTab: 'me',
      });

      return updatedTrade;
    });

    
    const currentRequests = this.getTradeRequests();
    const nextRequests = currentRequests.map((request) =>
      request.id === requestId ? updated : request
    );

    this.saveTradeRequests(nextRequests);

    this.addCampusNotification(
      'Payment Declaration Submitted',
      `Your payment declaration for "${updated.listingTitle}" was sent to the seller. The seller must independently confirm receipt.`,
      'trade_request',
      'me'
    );

    return updated;
  },


  /**
   * Seller ONLY: Approve transaction and deduct inventory
   * Strict validation: checks available stock against requested quantity
   * Deducts quantity from remainingQuantity, marks listing 'Sold' if remaining is 0
   */

  /**
   * Seller ONLY: Confirm payment received and deduct inventory.
   * Requires a verified Firebase user and a buyer payment declaration.
   * Trade update, stock deduction and buyer notification are atomic.
   */
  async approveTransaction(
    requestId: string,
    sellerId?: string
  ): Promise<{
    success: boolean;
    error?: string;
    request?: TradeRequest;
    listing?: Listing;
  }> {
    const { auth, db } = initFirebase();
    const firebaseUser = auth?.currentUser;

    if (!db || !firebaseUser) {
      return {
        success: false,
        error: 'Please sign in again before confirming payment.',
      };
    }

    if (!firebaseUser.emailVerified) {
      return {
        success: false,
        error: 'Please verify your UTM email before confirming payment.',
      };
    }

    if (sellerId && sellerId !== firebaseUser.uid) {
      return {
        success: false,
        error: 'Unauthorized: Your account does not match the signed-in seller.',
      };
    }

    const now = new Date().toISOString();
    const tradeDocRef = doc(db, 'trades', requestId);
    const notificationRef = doc(collection(db, 'notifications'));

    let updatedReq: TradeRequest | undefined;
    let updatedListing: Listing | undefined;

    try {
      await runTransaction(db, async (tx) => {
        // Read the actual trade from Firestore.
        const tradeSnap = await tx.get(tradeDocRef);

        if (!tradeSnap.exists()) {
          throw new Error('Purchase request not found in Firestore.');
        }

        const tradeData = tradeSnap.data() as TradeRequest;

        // Only the actual seller can confirm payment.
        if (tradeData.sellerId !== firebaseUser.uid) {
          throw new Error(
            'Unauthorized: Only the actual seller can confirm payment.'
          );
        }

        if (
          !tradeData.buyerId ||
          tradeData.buyerId === firebaseUser.uid
        ) {
          throw new Error('The buyer information is invalid.');
        }

        // Buyer must declare payment before seller confirmation.
        if (tradeData.status !== 'Payment Under Review') {
          throw new Error(
            `Payment cannot be confirmed while the request is "${tradeData.status}".`
          );
        }

        if (
          typeof tradeData.quantity !== 'number' ||
          !Number.isInteger(tradeData.quantity) ||
          tradeData.quantity < 1
        ) {
          throw new Error('The requested item quantity is invalid.');
        }

        // Read and validate the actual listing.
        const listingDocRef = doc(db, 'listings', tradeData.listingId);
        const listingSnap = await tx.get(listingDocRef);

        if (!listingSnap.exists()) {
          throw new Error('Associated product listing not found.');
        }

        const listingData = listingSnap.data() as Listing;

        if (listingData.sellerId !== firebaseUser.uid) {
          throw new Error(
            'Unauthorized: You do not own the associated listing.'
          );
        }

        if (listingData.status !== 'Active') {
          throw new Error(
            `Listing is no longer active (current status: ${listingData.status}).`
          );
        }

        const currentRemaining = listingData.remainingQuantity;

        if (
          typeof currentRemaining !== 'number' ||
          !Number.isInteger(currentRemaining) ||
          currentRemaining < tradeData.quantity
        ) {
          throw new Error(
            `Insufficient stock! Available: ${currentRemaining ?? 0}, requested: ${tradeData.quantity}.`
          );
        }

        const newRemaining = currentRemaining - tradeData.quantity;
        const newListingStatus: Listing['status'] =
          newRemaining === 0 ? 'Sold' : 'Active';

        // Atomically update stock and approve the trade.
        tx.update(listingDocRef, {
          remainingQuantity: newRemaining,
          status: newListingStatus,
        });

        tx.update(tradeDocRef, {
          status: 'Approved',
          approvedAt: now,
        });

        // Notify the actual buyer through Firestore.
        tx.set(notificationRef, {
          recipientId: tradeData.buyerId,
          senderId: firebaseUser.uid,
          buyerId: tradeData.buyerId,
          sellerId: firebaseUser.uid,
          type: 'payment_received',
          title: 'Payment Received',
          message: `The seller has confirmed receipt of your payment for "${tradeData.listingTitle}". Please coordinate your campus handover in Chat.`,
          isRead: false,
          read: false,
          createdAt: now,
          relatedRequestId: requestId,
          relatedListingId: tradeData.listingId,
          linkTab: 'chat',
        });

        updatedListing = {
          ...listingData,
          remainingQuantity: newRemaining,
          status: newListingStatus,
        };

        updatedReq = {
          ...tradeData,
          status: 'Approved',
          approvedAt: now,
        };
      });
    } catch (err: any) {
      console.error(
        'Atomic transaction failed in approveTransaction:',
        err
      );

      return {
        success: false,
        error:
          err.message ||
          'Failed to confirm payment. Please try again.',
      };
    }

    if (!updatedReq || !updatedListing) {
      return {
        success: false,
        error: 'Payment confirmation could not be completed.',
      };
    }

    // Synchronize local application state after Firestore succeeds.
    const currentListings = this.getListings();
    const nextListings = currentListings.map((listing) =>
      listing.id === updatedListing!.id
        ? updatedListing!
        : listing
    );
    this.saveListings(nextListings);

    const currentRequests = this.getTradeRequests();
    const nextRequests = currentRequests.map((request) =>
      request.id === updatedReq!.id
        ? updatedReq!
        : request
    );
    this.saveTradeRequests(nextRequests);

    // Notify other pending requests if the item is sold out.
    if (updatedListing.remainingQuantity === 0) {
      const otherPending = this.getTradeRequests().filter(
        (request) =>
          request.listingId === updatedListing!.id &&
          request.id !== requestId &&
          [
            'Pending Seller Response',
            'Pending',
            'Chat / Payment Arrangement',
            'Payment Under Review',
          ].includes(request.status)
      );

      for (const pending of otherPending) {
        this.addCampusNotification(
          'Item Out of Stock',
          `"${updatedListing.title}" is now sold out. Your request #${pending.id.slice(-6)} cannot be fulfilled.`,
          'trade_request',
          'mall'
        );
      }
    }

    return {
      success: true,
      request: updatedReq,
      listing: updatedListing,
    };
  },



  /**
   * Seller ONLY: Reject payment proof
   * Saves rejection to Firestore and notifies the actual buyer.
   */
  async rejectPaymentProof(
    requestId: string,
    reason: string,
    sellerId?: string
  ): Promise<{ success: boolean; error?: string; request?: TradeRequest }> {
    const requests = this.getTradeRequests();
    const targetReq = requests.find(r => r.id === requestId);

    if (!targetReq) {
      return { success: false, error: 'Purchase request not found.' };
    }

    const { auth, db } = initFirebase();
    const firebaseUser = auth?.currentUser;

    if (!db || !firebaseUser) {
      return { success: false, error: 'Please sign in again before rejecting payment proof.' };
    }

    if (
      firebaseUser.uid !== targetReq.sellerId ||
      (sellerId && targetReq.sellerId !== sellerId)
    ) {
      return { success: false, error: 'Unauthorized: Only the actual seller can reject this payment proof.' };
    }

    const extra: Partial<TradeRequest> = {
      rejectionReason:
        reason.trim() ||
        'Payment proof was unclear or did not match the expected amount.',
    };

    // STEP 1: Save the rejection to Firestore.
    const updatedList = await this.updateTradeRequestStatus(
      requestId,
      'Payment Proof Rejected',
      extra,
      true
    );

    const updated = updatedList.find(r => r.id === requestId);

    if (!updated) {
      return { success: false, error: 'Could not update payment proof status.' };
    }

    // STEP 2: Notify the actual buyer in Firestore.
    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId: targetReq.buyerId,
        senderId: firebaseUser.uid,
        buyerId: targetReq.buyerId,
        sellerId: firebaseUser.uid,
        type: 'payment_proof_rejected',
        title: 'Payment Proof Rejected',
        message: `Your payment proof for "${updated.listingTitle}" was rejected: ${extra.rejectionReason}`,
        isRead: false,
        read: false,
        createdAt: new Date().toISOString(),
        relatedRequestId: requestId,
        relatedListingId: targetReq.listingId,
        linkTab: 'me',
      });
    } catch (notificationError) {
      console.error(
        'Payment rejection was saved, but buyer notification failed:',
        notificationError
      );

      throw new Error(
        'The payment rejection was saved, but the buyer notification could not be delivered. Please contact the buyer.'
      );
    }

    return { success: true, request: updated };
  },

  /**
   * Complete transaction (Handover completed)
   */
  async completeTransaction(requestId: string): Promise<TradeRequest | null> {
    const now = new Date().toISOString();

    const updatedList = await this.updateTradeRequestStatus(
      requestId,
      'Completed',
      { completedAt: now }
    );

    const updated = updatedList.find(r => r.id === requestId) || null;

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
    const startDate = requestData.startDate?.trim() || '';
    const returnDate = requestData.returnDate?.trim() || '';

    if (!isValidCalendarDate(startDate) || !isValidCalendarDate(returnDate)) {
      throw new Error('Invalid or impossible calendar date provided (e.g. Feb 31 or Apr 31). Format must be YYYY-MM-DD.');
    }
    if (startDate > returnDate) {
      throw new Error('Return date must be on or after start date.');
    }

    // Standard rental days count: calendar date difference (exclusive of return boundary, 1 day minimum)
    const calculatedDays = calculateRentalDays(startDate, returnDate);

    const pricePerDay = requestData.pricePerDay;
    const securityDeposit = requestData.securityDeposit;
    const rentalFeeTotal = pricePerDay * calculatedDays;
    const totalBeforeRental = rentalFeeTotal + securityDeposit;

    const newReq: RentalRequest = {
      ...requestData,
      id: `rental-req-${Date.now()}`,
      startDate,
      returnDate,
      days: calculatedDays,
      rentalFeeTotal,
      totalBeforeRental,
      status: requestData.status || 'Pending Approval',
      depositStatus: requestData.depositStatus || 'Not Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
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

    const { auth, db } = initFirebase();

    // 1. Atomic transaction for owner approval
    if (status === 'Approved' && db && auth?.currentUser) {
      try {
        await runTransaction(db, async (tx) => {
          const reqRef = doc(db, 'rentalRequests', id);
          const reqSnap = await tx.get(reqRef);
          if (!reqSnap.exists()) {
            throw new Error('Rental request not found in Firestore.');
          }
          const reqData = reqSnap.data() as RentalRequest;
          if (reqData.ownerId !== auth.currentUser?.uid) {
            throw new Error('Unauthorized: Only the item owner can approve this booking.');
          }
          if (reqData.status !== 'Pending' && reqData.status !== 'Pending Approval') {
            throw new Error(`Cannot approve booking in status "${reqData.status}".`);
          }

          const rentalRef = doc(db, 'rentals', reqData.rentalItemId);
          const rentalSnap = await tx.get(rentalRef);
          if (!rentalSnap.exists()) {
            throw new Error('Rental item not found.');
          }
          const rentalData = rentalSnap.data() as RentalItem;
          if (rentalData.isAvailable === false) {
            throw new Error('This rental item is currently unavailable or booked.');
          }

          // Atomically reserve rental item and approve request
          tx.update(rentalRef, { isAvailable: false });
          tx.update(reqRef, payload);
        });
      } catch (err: any) {
        console.error('Atomic transaction failed in updateRentalRequestStatus:', err);
        return null;
      }
    } else if (db && auth?.currentUser) {
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
        } else if (status === 'Completed' || status === 'Rejected') {
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

    const newConvoId = `chat-${Date.now()}`;
    const initialMessageText = listing ? `Hi! I'm inquiring about "${listing.title}".` : 'Started a conversation.';
    const initialMessage: ChatMessage | null = listing ? {
      id: `msg-${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      text: initialMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sharedListing: {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        imageUrl: listing.imageUrl,
      },
    } : null;

    const newConvo: ChatConversation = {
      id: newConvoId,
      type: 'direct',
      name: otherUserName,
      participants: [
        { id: otherUserId, name: otherUserName, role: 'Peer' },
        { id: currentUserId, name: currentUserName, role: 'Me' }
      ],
      lastMessage: initialMessageText,
      lastMessageTime: 'Just now',
      unreadCount: 0,
      messages: initialMessage ? [initialMessage] : []
    };

    // Firebase Firestore Sync (store conversation header WITHOUT embedded messages)
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      try {
        const convoHeader = {
          id: newConvoId,
          type: 'direct',
          name: otherUserName,
          buyerId: currentUserId,
          sellerId: otherUserId,
          participantIds: [otherUserId, currentUserId],
          lastMessage: initialMessageText,
          lastMessageTime: 'Just now',
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setDoc(doc(db, 'conversations', newConvoId), convoHeader).catch((err) => {
          console.warn('Firestore conversation header write warning:', err);
        });

        // Store initial message in the messages subcollection
        if (initialMessage) {
          const msgRef = doc(collection(db, 'conversations', newConvoId, 'messages'), initialMessage.id);
          setDoc(msgRef, {
            ...initialMessage,
            conversationId: newConvoId,
            createdAt: new Date().toISOString(),
          }).catch((err) => {
            console.warn('Firestore subcollection message write warning:', err);
          });
        }
      } catch (err) {
        console.warn('Firestore chat sync warning:', err);
      }
    }

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

    const newMsg: ChatMessage = {
  id: `msg-${Date.now()}`,
  senderId: actualSenderId,
  senderName: actualSenderName,
  text,
  timestamp: timeStr,
  ...(actualSharedListing ? { sharedListing: actualSharedListing } : {})
};

    // Firebase Firestore Sync: Write strictly to the subcollection, update header metadata only
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      try {
        const msgRef = doc(collection(db, 'conversations', conversationId, 'messages'), newMsg.id);
        setDoc(msgRef, {
          ...newMsg,
          conversationId,
          createdAt: now.toISOString(),
        }).catch((err) => {
          console.warn('Firestore message subcollection write warning:', err);
        });

        updateDoc(doc(db, 'conversations', conversationId), {
          lastMessage: text,
          lastMessageTime: timeStr,
          updatedAt: now.toISOString(),
        }).catch((err) => {
          console.warn('Firestore conversation header update warning:', err);
        });
      } catch (err) {
        console.warn('Firestore sendChatMessage sync warning:', err);
      }
    }

    const updated = convos.map(c => {
      if (c.id === conversationId) {
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

  
  async markNotificationAsRead(id: string): Promise<CampusNotification[]> {
    const { auth, db } = initFirebase();
    const currentUser = auth?.currentUser;

    if (db && currentUser) {
      const notificationRef = doc(db, 'notifications', id);
      const notificationSnap = await getDoc(notificationRef);

      if (notificationSnap.exists()) {
        const notification = notificationSnap.data() as CampusNotification;

        if (notification.recipientId === currentUser.uid) {
          await updateDoc(notificationRef, {
            isRead: true,
            read: true,
          });
        }
      }
    }

    const notifs = this.getNotifications();
    const updated = notifs.map((n) =>
      n.id === id ? { ...n, isRead: true, read: true } : n
    );

    return this.saveNotifications(updated);
  },

  async markAllNotificationsAsRead(): Promise<CampusNotification[]> {
    const { auth, db } = initFirebase();
    const currentUser = auth?.currentUser;

    if (db && currentUser) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);

      await Promise.all(
        snapshot.docs.map((notificationDoc) =>
          updateDoc(notificationDoc.ref, {
            isRead: true,
            read: true,
          })
        )
      );
    }

    const notifs = this.getNotifications();
    const updated = notifs.map((n) => ({
      ...n,
      isRead: true,
      read: true,
    }));

    return this.saveNotifications(updated);
  },

  async clearAllNotifications(): Promise<CampusNotification[]> {
    const { auth, db } = initFirebase();
    const currentUser = auth?.currentUser;

    if (db && currentUser) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(q);

      await Promise.all(
        snapshot.docs.map((notificationDoc) =>
          deleteDoc(notificationDoc.ref)
        )
      );
    }

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
