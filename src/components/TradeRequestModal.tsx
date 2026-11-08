import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  MapPin, 
  DollarSign, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle,
  Package,
  Layers
} from 'lucide-react';
import { Listing, TradeRequest } from '../types';

interface TradeRequestModalProps {
  listing: Listing | null;
  onClose: () => void;
  onSubmit?: (requestData: Omit<TradeRequest, 'id' | 'createdAt' | 'status' | 'isSentByCurrentUser'> & {
    quantity: number;
    totalPrice: number;
    status: TradeRequest['status'];
  }) => void;
  onSubmitRequest?: (requestData: any) => void;
  currentUserName?: string;
  currentUserEmail?: string;
}

export const TradeRequestModal: React.FC<TradeRequestModalProps> = ({
  listing,
  onClose,
  onSubmit,
  onSubmitRequest,
  currentUserName = 'UTM Student',
  currentUserEmail = '',
}) => {
  if (!listing) return null;

  const remainingQty = typeof listing.remainingQuantity === 'number'
    ? listing.remainingQuantity
    : (listing.status === 'Sold' ? 0 : (listing.originalQuantity || 1));

  const maxAvailable = Math.max(1, remainingQty);

  const [requestedQty, setRequestedQty] = useState<number>(1);
  const [offeredUnitPrice, setOfferedUnitPrice] = useState<string>(listing.price.toString());
  const [buyerName, setBuyerName] = useState(currentUserName);
  const [buyerContact, setBuyerContact] = useState(currentUserEmail || '012-345-6789');
  const [pickupLocation, setPickupLocation] = useState(listing.campusLocation || listing.location || 'Central Library Foyer');
  const [message, setMessage] = useState(
    `Hi ${listing.sellerName}! I would like to buy this item. When are you free to meet on campus?`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedUnitPrice = parseFloat(offeredUnitPrice) || listing.price;
  const calculatedTotal = parsedUnitPrice * requestedQty;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (remainingQty <= 0) {
      setError('Sorry, this product is currently sold out.');
      return;
    }

    if (isNaN(requestedQty) || requestedQty < 1) {
      setError('Please request at least 1 unit.');
      return;
    }

    if (requestedQty > remainingQty) {
      setError(`Cannot request ${requestedQty} units. Only ${remainingQty} unit(s) are available in stock.`);
      return;
    }

    if (isNaN(parsedUnitPrice) || parsedUnitPrice <= 0) {
      setError('Please specify a valid price above RM 0.');
      return;
    }

    if (!buyerContact.trim()) {
      setError('Please provide a WhatsApp or phone contact for trade coordination.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingImage: listing.imageUrl,
      sellerName: listing.sellerName,
      sellerId: listing.sellerId,
      buyerName: buyerName.trim() || currentUserName,
      buyerContact: buyerContact.trim(),
      quantity: requestedQty,
      offeredPrice: parsedUnitPrice,
      totalPrice: calculatedTotal,
      pickupLocation: pickupLocation || listing.campusLocation || 'Campus Meetup Point',
      message: message.trim(),
      status: 'Pending Seller Response' as const,
    };

    setTimeout(() => {
      if (onSubmit) onSubmit(payload as any);
      if (onSubmitRequest) onSubmitRequest(payload);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150 text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request to Purchase</h3>
              <p className="text-[11px] text-slate-500">Send an order request to seller {listing.sellerName}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product summary card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                {listing.category} · {listing.condition}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {remainingQty} available
              </span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{listing.title}</h4>
            <div className="text-xs font-black text-slate-800 mt-1 flex items-baseline gap-1">
              <span>Unit Price:</span>
              <span className="text-blue-700">RM {listing.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quantity Selector and Total Calculation */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Quantity to Buy *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  step="1"
                  required
                  value={requestedQty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setRequestedQty(Math.max(1, Math.min(val, maxAvailable)));
                    } else {
                      setRequestedQty(1);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Max available: {remainingQty}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Total Payment (RM)
              </label>
              <div className="h-9 px-3 rounded-xl bg-white border border-slate-300 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">RM</span>
                <span className="text-base font-black text-blue-700 tabular-nums">
                  {calculatedTotal.toFixed(2)}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                {requestedQty} unit(s) x RM {parsedUnitPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Contact and Pickup Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Your Contact (WhatsApp / Phone) *
              </label>
              <input
                type="text"
                required
                value={buyerContact}
                onChange={(e) => setBuyerContact(e.target.value)}
                placeholder="e.g. 012-345-6789"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Preferred Meetup Spot *
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. PSZ Central Library Foyer"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Message to Seller */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Note or Schedule to Seller
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="State when you can meet on campus or if you plan to pay via DuitNow QR..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center gap-2 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Request initiates an order. After discussing in Chat, upload your payment proof to proceed to approval.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || remainingQty <= 0}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Sending Request...' : 'Send Purchase Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
