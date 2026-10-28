import React, { useState, useEffect } from 'react';
import { 
  Category, 
  Listing, 
  TradeRequest, 
  RequestStatus, 
  UserProfile, 
  Review, 
  ChatConversation, 
  CartItem,
  RentalItem,
  RentalRequest,
  RentalStatus,
  CampusNotification,
  UTMUser,
  AccountState
} from './types';
import { storageService } from './services/storageService';
import { authService } from './services/authService';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { MallView } from './components/MallView';
import { CartView } from './components/CartView';
import { RentView } from './components/RentView';
import { ChatView } from './components/ChatView';
import { MeView } from './components/MeView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { TradeRequestModal } from './components/TradeRequestModal';
import { RentalDetailModal } from './components/RentalDetailModal';
import { CreateRentalModal } from './components/CreateRentalModal';
import { HandoverModal, InspectionModal, DisputeModal } from './components/RentalActionModals';
import { UtmAuthModal, AuthModalMode } from './components/UtmAuthModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Navigation State (6 Tabs: Home, Cart, Mall, Rent, Chat, Me)
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [mallCategory, setMallCategory] = useState<Category>('All');

  // UTM Authentication & Account State
  const [currentUser, setCurrentUser] = useState<UTMUser | null>(authService.getCurrentUser());
  const [accountState, setAccountState] = useState<AccountState>(authService.getAccountState());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const [intendedActionLabel, setIntendedActionLabel] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Core Marketplace Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Peer Rental State
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([]);
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>([]);
  const [selectedRentalItem, setSelectedRentalItem] = useState<RentalItem | null>(null);
  const [isCreateRentalModalOpen, setIsCreateRentalModalOpen] = useState(false);
  const [editingRentalItem, setEditingRentalItem] = useState<RentalItem | null>(null);

  // Rental Workflow Action Modals
  const [handoverModalRequest, setHandoverModalRequest] = useState<RentalRequest | null>(null);
  const [inspectionModalRequest, setInspectionModalRequest] = useState<RentalRequest | null>(null);
  const [disputeModalRequest, setDisputeModalRequest] = useState<RentalRequest | null>(null);

  // Sales / Marketplace Modals
  const [detailModalListing, setDetailModalListing] = useState<Listing | null>(null);
  const [tradeModalListing, setTradeModalListing] = useState<Listing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Load
  const loadAllData = () => {
    try {
      setListings(storageService.getListings());
      setTradeRequests(storageService.getTradeRequests());
      setCart(storageService.getCart());
      setUserProfile(storageService.getUserProfile());
      setReviews(storageService.getReviews());
      setConversations(storageService.getChatConversations());
      setRentalItems(storageService.getRentalItems());
      setRentalRequests(storageService.getRentalRequests());
      setNotifications(storageService.getNotifications());
      setCurrentUser(authService.getCurrentUser());
      setAccountState(authService.getAccountState());
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Subscribe to auth state updates
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      setAccountState(authService.getAccountState());
      if (user) {
        setUserProfile((prev) => ({
          ...prev,
          name: user.name,
          email: user.email,
          studentId: user.studentId || prev.studentId,
          faculty: user.faculty || prev.faculty,
          accountState: user.accountState,
          emailVerified: user.emailVerified,
          isSuspended: user.isSuspended,
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // ==========================================
  // TRANSACTION GATEKEEPER
  // ==========================================
  const ensureVerifiedUtmUser = (actionLabel: string, callback?: () => void): boolean => {
    const check = authService.canTransact(currentUser);
    if (!check.allowed) {
      setIntendedActionLabel(actionLabel);
      setPendingAction(() => callback || null);
      setAuthModalMode(currentUser && !currentUser.emailVerified ? 'verify' : 'login');
      setIsAuthModalOpen(true);
      addToast(
        'info',
        'UTM Authentication Required',
        check.reason || `Please sign in with your verified UTM email to ${actionLabel}.`
      );
      return false;
    }
    return true;
  };

  // Handlers for Auth Success and Sign Out
  const handleAuthSuccess = (user: UTMUser) => {
    setCurrentUser(user);
    setAccountState(user.accountState);
    loadAllData();
    addToast('success', 'UTM Verified', `Signed in as ${user.name} (${user.email})`);
    
    // Execute preserved intended action
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setTimeout(() => act(), 150);
    }
  };

  const handleSignOut = async () => {
    await authService.logout();
    setCurrentUser(null);
    setAccountState('Signed Out');
    
    // Requirement 6: Clear protected user data from interface
    setCart([]);
    setTradeRequests([]);
    setActiveChatId(undefined);
    addToast('info', 'Signed Out', 'You have signed out. Protected personal data cleared from interface.');
  };

  // Open Auth Modal helper
  const handleOpenAuthModal = (mode: AuthModalMode = 'login', actionLabel?: string, callback?: () => void) => {
    setAuthModalMode(mode);
    setIntendedActionLabel(actionLabel);
    setPendingAction(() => callback || null);
    setIsAuthModalOpen(true);
  };

  // --- CART HANDLERS ---
  const handleAddToCart = (listing: Listing) => {
    if (!ensureVerifiedUtmUser('add items to cart', () => handleAddToCart(listing))) return;

    const updated = storageService.addToCart(listing, 1);
    setCart(updated);
    addToast('success', 'Added to Cart', `"${listing.title}" is in your shopping cart.`);
  };

  const handleToggleSelectCartItem = (listingId: string) => {
    const updated = storageService.toggleSelectCartItem(listingId);
    setCart(updated);
  };

  const handleSelectAllCart = (selected: boolean) => {
    const updated = storageService.selectAllCartItems(selected);
    setCart(updated);
  };

  const handleUpdateCartQuantity = (listingId: string, quantity: number) => {
    const updated = storageService.updateCartQuantity(listingId, quantity);
    setCart(updated);
  };

  const handleRemoveFromCart = (listingId: string) => {
    const updated = storageService.removeFromCart(listingId);
    setCart(updated);
    addToast('info', 'Item Removed', 'The item was removed from your cart.');
  };

  // Cart Handover Checkout (Student-to-student peer request)
  const handleCartCheckoutSubmit = (
    selectedItems: CartItem[],
    handoverLocation: string,
    preferredTime: string,
    notes: string
  ) => {
    if (!ensureVerifiedUtmUser('submit purchase handover requests')) return;

    const effectiveName = currentUser?.name || userProfile.name;
    const effectiveEmail = currentUser?.email || userProfile.email;

    selectedItems.forEach((item) => {
      const newReq = storageService.createTradeRequest({
        listingId: item.listingId,
        listingTitle: item.listing.title,
        listingPrice: item.listing.price,
        listingImage: item.listing.imageUrl,
        sellerName: item.listing.sellerName,
        buyerName: effectiveName,
        buyerContact: effectiveEmail || '012-345-6789',
        offeredPrice: item.listing.price * item.quantity,
        pickupLocation: handoverLocation,
        message: `${notes} (Qty: ${item.quantity}, Preferred Time: ${preferredTime})`,
      });
      setTradeRequests((prev) => [newReq, ...prev]);

      // Notify seller via direct message
      storageService.sendChatMessage(
        `chat-${item.listing.sellerName.toLowerCase().replace(/\s+/g, '-')}`,
        `Hi ${item.listing.sellerName}! I submitted a handover request for "${item.listing.title}" at ${handoverLocation} (${preferredTime}).`,
        {
          id: item.listing.id,
          title: item.listing.title,
          price: item.listing.price,
          imageUrl: item.listing.imageUrl,
        }
      );
    });

    const updatedCart = storageService.clearSelectedCartItems();
    setCart(updatedCart);
    setConversations(storageService.getChatConversations());

    addToast(
      'success',
      'Handover Request Sent!',
      `Sent ${selectedItems.length} peer request(s). Track under Me > Buy Requests.`
    );
  };

  // --- FAVOURITES TOGGLE ---
  const handleToggleFavorite = (listingId: string) => {
    const updatedFavs = storageService.toggleFavorite(listingId);
    setUserProfile((prev) => ({ ...prev, savedListingIds: updatedFavs }));
    const isSaved = updatedFavs.includes(listingId);
    addToast(
      'info',
      isSaved ? 'Added to Favourites' : 'Removed from Favourites',
      'Saved items can be viewed in your Me tab.'
    );
  };

  // --- CHAT HANDLERS ---
  const handleStartChat = (
    sellerName: string, 
    listing?: Listing, 
    rentalItem?: RentalItem
  ) => {
    if (!ensureVerifiedUtmUser('send marketplace messages', () => handleStartChat(sellerName, listing, rentalItem))) return;

    const effectiveName = currentUser?.name || userProfile.name;
    const convos = storageService.getChatConversations();
    let target = convos.find((c) => c.name.toLowerCase() === sellerName.toLowerCase());

    const itemTitle = rentalItem ? rentalItem.name : listing ? listing.title : 'Item';
    const itemPrice = rentalItem ? rentalItem.pricePerDay : listing ? listing.price : 0;
    const itemImage = rentalItem ? rentalItem.imageUrl : listing ? listing.imageUrl : '';

    if (!target) {
      target = {
        id: `chat-${sellerName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        type: 'direct',
        name: sellerName,
        avatar: listing?.sellerAvatar || rentalItem?.ownerAvatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        participants: [
          { id: 'user-seller', name: sellerName, role: 'Seller' },
          { id: 'user-current', name: effectiveName, role: 'Buyer' },
        ],
        lastMessage: `Inquiry about ${itemTitle}`,
        lastMessageTime: 'Just now',
        unreadCount: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            senderId: 'user-current',
            senderName: effectiveName,
            text: rentalItem
              ? `Hi ${sellerName}! I saw your rental listing for "${rentalItem.name}" (RM ${rentalItem.pricePerDay}/day). Where is your preferred campus handover location?`
              : `Hi ${sellerName}! Is "${listing?.title}" still available? Where is your preferred campus handover spot?`,
            timestamp: 'Just now',
            sharedListing: {
              id: (rentalItem ? rentalItem.id : listing?.id) || '',
              title: itemTitle,
              price: itemPrice,
              imageUrl: itemImage,
            }
          }
        ]
      };
      const updatedConvos = [target, ...convos];
      try {
        localStorage.setItem('campusloop_chats_v4', JSON.stringify(updatedConvos));
      } catch {}
      setConversations(updatedConvos);
    } else {
      // Add inquiry message to existing thread
      storageService.sendChatMessage(
        target.id,
        rentalItem
          ? `Hi ${sellerName}! Inquiring about renting "${rentalItem.name}".`
          : `Hi ${sellerName}! Is "${listing?.title}" still available?`,
        {
          id: (rentalItem ? rentalItem.id : listing?.id) || '',
          title: itemTitle,
          price: itemPrice,
          imageUrl: itemImage,
        }
      );
      setConversations(storageService.getChatConversations());
    }

    setActiveChatId(target.id);
    setActiveTab('chat');
    setDetailModalListing(null);
    setSelectedRentalItem(null);
  };

  // --- SALE LISTING CREATION ---
  const handleOpenCreateListingModal = () => {
    if (!ensureVerifiedUtmUser('create a product listing', () => setIsCreateModalOpen(true))) return;
    setIsCreateModalOpen(true);
  };

  const handleCreateListing = (newListingData: any) => {
    if (!ensureVerifiedUtmUser('publish a product listing')) return;

    const created = storageService.createListing({
      ...newListingData,
      sellerName: currentUser?.name || userProfile.name,
      sellerAvatar: currentUser?.avatarUrl || userProfile.avatarUrl,
    });
    setListings((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
    addToast('success', 'Listing Published!', `"${created.title}" is now visible in the marketplace.`);
  };

  // --- TRADE REQUEST FROM MODAL ---
  const handleTradeRequestSubmit = (requestData: any) => {
    if (!ensureVerifiedUtmUser('submit purchase requests')) return;

    const newReq = storageService.createTradeRequest({
      ...requestData,
      buyerName: currentUser?.name || userProfile.name,
      buyerContact: currentUser?.email || userProfile.email,
    });
    setTradeRequests((prev) => [newReq, ...prev]);
    setTradeModalListing(null);

    storageService.sendChatMessage(
      `chat-${newReq.sellerName.toLowerCase().replace(/\s+/g, '-')}`,
      `Hi ${newReq.sellerName}! I submitted an offer of RM ${newReq.offeredPrice.toFixed(2)} for "${newReq.listingTitle}". Handover at ${newReq.pickupLocation}.`,
      {
        id: newReq.listingId,
        title: newReq.listingTitle,
        price: newReq.listingPrice,
        imageUrl: newReq.listingImage,
      }
    );
    setConversations(storageService.getChatConversations());

    addToast(
      'success',
      'Offer Delivered!',
      `Sent offer of RM ${newReq.offeredPrice.toFixed(2)} to ${newReq.sellerName}. View in Me > Buy Requests.`
    );
  };

  const handleUpdateTradeStatus = (requestId: string, status: RequestStatus) => {
    if (!ensureVerifiedUtmUser('update trade status')) return;

    const updated = storageService.updateTradeRequestStatus(requestId, status);
    setTradeRequests(updated);
    addToast('info', `Status Updated: ${status}`, 'Trade status updated.');
  };

  // ==========================================
  // --- PEER RENTAL WORKFLOW HANDLERS ---
  // ==========================================

  // Step 4: Renter submits a rental request
  const handleRequestRent = (reqData: {
    rentalItemId: string;
    startDate: string;
    returnDate: string;
    days: number;
    pricePerDay: number;
    rentalFeeTotal: number;
    securityDeposit: number;
    totalBeforeRental: number;
    pickupLocation: string;
    message: string;
  }) => {
    if (!ensureVerifiedUtmUser('submit a rental booking request')) return;

    const item = rentalItems.find((i) => i.id === reqData.rentalItemId);
    if (!item) return;

    const effectiveName = currentUser?.name || userProfile.name;
    const effectiveEmail = currentUser?.email || userProfile.email;

    const newReq = storageService.createRentalRequest({
      rentalItemId: item.id,
      rentalItemName: item.name,
      rentalItemImage: item.imageUrl,
      ownerId: item.ownerId || 'owner-sample',
      ownerName: item.ownerName,
      ownerContact: item.ownerContact || '012-987-6543',
      renterId: currentUser?.studentId || userProfile.studentId || 'user-alex',
      renterName: effectiveName,
      renterContact: effectiveEmail || '012-345-6789',
      startDate: reqData.startDate,
      returnDate: reqData.returnDate,
      days: reqData.days,
      pricePerDay: reqData.pricePerDay,
      rentalFeeTotal: reqData.rentalFeeTotal,
      securityDeposit: reqData.securityDeposit,
      totalBeforeRental: reqData.totalBeforeRental,
      pickupLocation: reqData.pickupLocation,
      message: reqData.message,
      status: 'Pending Approval',
      depositStatus: 'Not Paid',
      isSentByCurrentUser: true,
    });

    setRentalRequests(storageService.getRentalRequests());
    setSelectedRentalItem(null);

    // Notify owner in chat
    storageService.sendChatMessage(
      `chat-${item.ownerName.toLowerCase().replace(/\s+/g, '-')}`,
      `Hi ${item.ownerName}! I submitted a rental request for "${item.name}" from ${reqData.startDate} to ${reqData.returnDate} (${reqData.days} days). Total: RM ${reqData.totalBeforeRental.toFixed(2)} (Fee: RM ${reqData.rentalFeeTotal} + Deposit: RM ${reqData.securityDeposit}).`,
      {
        id: item.id,
        title: item.name,
        price: item.pricePerDay,
        imageUrl: item.imageUrl,
      }
    );
    setConversations(storageService.getChatConversations());
    setNotifications(storageService.getNotifications());

    addToast(
      'success',
      'Rental Request Sent!',
      `Requested "${item.name}" for ${reqData.days} day(s). Awaiting owner confirmation.`
    );
  };

  // Open Create Rental Listing modal
  const handleOpenCreateRentalModal = () => {
    if (!ensureVerifiedUtmUser('list items for rent', () => {
      setEditingRentalItem(null);
      setIsCreateRentalModalOpen(true);
    })) return;

    setEditingRentalItem(null);
    setIsCreateRentalModalOpen(true);
  };

  // List an item for rent (or update existing)
  const handleCreateOrUpdateRentalListing = (data: Omit<RentalItem, 'id' | 'createdAt'>) => {
    if (!ensureVerifiedUtmUser('publish or update rental listings')) return;

    const effectiveName = currentUser?.name || userProfile.name;

    if (editingRentalItem) {
      storageService.updateRentalItem(editingRentalItem.id, data);
      addToast('success', 'Rental Item Updated!', `"${data.name}" details updated.`);
      setEditingRentalItem(null);
    } else {
      const created = storageService.createRentalItem({
        ...data,
        ownerName: effectiveName,
        ownerAvatar: currentUser?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        isUserCreated: true,
      });
      addToast('success', 'Rental Listed!', `"${created.name}" is now available for students to rent.`);
    }
    setRentalItems(storageService.getRentalItems());
    setIsCreateRentalModalOpen(false);
  };

  // Toggle active/pause for rental listing
  const handleToggleRentalAvailability = (id: string) => {
    if (!ensureVerifiedUtmUser('modify rental availability')) return;

    const item = rentalItems.find((i) => i.id === id);
    if (!item) return;
    const nextAvailability = !item.isAvailable;
    storageService.updateRentalItem(id, { isAvailable: nextAvailability });
    setRentalItems(storageService.getRentalItems());
    addToast(
      'info',
      nextAvailability ? 'Rental Listing Activated' : 'Rental Listing Paused',
      `"${item.name}" is now ${nextAvailability ? 'visible to renters' : 'hidden from browse'}.`
    );
  };

  // Delete rental listing
  const handleDeleteRentalItem = (id: string) => {
    if (!ensureVerifiedUtmUser('delete rental listings')) return;

    storageService.deleteRentalItem(id);
    setRentalItems(storageService.getRentalItems());
    addToast('info', 'Rental Listing Deleted', 'The item was removed from your rental inventory.');
  };

  // Step 5: Owner accepts or rejects rental
  const handleUpdateRentalStatus = (requestId: string, status: RentalStatus) => {
    if (!ensureVerifiedUtmUser('update rental booking status')) return;

    storageService.updateRentalRequestStatus(requestId, status);
    setRentalRequests(storageService.getRentalRequests());
    setRentalItems(storageService.getRentalItems());
    setNotifications(storageService.getNotifications());
    addToast('info', `Rental Status: ${status}`, 'Rental request updated.');
  };

  // Step 6 & 7: Handover inspection & condition baseline recorded -> marks Rented Out
  const handleRecordHandover = (requestId: string, notes: string) => {
    if (!ensureVerifiedUtmUser('record handover condition')) return;

    storageService.recordHandoverCondition(requestId, notes);
    setRentalRequests(storageService.getRentalRequests());
    setRentalItems(storageService.getRentalItems());
    setNotifications(storageService.getNotifications());
    setHandoverModalRequest(null);
    addToast(
      'success',
      'Handover Confirmed & Rented Out',
      'Baseline condition saved. The rental period has officially begun!'
    );
  };

  // Step 8: Renter reports/confirms return
  const handleConfirmReturn = (requestId: string) => {
    if (!ensureVerifiedUtmUser('confirm equipment return')) return;

    storageService.confirmRenterReturn(requestId);
    setRentalRequests(storageService.getRentalRequests());
    setNotifications(storageService.getNotifications());
    addToast(
      'success',
      'Return Handed Over!',
      'Return reported. The owner will inspect the item and approve your deposit refund.'
    );
  };

  // Step 9: Owner inspects returned item
  const handleRecordInspection = (
    requestId: string, 
    notes: string, 
    passed: boolean, 
    proposedDeduction = 0, 
    deductionReason?: string
  ) => {
    if (!ensureVerifiedUtmUser('perform return inspection')) return;

    storageService.recordReturnInspection(requestId, notes, passed, proposedDeduction, deductionReason);
    setRentalRequests(storageService.getRentalRequests());
    setRentalItems(storageService.getRentalItems());
    setNotifications(storageService.getNotifications());
    setInspectionModalRequest(null);

    if (passed) {
      addToast(
        'success',
        'Inspection Passed! 🌟',
        'Item returned in agreed condition. Full deposit refund is ready for release.'
      );
    } else {
      addToast(
        'info',
        'Dispute Initiated',
        `Proposed deduction of RM ${proposedDeduction} recorded. Renter will be notified.`
      );
    }
  };

  // Step 10 & 11: Owner approves deposit refund -> marks Completed
  const handleApproveDepositRefund = (requestId: string, refundAmount: number) => {
    if (!ensureVerifiedUtmUser('approve deposit refunds')) return;

    storageService.approveDepositRefund(requestId, refundAmount);
    setRentalRequests(storageService.getRentalRequests());
    setRentalItems(storageService.getRentalItems());
    setNotifications(storageService.getNotifications());
    addToast(
      'success',
      'Deposit Refund Approved! 💸',
      `RM ${refundAmount.toFixed(2)} recorded as refunded. Rental completed!`
    );
  };

  // Step 10 dispute resolution
  const handleResolveDispute = (
    requestId: string, 
    agreedRefundAmount: number, 
    notes: string, 
    renterResponse?: string
  ) => {
    if (!ensureVerifiedUtmUser('resolve rental disputes')) return;

    storageService.resolveDispute(requestId, agreedRefundAmount, notes, renterResponse);
    setRentalRequests(storageService.getRentalRequests());
    setNotifications(storageService.getNotifications());
    setDisputeModalRequest(null);
    addToast('success', 'Dispute Agreement Recorded', `Agreed deposit refund set to RM ${agreedRefundAmount.toFixed(2)}.`);
  };

  // --- NOTIFICATION HANDLERS ---
  const handleMarkNotificationRead = (id: string) => {
    const updated = storageService.markNotificationAsRead(id);
    setNotifications(updated);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = storageService.markAllNotificationsAsRead();
    setNotifications(updated);
  };

  const handleClearAllNotifications = () => {
    const updated = storageService.clearAllNotifications();
    setNotifications(updated);
  };

  // Profile update
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    const next = { ...userProfile, ...updated };
    setUserProfile(next);
    try {
      localStorage.setItem('campusloop_user_profile_v4', JSON.stringify(next));
    } catch {}
  };

  // Reset Prototype Data
  const handleResetData = () => {
    storageService.resetPrototypeData();
    loadAllData();
    addToast('success', 'Reset Complete', 'Fresh sample marketplace & rental data restored.');
  };

  // Navigate to Mall with specific category
  const handleNavigateMall = (category: Category = 'All') => {
    setMallCategory(category);
    setActiveTab('mall');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved listings objects
  const savedListings = listings.filter((l) => userProfile.savedListingIds.includes(l.id));

  // Counts for Badges
  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadNotifCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900 pb-20 md:pb-8">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navbar & 6-Tab Mobile Bottom Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={handleOpenCreateListingModal}
        openCreateRentalModal={handleOpenCreateRentalModal}
        cartCount={cart.length}
        unreadChatCount={unreadChatCount}
        unreadNotificationsCount={unreadNotifCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        accountState={accountState}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('login')}
        onSignOut={handleSignOut}
      />

      {/* Main View Area based on the 6 Shopping & Rental Tabs */}
      <main className="flex-1 w-full">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <HomeView
            listings={listings}
            onSelectListing={(item) => setDetailModalListing(item)}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            savedListingIds={userProfile.savedListingIds}
            onNavigateMall={handleNavigateMall}
            onOpenCreateModal={handleOpenCreateListingModal}
          />
        )}

        {/* TAB 2: CART */}
        {activeTab === 'cart' && (
          <CartView
            cart={cart}
            onToggleSelect={handleToggleSelectCartItem}
            onSelectAll={handleSelectAllCart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onSelectListing={(item) => setDetailModalListing(item)}
            onNavigateMall={() => handleNavigateMall('All')}
            onCheckoutSubmit={handleCartCheckoutSubmit}
          />
        )}

        {/* TAB 3: MALL */}
        {activeTab === 'mall' && (
          <MallView
            listings={listings}
            initialCategory={mallCategory}
            onSelectListing={(item) => setDetailModalListing(item)}
            onAddToCart={handleAddToCart}
            onToggleFavorite={handleToggleFavorite}
            savedListingIds={userProfile.savedListingIds}
          />
        )}

        {/* TAB 4: RENT (DEDICATED RENTAL MARKETPLACE) */}
        {activeTab === 'rent' && (
          <RentView
            rentalItems={rentalItems}
            onSelectRentalItem={(item) => setSelectedRentalItem(item)}
            onOpenCreateRentalModal={handleOpenCreateRentalModal}
          />
        )}

        {/* TAB 5: CHAT */}
        {activeTab === 'chat' && (
          <ChatView
            conversations={conversations}
            listings={listings}
            activeConversationId={activeChatId}
            onSelectConversation={setActiveChatId}
            onSelectListing={(item) => setDetailModalListing(item)}
            onRefreshConversations={() => setConversations(storageService.getChatConversations())}
          />
        )}

        {/* TAB 6: ME */}
        {activeTab === 'me' && (
          <MeView
            profile={userProfile}
            currentUser={currentUser}
            accountState={accountState}
            listings={listings}
            tradeRequests={tradeRequests}
            savedListings={savedListings}
            rentalItems={rentalItems}
            rentalRequests={rentalRequests}
            onSelectListing={(item) => setDetailModalListing(item)}
            onSelectRentalItem={(item) => setSelectedRentalItem(item)}
            onOpenCreateModal={handleOpenCreateListingModal}
            onOpenCreateRentalModal={handleOpenCreateRentalModal}
            onEditRentalItem={(item) => {
              if (!ensureVerifiedUtmUser('edit a rental listing')) return;
              setEditingRentalItem(item);
              setIsCreateRentalModalOpen(true);
            }}
            onToggleRentalAvailability={handleToggleRentalAvailability}
            onDeleteRentalItem={handleDeleteRentalItem}
            onUpdateTradeStatus={handleUpdateTradeStatus}
            onUpdateRentalStatus={handleUpdateRentalStatus}
            onOpenHandoverModal={(req) => {
              if (!ensureVerifiedUtmUser('record handover condition')) return;
              setHandoverModalRequest(req);
            }}
            onOpenInspectionModal={(req) => {
              if (!ensureVerifiedUtmUser('perform return inspection')) return;
              setInspectionModalRequest(req);
            }}
            onOpenDisputeModal={(req) => {
              if (!ensureVerifiedUtmUser('manage dispute records')) return;
              setDisputeModalRequest(req);
            }}
            onApproveDepositRefund={handleApproveDepositRefund}
            onConfirmReturn={handleConfirmReturn}
            onRemoveFavorite={handleToggleFavorite}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
            onSignOut={handleSignOut}
            onOpenAuthModal={() => handleOpenAuthModal('login')}
          />
        )}
      </main>

      {/* ============================================================== */}
      {/* MODALS & DRAWERS */}
      {/* ============================================================== */}

      {/* Product Details Modal (Mall / Buy) */}
      {detailModalListing && (
        <ListingDetailModal
          listing={detailModalListing}
          onClose={() => setDetailModalListing(null)}
          onAddToCart={handleAddToCart}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={userProfile.savedListingIds.includes(detailModalListing.id)}
          onStartChat={(sellerName, listing) => handleStartChat(sellerName, listing)}
          onRequestTrade={(listing) => {
            if (!ensureVerifiedUtmUser('request to buy an item', () => {
              setDetailModalListing(null);
              setTradeModalListing(listing);
            })) return;
            setDetailModalListing(null);
            setTradeModalListing(listing);
          }}
          reviews={reviews}
        />
      )}

      {/* Trade / Purchase Request Modal */}
      {tradeModalListing && (
        <TradeRequestModal
          listing={tradeModalListing}
          onClose={() => setTradeModalListing(null)}
          onSubmit={handleTradeRequestSubmit}
        />
      )}

      {/* Create Listing ("Sell an Item") Modal */}
      {isCreateModalOpen && (
        <CreateListingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onListingCreated={handleCreateListing}
        />
      )}

      {/* Rental Details Modal (Rent tab & Me) */}
      {selectedRentalItem && (
        <RentalDetailModal
          item={selectedRentalItem}
          onClose={() => setSelectedRentalItem(null)}
          onRequestRent={handleRequestRent}
          onStartChat={(ownerName, item) => handleStartChat(ownerName, undefined, item)}
        />
      )}

      {/* Create / Edit Rental Listing Modal */}
      {isCreateRentalModalOpen && (
        <CreateRentalModal
          isOpen={isCreateRentalModalOpen}
          onClose={() => {
            setIsCreateRentalModalOpen(false);
            setEditingRentalItem(null);
          }}
          onListingCreated={handleCreateOrUpdateRentalListing}
          editItem={editingRentalItem}
        />
      )}

      {/* Handover Condition Modal (Step 6) */}
      {handoverModalRequest && (
        <HandoverModal
          request={handoverModalRequest}
          onClose={() => setHandoverModalRequest(null)}
          onConfirm={handleRecordHandover}
        />
      )}

      {/* Return Inspection Modal (Step 9) */}
      {inspectionModalRequest && (
        <InspectionModal
          request={inspectionModalRequest}
          onClose={() => setInspectionModalRequest(null)}
          onRecordInspection={handleRecordInspection}
        />
      )}

      {/* Dispute Resolution Modal (Step 10 Dispute) */}
      {disputeModalRequest && (
        <DisputeModal
          request={disputeModalRequest}
          onClose={() => setDisputeModalRequest(null)}
          onResolveDispute={handleResolveDispute}
          isOwner={disputeModalRequest.ownerName === (currentUser?.name || userProfile.name) || !disputeModalRequest.isSentByCurrentUser}
        />
      )}

      {/* Campus Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onNavigateTab={(tab) => {
          if (tab === 'rent' || tab === 'me' || tab === 'chat' || tab === 'mall' || tab === 'cart') {
            setActiveTab(tab);
          }
        }}
      />

      {/* UTM Authentication Modal */}
      {isAuthModalOpen && (
        <UtmAuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
          intendedActionLabel={intendedActionLabel}
        />
      )}
    </div>
  );
}
