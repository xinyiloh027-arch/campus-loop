import React, { useState } from 'react';
import { MapPin, UserCheck, Tag, Heart, Camera, Star } from 'lucide-react';
import { Listing } from '../types';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onRequestTrade: (listing: Listing) => void;
  isSaved?: boolean;
  onToggleSave?: (listingId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onRequestTrade,
  isSaved = false,
  onToggleSave,
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      onClick={() => onSelect(listing)}
      className="group flex flex-col bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left"
    >
      {/* 4:3 Image Container */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50/50 p-4 text-center">
            <Tag className="w-8 h-8 text-indigo-400 mb-1" />
            <span className="text-xs font-medium text-slate-500">{listing.category}</span>
          </div>
        )}

        {/* Condition & Authentic Photo Tag */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded text-[11px] font-semibold text-slate-700 tracking-tight shadow-2xs">
            {listing.condition}
          </span>
          {listing.isActualPhoto !== false && (
            <span className="p-1 bg-white/95 backdrop-blur-sm rounded text-emerald-700 shadow-2xs" title="Authentic seller photo">
              <Camera className="w-3 h-3" />
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
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-rose-500 shadow-2xs transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-semibold">{listing.category}</span>
              <span aria-hidden="true">·</span>
              <span>{listing.condition}</span>
            </div>
            {listing.sellerRating && (
              <span className="text-[11px] text-amber-600 font-bold flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {listing.sellerRating}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[15px] font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
            {listing.title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Footer Area: Price, Location & Seller */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-slate-500">RM</span>
              <span className="text-xl font-bold text-slate-900 tabular-nums">
                {listing.price.toFixed(0)}
              </span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRequestTrade(listing);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1 rounded transition-colors"
            >
              Request Trade &rarr;
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 truncate max-w-[170px]" title={listing.location}>
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </span>

            <span className="flex items-center gap-1 shrink-0 text-slate-600 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate max-w-[90px]">{listing.sellerName.split(' ')[0]}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
