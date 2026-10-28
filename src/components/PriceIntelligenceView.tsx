import React, { useState } from 'react';
import { 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Info, 
  Sliders, 
  ShieldCheck, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Listing } from '../types';

interface PriceIntelligenceViewProps {
  listings: Listing[];
  onSelectListing: (listing: Listing) => void;
  onRequestTrade: (listing: Listing) => void;
}

export const PriceIntelligenceView: React.FC<PriceIntelligenceViewProps> = ({
  listings,
  onSelectListing,
  onRequestTrade,
}) => {
  const [warningThreshold, setWarningThreshold] = useState<number>(30); // 30% above market
  const [filterMode, setFilterMode] = useState<'all' | 'flagged' | 'fair'>('all');
  const [selectedItem, setSelectedItem] = useState<Listing>(listings[0]);

  // Evaluate if an item is flagged
  const checkIsFlagged = (listing: Listing) => {
    if (!listing.marketAverage) return false;
    const diffPercent = ((listing.price - listing.marketAverage) / listing.marketAverage) * 100;
    return diffPercent >= warningThreshold;
  };

  const flaggedCount = listings.filter(checkIsFlagged).length;

  const currentDiffPercent = selectedItem?.marketAverage 
    ? Math.round(((selectedItem.price - selectedItem.marketAverage) / selectedItem.marketAverage) * 100)
    : 0;

  const isCurrentFlagged = currentDiffPercent >= warningThreshold;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 mb-2">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Campus Price Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Market Price Monitor & Fair Value Checks
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Compare campus second-hand listings against reference prices from Shopee, Lazada, Taobao, and Pinduoduo to ensure transparent, fair student deals.
          </p>
        </div>

        {/* Configurable Alert Threshold Control */}
        <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex flex-col gap-1.5 self-start md:self-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 gap-4">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              Alert Sensitivity Threshold:
            </span>
            <span className="text-indigo-600 font-bold tabular-nums">+{warningThreshold}%</span>
          </div>
          <div className="flex items-center gap-2">
            {[20, 30, 40, 50].map((val) => (
              <button
                key={val}
                onClick={() => setWarningThreshold(val)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                  warningThreshold === val
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                +{val}%
              </button>
            ))}
          </div>
          <span className="text-[10px] text-slate-400">
            Flags listings priced {warningThreshold}% or higher above market reference
          </span>
        </div>
      </div>

      {/* Transparent Disclaimer Banner */}
      <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-100/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed space-y-1">
          <p className="font-semibold text-slate-900">
            About Price Intelligence Reference Data
          </p>
          <p>
            Reference prices are compiled from recent comparable listings across authorized regional e-commerce platforms. Student pricing may legitimately vary depending on item condition, bundled cables/accessories, rare textbook editions, and zero campus shipping waiting times.
          </p>
        </div>
      </div>

      {/* Main Analysis Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left List of Items: 5 Cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Campus Listings Monitor
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-0.5 text-xs rounded ${filterMode === 'all' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                All ({listings.length})
              </button>
              <button
                onClick={() => setFilterMode('flagged')}
                className={`px-2.5 py-0.5 text-xs rounded ${filterMode === 'flagged' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                Alerts ({flaggedCount})
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {listings
              .filter((l) => {
                if (filterMode === 'flagged') return checkIsFlagged(l);
                if (filterMode === 'fair') return !checkIsFlagged(l);
                return true;
              })
              .map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const isFlagged = checkIsFlagged(item);

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </span>
                          {isFlagged ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0">
                              <AlertTriangle className="w-3 h-3" /> +{Math.round(((item.price - (item.marketAverage || item.price)) / (item.marketAverage || 1)) * 100)}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                              <CheckCircle2 className="w-3 h-3" /> Fair
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs mt-1 text-slate-500">
                          <span>Campus: <strong className="text-slate-900">RM {item.price}</strong></span>
                          <span>Ref: RM {item.marketAverage || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Detail Inspection: 7 Cols */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
          {selectedItem ? (
            <>
              {/* Product Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {selectedItem.category} · {selectedItem.condition}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                    {selectedItem.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Listed by {selectedItem.sellerName} · {selectedItem.location}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Campus Price</span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    RM {selectedItem.price.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Price Warning or Fair Confirmation Box */}
              {isCurrentFlagged ? (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-950">
                        Price Alert: Approximately {currentDiffPercent}% above comparable market reference
                      </h4>
                      <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                        Reference Price: <strong>RM {selectedItem.referencePriceMin || 50} – RM {selectedItem.referencePriceMax || 100}</strong> (Market Average ~RM {selectedItem.marketAverage}).
                        This listing is RM {selectedItem.price}. Prices may differ due to condition, included accessories, or scarcity.
                      </p>
                    </div>
                  </div>

                  {/* Buyer Decision Actions */}
                  <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] text-amber-800">
                      As a buyer, you can choose how to proceed:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRequestTrade(selectedItem)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs"
                      >
                        Continue Anyway / Propose Offer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Fair Student Price Verified
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      This item is priced competitively (Market Average: RM {selectedItem.marketAverage}). A great deal without retail markup or external postage fees.
                    </p>
                  </div>
                </div>
              )}

              {/* Seller Explanation (if provided) */}
              {selectedItem.sellerExplanation && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Seller's Specification & Price Note:
                  </span>
                  <p className="text-slate-600 italic">
                    "{selectedItem.sellerExplanation}"
                  </p>
                </div>
              )}

              {/* External Platform Price Comparison Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">
                  Comparable External Market Rates (Shopee, Lazada, Taobao, Pinduoduo)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedItem.competitors && selectedItem.competitors.length > 0 ? (
                    selectedItem.competitors.map((comp) => (
                      <div
                        key={comp.platform}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">
                            {comp.platform}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 bg-white border border-slate-200 rounded text-slate-600">
                            {comp.condition}
                          </span>
                        </div>
                        <div>
                          <span className="text-lg font-bold text-slate-900 tabular-nums">
                            RM {comp.price}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {comp.lastUpdated}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-xs text-slate-400 p-4 text-center bg-slate-50 rounded-lg">
                      No external market benchmarks registered for this category yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Price Trend History Chart Simulation */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center justify-between">
                  <span>Historical Price Trajectory</span>
                  <span className="text-[11px] font-normal text-slate-400">Sample Reference Points</span>
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-end justify-between gap-4 h-24 pt-4 px-2">
                    {selectedItem.priceHistory?.map((point, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                          RM {point.price}
                        </span>
                        <div 
                          className={`w-full max-w-[48px] rounded-t transition-all ${
                            idx === (selectedItem.priceHistory?.length || 0) - 1
                              ? 'bg-indigo-600'
                              : 'bg-indigo-300'
                          }`}
                          style={{ height: `${Math.min(100, Math.max(25, (point.price / 350) * 100))}%` }}
                        />
                        <span className="text-[10px] text-slate-500 font-medium truncate max-w-[70px]">
                          {point.date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Primary Actions */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  onClick={() => onSelectListing(selectedItem)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  View Full Listing Details
                </button>
                <button
                  onClick={() => onRequestTrade(selectedItem)}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span>Request to Trade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-400 text-xs">
              Select an item on the left to inspect its market benchmark.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
