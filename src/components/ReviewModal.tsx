import React, { useState } from 'react';
import { 
  Star, 
  ShieldCheck, 
  X, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { TradeRequest, Review } from '../types';

export interface ReviewModalProps {
  request: TradeRequest | null;
  currentUserRole: 'Buyer' | 'Seller';
  currentUserName: string;
  onClose: () => void;
  onSubmit: (reviewData: Omit<Review, 'id' | 'createdAt'>) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  request,
  currentUserRole,
  currentUserName,
  onClose,
  onSubmit,
}) => {
  if (!request) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Reviewee is the other party in the transaction
  const revieweeName = currentUserRole === 'Buyer' ? request.sellerName : request.buyerName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating from 1 to 5.');
      return;
    }

    if (!comment.trim()) {
      setError('Please leave a brief comment about your campus trade experience.');
      return;
    }

    onSubmit({
      transactionId: request.id,
      listingId: request.listingId,
      listingTitle: request.listingTitle,
      reviewerName: currentUserName || 'Alex Tan',
      reviewerRole: currentUserRole,
      revieweeName,
      rating,
      comment: comment.trim(),
      isVerifiedTransaction: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Leave Verified Review</h3>
              <p className="text-[11px] text-slate-500">
                Reviewing {revieweeName} as a verified {currentUserRole}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
          <img
            src={request.listingImage}
            alt={request.listingTitle}
            className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3" />
              Verified Completed Trade
            </div>
            <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{request.listingTitle}</h4>
            <div className="text-xs text-slate-600">Traded for RM {request.offeredPrice.toFixed(2)}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star Rating */}
          <div className="space-y-2 text-center py-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        isActive
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-xs font-bold text-slate-600">
              {rating === 5 && '🌟 Excellent experience'}
              {rating === 4 && '👍 Great and smooth meetup'}
              {rating === 3 && '😐 Average trade'}
              {rating === 2 && '👎 Had some issues'}
              {rating === 1 && '⚠️ Poor communication or condition'}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Feedback & Comments *
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Arrived on time at the library, book was exactly in condition described! Highly recommended senior."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Submit Verified Review
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
