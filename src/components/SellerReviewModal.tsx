import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Receipt, 
  ShieldCheck, 
  Package, 
  DollarSign, 
  MapPin, 
  User, 
  Clock,
  Layers,
  ZoomIn
} from 'lucide-react';
import { TradeRequest, Listing } from '../types';

interface SellerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TradeRequest | null;
  listing?: Listing | null;
  onApprove: (requestId: string) => Promise<void>;
  onReject: (requestId: string, reason: string) => Promise<void>;
}

const REJECTION_REASONS = [
  'Payment not received in bank statement / DuitNow',
  'Transfer amount does not match order total',
  'Receipt screenshot is blurry or cropped',
  'Duplicate or invalid transaction reference',
  'Other reason'
];

export const SellerReviewModal: React.FC<SellerReviewModalProps> = ({
  isOpen,
  onClose,
  request,
  listing,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !request) return null;

  const [mode, setMode] = useState<'view' | 'confirm_approve' | 'reject_input'>('view');
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zoomReceipt, setZoomReceipt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestedQty = request.quantity || 1;
  const currentRemaining = typeof listing?.remainingQuantity === 'number'
    ? listing.remainingQuantity
    : (listing?.originalQuantity || 1);

  const totalAmount = request.totalPrice || (request.offeredPrice * requestedQty);
  const stockAfterApproval = currentRemaining - requestedQty;
  const isOutOfStock = stockAfterApproval < 0;

  const handleApproveConfirm = async () => {
    if (isOutOfStock) {
      setErrorMessage(`Cannot approve: Requested ${requestedQty} unit(s) exceeds available stock (${currentRemaining}).`);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onApprove(request.id);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to approve transaction.');
      setIsSubmitting(false);
    }
  };

  const handleRejectConfirm = async () => {
    const finalReason = selectedReason === 'Other reason'
      ? customReason.trim() || 'Payment proof was not accepted.'
      : selectedReason;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await onReject(request.id, finalReason);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to reject payment proof.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Seller Transaction Verification</h3>
              <p className="text-[11px] text-slate-500">Review buyer payment receipt & adjust inventory</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW MODE: DETAILS & RECEIPT */}
        {/* ============================================================== */}
        {mode === 'view' && (
          <div className="space-y-4 text-xs">
            {/* Buyer & Order Card */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Buyer</span>
                  <span className="font-bold text-slate-900 text-sm">{request.buyerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Contact</span>
                  <span className="font-mono text-blue-600 font-bold">{request.buyerContact}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/70 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Item</span>
                  <strong className="text-slate-800 line-clamp-1">{request.listingTitle}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Meetup Location</span>
                  <strong className="text-slate-800 line-clamp-1">{request.pickupLocation}</strong>
                </div>
              </div>

              {request.message && (
                <div className="p-2 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 italic">
                  "{request.message}"
                </div>
              )}
            </div>

            {/* Inventory & Financial Impact */}
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Total Payment to Receive:</span>
                <span className="text-base font-black text-blue-700 tabular-nums">
                  RM {totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-blue-200/50 text-center">
                <div className="p-2 bg-white rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block">Requested</span>
                  <strong className="text-sm font-bold text-slate-800">{requestedQty} unit(s)</strong>
                </div>

                <div className="p-2 bg-white rounded-xl border border-blue-100">
                  <span className="text-[10px] text-slate-400 block">Available</span>
                  <strong className="text-sm font-bold text-blue-700">{currentRemaining} unit(s)</strong>
                </div>

                <div className={`p-2 rounded-xl border ${
                  isOutOfStock 
                    ? 'bg-rose-50 border-rose-200 text-rose-700' 
                    : stockAfterApproval === 0 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span className="text-[10px] block opacity-80">Remaining After</span>
                  <strong className="text-sm font-bold">
                    {isOutOfStock ? 'Shortage!' : `${stockAfterApproval} left`}
                  </strong>
                </div>
              </div>

              {stockAfterApproval === 0 && !isOutOfStock && (
                <p className="text-[11px] text-amber-700 font-semibold text-center mt-1">
                  ⚠️ Approving this transaction will reduce stock to 0 and automatically mark the item as <strong>Sold</strong>.
                </p>
              )}
            </div>

            {/* Uploaded Payment Proof Screenshot */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buyer Payment Receipt</span>
                </span>
                {request.paymentMethod && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {request.paymentMethod}
                  </span>
                )}
              </div>

              {request.paymentProofUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group">
                  <img
                    src={request.paymentProofUrl}
                    alt="Payment Proof"
                    className="w-full max-h-64 object-contain mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setZoomReceipt(!zoomReceipt)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 rounded-xl bg-black/70 hover:bg-black text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs cursor-pointer"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>{zoomReceipt ? 'Fit' : 'Expand'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-center text-xs">
                  Buyer has not uploaded a payment screenshot yet. You can chat with them to request payment proof.
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setMode('reject_input')}
                className="px-4 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Reject Proof</span>
              </button>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={() => setMode('confirm_approve')}
                className="flex-1 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Transaction</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* APPROVE CONFIRMATION DIALOG */}
        {/* ============================================================== */}
        {mode === 'confirm_approve' && (
          <div className="space-y-4 text-xs animate-in fade-in-50">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Confirm Transaction Approval</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                You are about to verify that <strong>{request.buyerName}</strong> paid <strong>RM {totalAmount.toFixed(2)}</strong> for <strong>{requestedQty} unit(s)</strong> of "{request.listingTitle}".
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span>Current stock:</span>
                  <strong>{currentRemaining} unit(s)</strong>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Deducting:</span>
                  <strong>- {requestedQty} unit(s)</strong>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-1 font-bold">
                  <span>New stock level:</span>
                  <strong>{stockAfterApproval} unit(s)</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500">
              The buyer will receive an immediate notification, and the transaction will be marked Approved so you can proceed to physical campus handover.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Approving...' : 'Confirm Approval & Deduct Stock'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* REJECT PROOF INPUT DIALOG */}
        {/* ============================================================== */}
        {mode === 'reject_input' && (
          <div className="space-y-4 text-xs animate-in fade-in-50">
            <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-1">
              <span className="font-bold text-rose-900 block text-sm">
                Reject Payment Proof
              </span>
              <p className="text-slate-600 text-[11px]">
                Specify why this receipt is not accepted. Your inventory stock will <strong>not</strong> be deducted, and the buyer will be instructed to provide an updated receipt.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block font-bold text-slate-700">
                Select Reason *
              </label>
              <div className="space-y-1.5">
                {REJECTION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason
                        ? 'border-rose-300 bg-rose-50/60 font-semibold text-rose-900'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {selectedReason === 'Other reason' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Specific Explanation *
                </label>
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Explain why the proof was rejected..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setMode('view')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Rejecting...' : 'Reject & Notify Buyer'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
