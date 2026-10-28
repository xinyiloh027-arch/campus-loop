import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Tag, 
  UserCheck, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeftRight,
  Share2,
  Heart,
  MessageSquare,
  TrendingDown,
  Camera,
  Star,
  Flag
} from 'lucide-react';
import { Listing, Review } from '../types';

export interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onRequestTrade: (listing: Listing) => void;
  onStartChat?: (sellerName: string, listing: Listing) => void;
  onToggleSave?: (listingId: string) => void;
  onToggleFavorite?: (listingId: string) => void;
  isSaved?: boolean;
  isFavorite?: boolean;
  reviews?: Review[];
  sellerReviews?: Review[];
  onReportReview?: (reviewId: string) => void;
  onCopyLinkNotification?: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onRequestTrade,
  onStartChat,
  onToggleSave,
  onToggleFavorite,
  isSaved: rawSaved = false,
  isFavorite: rawFav = false,
  reviews: rawReviews = [],
  sellerReviews: rawSellerReviews,
}) => {
  if (!listing) return null;

  const isSaved = rawFav || rawSaved;
  const reviews = rawSellerReviews || rawReviews;
  const handleToggle = onToggleFavorite || onToggleSave;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = listing.additionalImages && listing.additionalImages.length > 0 
    ? listing.additionalImages 
    : [listing.imageUrl];

  const hasPriceWarning = listing.marketAverage && listing.price > listing.marketAverage * 1.25;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Header bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {listing.category}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-600">{listing.condition}</span>
          </div>

          <div className="flex items-center gap-2">
            {handleToggle && (
              <button
                onClick={() => handleToggle(listing.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  isSaved 
                    ? 'border-rose-200 bg-rose-50 text-rose-600' 
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
                title={isSaved ? 'Saved to Favorites' : 'Save Item'}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {listing.isActualPhoto && (
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Real Product Photo</span>
                </div>
              )}
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-indigo-600 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title and Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {listing.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{listing.campusLocation || listing.location}</span>
                <span>·</span>
                <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl font-black text-indigo-600">
                RM {listing.price.toFixed(2)}
              </div>
              {listing.marketAverage && (
                <div className="text-[11px] text-slate-500">
                  Market avg: RM {listing.marketAverage.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          {/* Overpriced Warning Banner */}
          {hasPriceWarning && (
            <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Price Intelligence Alert</strong>
                <span>
                  This item is listed {Math.round(((listing.price - (listing.marketAverage || 0)) / (listing.marketAverage || 1)) * 100)}% above 
                  current market retail prices (Shopee/Lazada). We recommend checking seller explanations or negotiating via trade request.
                </span>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Item Details & Condition
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* Seller Price Explanation */}
          {listing.sellerExplanation && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="text-xs font-bold text-slate-800">Seller's Note on Value:</div>
              <p className="text-xs text-slate-600 italic">
                "{listing.sellerExplanation}"
              </p>
            </div>
          )}

          {/* Seller Profile Card */}
          <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-2xs">
                {listing.sellerName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-slate-900">{listing.sellerName}</h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Verified Student
                  </span>
                </div>
                <div className="text-xs text-slate-500">{listing.sellerFaculty || 'Campus Senior'}</div>
                <div className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{listing.sellerRating || 4.9} rating ({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            {onStartChat && (
              <button
                onClick={() => onStartChat(listing.sellerName, listing)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chat with Seller</span>
              </button>
            )}
          </div>

          {/* Seller Verified Reviews */}
          {reviews.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recent Verified Reviews ({reviews.length})
              </h3>
              <div className="space-y-2">
                {reviews.slice(0, 2).map((rev) => (
                  <div key={rev.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{rev.reviewerName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={() => onRequestTrade(listing)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Request to Trade</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
