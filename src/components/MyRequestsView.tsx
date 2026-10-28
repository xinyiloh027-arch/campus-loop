import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CheckCheck, 
  MapPin, 
  MessageSquare, 
  Star, 
  Send, 
  Inbox
} from 'lucide-react';
import { TradeRequest, RequestStatus } from '../types';

interface MyRequestsViewProps {
  requests: TradeRequest[];
  onStatusChange: (requestId: string, newStatus: RequestStatus) => void;
  onOpenReviewModal: (request: TradeRequest, role: 'Buyer' | 'Seller') => void;
  onNavigateHome: () => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({
  requests,
  onStatusChange,
  onOpenReviewModal,
  onNavigateHome,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'sent' | 'received'>('sent');
  const [statusFilter, setStatusFilter] = useState<'All' | RequestStatus>('All');

  const filteredRequests = requests.filter((req) => {
    const matchesDirection = activeSubTab === 'sent' ? req.isSentByCurrentUser : !req.isSentByCurrentUser;
    const matchesStatus = statusFilter === 'All' ? true : req.status === statusFilter;
    return matchesDirection && matchesStatus;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
      case 'Accepted':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Trade Accepted!
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2.5 py-0.5 rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            Declined
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200/60 px-2.5 py-0.5 rounded-full">
            <CheckCheck className="w-3.5 h-3.5" />
            Trade Completed
          </span>
        );
    }
  };

  const sentCount = requests.filter((r) => r.isSentByCurrentUser).length;
  const receivedCount = requests.filter((r) => !r.isSentByCurrentUser).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Campus Trade Requests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track negotiations, meetup points, and submit two-way verified transaction reviews.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveSubTab('sent')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'sent'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Requests I Sent</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full tabular-nums">
              {sentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('received')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeSubTab === 'received'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Requests I Received</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-200 text-slate-700 rounded-full tabular-nums">
              {receivedCount}
            </span>
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-medium">Filter:</span>
          {(['All', 'Pending', 'Accepted', 'Completed', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} requests found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              {activeSubTab === 'sent'
                ? "You haven't sent any proposals matching this filter yet."
                : "No incoming trade proposals from classmates yet."}
            </p>
            <button
              onClick={onNavigateHome}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
            >
              Explore Marketplace
            </button>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const hasReviewed = req.isSentByCurrentUser ? req.hasBuyerReviewed : req.hasSellerReviewed;

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4">
                    <img
                      src={req.listingImage}
                      alt={req.listingTitle}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(req.status)}
                        <span className="text-xs text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {req.listingTitle}
                      </h3>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">
                          Listed: <strong className="text-slate-700">RM {req.listingPrice.toFixed(0)}</strong>
                        </span>
                        <span>·</span>
                        <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                          Offered: RM {req.offeredPrice.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Contact info */}
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-slate-400 block text-[11px]">
                      {activeSubTab === 'sent' ? 'Seller' : 'Buyer'}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {activeSubTab === 'sent' ? req.sellerName : req.buyerName}
                    </span>
                    <span className="text-indigo-600 block font-mono text-[11px]">
                      {req.buyerContact}
                    </span>
                  </div>
                </div>

                {/* Message & Pickup note */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 line-clamp-2">
                      <span className="font-medium text-slate-900">Note: </span>
                      {req.message}
                    </p>
                  </div>

                  <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-slate-600 truncate">
                      <span className="font-medium text-slate-900">Meetup: </span>
                      {req.pickupLocation}
                    </p>
                  </div>
                </div>

                {/* Action controls */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Ref #{req.id}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If Completed: Allow Leave Review (two-way reputation system) */}
                    {req.status === 'Completed' && (
                      !hasReviewed ? (
                        <button
                          onClick={() => onOpenReviewModal(req, req.isSentByCurrentUser ? 'Buyer' : 'Seller')}
                          className="px-3 py-1.5 font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Leave Verified Review</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Review Submitted</span>
                        </span>
                      )
                    )}

                    {/* Received & Pending */}
                    {!req.isSentByCurrentUser && req.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => onStatusChange(req.id, 'Rejected')}
                          className="px-3 py-1.5 font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => onStatusChange(req.id, 'Accepted')}
                          className="px-4 py-1.5 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs"
                        >
                          Accept Offer
                        </button>
                      </>
                    )}

                    {/* Accepted: Mark completed */}
                    {req.status === 'Accepted' && (
                      <button
                        onClick={() => onStatusChange(req.id, 'Completed')}
                        className="px-3.5 py-1.5 font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark as Completed (Traded)</span>
                      </button>
                    )}

                    {/* Sent & Pending: Allow cancel */}
                    {req.isSentByCurrentUser && req.status === 'Pending' && (
                      <button
                        onClick={() => onStatusChange(req.id, 'Rejected')}
                        className="px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg"
                      >
                        Withdraw Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
