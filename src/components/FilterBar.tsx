import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, X, BookOpen, Laptop, Home, PenTool, Wrench, Package } from 'lucide-react';
import { Category } from '../types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  sortOrder: 'newest' | 'price-asc' | 'price-desc';
  setSortOrder: (sort: 'newest' | 'price-asc' | 'price-desc') => void;
  maxPrice: number | null;
  setMaxPrice: (price: number | null) => void;
  totalResultsCount: number;
  onClearFilters: () => void;
}

const CATEGORIES_WITH_ICONS: { label: Category; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'All', icon: Package },
  { label: 'Textbooks', icon: BookOpen },
  { label: 'Electronics', icon: Laptop },
  { label: 'Dorm Essentials', icon: Home },
  { label: 'Stationery', icon: PenTool },
  { label: 'Project Equipment', icon: Wrench },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
  maxPrice,
  setMaxPrice,
  totalResultsCount,
  onClearFilters,
}) => {
  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'All' || maxPrice !== null;

  return (
    <div className="space-y-4">
      {/* Top Search & Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search textbooks, calculators, dorm gear, Arduino..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 text-sm bg-white rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder:text-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="appearance-none bg-white text-xs font-semibold text-slate-700 pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="newest">Sort: Newest Listed</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Quick Price Filter */}
          <div className="relative shrink-0">
            <select
              value={maxPrice === null ? 'all' : maxPrice.toString()}
              onChange={(e) => {
                const val = e.target.value;
                setMaxPrice(val === 'all' ? null : parseInt(val, 10));
              }}
              className="appearance-none bg-white text-xs font-semibold text-slate-700 pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Budget: Any Price</option>
              <option value="50">Under RM 50</option>
              <option value="100">Under RM 100</option>
              <option value="200">Under RM 200</option>
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Category Tabs (Interactive Segmented Buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-left">
        {CATEGORIES_WITH_ICONS.map(({ label, icon: Icon }) => {
          const isActive = selectedCategory === label;
          return (
            <button
              key={label}
              onClick={() => setSelectedCategory(label)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter summary & clear */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div>
          Showing <span className="font-bold text-slate-900 tabular-nums">{totalResultsCount}</span> campus listing{totalResultsCount === 1 ? '' : 's'}
          {selectedCategory !== 'All' && <span> in <strong className="text-indigo-600">{selectedCategory}</strong></span>}
          {maxPrice !== null && <span> (Under RM {maxPrice})</span>}
        </div>

        {isFiltered && (
          <button
            onClick={onClearFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 underline underline-offset-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};
