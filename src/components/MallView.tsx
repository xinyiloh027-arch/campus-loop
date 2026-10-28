import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  Laptop, 
  Pencil, 
  Home, 
  Shirt, 
  Activity, 
  Sparkles, 
  Coffee, 
  Package, 
  SlidersHorizontal, 
  X,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { Listing, Category, MALL_CATEGORIES, MallCategory, Condition } from '../types';
import { ListingCard } from './ListingCard';

interface MallViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onAddToCart?: (listing: Listing) => void;
  onToggleFavorite?: (listingId: string) => void;
  savedListingIds?: string[];
  initialCategory?: Category;
}

interface CategoryMeta {
  name: MallCategory;
  icon: React.ReactNode;
  bgLight: string;
  textColor: string;
}

const CATEGORY_ITEMS: CategoryMeta[] = [
  { name: 'Textbooks & Notes', icon: <BookOpen className="w-5 h-5" />, bgLight: 'bg-blue-50', textColor: 'text-blue-600' },
  { name: 'Electronics', icon: <Laptop className="w-5 h-5" />, bgLight: 'bg-indigo-50', textColor: 'text-indigo-600' },
  { name: 'Stationery', icon: <Pencil className="w-5 h-5" />, bgLight: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { name: 'Dorm Essentials', icon: <Home className="w-5 h-5" />, bgLight: 'bg-amber-50', textColor: 'text-amber-600' },
  { name: 'Clothing & Accessories', icon: <Shirt className="w-5 h-5" />, bgLight: 'bg-purple-50', textColor: 'text-purple-600' },
  { name: 'Sports & Fitness', icon: <Activity className="w-5 h-5" />, bgLight: 'bg-rose-50', textColor: 'text-rose-600' },
  { name: 'Beauty & Personal Care', icon: <Sparkles className="w-5 h-5" />, bgLight: 'bg-pink-50', textColor: 'text-pink-600' },
  { name: 'Food & Snacks', icon: <Coffee className="w-5 h-5" />, bgLight: 'bg-orange-50', textColor: 'text-orange-600' },
  { name: 'Other Items', icon: <Package className="w-5 h-5" />, bgLight: 'bg-slate-100', textColor: 'text-slate-600' },
];

export const MallView: React.FC<MallViewProps> = ({
  listings,
  onSelectListing,
  onAddToCart,
  onToggleFavorite,
  savedListingIds = [],
  initialCategory = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>(initialCategory);
  const [priceRange, setPriceRange] = useState<'all' | 'under30' | '30to100' | 'over100'>('all');
  const [conditionFilter, setConditionFilter] = useState<'all' | Condition>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Normalization helper to map legacy category names to Mall categories
  const matchesCategoryHelper = (itemCategory: string, targetCategory: Category): boolean => {
    if (targetCategory === 'All') return true;
    if (itemCategory === targetCategory) return true;
    // Map legacy names
    if (targetCategory === 'Textbooks & Notes' && itemCategory === 'Textbooks') return true;
    if (targetCategory === 'Clothing & Accessories' && itemCategory === 'Clothing') return true;
    if (targetCategory === 'Sports & Fitness' && itemCategory === 'Sports Equipment') return true;
    if (targetCategory === 'Electronics' && itemCategory === 'Project Equipment') return true;
    if (targetCategory === 'Other Items' && itemCategory === 'Other') return true;
    return false;
  };

  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        // Search
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          listing.title.toLowerCase().includes(query) ||
          listing.description.toLowerCase().includes(query) ||
          (listing.campusLocation || listing.location || '').toLowerCase().includes(query) ||
          listing.category.toLowerCase().includes(query);

        // Category
        const matchesCategory = matchesCategoryHelper(listing.category, selectedCategory);

        // Price
        let matchesPrice = true;
        if (priceRange === 'under30') matchesPrice = listing.price < 30;
        else if (priceRange === '30to100') matchesPrice = listing.price >= 30 && listing.price <= 100;
        else if (priceRange === 'over100') matchesPrice = listing.price > 100;

        // Condition
        let matchesCondition = true;
        if (conditionFilter !== 'all') {
          matchesCondition = listing.condition === conditionFilter;
        }

        return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.price - b.price;
        if (sortOrder === 'price-desc') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, searchQuery, selectedCategory, priceRange, conditionFilter, sortOrder]);

  const activeFiltersCount = 
    (selectedCategory !== 'All' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (conditionFilter !== 'all' ? 1 : 0) +
    (sortOrder !== 'newest' ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setPriceRange('all');
    setConditionFilter('all');
    setSortOrder('newest');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-left space-y-6">
      
      {/* Search Header */}
      <div className="space-y-3">
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
      </div>

      {/* Heading: Shop by Category */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Show All Categories
            </button>
          )}
        </div>

        {/* Clean Category Grid (3 cols on mobile, 5-9 cols on desktop) */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 sm:gap-2.5">
          {CATEGORY_ITEMS.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? 'All' : cat.name)}
                className={`p-2.5 sm:p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer border ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50 shadow-xs ring-2 ring-blue-100' 
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 transition-transform ${
                  isSelected ? 'bg-blue-600 text-white scale-105' : `${cat.bgLight} ${cat.textColor}`
                }`}>
                  {cat.icon}
                </div>
                <span className={`text-[10px] sm:text-[11px] font-semibold leading-tight line-clamp-2 ${
                  isSelected ? 'text-blue-700 font-bold' : 'text-slate-700'
                }`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Quick Sort Dropdown */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="bg-transparent focus:outline-none text-slate-700 cursor-pointer font-medium"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="price-asc">Sort: Price: Low to High</option>
                <option value="price-desc">Sort: Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredListings.length}</strong> {filteredListings.length === 1 ? 'item' : 'items'}
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs animate-in fade-in-50">
            {/* Price Filter */}
            <div>
              <span className="block font-bold text-slate-700 mb-1.5">Price Range (RM)</span>
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under30', label: '< RM 30' },
                  { id: '30to100', label: 'RM 30 - 100' },
                  { id: 'over100', label: '> RM 100' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRange(p.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      priceRange === p.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <span className="block font-bold text-slate-700 mb-1.5">Item Condition</span>
              <div className="flex flex-wrap gap-1">
                {['all', 'Brand New', 'Like New', 'Good', 'Fair'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setConditionFilter(c as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      conditionFilter === c
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c === 'all' ? 'All Conditions' : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Category Header pill */}
      {selectedCategory !== 'All' && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Filtered by:</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
            <span>{selectedCategory}</span>
            <button
              onClick={() => setSelectedCategory('All')}
              className="hover:text-blue-200"
              title="Clear category filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Product Grid: 2 columns on mobile, 3-4 on larger screens */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No products match your search or filters</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your price or category filters, or search for textbooks, electronics, or dorm gear.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredListings.map((listing) => (
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
  );
};
