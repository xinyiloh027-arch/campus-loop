import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Receipt, 
  RefreshCw,
  Camera,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { TradeRequest } from '../types';
import { imageStorageService } from '../services/imageStorageService';

interface PaymentProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: TradeRequest | null;
  onSubmitProof: (requestId: string, proofUrl: string, paymentMethod: string) => Promise<void>;
}

const PAYMENT_METHODS = [
  'DuitNow QR',
  'Online Banking (Maybank / CIMB / Bank Islam)',
  'Touch \'n Go eWallet',
  'Campus Handover Cash Arrangement'
];

export const PaymentProofModal: React.FC<PaymentProofModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitProof,
}) => {
  if (!isOpen || !request) return null;

  const [paymentMethod, setPaymentMethod] = useState(request.paymentMethod || PAYMENT_METHODS[0]);
  const [proofImage, setProofImage] = useState<string | null>(request.paymentProofUrl || null);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      // Compress and optimize receipt screenshot via Canvas (max 800px)
      const dataUrl = await imageStorageService.processImageFile(file, 800);
      setProofImage(dataUrl);
    } catch (err: any) {
      console.error('Error processing receipt:', err);
      setError('Failed to process payment receipt. Please try another image.');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleRemoveProof = () => {
    setProofImage(null);
    setFileName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      setError('Please upload a screenshot or photo of your payment receipt.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmitProof(request.id, proofImage, paymentMethod);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      console.error('Submit proof error:', err);
      setError(err?.message || 'Failed to submit payment proof.');
      setIsSubmitting(false);
    }
  };

  const totalAmount = request.totalPrice || (request.offeredPrice * (request.quantity || 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-left space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Payment Proof</h3>
              <p className="text-[11px] text-slate-500">Submit receipt to seller {request.sellerName}</p>
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

        {/* Transaction Summary Card */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900">
            <span className="truncate max-w-[200px]">{request.listingTitle}</span>
            <span className="text-blue-700 font-extrabold text-sm tabular-nums">
              RM {totalAmount.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500 text-[11px]">
            <span>Qty: {request.quantity || 1} unit(s)</span>
            <span>Seller: {request.sellerName}</span>
          </div>
        </div>

        {/* Rejection Notice if applicable */}
        {request.status === 'Payment Proof Rejected' && request.rejectionReason && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Seller Note: Payment Proof Was Rejected</span>
            </div>
            <p className="text-[11px] text-slate-700 bg-white/70 p-2 rounded-lg border border-rose-200/60">
              "{request.rejectionReason}"
            </p>
            <p className="text-[10px] text-rose-600 font-medium">
              Please upload a clear, updated receipt below.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Payment Method Used *</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              Receipt / Screenshot *
            </label>

            {proofImage ? (
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img
                      src={proofImage}
                      alt="Proof Receipt"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-slate-800 block truncate text-xs">
                      {fileName || 'Payment Receipt Screenshot'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready to submit
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <label className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveProof}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Remove receipt"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="w-full p-6 border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-blue-50/30">
                <Upload className="w-6 h-6 text-blue-600 mb-1.5" />
                <span className="font-bold text-slate-800 text-xs">
                  {isProcessing ? 'Processing image...' : 'Click to Upload Screenshot'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Supports JPG, PNG, WEBP from mobile or computer
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Note:</strong> Submitting payment proof updates status to <em>Payment Under Review</em>. Inventory is only officially deducted once the seller verifies and approves.
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessing || !proofImage}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
