import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { Listing, TradeRequest } from '../types';

interface TradeRequestModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSubmit?: (requestData: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>) => void;
  onSubmitRequest?: (requestData: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'>) => void;
}

export const TradeRequestModal: React.FC<TradeRequestModalProps> = ({
  listing,
  onClose,
  onSubmit,
  onSubmitRequest,
}) => {
  if (!listing) return null;

  const [offeredPrice, setOfferedPrice] = useState<string>(listing.price.toString());
  const [buyerName, setBuyerName] = useState('Alex Tan (You)');
  const [buyerContact, setBuyerContact] = useState('012-345-6789');
  const [pickupLocation, setPickupLocation] = useState(listing.campusLocation || listing.location || 'Central Library Foyer');
  const [message, setMessage] = useState(
    `Hi ${listing.sellerName}! I am interested in "${listing.title}". Can we arrange a meetup this week?`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(offeredPrice);

    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Please offer a valid price above RM 0.');
      return;
    }

    if (!buyerContact.trim()) {
      setError('Please provide a contact number or handle for trade coordination.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'> = {
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.imageUrl,
      sellerName: listing.sellerName,
      buyerName: buyerName.trim() || 'Alex Tan',
      buyerContact: buyerContact.trim(),
      offeredPrice: numPrice,
      pickupLocation: pickupLocation || listing.campusLocation || 'Campus Meetup Point',
      message: message.trim(),
    };

    setTimeout(() => {
      if (onSubmit) onSubmit(payload);
      if (onSubmitRequest) onSubmitRequest(payload);
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request to Trade</h3>
              <p className="text-[11px] text-slate-500">Send an offer directly to {listing.sellerName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Listing preview card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              {listing.category} · {listing.condition}
            </span>
            <h4 className="text-xs font-bold text-slate-900 truncate">{listing.title}</h4>
            <div className="text-xs font-black text-slate-800 mt-0.5">
              Listed Price: RM {listing.price.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Your Offered Price (RM) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RM</span>
              <input
                type="number"
                step="0.5"
                min="1"
                required
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Contact (WhatsApp/Phone) *
              </label>
              <input
                type="text"
                required
                value={buyerContact}
                onChange={(e) => setBuyerContact(e.target.value)}
                placeholder="012-345-6789"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Preferred Meetup Spot
              </label>
              <input
                type="text"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Central Library"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to Seller
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-center gap-2 text-[11px] text-indigo-900">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Campus Safe-Trade: Cash or DuitNow upon physical handover and inspection.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Trade Request'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
