import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Package, 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  Heart, 
  Settings, 
  HelpCircle, 
  PlusCircle, 
  Trash2, 
  Building,
  RotateCcw,
  Check,
  AlertCircle,
  Repeat,
  DollarSign,
  AlertTriangle,
  FileText,
  Calendar,
  Edit,
  Eye,
  Info,
  ChevronRight,
  Sparkles,
  LogOut,
  PawPrint,
  ArrowRight
} from 'lucide-react';
import { 
  UserProfile, 
  Listing, 
  TradeRequest, 
  RequestStatus,
  RentalItem,
  RentalRequest,
  RentalStatus,
  DepositStatus,
  UTMUser,
  AccountState
} from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';
import { PetWorldView } from './PetWorldView';

interface MeViewProps {
  profile: UserProfile;
  currentUser?: UTMUser | null;
  accountState?: AccountState;
  listings: Listing[];
  tradeRequests: TradeRequest[];
  savedListings: Listing[];
  rentalItems: RentalItem[];
  rentalRequests: RentalRequest[];
  onSelectListing: (listing: Listing) => void;
  onSelectRentalItem?: (item: RentalItem) => void;
  onOpenCreateModal: () => void;
  onOpenCreateRentalModal: () => void;
  onEditRentalItem: (item: RentalItem) => void;
  onToggleRentalAvailability: (id: string) => void;
  onDeleteRentalItem: (id: string) => void;
  onUpdateTradeStatus: (requestId: string, status: RequestStatus) => void;
  onUpdateRentalStatus: (requestId: string, status: RentalStatus) => void;
  onOpenHandoverModal: (req: RentalRequest) => void;
  onOpenInspectionModal: (req: RentalRequest) => void;
  onOpenDisputeModal: (req: RentalRequest) => void;
  onApproveDepositRefund: (requestId: string, refundAmount: number) => void;
  onConfirmReturn: (requestId: string) => void;
  onRemoveFavorite: (listingId: string) => void;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
  initialSubTab?: string;
  onSignOut?: () => void;
  onOpenAuthModal?: () => void;
  onNavigateToPetWorld?: () => void;
}

type MainTab = 'pet' | 'rentals' | 'listings' | 'purchases' | 'sales' | 'favourites' | 'settings' | 'help';
type RentalFilter = 'all' | 'my-listings' | 'my-requests' | 'renting' | 'rented-out' | 'deposits' | 'guide';

