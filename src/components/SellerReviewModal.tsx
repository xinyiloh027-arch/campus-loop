
import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  ShieldCheck,
  Package,
  MapPin,
  User,
  DollarSign
} from 'lucide-react';
import { TradeRequest, Listing } from '../types';

interface SellerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TradeRequest | null;
  listing?: Listing | null;
  onApprove: (requestId: string) => Promise<void>;
  onAcceptOffer: (requestId: string) => Promise<void>;
}

export const SellerReviewModal: React.FC<SellerReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  listing,
  onApprove,
  onAcceptOffer
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen || !request) return null;

  const isPaymentReview = request.status === 'Payment Under Review';
  const isNormalOffer =
    request.status === 'Pending Seller Response' ||
    request.status === 'Pending';

  const requestedQty = request.quantity || 1;
  const currentRemaining =
    typeof listing?.remainingQuantity === 'number'
      ? listing.remainingQuantity
      : (listing?.originalQuantity || 1);

  const totalAmount =
    request.totalPrice || request.offeredPrice * requestedQty;

  const stockAfterApproval = currentRemaining - requestedQty;
  const isOutOfStock = stockAfterApproval < 0;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isPaymentReview) {
        await onApprove(request.id);
      } else if (isNormalOffer) {
        await onAcceptOffer(request.id);
      } else {
        throw new Error('This purchase request can no longer be reviewed.');
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'The action failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setShowConfirmation(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4 max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              {isPaymentReview ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isPaymentReview ? 'Payment Confirmation' : 'Review Purchase Offer'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isPaymentReview
                  ? 'Independently verify payment received'
                  : 'Review the buyer’s purchase request'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Request details */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Buyer
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {request.buyerName}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Contact
              </span>
              <span className="font-mono text-blue-600 font-bold text-xs">
                {request.buyerContact || 'Not provided'}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3 text-[11px]">
            <div>
              <span className="text-slate-400 block">Item</span>
              <strong className="text-slate-800">
                {request.listingTitle}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block">Meetup Location</span>
              <strong className="text-slate-800 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {request.pickupLocation || 'To be arranged'}
              </strong>
            </div>
          </div>

          {request.message && (
            <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-600">
              {request.message}
            </div>
          )}
        </div>

        {/* Order amount */}
        <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              {isPaymentReview ? 'Payment Declared' : 'Order Amount'}
            </span>

            <span className="text-lg font-black text-blue-700">
              RM {totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 bg-white rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-400 block">
                Quantity
              </span>
              <strong className="text-sm text-slate-800">
                {requestedQty} unit(s)
              </strong>
            </div>

            <div className="p-2 bg-white rounded-xl border border-blue-100">
              <span className="text-[10px] text-slate-400 block">
                Unit Price
              </span>
              <strong className="text-sm text-slate-800">
                RM {request.offeredPrice.toFixed(2)}
              </strong>
            </div>
          </div>

          {isPaymentReview && (
            <div className="pt-2 border-t border-blue-200/70 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Receipt className="w-4 h-4" />
                Buyer Payment Declaration
              </div>

              <p className="text-[11px] text-slate-600">
                Payment method: <strong>{request.paymentMethod || 'Not specified'}</strong>
              </p>

              <p className="text-[11px] text-slate-600">
                Declared at: {request.paymentDeclaredAt
                  ? new Date(request.paymentDeclaredAt).toLocaleString()
                  : 'Not available'}
              </p>
            </div>
          )}
        </div>

        {/* Payment verification warning */}
        {isPaymentReview && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              Verify the payment yourself
            </div>

            <p className="text-[11px] text-amber-800 leading-relaxed">
              The buyer has declared that payment was made. This declaration
              is not proof of receipt. Check your own bank statement or
              e-wallet transaction history before confirming.
            </p>

            <p className="text-[11px] text-amber-800 font-semibold">
              Never confirm based only on the buyer’s message or declaration.
            </p>
          </div>
        )}

        {/* Stock information for payment confirmation */}
        {isPaymentReview && (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">
              Stock Impact After Confirmation
            </h4>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Available</span>
                <strong>{currentRemaining}</strong>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Deduct</span>
                <strong className="text-rose-600">
                  -{requestedQty}
                </strong>
              </div>

              <div className="p-2 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block">Remaining</span>
                <strong className={isOutOfStock ? 'text-rose-600' : 'text-emerald-700'}>
                  {isOutOfStock ? 'Insufficient' : stockAfterApproval}
                </strong>
              </div>
            </div>

            {isOutOfStock && (
              <p className="text-[11px] text-rose-700 font-semibold">
                There is insufficient stock for this request.
              </p>
            )}
          </div>
        )}

        {/* Normal offer explanation */}
        {isNormalOffer && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-900">
            Accepting this offer does not confirm payment or deduct stock.
            The buyer can then coordinate payment arrangements with you.
          </div>
        )}

        {/* Confirmation screen */}
        {showConfirmation ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                {isPaymentReview
                  ? 'Confirm Payment Received?'
                  : 'Accept This Purchase Offer?'}
              </div>

              <p className="text-[11px] text-slate-700 mt-2 leading-relaxed">
                {isPaymentReview
                  ? `Confirm that RM ${totalAmount.toFixed(2)} has actually arrived in your account. This will approve the transaction and deduct ${requestedQty} unit(s) from stock.`
                  : `Accept ${request.buyerName}'s offer for "${request.listingTitle}". The request will move to Chat / Payment Arrangement. No stock will be deducted yet.`}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting || (isPaymentReview && isOutOfStock)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isSubmitting
                  ? 'Processing...'
                  : isPaymentReview
                    ? 'Confirm Receipt & Deduct Stock'
                    : 'Confirm Offer Acceptance'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
            >
              Close
            </button>

            {isNormalOffer && (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Offer
              </button>
            )}

            {isPaymentReview && (
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                disabled={isOutOfStock}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                Confirm Payment Received
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
