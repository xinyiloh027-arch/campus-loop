
import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { TradeRequest } from '../types';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TradeRequest | null;
  onDeclarePayment: (requestId: string, paymentMethod: string) => Promise<void>;
}

const PAYMENT_METHODS = [
  'DuitNow QR',
  'Online Banking (Maybank / CIMB / Bank Islam)',
  "Touch 'n Go eWallet",
  'Campus Handover Cash Arrangement',
];

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  request,
  onDeclarePayment,
}) => {
  const [paymentMethod, setPaymentMethod] = useState(
    request?.paymentMethod || PAYMENT_METHODS[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const totalAmount =
    request.totalPrice || request.offeredPrice * (request.quantity || 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onDeclarePayment(request.id, paymentMethod);
      onClose();
    } catch (err) {
      console.error('Payment declaration error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit payment declaration. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Declare Payment
              </h3>
              <p className="text-[11px] text-slate-500">
                Payment arrangement with {request.sellerName}
              </p>
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

        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="truncate max-w-[200px]">
              {request.listingTitle}
            </span>
            <span className="text-blue-700 font-extrabold text-sm tabular-nums">
              RM {totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Qty: {request.quantity || 1} unit(s)</span>
            <span>Seller: {request.sellerName}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
            <strong>Important — payment happens outside CampusLoop.</strong>
            <p>
              Only declare payment after you have actually made the payment
              using the method arranged with the seller. CampusLoop does not
              process or hold your money.
            </p>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Seller verification:</strong> This declaration only
              notifies the seller. The seller must independently check their
              own bank or e-wallet account and confirm that the money was
              received. Stock is deducted only after seller confirmation.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting ? 'Submitting...' : "I've Made Payment"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
