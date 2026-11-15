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
  onSnapshot,
  serverTimestamp,
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

function normalizeIsoTimestamp(value: any): string {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return value;
  if (typeof value?.toDate === 'function') {
    try {
      return value.toDate().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000).toISOString();
  }
  return new Date().toISOString();
}

function formatNotificationTime(isoOrText: any): string {
  const iso = normalizeIsoTimestamp(isoOrText);
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return typeof isoOrText === 'string' ? isoOrText : 'Just now';
  return new Date(parsed).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function stripUndefinedDeep(value: any): any {
  if (value === undefined || value === null) return value;
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item));
  }
  if (typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) {
        cleanObj[k] = stripUndefinedDeep(v);
      }
    }
    return cleanObj;
  }
  return value;
}

function sanitizeFirestoreFields(
  obj: Record<string, any>,
  omitKeys: string[] = [],
  options: { preserveNull?: boolean } = {}
): Record<string, any> {
  const { preserveNull = false } = options;
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (omitKeys.includes(key)) continue;
    if (value === undefined) continue;
    if (value === null) {
      if (preserveNull) {
        clean[key] = null;
      }
      continue;
    }
    clean[key] = stripUndefinedDeep(value);
  }
  return clean;
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
    const cleanUpdates = sanitizeFirestoreFields(
      updates as Record<string, any>,
      ['id', 'sellerId', 'createdAt', 'isUserCreated'],
      { preserveNull: true }
    );
    const current = this.getListings();
    let updatedItem: Listing | null = null;
    const updated = current.map(item => {
      if (item.id === id) {
        const origQty = typeof cleanUpdates.originalQuantity === 'number' 
          ? Math.max(1, Math.floor(cleanUpdates.originalQuantity)) 
          : (item.originalQuantity || 1);
        
        let remQty = typeof cleanUpdates.remainingQuantity === 'number'
          ? Math.max(0, Math.floor(cleanUpdates.remainingQuantity))
          : (item.remainingQuantity !== undefined ? item.remainingQuantity : origQty);

        let newStatus = cleanUpdates.status || item.status;
        if (remQty === 0) {
          newStatus = 'Sold';
        } else if (newStatus === 'Sold' && remQty > 0) {
          newStatus = 'Active';
        }

        updatedItem = {
          ...item,
          ...cleanUpdates,
          originalQuantity: origQty,
          remainingQuantity: remQty,
          status: newStatus,
        };
        return updatedItem;
      }
      return item;
    });

    const resolvedUpdatedItem = updated.find((item) => item.id === id) || null;

    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      try {
        const firestoreUpdates = sanitizeFirestoreFields(
          {
            ...cleanUpdates,
            ...(resolvedUpdatedItem
              ? {
                  originalQuantity: resolvedUpdatedItem.originalQuantity,
                  remainingQuantity: resolvedUpdatedItem.remainingQuantity,
                  status: resolvedUpdatedItem.status,
                }
              : {}),
          },
          ['id', 'sellerId', 'createdAt', 'isUserCreated'],
          { preserveNull: true }
        );
        await updateDoc(doc(db, 'listings', id), firestoreUpdates);
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

  async fetchTradeRequests(userId?: string): Promise<TradeRequest[]> {
    const { auth, db } = initFirebase();
    const activeUid = userId || auth?.currentUser?.uid;
    if (!activeUid) {
      this.saveTradeRequests([]);
      return [];
    }

    if (db && auth?.currentUser && auth.currentUser.uid === activeUid && auth.currentUser.emailVerified) {
      try {
        const [buyerSnap, sellerSnap] = await Promise.all([
          getDocs(query(collection(db, 'trades'), where('buyerId', '==', activeUid))),
          getDocs(query(collection(db, 'trades'), where('sellerId', '==', activeUid))),
        ]);

        const merged = new Map<string, TradeRequest>();
        const ingest = (docSnap: any) => {
          const data = docSnap.data();
          const createdIso = normalizeIsoTimestamp(data.createdAt);
          merged.set(docSnap.id, {
            ...(data as any),
            id: docSnap.id,
            createdAt: createdIso,
            isSentByCurrentUser: data.buyerId === activeUid,
          });
        };

        buyerSnap.forEach(ingest);
        sellerSnap.forEach(ingest);

        const items = Array.from(merged.values()).sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
        this.saveTradeRequests(items);
        return items;
      } catch (err) {
        console.warn('Firestore fetchTradeRequests warning:', err);
      }
    }
    return this.getTradeRequests();
  },

  subscribeToTradeRequests(
    userIdOrCallback: string | ((trades: TradeRequest[]) => void) | undefined,
    maybeCallback?: (trades: TradeRequest[]) => void
  ): () => void {
    const callback = typeof userIdOrCallback === 'function' ? userIdOrCallback : maybeCallback;
    const requestedUid = typeof userIdOrCallback === 'string' ? userIdOrCallback : undefined;
    if (!callback) return () => {};

    const { auth, db } = initFirebase();
    const activeUid = requestedUid || auth?.currentUser?.uid;

    if (!activeUid) {
      this.saveTradeRequests([]);
      callback([]);
      return () => {};
    }

    if (db && auth?.currentUser && auth.currentUser.uid === activeUid && auth.currentUser.emailVerified) {
      try {
        const buyerMap = new Map<string, TradeRequest>();
        const sellerMap = new Map<string, TradeRequest>();

        const emitMerged = () => {
          const merged = new Map<string, TradeRequest>();
          buyerMap.forEach((v, k) => merged.set(k, v));
          sellerMap.forEach((v, k) => merged.set(k, v));
          const items = Array.from(merged.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          this.saveTradeRequests(items);
          callback(items);
        };

        const mapSnapshotDoc = (docSnap: any): TradeRequest => {
          const data = docSnap.data();
          return {
            ...(data as any),
            id: docSnap.id,
            createdAt: normalizeIsoTimestamp(data.createdAt),
            isSentByCurrentUser: data.buyerId === activeUid,
          };
        };

        const unsubBuyer = onSnapshot(
          query(collection(db, 'trades'), where('buyerId', '==', activeUid)),
          (snapshot) => {
            buyerMap.clear();
            snapshot.forEach((docSnap) => {
              buyerMap.set(docSnap.id, mapSnapshotDoc(docSnap));
            });
            emitMerged();
          },
          (err) => {
            console.warn('Firestore buyer trades subscription fallback:', err);
            callback(this.getTradeRequests());
          }
        );

        const unsubSeller = onSnapshot(
          query(collection(db, 'trades'), where('sellerId', '==', activeUid)),
          (snapshot) => {
            sellerMap.clear();
            snapshot.forEach((docSnap) => {
              sellerMap.set(docSnap.id, mapSnapshotDoc(docSnap));
            });
            emitMerged();
          },
          (err) => {
            console.warn('Firestore seller trades subscription fallback:', err);
            callback(this.getTradeRequests());
          }
        );

        return () => {
          unsubBuyer();
          unsubSeller();
        };
      } catch (e) {
        console.warn('Firestore trades query error:', e);
      }
    }

    callback(this.getTradeRequests());
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
    const qty = typeof data.quantity === 'number' && data.quantity > 0 ? Math.floor(data.quantity) : 1;
    const unitPrice = typeof data.offeredPrice === 'number' ? data.offeredPrice : data.listingPrice;
    const total = typeof data.totalPrice === 'number' ? data.totalPrice : unitPrice * qty;

    const { auth, db } = initFirebase();
    const currentUser = auth?.currentUser;

    // Require verified Firebase Auth user when Firebase is initialized
    if (db) {
      if (!currentUser) {
        throw new Error('You must sign in with your UTM account before submitting a purchase request.');
      }
      if (!currentUser.emailVerified) {
        throw new Error('Please verify your UTM email before submitting a purchase request.');
      }
    }

    const buyerId = currentUser?.uid || data.buyerId;
    if (!buyerId) {
      throw new Error('Authenticated buyer ID is required.');
    }

    // Resolve authoritative sellerId from Firestore listing doc first, then payload or local cache
    let resolvedSellerId = data.sellerId;
    if (db && data.listingId) {
      try {
        const listingSnap = await getDoc(doc(db, 'listings', data.listingId));
        if (listingSnap.exists()) {
          const firestoreSellerId = (listingSnap.data() as any).sellerId;
          if (firestoreSellerId) {
            resolvedSellerId = firestoreSellerId;
          }
        }
      } catch (err) {
        console.warn('Could not fetch listing sellerId from Firestore:', err);
      }
    }
    if (!resolvedSellerId && data.listingId) {
      const localListing = this.getListings().find((l) => l.id === data.listingId);
      if (localListing?.sellerId) {
        resolvedSellerId = localListing.sellerId;
      }
    }

    if (!resolvedSellerId) {
      throw new Error('Seller information is missing for this product. Please refresh and try again.');
    }

    if (resolvedSellerId === buyerId) {
      throw new Error('You cannot submit a purchase request for your own product.');
    }

    const initialStatus: RequestStatus =
      data.status === 'Pending Seller Response' || data.status === 'Pending'
        ? data.status
        : 'Pending';

    const tradeCol = db ? collection(db, 'trades') : null;
    const docRef = tradeCol ? doc(tradeCol) : null;
    const finalId = docRef ? docRef.id : `req-${Date.now()}`;
    const localIsoNow = new Date().toISOString();

    const newRequest: TradeRequest = {
      ...data,
      id: finalId,
      buyerId,
      sellerId: resolvedSellerId,
      offeredPrice: unitPrice,
      quantity: qty,
      totalPrice: total,
      status: initialStatus,
      createdAt: localIsoNow,
      isSentByCurrentUser: true,
    };

    if (db && docRef && currentUser) {
      // Never write client-perspective isSentByCurrentUser into shared Firestore trade documents
      const firestorePayload = sanitizeFirestoreFields(
        {
          id: finalId,
          listingId: data.listingId,
          listingTitle: data.listingTitle,
          listingPrice: data.listingPrice,
          listingImage: data.listingImage,
          sellerId: resolvedSellerId,
          sellerName: data.sellerName,
          buyerId,
          buyerName: data.buyerName,
          buyerContact: data.buyerContact,
          offeredPrice: unitPrice,
          pickupLocation: data.pickupLocation,
          message: data.message || '',
          status: initialStatus,
          quantity: qty,
          totalPrice: total,
          createdAt: serverTimestamp(),
        },
        ['isSentByCurrentUser']
      );

      // Step 1: Write trade document FIRST so /notifications rules can verify exists(/trades/{tradeId})
      try {
        await currentUser.getIdToken(true);
        await setDoc(docRef, firestorePayload);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, `trades/${finalId}`);
      }

      // Step 2: Sequentially notify the seller (User B)
      await this.createFirestoreNotification({
        recipientId: resolvedSellerId,
        senderId: buyerId,
        buyerId,
        sellerId: resolvedSellerId,
        type: 'purchase_request',
        title: 'New Purchase Request',
        message: `${data.buyerName} has requested to purchase ${qty}x "${data.listingTitle}" (Total: RM ${total.toFixed(2)}).`,
        relatedRequestId: finalId,
        relatedListingId: data.listingId,
        linkTab: 'me',
        subTab: 'sales',
      }).catch((notifErr) => {
        console.error('Failed to deliver seller notification in Firestore (ensure /firestore.rules are deployed):', notifErr);
      });

      // Step 3: Sequentially create buyer confirmation notification (User A)
      await this.createFirestoreNotification({
        recipientId: buyerId,
        senderId: buyerId,
        buyerId,
        sellerId: resolvedSellerId,
        type: 'purchase_request_sent',
        title: 'Purchase Request Sent',
        message: `Your purchase request for ${qty}x "${data.listingTitle}" (Total: RM ${total.toFixed(2)}) was sent to ${data.sellerName}.`,
        relatedRequestId: finalId,
        relatedListingId: data.listingId,
        linkTab: 'me',
        subTab: 'purchases',
      }).catch((notifErr) => {
        console.warn('Buyer confirmation notification write warning:', notifErr);
      });
    } else {
      // Offline / non-Firebase fallback only
      this.addCampusNotification(
        'Purchase Request Sent',
        `Your purchase request for ${qty}x "${data.listingTitle}" (Total: RM ${total.toFixed(2)}) was recorded locally.`,
        'purchase_request_sent',
        'me'
      );
    }

    const current = this.getTradeRequests();
    const updated = [newRequest, ...current.filter((item) => item.id !== finalId)];
    this.saveTradeRequests(updated);

    return newRequest;
  },

  async updateTradeRequestStatus(requestId: string, status: TradeRequest['status'], extra?: Partial<TradeRequest>): Promise<TradeRequest[]> {
    const cleanExtra = sanitizeFirestoreFields(
      (extra || {}) as Record<string, any>,
      ['id', 'buyerId', 'sellerId', 'listingId', 'createdAt', 'offeredPrice', 'quantity', 'totalPrice', 'isSentByCurrentUser'],
      { preserveNull: true }
    );
    const { auth, db } = initFirebase();

    if (db && auth?.currentUser) {
      try {
        await updateDoc(doc(db, 'trades', requestId), { status, ...cleanExtra });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `trades/${requestId}`);
      }
    }

    const current = this.getTradeRequests();
    let updatedReq: TradeRequest | null = null;

    const updated = current.map((req) => {
      if (req.id === requestId) {
        updatedReq = { ...req, status, ...cleanExtra };
        return updatedReq;
      }
      return req;
    });

    this.saveTradeRequests(updated);

    if (updatedReq && db && auth?.currentUser) {
      const targetReq = updatedReq as TradeRequest;
      const currentUid = auth.currentUser.uid;
      if (status === 'Rejected' && targetReq.buyerId && targetReq.sellerId === currentUid) {
        await this.createFirestoreNotification({
          recipientId: targetReq.buyerId,
          senderId: currentUid,
          buyerId: targetReq.buyerId,
          sellerId: targetReq.sellerId,
          type: 'purchase_request',
          title: 'Purchase Request Declined',
          message: `Your request for "${targetReq.listingTitle}" was declined by ${targetReq.sellerName}.`,
          relatedRequestId: targetReq.id,
          relatedListingId: targetReq.listingId,
          linkTab: 'me',
          subTab: 'purchases',
        }).catch((err) => console.warn('Decline notification warning:', err));
      }
    }

    return updated;
  },

  /**
   * Buyer submits payment screenshot/receipt
   * Updates status to 'Payment Under Review'
   * CRITICAL: Does NOT deduct inventory! Stock remains reserved/active until seller approval.
   */
  async submitPaymentProof(requestId: string, paymentProofUrl: string, paymentMethod = 'DuitNow QR'): Promise<TradeRequest | null> {
    if (!paymentProofUrl || paymentProofUrl.length > 500000) {
      throw new Error('Payment proof image exceeds the 500,000-character Firestore limit. Please upload a smaller screenshot.');
    }
    const now = new Date().toISOString();
    const current = this.getTradeRequests();
    const target = current.find((r) => r.id === requestId);
    if (!target) return null;

    const extra: Partial<TradeRequest> = {
      paymentProofUrl,
      paymentProofUploadedAt: now,
      paymentMethod,
    };

    const updatedList = await this.updateTradeRequestStatus(requestId, 'Payment Under Review', extra);
    const updated = updatedList.find((r) => r.id === requestId) || null;

    if (updated) {
      const { auth, db } = initFirebase();
      const buyerUid = auth?.currentUser?.uid || updated.buyerId;
      if (db && auth?.currentUser && updated.sellerId && buyerUid && updated.sellerId !== buyerUid) {
        await this.createFirestoreNotification({
          recipientId: updated.sellerId,
          senderId: buyerUid,
          buyerId: buyerUid,
          sellerId: updated.sellerId,
          type: 'purchase_request',
          title: 'Payment Proof Uploaded',
          message: `${updated.buyerName} uploaded payment proof for "${updated.listingTitle}" (${updated.quantity || 1} unit(s), RM ${(updated.totalPrice || updated.offeredPrice).toFixed(2)}). Please verify and approve.`,
          relatedRequestId: updated.id,
          relatedListingId: updated.listingId,
          linkTab: 'me',
          subTab: 'sales',
        }).catch((err) => console.warn('Payment proof seller notification warning:', err));
      }
    }

    return updated;
  },

  /**
   * Seller ONLY: Approve transaction and deduct inventory
   * Strict validation: checks available stock against requested quantity
   * Deducts quantity from remainingQuantity, marks listing 'Sold' if remaining is 0
   */
  async approveTransaction(requestId: string, sellerId?: string): Promise<{ success: boolean; error?: string; request?: TradeRequest; listing?: Listing }> {
    const requests = this.getTradeRequests();
    const targetReq = requests.find((r) => r.id === requestId);
    if (sellerId && targetReq && targetReq.sellerId && targetReq.sellerId !== sellerId) {
      return { success: false, error: 'Unauthorized: Only the seller can approve this request.' };
    }

    const { auth, db } = initFirebase();
    const now = new Date().toISOString();
    let updatedReq: TradeRequest | undefined;
    let updatedListing: Listing | undefined;

    // 1. Atomic Firestore Transaction (when connected to Firebase)
    if (db && auth?.currentUser) {
      try {
        await runTransaction(db, async (tx) => {
          const tradeDocRef = doc(db, 'trades', requestId);
          const tradeSnap = await tx.get(tradeDocRef);
          if (!tradeSnap.exists()) {
            throw new Error('Purchase request not found in Firestore.');
          }
          const tradeData = tradeSnap.data() as TradeRequest;
          if (tradeData.sellerId !== auth.currentUser?.uid) {
            throw new Error('Unauthorized: Only the seller can approve this request.');
          }
          const allowedSourceStates = ['Pending Seller Response', 'Pending', 'Chat / Payment Arrangement', 'Payment Under Review'];
          if (!allowedSourceStates.includes(tradeData.status)) {
            throw new Error(`Cannot approve transaction in status "${tradeData.status}".`);
          }

          const listingDocRef = doc(db, 'listings', tradeData.listingId);
          const listingSnap = await tx.get(listingDocRef);
          if (!listingSnap.exists()) {
            throw new Error('Associated product listing not found.');
          }
          const listingData = listingSnap.data() as Listing;
          const statusStr = (listingData.status as string) || '';
          if (statusStr !== 'Active' && statusStr !== 'active') {
            throw new Error(`Listing is no longer active (current status: ${listingData.status}).`);
          }

          const reqQty = typeof tradeData.quantity === 'number' && tradeData.quantity > 0 ? Math.floor(tradeData.quantity) : 1;
          const currentRemaining = typeof listingData.remainingQuantity === 'number' ? listingData.remainingQuantity : 1;

          if (currentRemaining < reqQty) {
            throw new Error(`Insufficient stock! Only ${currentRemaining} unit(s) remaining, but ${reqQty} unit(s) were requested.`);
          }

          const newRemaining = Math.max(0, currentRemaining - reqQty);
          const newListingStatus: Listing['status'] = newRemaining === 0 ? 'Sold' : 'Active';

          // Atomically decrement stock on listing and mark trade approved
          tx.update(listingDocRef, {
            remainingQuantity: newRemaining,
            status: newListingStatus,
          });

          tx.update(tradeDocRef, {
            status: 'Approved',
            approvedAt: now,
          });

          updatedListing = {
            ...listingData,
            id: listingSnap.id,
            remainingQuantity: newRemaining,
            status: newListingStatus,
          };
          updatedReq = {
            ...tradeData,
            id: tradeSnap.id,
            createdAt: normalizeIsoTimestamp(tradeData.createdAt),
            isSentByCurrentUser: tradeData.buyerId === auth.currentUser?.uid,
            status: 'Approved',
            approvedAt: now,
          };
        });
      } catch (err: any) {
        console.error('Atomic transaction failed in approveTransaction:', err);
        return {
          success: false,
          error: err.message || 'Failed to approve transaction due to a database concurrency conflict.',
        };
      }
    }

    // 2. Synchronize local state
    if (!updatedReq || !updatedListing) {
      if (!targetReq) {
        return { success: false, error: 'Purchase request not found.' };
      }
      // Local fallback execution if offline or without Firebase Auth
      const listings = this.getListings();
      const listing = listings.find((l) => l.id === targetReq.listingId);
      if (!listing) {
        return { success: false, error: 'Associated product listing not found.' };
      }

      const requestedQty = targetReq.quantity || 1;
      const currentRemaining = typeof listing.remainingQuantity === 'number' ? listing.remainingQuantity : 1;

      if (currentRemaining < requestedQty) {
        return {
          success: false,
          error: `Insufficient stock! Only ${currentRemaining} unit(s) remaining, but ${requestedQty} unit(s) were requested.`
        };
      }

      const newRemaining = Math.max(0, currentRemaining - requestedQty);
      updatedListing = (await this.updateListing(listing.id, {
        remainingQuantity: newRemaining,
        status: newRemaining === 0 ? 'Sold' : 'Active',
      })) || undefined;

      const updatedList = await this.updateTradeRequestStatus(requestId, 'Approved', { approvedAt: now });
      updatedReq = updatedList.find((r) => r.id === requestId);
    } else {
      const currentListings = this.getListings();
      const nextListings = currentListings.map((l) => (l.id === updatedListing!.id ? updatedListing! : l));
      this.saveListings(nextListings);

      const currentRequests = this.getTradeRequests();
      const nextRequests = currentRequests.map((r) => (r.id === updatedReq!.id ? updatedReq! : r));
      this.saveTradeRequests(nextRequests);
    }

    // Notify buyer via Firestore
    if (updatedReq && db && auth?.currentUser && updatedReq.buyerId && updatedReq.buyerId !== auth.currentUser.uid) {
      await this.createFirestoreNotification({
        recipientId: updatedReq.buyerId,
        senderId: auth.currentUser.uid,
        buyerId: updatedReq.buyerId,
        sellerId: updatedReq.sellerId,
        type: 'purchase_request',
        title: 'Purchase Approved',
        message: `Seller approved payment of RM ${(updatedReq.totalPrice || updatedReq.offeredPrice).toFixed(2)} for ${updatedReq.quantity || 1}x "${updatedReq.listingTitle}". Coordinate campus meetup in Chat!`,
        relatedRequestId: updatedReq.id,
        relatedListingId: updatedReq.listingId,
        linkTab: 'me',
        subTab: 'purchases',
      }).catch((err) => console.warn('Buyer approval notification warning:', err));
    }

    return {
      success: true,
      request: updatedReq,
      listing: updatedListing,
    };
  },

  /**
   * Seller ONLY: Reject payment proof
   * Keeps stock unchanged and notifies buyer with reason
   */
  async rejectPaymentProof(requestId: string, reason: string, sellerId?: string): Promise<{ success: boolean; error?: string; request?: TradeRequest }> {
    const requests = this.getTradeRequests();
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) {
      return { success: false, error: 'Purchase request not found.' };
    }
    if (sellerId && targetReq.sellerId && targetReq.sellerId !== sellerId) {
      return { success: false, error: 'Unauthorized: Only the seller can reject this payment proof.' };
    }

    const cleanReason = reason.trim() || 'Payment proof was unclear or did not match the expected amount.';
    const updatedList = await this.updateTradeRequestStatus(requestId, 'Payment Proof Rejected', {
      rejectionReason: cleanReason,
    });
    const updated = updatedList.find((r) => r.id === requestId);

    if (updated) {
      const { auth, db } = initFirebase();
      if (db && auth?.currentUser && updated.buyerId && updated.buyerId !== auth.currentUser.uid) {
        await this.createFirestoreNotification({
          recipientId: updated.buyerId,
          senderId: auth.currentUser.uid,
          buyerId: updated.buyerId,
          sellerId: updated.sellerId,
          type: 'purchase_request',
          title: 'Payment Proof Rejected',
          message: `Seller rejected payment proof for "${updated.listingTitle}": ${cleanReason}`,
          relatedRequestId: updated.id,
          relatedListingId: updated.listingId,
          linkTab: 'me',
          subTab: 'purchases',
        }).catch((err) => console.warn('Payment rejection notification warning:', err));
      }
      return { success: true, request: updated };
    }

    return { success: false, error: 'Could not update payment proof status.' };
  },

  /**
   * Seller ONLY: Complete transaction (Handover completed)
   */
  async completeTransaction(requestId: string): Promise<TradeRequest | null> {
    const requests = this.getTradeRequests();
    const targetReq = requests.find((r) => r.id === requestId);
    const { auth, db } = initFirebase();

    if (db && auth?.currentUser && targetReq?.sellerId && targetReq.sellerId !== auth.currentUser.uid) {
      throw new Error('Unauthorized: Only the seller can mark a handover as completed.');
    }

    const now = new Date().toISOString();
    const updatedList = await this.updateTradeRequestStatus(requestId, 'Completed', { completedAt: now });
    const updated = updatedList.find((r) => r.id === requestId) || null;

    if (updated && db && auth?.currentUser && updated.buyerId && updated.buyerId !== auth.currentUser.uid) {
      await this.createFirestoreNotification({
        recipientId: updated.buyerId,
        senderId: auth.currentUser.uid,
        buyerId: updated.buyerId,
        sellerId: updated.sellerId,
        type: 'purchase_request',
        title: 'Transaction Completed',
        message: `Handover for "${updated.listingTitle}" is complete!`,
        relatedRequestId: updated.id,
        relatedListingId: updated.listingId,
        linkTab: 'me',
        subTab: 'purchases',
      }).catch((err) => console.warn('Completion notification warning:', err));
    }

    return updated;
  },

  updateRequestStatus(requestId: string, status: TradeRequest['status']): TradeRequest[] {
    this.updateTradeRequestStatus(requestId, status).catch((err) => {
      console.warn('updateRequestStatus warning:', err);
    });
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
      const rentalCol = collection(db, 'rentalRequests');
      const rentalDocRef = doc(rentalCol);
      newReq.id = rentalDocRef.id;
      const cleanRentalPayload = sanitizeFirestoreFields(
        {
          ...newReq,
          renterId: auth.currentUser.uid,
        },
        ['isSentByCurrentUser']
      );
      try {
        await setDoc(rentalDocRef, cleanRentalPayload);
      } catch (err) {
        console.warn('Firestore rental request write warning:', err);
      }

      if (newReq.ownerId && newReq.ownerId !== auth.currentUser.uid) {
        await this.createFirestoreNotification({
          recipientId: newReq.ownerId,
          senderId: auth.currentUser.uid,
          type: 'rental_request',
          title: 'New Rental Request',
          message: `${newReq.renterName} requested to rent "${newReq.rentalItemName}" from ${newReq.startDate} to ${newReq.returnDate}.`,
          relatedRentalId: newReq.id,
          linkTab: 'me',
          subTab: 'rentals',
        }).catch((err) => console.warn('Rental owner notification warning:', err));
      }
    } else {
      this.addCampusNotification(
        'New Rental Request!',
        `${newReq.renterName} requested to rent "${newReq.rentalItemName}" from ${newReq.startDate} to ${newReq.returnDate}.`,
        'rental_request',
        'rent',
        newReq.id
      );
    }

    const requests = this.getRentalRequests();
    const updated = [newReq, ...requests];
    this.saveRentalRequests(updated);

    return newReq;
  },

  async updateRentalRequestStatus(id: string, status: RentalStatus, extraData?: Partial<RentalRequest>): Promise<RentalRequest | null> {
    const now = new Date().toISOString();
    const cleanExtra = sanitizeFirestoreFields(
      (extraData || {}) as Record<string, any>,
      ['id', 'renterId', 'ownerId', 'rentalItemId', 'createdAt', 'isSentByCurrentUser'],
      { preserveNull: true }
    );
    const payload = { status, updatedAt: now, ...cleanExtra };

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
      const targetRentalReq = updatedReq as RentalRequest;

      if (db && auth?.currentUser && targetRentalReq.renterId && targetRentalReq.renterId !== auth.currentUser.uid) {
        if (status === 'Approved') {
          await this.createFirestoreNotification({
            recipientId: targetRentalReq.renterId,
            senderId: auth.currentUser.uid,
            type: 'rental_approved',
            title: 'Rental Request Approved',
            message: `Your rental request for "${targetRentalReq.rentalItemName}" was approved. Please arrange campus handover.`,
            relatedRentalId: id,
            linkTab: 'me',
            subTab: 'rentals',
          }).catch((err) => console.warn('Rental approved notification warning:', err));
        } else if (status === 'Rejected') {
          await this.createFirestoreNotification({
            recipientId: targetRentalReq.renterId,
            senderId: auth.currentUser.uid,
            type: 'rental_rejected',
            title: 'Rental Request Declined',
            message: `Your rental request for "${targetRentalReq.rentalItemName}" was declined by the owner.`,
            relatedRentalId: id,
            linkTab: 'me',
            subTab: 'rentals',
          }).catch((err) => console.warn('Rental rejected notification warning:', err));
        }
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
      sharedListing: actualSharedListing
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

  // --- NOTIFICATIONS (Recipient-scoped Firestore /notifications) ---
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

  clearUserScopedLocalCache() {
    try {
      localStorage.removeItem(NOTIFICATIONS_KEY);
      localStorage.removeItem(REQUESTS_KEY);
      localStorage.removeItem(CART_KEY);
    } catch {}
  },

  async createFirestoreNotification(input: {
    recipientId: string;
    senderId?: string;
    buyerId?: string;
    sellerId?: string;
    type: CampusNotification['type'];
    title: string;
    message: string;
    relatedRequestId?: string;
    relatedListingId?: string;
    relatedRentalId?: string;
    linkTab?: string;
    subTab?: string;
  }): Promise<CampusNotification | null> {
    const { auth, db } = initFirebase();
    const currentUser = auth?.currentUser;
    if (!db || !currentUser) return null;

    const notifCol = collection(db, 'notifications');
    const docRef = doc(notifCol);
    const notifId = docRef.id;
    const nowIso = new Date().toISOString();

    const firestorePayload = sanitizeFirestoreFields({
      id: notifId,
      recipientId: input.recipientId,
      senderId: currentUser.uid,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedRequestId: input.relatedRequestId,
      relatedListingId: input.relatedListingId,
      relatedRentalId: input.relatedRentalId,
      linkTab: input.linkTab,
      subTab: input.subTab,
      isRead: false,
      read: false,
      createdAt: serverTimestamp(),
    });

    try {
      await setDoc(docRef, firestorePayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`);
    }

    const createdLocal: CampusNotification = {
      id: notifId,
      recipientId: input.recipientId,
      senderId: currentUser.uid,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      type: input.type,
      title: input.title,
      message: input.message,
      relatedRequestId: input.relatedRequestId,
      relatedListingId: input.relatedListingId,
      relatedRentalId: input.relatedRentalId,
      linkTab: input.linkTab,
      subTab: input.subTab,
      isRead: false,
      read: false,
      createdAt: nowIso,
      timestamp: formatNotificationTime(nowIso),
    };

    // Only mirror to localStorage if the notification is actually addressed to the signed-in user
    if (input.recipientId === currentUser.uid) {
      const existing = this.getNotifications();
      this.saveNotifications([createdLocal, ...existing.filter((n) => n.id !== notifId)]);
    }

    return createdLocal;
  },

  subscribeToNotifications(
    userId: string | undefined,
    callback: (notifications: CampusNotification[]) => void
  ): () => void {
    const { auth, db } = initFirebase();
    const activeUid = userId || auth?.currentUser?.uid;

    if (!activeUid) {
      this.saveNotifications([]);
      callback([]);
      return () => {};
    }

    if (db && auth?.currentUser && auth.currentUser.uid === activeUid && auth.currentUser.emailVerified) {
      try {
        const q = query(collection(db, 'notifications'), where('recipientId', '==', activeUid));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const items: CampusNotification[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const createdIso = normalizeIsoTimestamp(data.createdAt);
              items.push({
                ...(data as any),
                id: docSnap.id,
                createdAt: createdIso,
                timestamp: formatNotificationTime(createdIso),
                isRead: data.isRead === true || data.read === true,
                read: data.isRead === true || data.read === true,
              });
            });
            items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            this.saveNotifications(items);
            callback(items);
          },
          (err) => {
            console.warn('Firestore notifications subscription fallback:', err);
            callback(this.getNotifications());
          }
        );
        return unsubscribe;
      } catch (e) {
        console.warn('Failed to subscribe to Firestore notifications:', e);
      }
    }

    callback(this.getNotifications());
    return () => {};
  },

  markNotificationAsRead(id: string): CampusNotification[] {
    const notifs = this.getNotifications();
    const target = notifs.find((n) => n.id === id);
    const updated = notifs.map((n) =>
      n.id === id ? { ...n, isRead: true, read: true } : n
    );
    this.saveNotifications(updated);

    const { auth, db } = initFirebase();
    if (db && auth?.currentUser && target && (!target.recipientId || target.recipientId === auth.currentUser.uid)) {
      updateDoc(doc(db, 'notifications', id), { isRead: true, read: true }).catch((err) => {
        console.warn('Firestore markNotificationAsRead warning:', err);
      });
    }

    return updated;
  },

  markAllNotificationsAsRead(): CampusNotification[] {
    const notifs = this.getNotifications();
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      const uid = auth.currentUser.uid;
      notifs
        .filter((n) => (!n.isRead && !n.read) && (!n.recipientId || n.recipientId === uid))
        .forEach((n) => {
          updateDoc(doc(db, 'notifications', n.id), { isRead: true, read: true }).catch((err) => {
            console.warn('Firestore markAllNotificationsAsRead warning:', err);
          });
        });
    }

    const updated = notifs.map((n) => ({ ...n, isRead: true, read: true }));
    return this.saveNotifications(updated);
  },

  clearAllNotifications(): CampusNotification[] {
    const notifs = this.getNotifications();
    const { auth, db } = initFirebase();
    if (db && auth?.currentUser) {
      const uid = auth.currentUser.uid;
      notifs
        .filter((n) => !n.recipientId || n.recipientId === uid)
        .forEach((n) => {
          deleteDoc(doc(db, 'notifications', n.id)).catch((err) => {
            console.warn('Firestore clearAllNotifications warning:', err);
          });
        });
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
    const nowIso = new Date().toISOString();
    const newNotif: CampusNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      read: false,
      createdAt: nowIso,
      timestamp: formatNotificationTime(nowIso),
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
