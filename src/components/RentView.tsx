import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Repeat, 
  PlusCircle, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Star, 
  SlidersHorizontal, 
  X, 
  ArrowUpDown, 
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Tag
} from 'lucide-react';
import { 
  RentalItem, 
  RentalCategory, 
  RENTAL_CATEGORIES, 
  Condition 
} from '../types';

interface RentViewProps {
  rentalItems: RentalItem[];
  onSelectRentalItem: (item: RentalItem) => void;
  onOpenCreateRentalModal: () => void;
}

export const RentView: React.FC<RentViewProps> = ({
  rentalItems,
  onSelectRentalItem,
  onOpenCreateRentalModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Filtered & sorted rental items
  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return rentalItems
      .filter((item) => {
        const matchesSearch =
          !q ||
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.pickupLocation.toLowerCase().includes(q) ||
          item.ownerName.toLowerCase().includes(q);

        const matchesCategory =
          selectedCategory === 'All' || item.category === selectedCategory;

        const matchesAvailability = !onlyAvailable || item.isAvailable;

        return matchesSearch && matchesCategory && matchesAvailability;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (sortOrder === 'price-desc') return b.pricePerDay - a.pricePerDay;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rentalItems, searchQuery, selectedCategory, sortOrder, onlyAvailable]);

  // "Popular Rentals" (curated items)
  const popularRentals = useMemo(() => {
    return rentalItems.slice(0, 4);
  }, [rentalItems]);

  // "Recently Added"
  const recentlyAdded = useMemo(() => {
    return [...rentalItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [rentalItems]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-left space-y-6">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-5 sm:p-7 shadow-lg shadow-blue-500/10 overflow-hidden">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-52 h-52 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white backdrop-blur-xs">
              <Repeat className="w-3.5 h-3.5" />
              <span>Campus Peer Rental Marketplace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rent
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Borrow what you need. Earn by sharing.
            </p>
            <p className="text-xs text-blue-200/90 leading-relaxed pt-1">
              Need a graphing calculator for midterms, a DSLR camera for a club shoot, or an event projector for the weekend? Rent affordably from fellow students on campus with protected security deposits.
            </p>
          </div>

          <div className="shrink-0 pt-1 sm:pt-0">
            <button
              type="button"
              onClick={onOpenCreateRentalModal}
              className="px-5 py-3 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-100 font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>List an Item for Rent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search rental calculators, cameras, sports gear, dorm appliances, tools..."
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

      {/* Category Pills Filter Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <span>Categories:</span>
          {selectedCategory !== 'All' && (
            <button 
              onClick={() => setSelectedCategory('All')}
              className="text-blue-600 hover:text-blue-700"
            >
              Reset to All
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>

          {RENTAL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting & Availability Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Daily Rate: Low to High</option>
              <option value="price-desc">Daily Rate: High to Low</option>
            </select>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-medium select-none">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Available only</span>
          </label>
        </div>

        <div className="text-slate-500">
          Showing <strong className="text-slate-800">{filteredItems.length}</strong> rental items
        </div>
      </div>

      {/* Search Mode or Category Browse Mode */}
      {searchQuery.trim() ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Search Results for "{searchQuery}" ({filteredItems.length})
            </h2>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Clear Search
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No rental items match "{searchQuery}"</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for calculators, cameras, projectors, drills, or camping gear.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <RentalItemCard
                  key={item.id}
                  item={item}
                  onSelect={onSelectRentalItem}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Section: Popular Rentals */}
          {selectedCategory === 'All' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Popular Rentals on Campus
                  </h2>
                </div>
                <span className="text-xs text-blue-600 font-semibold">Top student picks</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {popularRentals.map((item) => (
                  <RentalItemCard
                    key={item.id}
                    item={item}
                    onSelect={onSelectRentalItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Recently Added */}
          {selectedCategory === 'All' && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                    Recently Added by Peers
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Fresh listings</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {recentlyAdded.map((item) => (
                  <RentalItemCard
                    key={item.id}
                    item={item}
                    onSelect={onSelectRentalItem}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Filtered Items Grid */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {selectedCategory === 'All' ? 'Browse All Campus Rentals' : `${selectedCategory} Rentals`}
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {filteredItems.length} items available
              </span>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <Repeat className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No items available in this category</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Be the first to list an item in this category and earn money by sharing with classmates!
                </p>
                <button
                  onClick={onOpenCreateRentalModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  + List an Item for Rent
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredItems.map((item) => (
                  <RentalItemCard
                    key={item.id}
                    item={item}
                    onSelect={onSelectRentalItem}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Safety & Deposit Information Banner */}
      <div className="p-4 bg-blue-50/80 rounded-3xl border border-blue-200/80 text-xs text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-blue-900">How CampusLoop Rental Works:</span>
            <p className="text-slate-600 leading-relaxed">
              1. Book rental days & refundable deposit &bull; 2. Meet on campus to inspect & record condition &bull; 3. Return by agreed date &bull; 4. Full deposit refunded upon verification.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

// ==========================================
// RENTAL ITEM CARD COMPONENT
// ==========================================

interface RentalItemCardProps {
  item: RentalItem;
  onSelect: (item: RentalItem) => void;
}

export const RentalItemCard: React.FC<RentalItemCardProps> = ({ item, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-lg hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer text-left relative"
    >
      {/* 1:1 Image */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={item.imageUrl || item.images[0]}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        {/* Condition Badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/95 text-slate-700 backdrop-blur-xs border border-slate-200/60 shadow-xs">
            {item.condition}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-2 right-2">
          {item.isAvailable ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Available</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800/90 text-white shadow-xs backdrop-blur-xs">
              Rented Out
            </span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <div className="flex items-center justify-between text-[10px] text-blue-600 font-semibold mb-1">
            <span className="truncate max-w-[130px]">{item.category}</span>
            {item.ownerRating && (
              <span className="text-amber-500 font-bold flex items-center gap-0.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {item.ownerRating}
              </span>
            )}
          </div>

          {/* Name */}
          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {item.name}
          </h3>
        </div>

        {/* Rental Price & Deposit */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          {/* Rate per day */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-blue-700">RM</span>
              <span className="text-lg font-black text-blue-700 tabular-nums">
                {item.pricePerDay}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">/ day</span>
            </div>

            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
              Rent
            </span>
          </div>

          {/* Refundable Deposit Display */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
            <span>Deposit:</span>
            <strong className="text-slate-700 font-bold">RM {item.securityDeposit} (Refundable)</strong>
          </div>

          {/* Pickup location & Owner */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span className="truncate max-w-[110px] flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{item.pickupLocation}</span>
            </span>
            <span className="truncate max-w-[70px] text-slate-600 font-medium text-right">
              {item.ownerName.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
