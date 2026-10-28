import React from 'react';
import { ArrowRight, PlusCircle, ShieldCheck, Zap, Sparkles, MapPin } from 'lucide-react';

interface HeroBannerProps {
  onExploreClick: () => void;
  onCreateClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onCreateClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/80 via-sky-50/50 to-white border border-indigo-100/70 p-6 sm:p-10 mb-8 shadow-xs text-left">
      {/* Decorative ambient gradient blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 bg-sky-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl space-y-4">
        {/* Soft kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/70 text-indigo-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Peer-to-Peer Student Exchange</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
          Buy, Sell & Trade on Campus Without the Shipping Fees.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          The verified marketplace for university students. Pass down your engineering textbooks, find affordable dorm essentials, or swap electronics at the campus library.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            onClick={onExploreClick}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm shadow-indigo-200 transition-all"
          >
            <span>Explore All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>List an Item</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-indigo-100/60 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Campus Students
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-indigo-600" />
            Pick up at Library or Dorms
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            Zero Platform Fees
          </span>
        </div>
      </div>
    </div>
  );
};
