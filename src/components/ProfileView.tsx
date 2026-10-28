import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Building, 
  MapPin, 
  Check, 
  Flag, 
  Heart, 
  RotateCcw 
} from 'lucide-react';
import { UserProfile, UserRole, Review, Listing } from '../types';

export interface ProfileViewProps {
  profile: UserProfile;
  totalListingsCount: number;
  totalRequestsCount: number;
  reviews: Review[];
  savedListings: Listing[];
  onRoleChange: (role: UserRole) => void;
  onSelectListing: (listing: Listing) => void;
  onReportReview: (reviewId: string) => void;
  onResetData: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  totalListingsCount,
  totalRequestsCount,
  reviews,
  savedListings,
  onRoleChange,
  onSelectListing,
  onReportReview,
  onResetData,
}) => {
  const [resetDone, setResetDone] = useState(false);

  // Reviews where Alex Tan is the reviewee
  const myReviews = reviews.filter((r) => r.revieweeName.includes('Alex Tan'));
  const avgRating = myReviews.length > 0
    ? (myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length).toFixed(1)
    : '5.0';

  const handleResetClick = () => {
    if (window.confirm('Reset all prototype listings, trade requests, chats, budget entries, and reviews back to fresh sample data?')) {
      onResetData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 2500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      
      {/* Student ID Card Showcase */}
      <div className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-6 opacity-10 text-8xl font-black font-mono tracking-tighter select-none pointer-events-none">
          CAMPUS
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-300 p-1 shadow-md">
                <div className="w-full h-full rounded-[14px] bg-indigo-950 flex items-center justify-center text-2xl font-bold text-sky-200">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {profile.name}
                </h2>
                <span className="text-[11px] font-semibold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  Verified Student
                </span>
                <span className="text-[11px] font-semibold bg-indigo-400/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full capitalize">
                  Active Role: {profile.role}
                </span>
              </div>
              <p className="text-xs text-indigo-200 font-mono">
                ID: {profile.studentId} · Telegram: {profile.contactHandle}
              </p>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 pt-0.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                <span>{profile.faculty}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 w-full sm:w-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl font-black tabular-nums">⭐ {avgRating}</span>
              <span className="text-[10px] block text-indigo-200 mt-0.5">Reputation</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl font-black tabular-nums">{profile.verifiedTransactionsCount}</span>
              <span className="text-[10px] block text-indigo-200 mt-0.5">Trades Done</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl font-black tabular-nums">{totalListingsCount}</span>
              <span className="text-[10px] block text-indigo-200 mt-0.5">My Listings</span>
            </div>
          </div>
        </div>

        {/* Dorm and Campus Info Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-200">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Residential College: <strong className="text-white font-medium">{profile.dorm}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-sky-400" />
            {profile.email}
          </span>
        </div>
      </div>

      {/* MODULE 1: Flexible Buyer and Seller Roles */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Account Role Mode
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose whether you want to act primarily as a Buyer, a Seller, or Both. You can toggle your role anytime without creating a second account.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Buyer */}
          <div
            onClick={() => onRoleChange('buyer')}
            className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
              profile.role === 'buyer'
                ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Buyer Mode</span>
              {profile.role === 'buyer' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Browse products, compare fair market prices, save favorites, chat with sellers, and track budget spending.
            </p>
          </div>

          {/* Seller */}
          <div
            onClick={() => onRoleChange('seller')}
            className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
              profile.role === 'seller'
                ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Seller Mode</span>
              {profile.role === 'seller' && <Check className="w-4 h-4 text-indigo-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Create listings, upload real product photos, manage incoming trade offers, and earn peer seller reviews.
            </p>
          </div>

          {/* Both */}
          <div
            onClick={() => onRoleChange('both')}
            className={`p-4 rounded-xl border-2 text-left cursor-pointer transition-all ${
              profile.role === 'both'
                ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">Both (All-in-One)</span>
              {profile.role === 'both' && <Check className="w-4 h-4 text-purple-600" />}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Full access to both buyer and seller features seamlessly unified under your student identity.
            </p>
          </div>
        </div>
      </div>

      {/* MODULE 2: Buyer & Seller Reputation and Verified Reviews */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Verified Peer Reviews ({myReviews.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only verified trade participants can submit ratings. Self-reviews and duplicates are strictly disallowed.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Average Score: {avgRating} / 5.0
          </span>
        </div>

        <div className="space-y-3">
          {myReviews.length > 0 ? (
            myReviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.reviewerName}</span>
                    <span className="text-[11px] text-slate-400">({rev.reviewerRole})</span>
                    <span className="text-amber-500 font-bold">
                      {'★'.repeat(rev.rating)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      Verified Transaction #{rev.transactionId}
                    </span>
                    <button
                      onClick={() => onReportReview(rev.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Report abusive or fraudulent review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">"{rev.comment}"</p>
                <span className="text-[10px] text-slate-400 block pt-0.5">
                  Item: {rev.listingTitle} · {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No written reviews yet. Once you complete a campus trade, your partner's review will appear here!
            </div>
          )}
        </div>
      </div>

      {/* MODULE 3: Saved / Favorite Listings */}
      {savedListings.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <h3 className="text-base font-bold text-slate-900">
              Saved Favorites ({savedListings.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedListings.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectListing(item)}
                className="p-3 rounded-xl border border-slate-200 flex items-center gap-3 hover:border-indigo-300 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <span className="font-bold text-slate-900 truncate block">
                    {item.title}
                  </span>
                  <div className="flex items-center justify-between text-slate-500 mt-1">
                    <span className="font-bold text-indigo-600">RM {item.price}</span>
                    <span>{item.condition}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Prototype Data Button */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="text-slate-500">
          Want a clean demonstration state? Reset all listings, trade offers, chat logs, budget entries, and reviews to fresh sample data.
        </div>
        <button
          onClick={handleResetClick}
          className="flex items-center gap-1.5 px-4 py-2 font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
        >
          {resetDone ? <Check className="w-4 h-4 text-emerald-600" /> : <RotateCcw className="w-4 h-4" />}
          <span>{resetDone ? 'Data Reset Complete!' : 'Reset All Sample Data'}</span>
        </button>
      </div>
    </div>
  );
};