export const MeView: React.FC<MeViewProps> = ({
  profile,
  currentUser,
  accountState = 'Verified UTM Member',
  listings,
  tradeRequests,
  savedListings,
  rentalItems,
  rentalRequests,
  onSelectListing,
  onSelectRentalItem,
  onOpenCreateModal,
  onOpenCreateRentalModal,
  onEditRentalItem,
  onToggleRentalAvailability,
  onDeleteRentalItem,
  onUpdateTradeStatus,
  onUpdateRentalStatus,
  onOpenHandoverModal,
  onOpenInspectionModal,
  onOpenDisputeModal,
  onApproveDepositRefund,
  onConfirmReturn,
  onRemoveFavorite,
  onUpdateProfile,
  onResetData,
  initialSubTab,
  onSignOut,
  onOpenAuthModal,
  onNavigateToPetWorld,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(
    (initialSubTab as MainTab) || 'rentals'
  );
  const [rentalFilter, setRentalFilter] = useState<RentalFilter>('all');
  const [defaultSpot, setDefaultSpot] = useState(profile.dorm || POPULAR_CAMPUS_LOCATIONS[0]);
  const [contactHandle, setContactHandle] = useState(profile.contactHandle || '@alex_tan');
  const [savedSettingsMsg, setSavedSettingsMsg] = useState(false);
  const [resetConfirmMsg, setResetConfirmMsg] = useState(false);

  const isUserSignedIn = Boolean(currentUser) && accountState !== 'Signed Out';
  const effectiveEmail = currentUser?.email || profile.email;
  const effectiveName = currentUser?.name || profile.name;

  // Protected User Data: Cleared when signed out
  const myListings = isUserSignedIn
    ? listings.filter((l) => l.isUserCreated || l.sellerName === effectiveName || (currentUser && l.sellerName === currentUser.name))
    : [];

  const myPurchases = isUserSignedIn
    ? tradeRequests.filter((r) => r.isSentByCurrentUser || (currentUser && r.buyerName === currentUser.name))
    : [];

  const mySales = isUserSignedIn
    ? tradeRequests.filter((r) => !r.isSentByCurrentUser && (r.sellerName === effectiveName || (currentUser && r.sellerName === currentUser.name)))
    : [];

  // --- RENTAL FILTERING (Cleared when signed out) ---
  const myRentalListings = isUserSignedIn
    ? rentalItems.filter((item) => item.isUserCreated || item.ownerName === effectiveName || (currentUser && item.ownerName === currentUser.name))
    : [];

  const myRentalRequests = isUserSignedIn
    ? rentalRequests.filter((r) => r.isSentByCurrentUser || r.renterName === effectiveName || (currentUser && r.renterName === currentUser.name))
    : [];

  const itemsImRenting = isUserSignedIn
    ? myRentalRequests.filter((r) =>
        ['Approved', 'Ready for Handover', 'Rented Out', 'Return Pending', 'Inspection Pending', 'Dispute'].includes(r.status)
      )
    : [];

  const itemsRentedToOthers = isUserSignedIn
    ? rentalRequests.filter(
        (r) => !r.isSentByCurrentUser && (r.ownerName === effectiveName || (currentUser && r.ownerName === currentUser.name))
      )
    : [];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ dorm: defaultSpot, contactHandle });
    setSavedSettingsMsg(true);
    setTimeout(() => setSavedSettingsMsg(false), 2500);
  };

  const handleResetClick = () => {
    if (window.confirm('Reset all prototype listings, rental items, requests, cart, and chats back to fresh sample data?')) {
      onResetData();
      setResetConfirmMsg(true);
      setTimeout(() => setResetConfirmMsg(false), 2500);
    }
  };

  // Helper for Trade status badge
  const getTradeStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending Handover
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Accepted · Ready to Meet
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3" />
            Completed
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            Declined
          </span>
        );
    }
  };

  // Helper for 11 Rental Statuses badge
  const getRentalStatusBadge = (status: RentalStatus) => {
    switch (status) {
      case 'Pending Approval':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Pending Approval
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        );
      case 'Ready for Handover':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            <MapPin className="w-3 h-3" />
            Ready for Handover
          </span>
        );
      case 'Rented Out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <Repeat className="w-3 h-3" />
            Rented Out (Active)
          </span>
        );
      case 'Return Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full">
            <RotateCcw className="w-3 h-3" />
            Return Reported
          </span>
        );
      case 'Inspection Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3" />
            Inspection Pending
          </span>
        );
      case 'Refund Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            <DollarSign className="w-3 h-3" />
            Refund Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3" />
            Completed & Refunded
          </span>
        );
      case 'Dispute':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2.5 py-0.5 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            Dispute Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            Declined
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {status}
          </span>
        );
    }
  };

  // Helper for 5 Deposit Statuses badge
  const getDepositStatusBadge = (status: DepositStatus) => {
    switch (status) {
      case 'Not Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            Deposit: Not Paid
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            Deposit: Held (RM)
          </span>
        );
      case 'Refund Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            Deposit: Refund Pending
          </span>
        );
      case 'Refunded':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
            Deposit: 100% Refunded
          </span>
        );
      case 'Dispute':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md">
            Deposit: In Dispute
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-left space-y-6">
      
      {/* UTM Account State Banner */}
      {!isUserSignedIn ? (
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-6 shadow-md overflow-hidden text-center sm:text-left">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                <User className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl font-bold tracking-tight">You are currently Signed Out</h2>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-blue-100 text-[10px] font-bold">
                    Visitor Mode
                  </span>
                </div>
                <p className="text-xs text-blue-100 max-w-md">
                  Sign in with your approved UTM student (@graduate.utm.my / @student.utm.my) or staff (@utm.my) email to manage listings and active rentals.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UTM Sign In / Register</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-5 sm:p-6 shadow-md overflow-hidden">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white text-blue-700 font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white/80">
                  {effectiveName.split(' ').map(n => n[0]).join('')}
                </div>
                {accountState === 'Verified UTM Member' && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs" title="Verified UTM Member">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {effectiveName}
                  </h1>
                  {accountState === 'Verified UTM Member' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      Verified UTM Member
                    </span>
                  ) : accountState === 'Email Verification Pending' ? (
                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/30 text-amber-100 border border-amber-400/50 text-[10px] font-bold hover:bg-amber-400/40 transition-colors"
                      title="Click to enter verification code"
                    >
                      <Clock className="w-3 h-3" />
                      Email Verification Pending (Verify Now)
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-400/30 text-rose-100 border border-rose-400/50 text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      Account Suspended
                    </span>
                  )}
                </div>
                <p className="text-xs text-blue-100 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-200" />
                  <span>{effectiveEmail}</span>
                </p>
                <p className="text-xs text-blue-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-200" />
                  <span>{currentUser?.faculty || profile.faculty} · ID: {currentUser?.studentId || profile.studentId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={onOpenCreateRentalModal}
                disabled={accountState === 'Suspended'}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 ${
                  accountState === 'Suspended' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Repeat className="w-4 h-4 text-blue-600" />
                <span>List for Rent</span>
              </button>
              <button
                type="button"
                onClick={onOpenCreateModal}
                disabled={accountState === 'Suspended'}
                className={`flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-blue-800/80 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm border border-blue-400/30 transition-all flex items-center justify-center gap-1.5 ${
                  accountState === 'Suspended' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell Item</span>
              </button>
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition-all flex items-center justify-center gap-1.5"
                  title="Sign out of your UTM account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Suspended Alert Notice */}
      {isUserSignedIn && accountState === 'Suspended' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block font-bold text-rose-950">UTM Account Suspended</strong>
            <p className="text-slate-600 leading-relaxed">
              This UTM account has been suspended by campus administration. Creating listings, submitting rental bookings, making purchase offers, and sending messages are blocked.
            </p>
          </div>
        </div>
      )}

      {/* Pet Corner Section directly inside Profile */}
      <div 
        onClick={() => setActiveMainTab('pet')}
        className={`relative overflow-hidden rounded-3xl p-5 shadow-xs transition-all cursor-pointer group ${
          activeMainTab === 'pet'
            ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md ring-2 ring-pink-300'
            : 'bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 border border-pink-200/80 hover:border-pink-300 text-slate-800'
        }`}
      >
        <div className="absolute right-0 top-0 -mr-6 -mt-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none group-hover:scale-110 transition-transform" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 group-hover:scale-105 transition-transform ${
              activeMainTab === 'pet' ? 'bg-white/20 backdrop-blur-xs text-white' : 'bg-pink-500 text-white shadow-pink-200'
            }`}>
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black tracking-wider uppercase ${activeMainTab === 'pet' ? 'text-pink-100' : 'text-pink-600'}`}>
                  My Little Buddy
                </span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  activeMainTab === 'pet' ? 'bg-white text-pink-700' : 'bg-pink-100 text-pink-700'
                }`}>
                  PET CORNER
                </span>
              </div>
              <h3 className={`text-lg font-black tracking-tight mt-0.5 ${activeMainTab === 'pet' ? 'text-white' : 'text-slate-900'}`}>
                Pet Corner — Your Campus Companion
              </h3>
              <p className={`text-xs mt-0.5 ${activeMainTab === 'pet' ? 'text-pink-100' : 'text-slate-600'}`}>
                Adopt 18+ plush cartoon animals, create custom head pets, feed, bathe, play mini-games, and collect Pet Points!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMainTab('pet');
              }}
              className={`px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeMainTab === 'pet'
                  ? 'bg-white text-pink-700 hover:bg-pink-50'
                  : 'bg-pink-500 hover:bg-pink-600 text-white'
              }`}
            >
              <span>{activeMainTab === 'pet' ? 'Viewing Pet Corner' : 'Open Pet Corner'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Sub-Tabs */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
        {/* PET CORNER SUBTAB */}
        <button
          onClick={() => setActiveMainTab('pet')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'pet'
              ? 'bg-pink-500 text-white shadow-xs font-bold'
              : 'text-pink-600 hover:text-pink-700 hover:bg-pink-50/70'
          }`}
        >
          <PawPrint className="w-4 h-4" />
          <span className="truncate">Pet Corner</span>
        </button>

        <button
          onClick={() => setActiveMainTab('rentals')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'rentals'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span className="truncate">Rentals Hub</span>
        </button>

        <button
          onClick={() => setActiveMainTab('listings')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'listings'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="truncate">My Sales ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('purchases')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'purchases'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="truncate">Buy Requests ({myPurchases.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('sales')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'sales'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="truncate">Sale Offers ({mySales.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('favourites')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'favourites'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span className="truncate">Saved ({savedListings.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('settings')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'settings'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setActiveMainTab('help')}
          className={`py-2 px-1 rounded-xl transition-all text-center flex flex-col items-center gap-1 ${
            activeMainTab === 'help'
              ? 'bg-white text-blue-600 shadow-xs font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 0: PET CORNER (MY LITTLE BUDDY INSIDE PROFILE) */}
      {/* ============================================================== */}
      {activeMainTab === 'pet' && (
        <div className="space-y-6">
          <PetWorldView currentUser={currentUser} />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: RENTALS HUB (COMPLETE 6 RENTAL SECTIONS) */}
      {/* ============================================================== */}
      {activeMainTab === 'rentals' && (
        <div className="space-y-6">
          {/* Header & Rental Filter Pills */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Repeat className="w-5 h-5 text-blue-600" />
                  <span>Peer Rental Management</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Track your listed rental gear, active borrowings, return inspections, and security deposit refunds.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenCreateRentalModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ List an Item for Rent</span>
              </button>
            </div>

            {/* 6 Sub-Sections Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold no-scrollbar">
              <button
                type="button"
                onClick={() => setRentalFilter('all')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'all'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('my-listings')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'my-listings'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                My Rental Listings ({myRentalListings.length})
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('my-requests')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'my-requests'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                My Rental Requests ({myRentalRequests.length})
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('renting')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'renting'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Items I'm Renting ({itemsImRenting.length})
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('rented-out')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'rented-out'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Items Rented to Others ({itemsRentedToOthers.length})
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('deposits')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'deposits'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Deposit Records
              </button>
              <button
                type="button"
                onClick={() => setRentalFilter('guide')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  rentalFilter === 'guide'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Return & Refund Guide
              </button>
            </div>
          </div>

          {/* SECTION 1: MY RENTAL LISTINGS */}
          {(rentalFilter === 'all' || rentalFilter === 'my-listings') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    My Rental Listings ({myRentalListings.length})
                  </h3>
                  <p className="text-xs text-slate-500">Items you have made available for fellow students to rent.</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenCreateRentalModal}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ List for Rent</span>
                </button>
              </div>

              {myRentalListings.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                  <Repeat className="w-10 h-10 text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">No rental listings created</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Have a scientific calculator, DSLR camera, badminton racket, or projector? Earn daily rental cash while helping other students!
                  </p>
                  <button
                    type="button"
                    onClick={onOpenCreateRentalModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    + List Your First Rental Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {myRentalListings.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-blue-600 uppercase truncate">
                              {item.category}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.isAvailable 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}>
                              {item.isAvailable ? 'Available' : 'Paused / Rented'}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-black text-blue-700">
                              RM {item.pricePerDay.toFixed(2)}
                              <span className="text-[10px] text-slate-400 font-normal"> /day</span>
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              Deposit: RM {item.securityDeposit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1 truncate max-w-[180px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.pickupLocation}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Toggle Active / Pause */}
                          <button
                            type="button"
                            onClick={() => onToggleRentalAvailability(item.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                              item.isAvailable
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            }`}
                            title={item.isAvailable ? 'Pause listing visibility' : 'Reactivate listing'}
                          >
                            {item.isAvailable ? 'Pause' : 'Activate'}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEditRentalItem(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 border border-slate-200"
                            title="Edit listing details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                                onDeleteRentalItem(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-slate-200"
                            title="Delete listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: MY RENTAL REQUESTS (SENT BY USER) */}
          {(rentalFilter === 'all' || rentalFilter === 'my-requests') && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  My Rental Requests ({myRentalRequests.length})
                </h3>
                <p className="text-xs text-slate-500">Rentals you have requested to borrow from other campus owners.</p>
              </div>

              {myRentalRequests.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
                  <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">No rental requests sent</p>
                  <p className="text-xs text-slate-500">Browse the Rent tab to borrow calculators, cameras, projectors, or gear.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRentalRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={req.rentalItemImage} alt={req.rentalItemName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{req.rentalItemName}</h4>
                            <p className="text-xs text-slate-500">
                              Owner: <strong>{req.ownerName}</strong> &bull; Pickup: <strong>{req.pickupLocation}</strong>
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs font-black text-blue-700">
                                Fee: RM {req.rentalFeeTotal.toFixed(2)} ({req.days} days)
                              </span>
                              <span className="text-xs font-semibold text-slate-600">
                                + Deposit: RM {req.securityDeposit.toFixed(2)}
                              </span>
                              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                Total: RM {req.totalBeforeRental.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-1.5">
                          {getRentalStatusBadge(req.status)}
                          {getDepositStatusBadge(req.depositStatus)}
                        </div>
                      </div>

                      {/* Date details and notes */}
                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2 border border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Rental Period: <strong>{req.startDate}</strong> to <strong>{req.returnDate}</strong></span>
                        </div>
                        <span className="text-[11px] text-slate-400">Created {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* Renter Actions */}
                      {req.status === 'Rented Out' && (
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs text-emerald-900">
                            <strong>Item in your possession.</strong> Remember to return on or before {req.returnDate} at {req.pickupLocation}.
                          </div>
                          <button
                            type="button"
                            onClick={() => onConfirmReturn(req.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Confirm Return to Owner</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'Inspection Pending' && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Return handed over. Waiting for owner to inspect item and release your deposit refund.</span>
                        </div>
                      )}

                      {req.status === 'Dispute' && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="text-xs text-rose-900">
                            <strong>Deduction proposed by owner:</strong> {req.disputeNotes || req.deductionReason}
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenDisputeModal(req)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Review & Settle Dispute</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'Completed' && req.refundAmount !== undefined && (
                        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Rental finished! Deposit refund of <strong>RM {req.refundAmount.toFixed(2)}</strong> processed successfully.
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: ITEMS I'M RENTING (ACTIVE AS RENTER) */}
          {(rentalFilter === 'all' || rentalFilter === 'renting') && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-blue-600" />
                  <span>Items I'm Renting ({itemsImRenting.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Currently active rentals you are using on campus.</p>
              </div>

              {itemsImRenting.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-1">
                  <p className="text-xs text-slate-500">You currently have no active borrowed items.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsImRenting.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border border-blue-200 shadow-2xs space-y-3 text-left ring-2 ring-blue-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={req.rentalItemImage} alt={req.rentalItemName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{req.rentalItemName}</h4>
                            <p className="text-xs text-slate-500">Owner: {req.ownerName} &bull; Return by: <strong>{req.returnDate}</strong></p>
                          </div>
                        </div>
                        {getRentalStatusBadge(req.status)}
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100 flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>Return Location: <strong>{req.pickupLocation}</strong></span>
                        </div>

                        {req.status === 'Rented Out' && (
                          <button
                            type="button"
                            onClick={() => onConfirmReturn(req.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Confirm Return Now</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 4: ITEMS RENTED TO OTHERS (AS OWNER) */}
          {(rentalFilter === 'all' || rentalFilter === 'rented-out') && (
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Items Rented to Others ({itemsRentedToOthers.length})</span>
                </h3>
                <p className="text-xs text-slate-500">Incoming rental requests and active items you lent to classmates.</p>
              </div>

              {itemsRentedToOthers.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 text-center space-y-1">
                  <p className="text-xs text-slate-500">No classmate rental requests received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {itemsRentedToOthers.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3 text-left"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                            <img src={req.rentalItemImage} alt={req.rentalItemName} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{req.rentalItemName}</h4>
                            <p className="text-xs text-slate-500">
                              Renter: <strong>{req.renterName}</strong> ({req.renterContact})
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs">
                              <span className="font-bold text-blue-700">Earnings: RM {req.rentalFeeTotal.toFixed(2)}</span>
                              <span className="text-slate-400">&bull;</span>
                              <span className="text-slate-600">Deposit: RM {req.securityDeposit.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-start sm:items-end gap-1">
                          {getRentalStatusBadge(req.status)}
                          {getDepositStatusBadge(req.depositStatus)}
                        </div>
                      </div>

                      {/* Status-specific action buttons for owner */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                        {req.status === 'Pending Approval' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onUpdateRentalStatus(req.id, 'Approved')}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                            >
                              Accept Rental
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateRentalStatus(req.id, 'Rejected')}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'Approved' && (
                          <button
                            type="button"
                            onClick={() => onOpenHandoverModal(req)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Record Handover Condition (Step 6)</span>
                          </button>
                        )}

                        {req.status === 'Ready for Handover' && (
                          <button
                            type="button"
                            onClick={() => onOpenHandoverModal(req)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Confirm Handover & Set Rented Out</span>
                          </button>
                        )}

                        {req.status === 'Rented Out' && (
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Currently with renter. Due date: {req.returnDate}</span>
                          </div>
                        )}

                        {(req.status === 'Return Pending' || req.status === 'Inspection Pending') && (
                          <button
                            type="button"
                            onClick={() => onOpenInspectionModal(req)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Inspect Returned Item & Settle Deposit</span>
                          </button>
                        )}

                        {req.status === 'Refund Pending' && (
                          <button
                            type="button"
                            onClick={() => onApproveDepositRefund(req.id, req.refundAmount ?? req.securityDeposit)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve Deposit Refund (RM {(req.refundAmount ?? req.securityDeposit).toFixed(2)})</span>
                          </button>
                        )}

                        {req.status === 'Dispute' && (
                          <button
                            type="button"
                            onClick={() => onOpenDisputeModal(req)}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Manage / Settle Dispute</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: DEPOSIT RECORDS (LEDGER) */}
          {(rentalFilter === 'all' || rentalFilter === 'deposits') && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    <span>Security Deposit Records</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent tracking of refundable deposits held and returned between students.
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                  Prototype Peer Tracking
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Item</th>
                        <th className="p-3">Party</th>
                        <th className="p-3">Rental Fee</th>
                        <th className="p-3">Security Deposit</th>
                        <th className="p-3">Deposit Status</th>
                        <th className="p-3">Refund Amount</th>
                        <th className="p-3">Inspection Baseline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rentalRequests.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-400">
                            No deposit transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        rentalRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3 font-semibold text-slate-900 whitespace-nowrap">
                              {req.rentalItemName}
                            </td>
                            <td className="p-3 text-slate-600 whitespace-nowrap">
                              {req.isSentByCurrentUser ? `Owner: ${req.ownerName}` : `Renter: ${req.renterName}`}
                            </td>
                            <td className="p-3 font-bold text-blue-700 whitespace-nowrap">
                              RM {req.rentalFeeTotal.toFixed(2)}
                            </td>
                            <td className="p-3 font-black text-slate-900 whitespace-nowrap">
                              RM {req.securityDeposit.toFixed(2)}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {getDepositStatusBadge(req.depositStatus)}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              {req.refundAmount !== undefined ? (
                                <span className="font-bold text-emerald-700">
                                  RM {req.refundAmount.toFixed(2)}
                                </span>
                              ) : req.proposedDeduction ? (
                                <span className="text-rose-600 font-semibold">
                                  Deduction RM {req.proposedDeduction}
                                </span>
                              ) : (
                                <span className="text-slate-400">&mdash;</span>
                              )}
                            </td>
                            <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                              {req.returnConditionNotes || req.handoverConditionNotes || 'Pending inspection'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: RETURN AND REFUND STATUS WORKFLOW GUIDE */}
          {(rentalFilter === 'all' || rentalFilter === 'guide') && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-4 text-left">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    How Return & Security Deposit Refund Works
                  </h3>
                  <p className="text-xs text-slate-500">11 clear steps designed to protect both renters and equipment owners</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-blue-700">1. Browse & Request</div>
                  <p className="text-slate-600">Renter picks dates and reviews the clear cost breakdown (daily rate × days + deposit).</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-blue-700">2. Owner Approval</div>
                  <p className="text-slate-600">Owner accepts request; dates are blocked to avoid double booking.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-blue-700">3. Handover & Condition Baseline</div>
                  <p className="text-slate-600">Both students meet on campus. Owner inspects and records working condition notes.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-blue-700">4. Rented Out Period</div>
                  <p className="text-slate-600">Renter uses equipment safely. Deposit remains securely held in peer escrow.</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                  <div className="font-bold text-blue-700">5. Campus Return & Inspection</div>
                  <p className="text-slate-600">Renter returns item. Owner compares against handover condition notes.</p>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/70 space-y-1">
                  <div className="font-bold text-emerald-800">6. Full Deposit Refund</div>
                  <p className="text-emerald-700">When returned in agreed condition, owner approves 100% refund immediately.</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Campus Dispute Protection:</strong> If any item is damaged or missing accessories, the owner initiates a transparent dispute with itemized proposed deductions. Both students agree before finalizing.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MY LISTINGS (SELL) */}
      {/* ============================================================== */}
      {activeMainTab === 'listings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                My Active Sale Listings ({myListings.length})
              </h2>
              <p className="text-xs text-slate-500">Items you are selling to students across campus.</p>
            </div>
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ List New Item</span>
            </button>
          </div>

          {myListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">You haven't listed any items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Turn your used textbooks, electronics, or dorm gear into extra cash for the semester!
              </p>
              <button
                onClick={onOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                + Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {myListings.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectListing(item)}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xs transition-all flex items-center gap-3 cursor-pointer group text-left"
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {item.category} · {item.condition}
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-blue-600">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-black text-blue-700">
                        RM {item.price.toFixed(2)}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: BUY REQUESTS (PURCHASES) */}
      {/* ============================================================== */}
      {activeMainTab === 'purchases' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              My Sent Purchase & Handover Requests ({myPurchases.length})
            </h2>
            <p className="text-xs text-slate-500">Track negotiations and meetup arrangements with sellers.</p>
          </div>

          {myPurchases.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
              <ArrowLeftRight className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No purchase requests sent yet</p>
              <p className="text-xs text-slate-500">Add products to your cart or enquire directly on any item.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myPurchases.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2.5 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                        <img src={req.listingImage} alt={req.listingTitle} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{req.listingTitle}</h4>
                        <p className="text-xs text-slate-500">Seller: {req.sellerName} · Offered: <strong className="text-blue-700">RM {req.offeredPrice.toFixed(2)}</strong></p>
                      </div>
                    </div>
                    {getTradeStatusBadge(req.status)}
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Meetup: <strong>{req.pickupLocation}</strong></span>
                    </div>
                    <span className="text-[11px] text-slate-400">Sent {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>

                  {req.message && (
                    <p className="text-xs text-slate-600 italic bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      "{req.message}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SALE OFFERS */}
      {/* ============================================================== */}
      {activeMainTab === 'sales' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Incoming Student Trade Offers ({mySales.length})
            </h2>
            <p className="text-xs text-slate-500">Offers and campus meetup requests from fellow students for your items.</p>
          </div>

          {mySales.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
              <Clock className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No incoming sales requests</p>
              <p className="text-xs text-slate-500">When classmates send trade requests for your listings, they will show up here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySales.map((req) => (
                <div
                  key={req.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{req.listingTitle}</h4>
                      <p className="text-xs text-slate-500">Buyer: {req.buyerName} ({req.buyerContact})</p>
                      <p className="text-xs font-bold text-blue-700 mt-0.5">Offered RM {req.offeredPrice.toFixed(2)}</p>
                    </div>
                    {getTradeStatusBadge(req.status)}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Meetup Spot: {req.pickupLocation}</span>
                  </div>

                  {/* Actions */}
                  {req.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onUpdateTradeStatus(req.id, 'Accepted')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                      >
                        Accept Offer
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateTradeStatus(req.id, 'Rejected')}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {req.status === 'Accepted' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onUpdateTradeStatus(req.id, 'Completed')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                      >
                        Mark Handover Completed
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: FAVOURITES */}
      {/* ============================================================== */}
      {activeMainTab === 'favourites' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Saved Favourites ({savedListings.length})
            </h2>
            <p className="text-xs text-slate-500">Items you saved for quick access later.</p>
          </div>

          {savedListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
              <Heart className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-800">No saved favourites yet</p>
              <p className="text-xs text-slate-500">Tap the heart icon on any product card to bookmark it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedListings.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div 
                    onClick={() => onSelectListing(item)}
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{item.title}</h4>
                      <p className="text-xs font-bold text-blue-700">RM {item.price.toFixed(2)}</p>
                      <span className="text-[10px] text-slate-400">{item.campusLocation || item.location}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50"
                    title="Remove from favourites"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: SETTINGS */}
      {/* ============================================================== */}
      {activeMainTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Campus Account Settings</h2>
            <p className="text-xs text-slate-500">Set your default meetup location and contact info.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Default Campus Handover Spot
              </label>
              <select
                value={defaultSpot}
                onChange={(e) => setDefaultSpot(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Contact Handle (Telegram / WhatsApp)
              </label>
              <input
                type="text"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {savedSettingsMsg && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved successfully!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200"
              >
                Save Preferences
              </button>
            </div>
          </form>

          {/* Account Security & Sign Out Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">UTM Account & Security</h3>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Authenticated Email:</span>
                <span className="font-bold text-slate-800">{effectiveEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Account State:</span>
                <span className="font-bold text-emerald-700">{accountState}</span>
              </div>
            </div>

            {onSignOut && isUserSignedIn && (
              <button
                type="button"
                onClick={onSignOut}
                className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of UTM Account</span>
              </button>
            )}

            {!isUserSignedIn && onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Sign In with UTM Email</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: HELP & SAFETY */}
      {/* ============================================================== */}
      {activeMainTab === 'help' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Campus Safety Guidelines & FAQs</span>
            </h2>

            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100">
                <strong className="block font-bold text-blue-900 mb-1">🏛️ Designated Safe Handover Zones:</strong>
                <span>We strongly recommend arranging handovers at well-lit public campus hubs: Central Library Foyer, Student Activity Centre (SAC), Faculty Cafeterias, or Residential College Administration Lobbies.</span>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <strong className="block font-bold text-emerald-900 mb-1">🔍 Peer Rental Inspection:</strong>
                <span>Always inspect rental equipment together during the handover step. Take 2 minutes to verify charging cables and test power on before parting ways.</span>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-100">
                <strong className="block font-bold text-amber-900 mb-1">💸 100% Refundable Security Deposit:</strong>
                <span>Security deposits are held in peer escrow and fully refunded by the equipment owner once the item is returned on time in working condition.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action: Reset Prototype Data */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">CampusLoop Prototype v4.0 · Student Peer Marketplace</span>
        <button
          type="button"
          onClick={handleResetClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Sample Data</span>
        </button>
      </div>
      {resetConfirmMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs text-center border border-emerald-200">
          Sample data reset successfully!
        </div>
      )}
    </div>
  );
};
