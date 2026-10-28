import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Heart, 
  ShoppingCart, 
  MessageSquare, 
  ArrowLeftRight, 
  Star, 
  ShieldCheck, 
  Camera, 
  Check, 
  ChevronRight
} from 'lucide-react';
import { Listing, Review } from '../types';

export interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onAddToCart?: (listing: Listing) => void;
  onToggleFavorite?: (listingId: string) => void;
  isFavorite?: boolean;
  onStartChat?: (sellerName: string, listing: Listing) => void;
  onRequestTrade: (listing: Listing) => void;
  reviews?: Review[];
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  onStartChat,
  onRequestTrade,
  reviews = [],
}) => {
  if (!listing) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = listing.additionalImages && listing.additionalImages.length > 0
    ? listing.additionalImages
    : [listing.imageUrl];

  const handleAddToCartClick = () => {
    if (onAddToCart) {
      onAddToCart(listing);
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 1500);
    }
  };

  const sellerReviews = reviews.filter((r) => r.revieweeName === listing.sellerName);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50 duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
              {listing.category}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
              {listing.condition}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(listing.id)}
                className={`p-2 rounded-full border transition-colors ${
                  isFavorite 
                    ? 'border-rose-200 bg-rose-50 text-rose-600' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                }`}
                title={isFavorite ? 'Saved to Favourites' : 'Add to Favourites'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {listing.isActualPhoto && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/95 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs">
                  <Camera className="w-3 h-3" />
                  <span>Real Campus Item Photo</span>
                </div>
              )}
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="space-y-2 border-b border-slate-100 pb-4">
            <div className="flex items-baseline gap-1 text-blue-700">
              <span className="text-sm font-bold">RM</span>
              <span className="text-3xl font-black tabular-nums">{listing.price.toFixed(2)}</span>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-1 text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Pickup: {listing.campusLocation || listing.location || 'On-campus handover'}</span>
              </div>
              <span>·</span>
              <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Item Description */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Description & Details
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {listing.description}
            </p>
          </div>

          {/* Seller Information Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/30 rounded-2xl border border-blue-100 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-xs shrink-0">
                {listing.sellerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{listing.sellerName}</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500">{listing.sellerFaculty || 'Campus Student'}</p>
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{listing.sellerRating || 4.9} rating ({sellerReviews.length > 0 ? sellerReviews.length : 4} student reviews)</span>
                </div>
              </div>
            </div>

            {onStartChat && (
              <button
                type="button"
                onClick={() => onStartChat(listing.sellerName, listing)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}
          </div>

          {/* Student Peer Handover Safety Notice */}
          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Safe Campus Handover:</strong> Always meet in public university areas (e.g. Central Library, Student Activity Centre, Cafeteria) and inspect the item before finalizing payment via cash or DuitNow QR.
            </span>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2.5">
          {onStartChat && (
            <button
              type="button"
              onClick={() => onStartChat(listing.sellerName, listing)}
              className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex flex-col items-center justify-center shrink-0"
              title="Chat with Seller"
            >
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Chat</span>
            </button>
          )}

          {onAddToCart && (
            <button
              type="button"
              onClick={handleAddToCartClick}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                addedAnimation 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onRequestTrade(listing)}
            className="flex-1 py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Enquire / Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
