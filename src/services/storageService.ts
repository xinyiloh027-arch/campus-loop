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
    const activeSellerId = auth?.currentUser?.uid || listingData.sellerId || 'uid';

    // Generate authoritative Firestore document ID upfront
    const listingsCol = db ? collection(db, 'listings') : null;
    const docRef = listingsCol ? doc(listingsCol) : null;
    const finalId = docRef ? docRef.id : `list-${Date.now()}`;

    const newListing: Listing = {
      ...listingData,
      id: finalId,
      sellerId: activeSellerId,
      createdAt: new Date().toISOString(),
      originalQuantity: rawQty,
      remainingQuantity: remainingQty,
      status: remainingQty === 0 ? 'Sold' : (listingData.status || 'Active'),
      isUserCreated: true,
    };

    // 1. Firebase Firestore sync
    if (db && docRef) {
      if (auth?.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch {}
      }
      try {
        await setDoc(docRef, newListing);
        console.info('Listing successfully persisted to Firestore with ID:', finalId);
      } catch (err) {
        console.error('Firestore listing write error:', err);
        throw err;
      }
    }

    // 2. Local state update
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

    const { db } = initFirebase();
    if (db && updatedItem) {
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

    if (db && docRef) {
      if (auth?.currentUser) {
        try {
          await auth.currentUser.getIdToken(true);
        } catch {}
      }
      try {
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
    const qty = typeof data.quantity === 'number' && data.quantity > 0 ? Math.floor(data.quantity) : 1;
    const total = typeof data.totalPrice === 'number' ? data.totalPrice : (data.offeredPrice * qty);

    const newRequest: TradeRequest = {
      ...data,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      quantity: qty,
      totalPrice: total,
      status: data.status || 'Pending Seller Response',
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
      `${newRequest.buyerName} requested to buy ${newRequest.quantity}x "${newRequest.listingTitle}" for RM ${total.toFixed(2)}. (Ref #${newRequest.id.slice(-6)})`,
      'trade_request',
      'me'
    );

    return newRequest;
  },

  async updateTradeRequestStatus(requestId: string, status: TradeRequest['status'], extra?: Partial<TradeRequest>): Promise<TradeRequest[]> {
    const current = this.getTradeRequests();
    let updatedReq: TradeRequest | null = null;

    const updated = current.map(req => {
      if (req.id === requestId) {
        updatedReq = { ...req, status, ...(extra || {}) };
        if (status === 'Accepted' || status === 'Approved') {
          this.addCampusNotification(
            'Purchase Request Approved!',
            `The seller approved your purchase for "${req.listingTitle}". Coordinate campus meetup in Chat!`,
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
        } else if (status === 'Payment Proof Rejected') {
          this.addCampusNotification(
            'Payment Proof Needs Revision',
            `Payment proof for "${req.listingTitle}" was rejected: ${extra?.rejectionReason || 'Please upload a clear screenshot.'}`,
            'trade_request',
            'me'
          );
        }
        return updatedReq;
      }
      return req;
    });

    const { db } = initFirebase();
    if (db && updatedReq) {
      try {
        await updateDoc(doc(db, 'trades', requestId), { status, ...(extra || {}) });
      } catch (err) {
        console.warn('Firestore trade status update warning:', err);
      }
    }

    this.saveTradeRequests(updated);
    return updated;
  },

  /**
   * Buyer submits payment screenshot/receipt
   * Updates status to 'Payment Under Review'
   * CRITICAL: Does NOT deduct inventory! Stock remains reserved/active until seller approval.
   */
  async submitPaymentProof(requestId: string, paymentProofUrl: string, paymentMethod = 'DuitNow QR'): Promise<TradeRequest | null> {
    const now = new Date().toISOString();
    const current = this.getTradeRequests();
    const target = current.find(r => r.id === requestId);
    if (!target) return null;

    const extra: Partial<TradeRequest> = {
      paymentProofUrl,
      paymentProofUploadedAt: now,
      paymentMethod,
      rejectionReason: undefined,
    };

    const updatedList = await this.updateTradeRequestStatus(requestId, 'Payment Under Review', extra);
    const updated = updatedList.find(r => r.id === requestId) || null;

    if (updated) {
      this.addCampusNotification(
        'Payment Proof Uploaded!',
        `${updated.buyerName} uploaded payment proof for "${updated.listingTitle}" (${updated.quantity} unit(s), RM ${(updated.totalPrice || updated.offeredPrice).toFixed(2)}). Please verify and approve.`,
        'trade_request',
        'me'
      );
    }

    return updated;
  },

  /**
   * Seller ONLY: Approve transaction and deduct inventory
   * Strict validation: checks available stock against requested quantity
   * Deducts quantity from remainingQuantity, marks listing 'Sold' if remaining is 0
   */
  async approveTransaction(requestId: string): Promise<{ success: boolean; error?: string; request?: TradeRequest; listing?: Listing }> {
    const requests = this.getTradeRequests();
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) {
      return { success: false, error: 'Purchase request not found.' };
    }

    const listings = this.getListings();
    const listing = listings.find(l => l.id === targetReq.listingId);
    if (!listing) {
      return { success: false, error: 'Associated product listing not found.' };
    }

    const requestedQty = targetReq.quantity || 1;
    const currentRemaining = typeof listing.remainingQuantity === 'number' ? listing.remainingQuantity : 1;

    // Strict inventory conflict check
    if (currentRemaining < requestedQty) {
      return {
        success: false,
        error: `Insufficient stock! Only ${currentRemaining} unit(s) remaining, but ${requestedQty} unit(s) were requested.`
      };
    }

    // Deduct stock
    const newRemaining = Math.max(0, currentRemaining - requestedQty);
    const updatedListing = await this.updateListing(listing.id, {
      remainingQuantity: newRemaining,
      status: newRemaining === 0 ? 'Sold' : 'Active',
    });

    const now = new Date().toISOString();
    const extra: Partial<TradeRequest> = {
      approvedAt: now,
    };

    const updatedList = await this.updateTradeRequestStatus(requestId, 'Approved', extra);
    const updatedReq = updatedList.find(r => r.id === requestId);

    // Notify buyer
    this.addCampusNotification(
      'Purchase Approved!',
      `Seller approved payment of RM ${(targetReq.totalPrice || targetReq.offeredPrice).toFixed(2)} for ${requestedQty}x "${targetReq.listingTitle}". Coordinate campus meetup in Chat!`,
      'trade_request',
      'chat'
    );

    // If stock depleted to 0, notify any conflicting pending requests
    if (newRemaining === 0) {
      const otherPending = requests.filter(r => r.listingId === listing.id && r.id !== requestId && ['Pending Seller Response', 'Payment Under Review'].includes(r.status));
      for (const pending of otherPending) {
        this.addCampusNotification(
          'Item Out of Stock',
          `"${listing.title}" is now sold out. Your request #${pending.id.slice(-6)} cannot be fulfilled.`,
          'trade_request',
          'mall'
        );
      }
    }

    return {
      success: true,
      request: updatedReq,
      listing: updatedListing || undefined,
    };
  },

  /**
   * Seller ONLY: Reject payment proof
   * Keeps stock unchanged and notifies buyer with reason
   */
  async rejectPaymentProof(requestId: string, reason: string): Promise<TradeRequest | null> {
    const extra: Partial<TradeRequest> = {
      rejectionReason: reason.trim() || 'Payment proof was unclear or did not match the expected amount.',
    };

    const updatedList = await this.updateTradeRequestStatus(requestId, 'Payment Proof Rejected', extra);
    const updated = updatedList.find(r => r.id === requestId) || null;

    if (updated) {
      this.addCampusNotification(
        'Payment Proof Rejected',
        `Seller rejected payment proof for "${updated.listingTitle}": ${extra.rejectionReason}`,
        'trade_request',
        'me'
      );
    }

    return updated;
  },

  /**
   * Complete transaction (Handover completed)
   */
  async completeTransaction(requestId: string): Promise<TradeRequest | null> {
    const now = new Date().toISOString();
    const updatedList = await this.updateTradeRequestStatus(requestId, 'Completed', { completedAt: now });
    const updated = updatedList.find(r => r.id === requestId) || null;

    if (updated) {
      this.addCampusNotification(
        'Transaction Completed!',
        `Handover for "${updated.listingTitle}" is complete! Please leave a verified review.`,
        'trade_request',
        'me'
      );
    }

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
