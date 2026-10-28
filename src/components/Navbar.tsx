import React, { useState } from 'react';
import { 
  ShoppingBag, 
  PlusCircle, 
  Compass, 
  ArrowLeftRight, 
  MessageSquare, 
  TrendingDown, 
  Wallet, 
  Gamepad2, 
  User, 
  Menu, 
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Bell,
  RefreshCw,
  HelpCircle,
  Gift,
  BookOpen
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 
  | 'home' 
  | 'explore'
  | 'borrow'
  | 'wanted'
  | 'free'
  | 'pricing' 
  | 'budget' 
  | 'games' 
  | 'chat'
  | 'my-requests' 
  | 'my-listings' 
  | 'profile';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openCreateModal: () => void;
  pendingRequestsCount: number;
  unreadChatCount: number;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenEditionChecker: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCreateModal,
  pendingRequestsCount,
  unreadChatCount,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenEditionChecker,
  userRole,
  onRoleChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const roleLabels: Record<UserRole, { label: string; desc: string; color: string }> = {
    buyer: { label: 'Buyer', desc: 'Browse & Trade', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    seller: { label: 'Seller', desc: 'Manage Listings', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    both: { label: 'Buyer & Seller', desc: 'Full Access', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const canSell = userRole === 'seller' || userRole === 'both';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-indigo-400 flex items-center justify-center text-white shadow-sm shadow-indigo-100 group-hover:scale-105 transition-transform duration-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Campus<span className="text-indigo-600">Loop</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium -mt-1 hidden sm:block">
                  University Lifestyle Hub
                </span>
              </div>
            </button>

            {/* Role Switcher Pill */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleLabels[userRole].color} transition-all hover:shadow-2xs`}
                title="Switch mode without creating another account"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>Mode: {roleLabels[userRole].label}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">Flexible Campus Roles</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Switch mode anytime seamlessly</p>
                  </div>
                  <div className="space-y-1 mt-1">
                    {(['buyer', 'seller', 'both'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          onRoleChange(r);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          userRole === r ? 'bg-indigo-50 font-bold text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="capitalize">{r === 'both' ? 'Buyer & Seller (Both)' : `${r} Mode`}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{roleLabels[r].desc}</div>
                        </div>
                        {userRole === r && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'home'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => handleNavClick('borrow')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'borrow'
                  ? 'bg-teal-50 text-teal-700 font-bold'
                  : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
              <span>Borrow</span>
            </button>

            <button
              onClick={() => handleNavClick('wanted')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'wanted'
                  ? 'bg-amber-50 text-amber-800 font-bold'
                  : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Wanted</span>
            </button>

            <button
              onClick={() => handleNavClick('free')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'free'
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-emerald-600" />
              <span>Free</span>
            </button>

            <button
              onClick={() => handleNavClick('pricing')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'pricing'
                  ? 'bg-sky-50 text-sky-700 font-bold'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50/50'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 text-sky-600" />
              <span>Price Intel</span>
            </button>

            <button
              onClick={() => handleNavClick('budget')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'budget'
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/50'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-purple-600" />
              <span>Budget</span>
            </button>

            <button
              onClick={() => handleNavClick('games')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'games'
                  ? 'bg-rose-50 text-rose-700 font-bold'
                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/50'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Virtual Pet</span>
            </button>

            <button
              onClick={() => handleNavClick('chat')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleNavClick('my-requests')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
                activeTab === 'my-requests'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Requests</span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action Zone: Edition Checker, Notifications, Sell Button, Profile */}
          <div className="flex items-center gap-2">
            
            {/* Textbook Edition Checker Quick Button */}
            <button
              onClick={onOpenEditionChecker}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Check syllabus edition compatibility"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Syllabus Check</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              title="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Create Listing (Seller / Both) */}
            {canSell && (
              <button
                onClick={openCreateModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell Item</span>
              </button>
            )}

            {/* Profile Avatar / Link */}
            <button
              onClick={() => handleNavClick('profile')}
              className={`flex items-center gap-2 p-1.5 rounded-xl transition-all ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 ring-2 ring-indigo-200'
                  : 'hover:bg-slate-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                AT
              </div>
            </button>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          
          <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Role</span>
            <div className="flex gap-1.5">
              {(['buyer', 'seller', 'both'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize font-bold ${
                    userRole === r ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'home' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Marketplace
            </button>
            <button
              onClick={() => handleNavClick('borrow')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'borrow' ? 'bg-teal-50 text-teal-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Borrow Gear
            </button>
            <button
              onClick={() => handleNavClick('wanted')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'wanted' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Wanted Board
            </button>
            <button
              onClick={() => handleNavClick('free')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'free' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Free & Reuse
            </button>
            <button
              onClick={() => handleNavClick('pricing')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'pricing' ? 'bg-sky-50 text-sky-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Price Intel
            </button>
            <button
              onClick={() => handleNavClick('budget')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'budget' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Student Budget
            </button>
            <button
              onClick={() => handleNavClick('games')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'games' ? 'bg-rose-50 text-rose-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Virtual Pet
            </button>
            <button
              onClick={() => handleNavClick('chat')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Chat ({unreadChatCount})
            </button>
            <button
              onClick={() => handleNavClick('my-requests')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'my-requests' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              My Requests
            </button>
            <button
              onClick={() => handleNavClick('profile')}
              className={`p-2.5 rounded-xl text-left ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50'}`}
            >
              Student Profile
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenEditionChecker();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold text-center"
            >
              📖 Textbook Edition Checker
            </button>

            {canSell && (
              <button
                onClick={() => {
                  openCreateModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold text-center shadow-xs"
              >
                + Create New Listing
              </button>
            )}
          </div>

        </div>
      )}
    </header>
  );
};
