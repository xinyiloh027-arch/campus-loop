import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  MapPin, 
  ShieldCheck, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  X,
  Store
} from 'lucide-react';
import { CartItem, Listing } from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';

interface CartViewProps {
  cart: CartItem[];
  onToggleSelect: (listingId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onUpdateQuantity: (listingId: string, quantity: number) => void;
  onRemoveItem: (listingId: string) => void;
  onSelectListing: (listing: Listing) => void;
  onNavigateMall: () => void;
  onCheckoutSubmit: (selectedItems: CartItem[], handoverLocation: string, preferredTime: string, notes: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onToggleSelect,
  onSelectAll,
  onUpdateQuantity,
  onRemoveItem,
  onSelectListing,
  onNavigateMall,
  onCheckoutSubmit,
}) => {
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [handoverLocation, setHandoverLocation] = useState(POPULAR_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [preferredTime, setPreferredTime] = useState('Tomorrow after 2:00 PM');
  const [notes, setNotes] = useState('Hi! I would like to arrange a campus handover. Can pay with DuitNow QR or cash.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItems = cart.filter((item) => item.selected);
  const allSelected = cart.length > 0 && selectedItems.length === cart.length;

  const subtotal = selectedItems.reduce((acc, item) => {
    return acc + (item.listing.price * item.quantity);
  }, 0);

  const handleStartCheckout = () => {
    if (selectedItems.length === 0) return;
    setIsHandoverModalOpen(true);
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalLocation = handoverLocation === 'Other' ? (customLocation.trim() || 'Campus Foyer') : handoverLocation;

    setTimeout(() => {
      onCheckoutSubmit(selectedItems, finalLocation, preferredTime, notes);
      setIsSubmitting(false);
      setIsHandoverModalOpen(false);
    }, 400);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Campus Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Explore textbooks, electronics, and dorm essentials listed by fellow university students.
        </p>
        <button
          onClick={onNavigateMall}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-200 transition-all"
        >
          <Store className="w-4 h-4" />
          <span>Browse CampusLoop Mall</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-left space-y-5">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>Shopping Cart</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Peer-to-peer campus marketplace. Select items to arrange meetups.
          </p>
        </div>

        {/* Select All on Top for quick mobile action */}
        <button
          type="button"
          onClick={() => onSelectAll(!allSelected)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4 text-blue-600" />
          ) : (
            <Square className="w-4 h-4 text-slate-400" />
          )}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>
      </div>

      {/* Student Peer-to-Peer Important Notice Banner */}
      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200/70 text-xs text-blue-950 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-bold">Student-to-Student Handover:</strong> CampusLoop does not process credit card fees. Proceeding allows you to send a purchase enquiry to the seller to arrange a safe campus meetup and pay directly via DuitNow QR or cash.
        </div>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3">
        {cart.map((item) => {
          const listing = item.listing;
          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                item.selected 
                  ? 'border-blue-300 ring-1 ring-blue-100' 
                  : 'border-slate-200 opacity-90'
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleSelect(item.listingId)}
                  className="mt-1 sm:mt-0 text-blue-600 p-1 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
                  aria-label={item.selected ? 'Deselect item' : 'Select item'}
                >
                  {item.selected ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {/* Product Thumbnail */}
                <div 
                  onClick={() => onSelectListing(listing)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                    {listing.category} · {listing.condition}
                  </span>
                  <h3 
                    onClick={() => onSelectListing(listing)}
                    className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors truncate"
                  >
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{listing.campusLocation || listing.location || 'Campus'}</span>
                    <span>·</span>
                    <span className="text-slate-600 font-medium">Seller: {listing.sellerName.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Price & Quantity & Remove */}
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                {/* Price */}
                <div className="text-left sm:text-right">
                  <div className="text-sm sm:text-base font-bold text-blue-700 tabular-nums">
                    RM {(listing.price * item.quantity).toFixed(2)}
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-[10px] text-slate-400">
                      RM {listing.price.toFixed(2)} each
                    </div>
                  )}
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.listingId, item.quantity - 1)}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-colors"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-800 tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.listingId, item.quantity + 1)}
                    className="p-1 rounded-lg text-slate-600 hover:bg-white hover:text-blue-600 transition-colors"
                    title="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.listingId)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Remove from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary & Sticky Checkout Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
          <span>Selected items ({selectedItems.length}):</span>
          <span className="font-semibold text-slate-900">{selectedItems.length} items</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div>
            <span className="text-xs text-slate-500 block">Estimated Handover Total</span>
            <div className="text-xl sm:text-2xl font-black text-blue-700 tabular-nums">
              RM {subtotal.toFixed(2)}
            </div>
          </div>

          <button
            type="button"
            disabled={selectedItems.length === 0}
            onClick={handleStartCheckout}
            className={`py-3 px-5 sm:px-7 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md ${
              selectedItems.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <span>Proceed to Handover Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Handover Enquiry Modal */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Campus Handover Request</h3>
                  <span className="text-[11px] text-slate-500">Prototype Peer Enquiry Flow</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmHandover} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Preferred Campus Meetup Spot *
                </label>
                <select
                  value={handoverLocation}
                  onChange={(e) => setHandoverLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs sm:text-sm"
                >
                  {POPULAR_CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {handoverLocation === 'Other' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Specify Custom Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g., Faculty of Arts Gazebo, College 12 Lobby"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Preferred Date & Time *
                </label>
                <input
                  type="text"
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  placeholder="e.g. Tomorrow 2:30 PM after lecture"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Message to Seller(s)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm resize-none"
                />
              </div>

              {/* Order Breakdown */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                <div className="font-bold text-slate-700">Enquiry Summary ({selectedItems.length} items):</div>
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[220px]">{item.listing.title} x{item.quantity}</span>
                    <span className="font-semibold text-slate-900">RM {(item.listing.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-blue-700">
                  <span>Total Amount for Handover:</span>
                  <span>RM {subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHandoverModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Send Handover Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
