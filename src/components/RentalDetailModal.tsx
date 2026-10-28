import React, { useState, useMemo } from 'react';
import { 
  X, 
  MapPin, 
  Repeat, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  Clock, 
  Info, 
  ArrowRight,
  Check
} from 'lucide-react';
import { RentalItem, RentalRequest } from '../types';
import { storageService } from '../services/storageService';

interface RentalDetailModalProps {
  item: RentalItem | null;
  onClose: () => void;
  onRequestRent: (reqData: {
    rentalItemId: string;
    startDate: string;
    returnDate: string;
    days: number;
    pricePerDay: number;
    rentalFeeTotal: number;
    securityDeposit: number;
    totalBeforeRental: number;
    pickupLocation: string;
    message: string;
  }) => void;
  onStartChat: (ownerName: string, item: RentalItem) => void;
}

export const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  item,
  onClose,
  onRequestRent,
  onStartChat,
}) => {
  if (!item) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Default dates: tomorrow to tomorrow + 2 days
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const threeDaysLaterStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [returnDate, setReturnDate] = useState(threeDaysLaterStr);
  const [renterMessage, setRenterMessage] = useState('Hi! I would like to rent this item for my coursework. I will handle it with care.');
  const [showConfirmStep, setShowConfirmStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];

  // Duration in days
  const days = useMemo(() => {
    const s = new Date(startDate).getTime();
    const r = new Date(returnDate).getTime();
    if (isNaN(s) || isNaN(r) || r < s) return 1;
    const diff = Math.ceil((r - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [startDate, returnDate]);

  // Cost breakdown calculations
  const rentalFeeTotal = item.pricePerDay * days;
  const securityDeposit = item.securityDeposit;
  const totalBeforeRental = rentalFeeTotal + securityDeposit;

  // Check booking overlap with existing approved/active bookings
  const isOverlapping = useMemo(() => {
    if (!startDate || !returnDate) return false;
    return storageService.checkRentalOverlap(item.id, startDate, returnDate);
  }, [item.id, startDate, returnDate]);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverlapping) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onRequestRent({
        rentalItemId: item.id,
        startDate,
        returnDate,
        days,
        pricePerDay: item.pricePerDay,
        rentalFeeTotal,
        securityDeposit,
        totalBeforeRental,
        pickupLocation: item.pickupLocation,
        message: renterMessage.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              <span>Rental Item</span>
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-700">{item.category}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Main Photo Gallery */}
          <div className="space-y-2">
            <div className="relative h-60 sm:h-72 w-full rounded-2xl bg-slate-100 overflow-hidden border border-slate-200/80">
              <img
                src={images[activeImageIndex]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                Condition: {item.condition}
              </div>

              <div className="absolute top-3 right-3">
                {item.isAvailable ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-600 text-white text-[10px] font-bold">
                    Currently Rented
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title, Pricing & Highlights */}
          <div className="space-y-2.5 border-b border-slate-100 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1 text-blue-700">
                <span className="text-sm font-bold">RM</span>
                <span className="text-3xl font-black tabular-nums">{item.pricePerDay}</span>
                <span className="text-xs font-semibold text-slate-500">/ day</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Refundable Deposit: RM {item.securityDeposit}</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {item.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1 text-slate-600 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Pickup: {item.pickupLocation}</span>
              </span>
              <span>·</span>
              <span className="text-slate-500">{item.availableDates}</span>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/30 rounded-2xl border border-blue-100 p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                {item.ownerAvatar ? (
                  <img src={item.ownerAvatar} alt={item.ownerName} className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  item.ownerName.substring(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-900">{item.ownerName}</span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Student
                  </span>
                </div>
                <p className="text-xs text-slate-500">{item.ownerFaculty || 'Campus Student'}</p>
                <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{item.ownerRating || 4.9} rating &bull; Prompt handovers</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartChat(item.ownerName, item)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Chat with Owner</span>
            </button>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Item Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {item.description}
            </p>
          </div>

          {/* Rental Rules & Instructions */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Owner's Rental Rules & Instructions</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80">
              {item.rules || 'Please handle with care and return by the agreed date and time.'}
            </p>
          </div>

          {/* Interactive Date Selector & Cost Breakdown */}
          <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Select Rental Dates</span>
              </h3>
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                {days} {days === 1 ? 'day' : 'days'} duration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return Date *
                </label>
                <input
                  type="date"
                  min={startDate || new Date().toISOString().split('T')[0]}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Overlap Warning if applicable */}
            {isOverlapping && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Unavailable for Selected Dates:</strong> This item already has an approved rental booking overlapping with your selected dates. Please adjust your dates.
                </span>
              </div>
            )}

            {/* Cost Breakdown Box */}
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200/80">
              <div className="font-bold text-slate-700 pb-1 border-b border-slate-200/60 flex items-center justify-between">
                <span>Rental Cost Breakdown</span>
                <span className="text-[10px] text-slate-400 font-normal">Calculated in RM</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Daily Rental Fee:</span>
                <span className="font-semibold text-slate-800">RM {item.pricePerDay} &times; {days} {days === 1 ? 'day' : 'days'} = RM {rentalFeeTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1">
                  <span>Refundable Security Deposit:</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                </span>
                <span className="font-semibold text-emerald-700">RM {securityDeposit.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline font-bold text-slate-900">
                <span>Total Amount Before Rental Begins:</span>
                <span className="text-base text-blue-700 font-black">RM {totalBeforeRental.toFixed(2)}</span>
              </div>

              <div className="p-2 bg-emerald-50 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Deposit refund after qualifying return: <strong>RM {securityDeposit.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Note on payment & prototype */}
            <div className="text-[11px] text-slate-500 leading-relaxed">
              ℹ️ <strong>Campus Loop Prototype:</strong> No credit card fees are processed online. Handover conditions and deposit refunds are recorded and verified directly between students via DuitNow QR or cash.
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block">Total Due at Handover</span>
            <div className="text-lg sm:text-xl font-black text-blue-700 tabular-nums">
              RM {totalBeforeRental.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStartChat(item.ownerName, item)}
              className="p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center justify-center"
              title="Chat with Owner"
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </button>

            <button
              type="button"
              disabled={isOverlapping || !item.isAvailable}
              onClick={() => setShowConfirmStep(true)}
              className={`py-3 px-5 sm:px-7 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md ${
                !isOverlapping && item.isAvailable
                  ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-blue-200 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Repeat className="w-4 h-4" />
              <span>Request to Rent</span>
            </button>
          </div>
        </div>

      </div>

      {/* Confirmation Screen / Modal before submitting request */}
      {showConfirmStep && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in zoom-in-95">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Confirm Rental Request</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmStep(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="text-slate-500">Owner: {item.ownerName} &bull; Pickup: {item.pickupLocation}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-blue-950 font-medium">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Start Date</span>
                  <strong>{startDate}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Return Date</span>
                  <strong>{returnDate} ({days} days)</strong>
                </div>
              </div>

              <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl">
                <div className="flex justify-between text-slate-600">
                  <span>Rental Fee ({days} days @ RM {item.pricePerDay}/day):</span>
                  <span className="font-bold text-slate-900">RM {rentalFeeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-emerald-700">RM {securityDeposit.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between text-sm font-black text-blue-700">
                  <span>Total Due Before Handover:</span>
                  <span>RM {totalBeforeRental.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Message / Special Request to Owner
                </label>
                <textarea
                  rows={2}
                  value={renterMessage}
                  onChange={(e) => setRenterMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                🛡️ The security deposit of <strong>RM {securityDeposit.toFixed(2)}</strong> is fully refunded when the item is returned in agreed condition.
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmStep(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRequest}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Request...' : 'Confirm & Send Request'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
