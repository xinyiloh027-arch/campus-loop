import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  Info, 
  Camera, 
  Check, 
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { RentalRequest } from '../types';

// ==========================================
// 1. HANDOVER CONDITION RECORDING MODAL
// ==========================================
interface HandoverModalProps {
  request: RentalRequest | null;
  onClose: () => void;
  onConfirm: (requestId: string, notes: string) => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  request,
  onClose,
  onConfirm,
}) => {
  if (!request) return null;

  const [notes, setNotes] = useState(
    'Inspected item together at campus meetup. All accessories, cables, and chargers present. No cosmetic or functional damages. Handed over in working order.'
  );
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCheck) return;
    onConfirm(request.id, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Record Handover Condition</h3>
              <p className="text-[11px] text-slate-500">Step 6: Handover Inspection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-800">{request.rentalItemName}</div>
            <div className="text-slate-500">Renter: {request.renterName} &bull; Pickup: {request.pickupLocation}</div>
            <div className="text-blue-700 font-bold">Security Deposit: RM {request.securityDeposit} (Paid/Received)</div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Handover Condition Notes *
            </label>
            <textarea
              rows={3}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record serial numbers, cosmetic condition, battery health, accessories included..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <label className="flex items-start gap-2.5 p-3 bg-blue-50/60 rounded-xl border border-blue-100 cursor-pointer select-none">
            <input
              type="checkbox"
              required
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px] text-blue-900 leading-snug">
              I verify that the item was handed over in the noted condition and the refundable security deposit of <strong>RM {request.securityDeposit}</strong> has been collected or recorded.
            </span>
          </label>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmedCheck}
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shadow-md ${
                confirmedCheck
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Confirm Handover (Rented Out)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. OWNER RETURN INSPECTION MODAL
// ==========================================
interface InspectionModalProps {
  request: RentalRequest | null;
  onClose: () => void;
  onRecordInspection: (
    requestId: string, 
    returnNotes: string, 
    passed: boolean, 
    proposedDeduction?: number, 
    deductionReason?: string
  ) => void;
}

export const InspectionModal: React.FC<InspectionModalProps> = ({
  request,
  onClose,
  onRecordInspection,
}) => {
  if (!request) return null;

  const [passed, setPassed] = useState<boolean>(true);
  const [returnNotes, setReturnNotes] = useState('Item returned in excellent condition on time with all accessories present.');
  const [proposedDeduction, setProposedDeduction] = useState('');
  const [deductionReason, setDeductionReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numDeduction = proposedDeduction ? parseFloat(proposedDeduction) : 0;
    onRecordInspection(
      request.id,
      returnNotes.trim(),
      passed,
      numDeduction,
      deductionReason.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Inspect Returned Item</h3>
              <p className="text-[11px] text-slate-500">Step 9: Condition Inspection & Deposit Decision</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="font-bold text-slate-800">{request.rentalItemName}</div>
            <div className="text-slate-500">Renter: {request.renterName} &bull; Total Deposit Held: <strong>RM {request.securityDeposit}</strong></div>
            {request.handoverConditionNotes && (
              <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200 mt-1">
                Handover Baseline: "{request.handoverConditionNotes}"
              </div>
            )}
          </div>

          {/* Outcome Choice */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Inspection Result *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPassed(true);
                  setReturnNotes('Item returned in excellent condition on time with all accessories present.');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  passed
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-100 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Pass (Good Condition)</span>
                  {passed && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                </div>
                <span className="text-[10px] font-normal text-slate-500">Full deposit refund approved</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPassed(false);
                  setReturnNotes('');
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  !passed
                    ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-100 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Issue / Damage Found</span>
                  {!passed && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                </div>
                <span className="text-[10px] font-normal text-slate-500">Initiates transparent dispute process</span>
              </button>
            </div>
          </div>

          {/* Inspection Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Return Inspection Notes *
            </label>
            <textarea
              rows={2}
              required
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="State any wear, missing items, or verify that all cables and parts returned cleanly..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* If Damage/Issue Found */}
          {!passed && (
            <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Proposed Security Deposit Deduction</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                CampusLoop policy: Owners cannot secretly deduct deposits. Your proposed deduction will be clearly notified to the renter for review and mutual agreement.
              </p>

              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  Proposed Deduction Amount (RM) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                  <input
                    type="number"
                    min="1"
                    max={request.securityDeposit}
                    step="1"
                    required
                    value={proposedDeduction}
                    onChange={(e) => setProposedDeduction(e.target.value)}
                    placeholder={`Max RM ${request.securityDeposit}`}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Remaining refund to renter: RM {Math.max(0, request.securityDeposit - (parseFloat(proposedDeduction) || 0)).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block font-bold text-amber-950 mb-1">
                  Deduction Reason & Item Details *
                </label>
                <input
                  type="text"
                  required
                  value={deductionReason}
                  onChange={(e) => setDeductionReason(e.target.value)}
                  placeholder="e.g. Missing 3-piece screwdriver bits set, cracked lens cap"
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-800 text-xs"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 text-white shadow-md transition-all ${
                passed 
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{passed ? 'Pass Inspection (Refund Full Deposit)' : 'Submit Inspection with Deduction'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. DISPUTE RESOLUTION MODAL
// ==========================================
interface DisputeModalProps {
  request: RentalRequest | null;
  onClose: () => void;
  onResolveDispute: (requestId: string, agreedRefundAmount: number, notes: string, renterResponse?: string) => void;
  isOwner: boolean;
}

export const DisputeModal: React.FC<DisputeModalProps> = ({
  request,
  onClose,
  onResolveDispute,
  isOwner,
}) => {
  if (!request) return null;

  const [agreedRefund, setAgreedRefund] = useState(
    (request.securityDeposit - (request.proposedDeduction || 0)).toString()
  );
  const [resolutionNotes, setResolutionNotes] = useState('Agreed on resolved deposit settlement.');
  const [renterResponse, setRenterResponse] = useState(request.renterDisputeResponse || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const refundNum = parseFloat(agreedRefund);
    if (isNaN(refundNum) || refundNum < 0 || refundNum > request.securityDeposit) return;

    onResolveDispute(request.id, refundNum, resolutionNotes.trim(), renterResponse.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Rental Deposit Dispute Resolution</h3>
              <p className="text-[11px] text-slate-500">Transparent Peer Negotiation</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2 text-amber-950">
            <div className="font-bold">{request.rentalItemName}</div>
            <div className="flex justify-between border-b border-amber-200/60 pb-1">
              <span>Original Security Deposit:</span>
              <span className="font-bold">RM {request.securityDeposit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Proposed Deduction by Owner:</span>
              <span className="font-bold text-rose-700">- RM {(request.proposedDeduction || 0).toFixed(2)}</span>
            </div>
            {request.deductionReason && (
              <div className="p-2 bg-white rounded-lg text-slate-700 italic border border-amber-200">
                Reason: "{request.deductionReason}"
              </div>
            )}
          </div>

          {/* Renter response section */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isOwner ? "Renter's Response / Explanation" : "Your Explanation / Counter-Offer"}
            </label>
            <textarea
              rows={2}
              value={renterResponse}
              onChange={(e) => setRenterResponse(e.target.value)}
              placeholder="e.g. I found the missing item and can return it by 4 PM, or I accept the RM15 deduction..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Agreed Refund Amount */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2">
            <label className="block font-bold text-slate-800">
              Agreed Deposit Refund to Renter (RM) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">RM</span>
              <input
                type="number"
                min="0"
                max={request.securityDeposit}
                step="0.5"
                required
                value={agreedRefund}
                onChange={(e) => setAgreedRefund(e.target.value)}
                className="w-full pl-11 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-bold focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 block">
              Max deposit is RM {request.securityDeposit}. Owner retains remainder RM {(request.securityDeposit - (parseFloat(agreedRefund) || 0)).toFixed(2)}.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Resolution Agreement Notes
            </label>
            <input
              type="text"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Dispute Settlement</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
