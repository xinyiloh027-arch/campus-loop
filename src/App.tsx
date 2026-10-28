import React, { useState, useEffect, useMemo } from 'react';
import { 
  Category, 
  Listing, 
  TradeRequest, 
  RequestStatus, 
  UserProfile, 
  UserRole, 
  Review, 
  ChatConversation, 
  VirtualPet, 
  BudgetTransaction, 
  BudgetSettings,
  CampusNotification,
  BorrowRequest,
  BorrowStatus
} from './types';
import { storageService } from './services/storageService';
import { Navbar, NavTab } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { TradeRequestModal } from './components/TradeRequestModal';
import { MyRequestsView } from './components/MyRequestsView';
import { MyListingsView } from './components/MyListingsView';
import { ProfileView } from './components/ProfileView';
import { PriceIntelligenceView } from './components/PriceIntelligenceView';
import { ChatView } from './components/ChatView';
import { BudgetView } from './components/BudgetView';
import { CampusPetView } from './components/CampusPetView';
import { BorrowView } from './components/BorrowView';
import { WantedBoardView } from './components/WantedBoardView';
import { FreeReuseView } from './components/FreeReuseView';
import { TextbookEditionCheckerModal } from './components/TextbookEditionCheckerModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ReviewModal } from './components/ReviewModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PackageSearch, Sparkles, BookOpen } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Core Data State (Loaded from localStorage persistent prototype service)
  const [listings, setListings] = useState<Listing[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(storageService.getUserProfile());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [virtualPet, setVirtualPet] = useState<VirtualPet>(storageService.getVirtualPet());
  const [budgetTransactions, setBudgetTransactions] = useState<BudgetTransaction[]>([]);
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(storageService.getBudgetSettings());
  const [notifications, setNotifications] = useState<CampusNotification[]>(storageService.getNotifications());
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Modals
  const [detailModalListing, setDetailModalListing] = useState<Listing | null>(null);
  const [tradeModalListing, setTradeModalListing] = useState<Listing | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [reviewModalRequest, setReviewModalRequest] = useState<TradeRequest | null>(null);
  const [reviewModalRole, setReviewModalRole] = useState<'Buyer' | 'Seller'>('Buyer');
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isEditionCheckerOpen, setIsEditionCheckerOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Load
  const loadAllData = () => {
    try {
      setListings(storageService.getListings());
      setTradeRequests(storageService.getTradeRequests());
      setUserProfile(storageService.getUserProfile());
      setReviews(storageService.getReviews());
      setConversations(storageService.getChatConversations());
      setVirtualPet(storageService.getVirtualPet());
      setBudgetTransactions(storageService.getBudgetTransactions());
      setBudgetSettings(storageService.getBudgetSettings());
      setNotifications(storageService.getNotifications());
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        const matchesSearch =
          listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ((listing.campusLocation || listing.location || '').toLowerCase().includes(searchQuery.toLowerCase())) ||
          (listing.courseCode && listing.courseCode.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCategory =
          selectedCategory === 'All' || listing.category === selectedCategory;

        const matchesPrice = maxPrice === null || listing.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, searchQuery, selectedCategory, maxPrice, sortOrder]);

  // Favorite toggle handler
  const handleToggleFavorite = (listingId: string) => {
    const updatedFavs = storageService.toggleFavorite(listingId);
    setUserProfile((prev) => ({ ...prev, savedListingIds: updatedFavs }));
    const isSaved = updatedFavs.includes(listingId);
    addToast(
      'info',
      isSaved ? 'Added to Saved Items' : 'Removed from Saved Items',
      'Manage saved items in your Student Profile.'
    );
  };

  // Role Change Handler
  const handleRoleChange = (role: UserRole) => {
    const updated = storageService.setUserRole(role);
    setUserProfile(updated);
    addToast(
      'success',
      `Switched to ${role === 'both' ? 'Buyer & Seller' : role.toUpperCase()} Mode`,
      'Your UI features and tools have adjusted accordingly.'
    );
  };

  // Create Listing Handler
  const handleCreateListing = (newListingData: any) => {
    const created = storageService.createListing(newListingData);
    setListings((prev) => [created, ...prev]);
    setIsCreateModalOpen(false);
    addToast('success', 'Listing Published!', `"${created.title}" is now visible to campus peers.`);
  };

  // Trade Request Submission
  const handleTradeRequestSubmit = (requestData: any) => {
    const newReq = storageService.createTradeRequest(requestData);
    setTradeRequests((prev) => [newReq, ...prev]);
    setTradeModalListing(null);

    // Also trigger a notification
    const newNotif: CampusNotification = {
      id: `notif-${Date.now()}`,
      type: 'trade_request',
      title: 'Offer Sent to Seller',
      message: `Your trade request for "${newReq.listingTitle}" (RM ${newReq.offeredPrice}) was delivered to ${newReq.sellerName}.`,
      createdAt: 'Just now',
      isRead: false,
      linkTab: 'my-requests',
    };
    const nextNotifs = [newNotif, ...notifications];
    setNotifications(nextNotifs);
    storageService.saveNotifications(nextNotifs);

    addToast(
      'success',
      'Trade Request Sent!',
      `Sent offer of RM ${newReq.offeredPrice} to ${newReq.sellerName}. Track in My Requests.`
    );
  };

  // Trade Request Status Progression
  const handleUpdateTradeStatus = (requestId: string, status: RequestStatus) => {
    const updated = storageService.updateTradeRequestStatus(requestId, status);
    setTradeRequests(updated);
    addToast('info', `Status Updated: ${status}`, 'Transaction history updated in local storage.');

    // If completed, prompt user for review or budget sync
    if (status === 'Completed') {
      const completedReq = updated.find((r) => r.id === requestId);
      if (completedReq) {
        addToast(
          'success',
          'Transaction Completed!',
          'You can now leave a verified review and record this in your Student Budget.'
        );
      }
    }
  };

  // Reviews submission
  const handleSubmitReview = (reviewData: any) => {
    const created = storageService.addReview(reviewData);
    setReviews((prev) => [created, ...prev]);
    setReviewModalRequest(null);
    addToast('success', 'Verified Review Published!', 'Thank you for building trusted campus reputation.');
  };

  // Borrow Request handler
  const handleSendBorrowRequest = (req: Omit<BorrowRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>) => {
    const newBorrowReq: BorrowRequest = {
      ...req,
      id: `breq-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isSentByCurrentUser: true,
    };
    addToast('success', 'Borrow Request Sent!', `Lender ${req.lenderName} will verify pickup arrangements.`);
  };

  // Free Claim handler
  const handleClaimFreeItem = (item: Listing, pickupSpot: string, note: string) => {
    addToast(
      'success',
      'Free Item Claim Sent!',
      `Contacted ${item.sellerName} for pickup at ${item.campusLocation || item.location}. Thank you for promoting zero waste!`
    );
  };

  // Notification actions
  const handleMarkNotifRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, isRead: true, read: true } : n);
    setNotifications(updated);
    storageService.saveNotifications(updated);
  };

  const handleMarkAllNotifsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true, read: true }));
    setNotifications(updated);
    storageService.saveNotifications(updated);
  };

  const handleClearNotifs = () => {
    setNotifications([]);
    storageService.saveNotifications([]);
  };

  // Direct DM handler from Wanted or Listing
  const handleOpenDirectChat = (recipientName: string, initialText?: string) => {
    setActiveTab('chat');
    if (initialText) {
      addToast('info', `Opening Chat with ${recipientName}`, initialText);
    }
  };

  // Pending counts
  const pendingRequestsCount = tradeRequests.filter(
    (r) => r.status === 'Pending' && !r.isSentByCurrentUser
  ).length;

  const unreadChatCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const unreadNotificationsCount = notifications.filter(n => !(n.isRead === true || n.read === true)).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Toast Alert Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Universal Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={() => setIsCreateModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
        unreadChatCount={unreadChatCount}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenEditionChecker={() => setIsEditionCheckerOpen(true)}
        userRole={userProfile.role}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <div className="space-y-6 pb-16">
            {/* Hero Section */}
            <HeroBanner
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onOpenCreateModal={() => setIsCreateModalOpen(true)}
              totalListingsCount={listings.length}
              userRole={userProfile.role}
            />

            {/* Quick Textbook Syllabus Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-r from-indigo-500 via-sky-600 to-indigo-600 rounded-2xl p-4 text-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Textbook Edition & Syllabus Checker</h3>
                    <p className="text-xs text-sky-100">
                      Need course books? Check if older textbook editions match your lecturer's problem sets and save up to RM 160.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditionCheckerOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white text-indigo-700 hover:bg-sky-50 font-bold text-xs shadow-xs transition-colors shrink-0"
                >
                  Check Course Codes
                </button>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <FilterBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                totalResults={filteredListings.length}
              />
            </div>

            {/* Marketplace Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4 space-y-3"
                    >
                      <div className="h-44 bg-slate-100 rounded-xl"></div>
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 my-8 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                    <PackageSearch className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">No Listings Found</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      No items matched "{searchQuery}" under category {selectedCategory}. Try resetting filters or post a request on the Wanted Board!
                    </p>
                  </div>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setMaxPrice(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      Reset Filters
                    </button>
                    <button
                      onClick={() => setActiveTab('wanted')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                    >
                      Post to Wanted Board
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredListings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={(item: Listing) => setDetailModalListing(item)}
                      onRequestTrade={(item: Listing) => setTradeModalListing(item)}
                      onToggleSave={handleToggleFavorite}
                      isSaved={(userProfile.savedListingIds || []).includes(listing.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Borrow & Lend Gear */}
        {activeTab === 'borrow' && (
          <BorrowView
            listings={listings}
            onSendBorrowRequest={handleSendBorrowRequest}
            onUpdateBorrowStatus={(id, status) => {
              addToast('info', `Borrow status: ${status}`, 'Lending terms recorded.');
            }}
          />
        )}

        {/* Wanted Bulletin Board */}
        {activeTab === 'wanted' && (
          <WantedBoardView
            onOpenDirectChat={handleOpenDirectChat}
          />
        )}

        {/* Free & Circular Reuse Giveaways */}
        {activeTab === 'free' && (
          <FreeReuseView
            onClaimItem={handleClaimFreeItem}
          />
        )}

        {/* Price Intelligence & Competitor Benchmark */}
        {activeTab === 'pricing' && (
          <PriceIntelligenceView
            listings={listings}
            onSelectListing={(item: Listing) => setDetailModalListing(item)}
            onRequestTrade={(item: Listing) => setTradeModalListing(item)}
          />
        )}

        {/* Student Personal Finance & Budget */}
        {activeTab === 'budget' && (
          <BudgetView
            transactions={budgetTransactions}
            settings={budgetSettings}
            tradeRequests={tradeRequests}
            onRefreshData={loadAllData}
          />
        )}

        {/* Campus Cute Cartoon Pet & Pocket Garden */}
        {activeTab === 'games' && (
          <CampusPetView
            pet={virtualPet}
            onRefreshPet={() => setVirtualPet(storageService.getVirtualPet())}
          />
        )}

        {/* Direct Messages & Study Groups */}
        {activeTab === 'chat' && (
          <ChatView
            conversations={conversations}
            listings={listings}
            onSelectListing={(item: Listing) => setDetailModalListing(item)}
            onRefreshConversations={loadAllData}
          />
        )}

        {/* Trade Requests & Offers */}
        {activeTab === 'my-requests' && (
          <MyRequestsView
            requests={tradeRequests}
            onStatusChange={handleUpdateTradeStatus}
            onOpenReviewModal={(req: TradeRequest, role: 'Buyer' | 'Seller') => {
              setReviewModalRequest(req);
              setReviewModalRole(role);
            }}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {/* My Active Listings (Seller Mode) */}
        {activeTab === 'my-listings' && (
          <MyListingsView
            listings={listings.filter((l: Listing) => l.isUserCreated)}
            onSelectListing={(item: Listing) => setDetailModalListing(item)}
            openCreateModal={() => setIsCreateModalOpen(true)}
            onNavigateExplore={() => setActiveTab('home')}
          />
        )}

        {/* Student Profile & Verified Reputation */}
        {activeTab === 'profile' && (
          <ProfileView
            profile={userProfile}
            totalListingsCount={listings.filter((l: Listing) => l.isUserCreated).length}
            totalRequestsCount={tradeRequests.length}
            reviews={reviews}
            savedListings={listings.filter((l: Listing) =>
              (userProfile.savedListingIds || []).includes(l.id)
            )}
            onRoleChange={handleRoleChange}
            onSelectListing={(item: Listing) => setDetailModalListing(item)}
            onReportReview={(id: string) => addToast('info', 'Report Submitted', 'Moderation review underway.')}
            onResetData={() => {
              storageService.resetPrototypeData();
              loadAllData();
              addToast('info', 'Prototype Reset', 'Default mock data reloaded.');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CampusLoop 3.0</span>
            <span>·</span>
            <span>Sustainable Campus Lifestyle & Peer Marketplace</span>
          </div>
          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Persistent Prototype Layer (localStorage) · Ready for Google Firebase Firestore Integration
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Listing Detail Modal */}
      {detailModalListing && (
        <ListingDetailModal
          listing={detailModalListing}
          onClose={() => setDetailModalListing(null)}
          onRequestTrade={(item: Listing) => {
            setDetailModalListing(null);
            setTradeModalListing(item);
          }}
          onToggleSave={handleToggleFavorite}
          isSaved={(userProfile.savedListingIds || []).includes(detailModalListing.id)}
          sellerReviews={reviews.filter((r) => r.revieweeName === detailModalListing.sellerName)}
        />
      )}

      {/* Trade Request Modal */}
      {tradeModalListing && (
        <TradeRequestModal
          listing={tradeModalListing}
          onClose={() => setTradeModalListing(null)}
          onSubmit={handleTradeRequestSubmit}
        />
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onListingCreated={handleCreateListing}
      />

      {/* Review & Reputation Modal */}
      {reviewModalRequest && (
        <ReviewModal
          request={reviewModalRequest}
          currentUserRole={reviewModalRole}
          currentUserName={userProfile.name}
          onClose={() => setReviewModalRequest(null)}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Textbook Edition Checker Modal */}
      <TextbookEditionCheckerModal
        isOpen={isEditionCheckerOpen}
        onClose={() => setIsEditionCheckerOpen(false)}
        onSelectBookForSearch={(bookTitle) => {
          setActiveTab('home');
          setSearchQuery(bookTitle.split(' ')[0]);
        }}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotifRead}
        onMarkAllAsRead={handleMarkAllNotifsRead}
        onClearAll={handleClearNotifs}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
        }}
      />

    </div>
  );
}
