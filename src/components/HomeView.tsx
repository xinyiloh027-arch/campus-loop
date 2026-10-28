import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  BookOpen, 
  Laptop, 
  Pencil, 
  Home, 
  Shirt, 
  Activity, 
  Coffee, 
  LayoutGrid, 
  PlusCircle, 
  ShieldCheck, 
  TrendingUp,
  X
} from 'lucide-react';
import { Listing, Category } from '../types';
import { ListingCard } from './ListingCard';

interface HomeViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onAddToCart?: (listing: Listing) => void;
  onToggleFavorite?: (listingId: string) => void;
  savedListingIds?: string[];
  onNavigateMall: (category?: Category) => void;
  onOpenCreateModal: () => void;
}

const QUICK_CATEGORIES = [
  { label: 'Textbooks', category: 'Textbooks & Notes' as Category, icon: <BookOpen className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
  { label: 'Electronics', category: 'Electronics' as Category, icon: <Laptop className="w-5 h-5" />, color: 'bg-indigo-50 text-indigo-600' },
  { label: 'Stationery', category: 'Stationery' as Category, icon: <Pencil className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
  { label: 'Dorm Gear', category: 'Dorm Essentials' as Category, icon: <Home className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
  { label: 'Clothing', category: 'Clothing & Accessories' as Category, icon: <Shirt className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
  { label: 'Sports', category: 'Sports & Fitness' as Category, icon: <Activity className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600' },
  { label: 'Snacks', category: 'Food & Snacks' as Category, icon: <Coffee className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
  { label: 'All Mall', category: 'All' as Category, icon: <LayoutGrid className="w-5 h-5" />, color: 'bg-blue-600 text-white' },
];

export const HomeView: React.FC<HomeViewProps> = ({
  listings,
  onSelectListing,
  onAddToCart,
  onToggleFavorite,
  savedListingIds = [],
  onNavigateMall,
  onOpenCreateModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Recommended products (curated top campus items)
  const recommendedListings = useMemo(() => {
    return listings.slice(0, 4);
  }, [listings]);

  // Recently listed (sorted by newest)
  const recentlyListed = useMemo(() => {
    return [...listings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [listings]);

  // Filtered listings if search is active
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return listings.filter((l) => 
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      (l.campusLocation || l.location || '').toLowerCase().includes(q)
    );
  }, [listings, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 text-left space-y-6">
      
      {/* Search Header for Mobile/Desktop */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search textbooks, calculators, dorm gear, clothes, snacks..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* If Search is Active, show instant search results */}
      {searchQuery.trim() ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Search Results for "{searchQuery}" ({searchResults.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-2">
              <p className="text-sm font-bold text-slate-800">No items found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-500">Try searching for generic terms like "textbook", "mouse", "desk", or "jacket".</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {searchResults.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={onSelectListing}
                  onAddToCart={onAddToCart}
                  onToggleSave={onToggleFavorite}
                  isSaved={savedListingIds.includes(listing.id)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Promotional Banner: "Your Campus, Your Marketplace" */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-5 sm:p-7 shadow-lg shadow-blue-500/10">
            <div className="absolute right-0 top-0 -mt-6 -mr-6 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified University Students Only</span>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                  Your Campus, Your Marketplace
                </h1>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Buy, sell, and trade textbooks, electronics, dorm essentials, and stationery directly with peers. 0% platform fees & safe campus meetups.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 pt-1 sm:pt-0">
                <button
                  type="button"
                  onClick={() => onNavigateMall('All')}
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Explore Mall</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenCreateModal}
                  className="px-4 py-2.5 rounded-2xl bg-blue-800/80 hover:bg-blue-900 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 border border-white/20"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sell an Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-Access Category Icons */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider">
                Quick Categories
              </h2>
              <button
                onClick={() => onNavigateMall('All')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
              {QUICK_CATEGORIES.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onNavigateMall(item.category)}
                  className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-1.5 transition-transform group-hover:scale-105 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 truncate max-w-full">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recommended for You */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Recommended for You
                </h2>
              </div>
              <button
                onClick={() => onNavigateMall('All')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                See More &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {recommendedListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={onSelectListing}
                  onAddToCart={onAddToCart}
                  onToggleSave={onToggleFavorite}
                  isSaved={savedListingIds.includes(listing.id)}
                />
              ))}
            </div>
          </div>

          {/* Recently Listed */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Recently Listed by Classmates
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Updated live</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {recentlyListed.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={onSelectListing}
                  onAddToCart={onAddToCart}
                  onToggleSave={onToggleFavorite}
                  isSaved={savedListingIds.includes(listing.id)}
                />
              ))}
            </div>
          </div>

          {/* All Campus Marketplace Feed (2 cols on mobile, 3-4 cols on desktop) */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  Explore All Campus Items
                </h2>
                <p className="text-xs text-slate-500">Textbooks, calculators, electronics, dorm essentials & more</p>
              </div>
              <button
                onClick={() => onNavigateMall('All')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                Filter by Category &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={onSelectListing}
                  onAddToCart={onAddToCart}
                  onToggleSave={onToggleFavorite}
                  isSaved={savedListingIds.includes(listing.id)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
