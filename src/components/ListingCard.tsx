import React, { useState } from 'react';
import { MapPin, Heart, ShoppingCart, Star } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  isSaved?: boolean;
  onToggleSave?: (listingId: string) => void;
  onAddToCart?: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  isSaved = false,
  onToggleSave,
  onAddToCart,
}) => {
  const [imageError, setImageError] = useState(false);

  // Shorten condition to New vs Used or specific condition
  const isNew = listing.condition === 'Brand New';
  const conditionLabel = isNew ? 'New' : 'Used';

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left relative"
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
            <span className="text-2xl">📦</span>
            <span className="text-[11px] font-medium text-slate-500 mt-1">{listing.category}</span>
          </div>
        )}

        {/* Condition Tag */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight shadow-xs ${
            isNew 
              ? 'bg-emerald-600 text-white' 
              : 'bg-white/95 text-slate-700 backdrop-blur-xs border border-slate-200/60'
          }`}>
            {conditionLabel}
          </span>
          {listing.condition === 'Like New' && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[9px] font-semibold border border-blue-200 hidden sm:inline-block">
              Like New
            </span>
          )}
        </div>

        {/* Favorite Save Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(listing.id);
            }}
            aria-label={isSaved ? 'Remove from favourites' : 'Save to favourites'}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-rose-500 shadow-xs transition-colors backdrop-blur-xs"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Badge & Rating */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-blue-600 font-semibold truncate max-w-[110px]">
              {listing.category}
            </span>
            {listing.sellerRating && (
              <span className="text-amber-500 font-bold flex items-center gap-0.5 shrink-0 text-[10px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {listing.sellerRating}
              </span>
            )}
          </div>

          {/* Product Title (2-line clamp) */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {listing.title}
          </h3>
        </div>

        {/* Price & Action Area */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-blue-700">RM</span>
              <span className="text-base sm:text-lg font-black text-blue-700 tabular-nums">
                {listing.price.toFixed(0)}
              </span>
            </div>

            {onAddToCart && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(listing);
                }}
                className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                title="Add to Cart"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>

          {/* Campus Location */}
          <div className="flex items-center text-[10px] sm:text-[11px] text-slate-500 truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mr-1" />
            <span className="truncate">{listing.campusLocation || listing.location || 'Campus'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
