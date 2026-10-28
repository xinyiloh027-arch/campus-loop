import React from 'react';
import { PlusCircle, Tag, MapPin, Eye, ArrowLeftRight } from 'lucide-react';
import { Listing } from '../types';

interface MyListingsViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  openCreateModal: () => void;
  onNavigateExplore: () => void;
}

export const MyListingsView: React.FC<MyListingsViewProps> = ({
  listings,
  onSelectListing,
  openCreateModal,
  onNavigateExplore,
}) => {
  // Items created by user or assigned to user Alex Tan
  const myListings = listings.filter((l) => l.isUserCreated || l.sellerName.includes('Alex Tan'));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Campus Listings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your items for sale or trade across campus.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>List Another Item</span>
        </button>
      </div>

      {myListings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            You haven't listed any campus items yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
            Turn your old textbooks, unused electronics, or dorm gear into extra cash for the semester!
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={openCreateModal}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
            >
              + Create First Listing
            </button>
            <button
              onClick={onNavigateExplore}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Browse Campus Items
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myListings.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectListing(item)}
              className="bg-white rounded-xl border border-slate-200/90 p-4 flex gap-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer text-left group"
            >
              <div className="w-24 h-24 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      {item.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mt-0.5">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[11px] text-slate-400 font-medium">RM</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.price.toFixed(0)}
                    </span>
                  </div>

                  <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                    <Eye className="w-3.5 h-3.5" />
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
