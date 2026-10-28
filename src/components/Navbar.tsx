import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  Store, 
  Repeat, 
  MessageSquare, 
  User, 
  ShoppingBag, 
  PlusCircle, 
  Bell,
  ShieldCheck,
  Clock,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { AccountState, UTMUser } from '../types';

export type NavTab = 'home' | 'cart' | 'mall' | 'rent' | 'chat' | 'me';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  openCreateModal: () => void;
  openCreateRentalModal?: () => void;
  cartCount: number;
  unreadChatCount: number;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  accountState?: AccountState;
  currentUser?: UTMUser | null;
  onOpenAuthModal?: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openCreateModal,
  openCreateRentalModal,
  cartCount,
  unreadChatCount,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  accountState = 'Signed Out',
  currentUser,
  onOpenAuthModal,
  onSignOut,
}) => {
  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Top Header for Desktop & Mobile */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-15 gap-3">
            
            {/* CampusLoop Logo */}
            <button
              type="button"
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-200 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    Campus<span className="text-blue-600">Loop</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded-md">
                    UTM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium -mt-0.5 hidden sm:block">
                  Universiti Teknologi Malaysia Student Marketplace
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links (6 Tabs in exact order) */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleNavClick('home')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'home'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('cart')}
                className={`px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'cart'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('mall')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'mall'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Mall
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('rent')}
                className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeTab === 'rent'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Rent</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('chat')}
                className={`px-3 py-2 rounded-xl transition-all relative flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>Chat</span>
                {unreadChatCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {unreadChatCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavClick('me')}
                className={`px-3 py-2 rounded-xl transition-all ${
                  activeTab === 'me'
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Me
              </button>
            </nav>

            {/* Actions: UTM Account Status, Notifications, Sell/Rent Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* UTM Authentication Status Badge */}
              {currentUser && accountState === 'Verified UTM Member' ? (
                <div 
                  onClick={() => handleNavClick('me')}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-colors"
                  title={`Signed in as ${currentUser.name} (${currentUser.email})`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="truncate max-w-[130px]">{currentUser.name.split(' ')[0]} (UTM Verified)</span>
                </div>
              ) : currentUser && accountState === 'Email Verification Pending' ? (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                  title="Click to complete UTM email verification"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Verify Email</span>
                </button>
              ) : currentUser && accountState === 'Suspended' ? (
                <div 
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold"
                  title="Account is suspended"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Suspended</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuthModal}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>UTM Sign In</span>
                </button>
              )}

              {/* Notification Bell */}
              {onOpenNotifications && (
                <button
                  type="button"
                  onClick={onOpenNotifications}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  title="View campus notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>
              )}

              {/* Action Buttons */}
              <button
                type="button"
                onClick={openCreateModal}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                title="Sell an item"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Sell</span>
              </button>

              {openCreateRentalModal && (
                <button
                  type="button"
                  onClick={openCreateRentalModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-sm shadow-blue-200 transition-all cursor-pointer"
                  title="List an item for rent"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>List for Rent</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (Exact 6 tabs: Home, Cart, Mall, Rent, Chat, Me) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
        <div className="grid grid-cols-6 h-15.5 px-1 py-1">
          {/* TAB 1: HOME */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
              activeTab === 'home'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* TAB 2: CART */}
          <button
            type="button"
            onClick={() => handleNavClick('cart')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all relative ${
              activeTab === 'cart'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Cart</span>
          </button>

          {/* TAB 3: MALL */}
          <button
            type="button"
            onClick={() => handleNavClick('mall')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
              activeTab === 'mall'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Mall</span>
          </button>

          {/* TAB 4: RENT */}
          <button
            type="button"
            onClick={() => handleNavClick('rent')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
              activeTab === 'rent'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <Repeat className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Rent</span>
          </button>

          {/* TAB 5: CHAT */}
          <button
            type="button"
            onClick={() => handleNavClick('chat')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all relative ${
              activeTab === 'chat'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-2.5 px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[9px] font-bold">
                  {unreadChatCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Chat</span>
          </button>

          {/* TAB 6: ME */}
          <button
            type="button"
            onClick={() => handleNavClick('me')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl transition-all ${
              activeTab === 'me'
                ? 'text-blue-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Me</span>
          </button>
        </div>
      </nav>
    </>
  );
};
