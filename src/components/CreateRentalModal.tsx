import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Repeat, 
  Check, 
  AlertCircle, 
  Info, 
  ShieldCheck,
  Tag
} from 'lucide-react';
import { RentalItem, RentalCategory, RENTAL_CATEGORIES, Condition } from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';

interface CreateRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newRentalItem: Omit<RentalItem, 'id' | 'createdAt'>) => void;
  editItem?: RentalItem | null;
}

const PRESET_RENTAL_IMAGES = [
  { name: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80' },
  { name: '4K Camera', url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80' },
  { name: 'Smart Projector', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Badminton Set', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' },
  { name: 'Graduation Gown', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cordless Drill Tool', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Multi Cooker', url: 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Smartphone Gimbal', url: 'https://images.unsplash.com/photo-1589872766857-2110abb95a08?auto=format&fit=crop&w=600&q=80' },
];

const CONDITIONS: Condition[] = ['Brand New', 'Like New', 'Good', 'Fair'];

export const CreateRentalModal: React.FC<CreateRentalModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
  editItem,
}) => {
  const [name, setName] = useState(editItem?.name || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [category, setCategory] = useState<RentalCategory>(editItem?.category || RENTAL_CATEGORIES[0]);
  const [condition, setCondition] = useState<Condition>(editItem?.condition || 'Like New');
  const [pricePerDay, setPricePerDay] = useState(editItem ? editItem.pricePerDay.toString() : '');
  const [securityDeposit, setSecurityDeposit] = useState(editItem ? editItem.securityDeposit.toString() : '');
  const [availableDates, setAvailableDates] = useState(editItem?.availableDates || 'Available daily on campus');
  const [location, setLocation] = useState(editItem?.pickupLocation || POPULAR_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [rules, setRules] = useState(editItem?.rules || 'Please handle with care and return by the agreed date. Do not sub-rent.');
  
  const [selectedPresetImage, setSelectedPresetImage] = useState(editItem?.imageUrl || PRESET_RENTAL_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Please choose an image under 2MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setCustomImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const getEffectiveImageUrl = () => {
    if (uploadedImage) return uploadedImage;
    if (customImageUrl.trim()) return customImageUrl.trim();
    return selectedPresetImage;
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Item name is required.';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Item name must be at least 3 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the item and condition.';
    }

    const numPrice = parseFloat(pricePerDay);
    if (!pricePerDay || isNaN(numPrice)) {
      newErrors.price = 'Please specify a daily rental fee in RM.';
    } else if (numPrice < 0) {
      newErrors.price = 'Rental price cannot be negative.';
    }

    const numDeposit = parseFloat(securityDeposit);
    if (!securityDeposit || isNaN(numDeposit)) {
      newErrors.deposit = 'Please specify a refundable security deposit.';
    } else if (numDeposit < 0) {
      newErrors.deposit = 'Security deposit cannot be negative.';
    }

    if (!availableDates.trim()) {
      newErrors.availableDates = 'Please specify available dates or schedule.';
    }

    const finalLoc = location === 'Other' ? customLocation.trim() : location;
    if (!finalLoc) {
      newErrors.location = 'Please specify campus pickup and return location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalLocation = location === 'Other' ? customLocation.trim() : location;
    const finalImage = getEffectiveImageUrl();

    const payload: Omit<RentalItem, 'id' | 'createdAt'> = {
      name: name.trim(),
      description: description.trim(),
      category,
      condition,
      images: [finalImage],
      imageUrl: finalImage,
      pricePerDay: parseFloat(pricePerDay),
      securityDeposit: parseFloat(securityDeposit),
      availableDates: availableDates.trim(),
      pickupLocation: finalLocation,
      rules: rules.trim(),
      ownerId: 'user-current',
      ownerName: 'Alex Tan',
      ownerContact: 'alex.tan@student.edu.my',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      ownerRating: 4.9,
      ownerFaculty: 'FCSIT (Year 2)',
      isAvailable: true,
      isUserCreated: true,
    };

    setTimeout(() => {
      onListingCreated(payload);
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
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Repeat className="w-5 h-5 text-blue-600" />
              <span>{editItem ? 'Edit Rental Listing' : 'List an Item for Rent'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rent out calculators, cameras, dorm appliances, or tools to campus peers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          {/* Item Name */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sony Alpha A6400 4K Camera, Casio Scientific Calculator..."
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.name ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
              } text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Category & Condition in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Rental Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RentalCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RENTAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing: Rental Price/Day + Refundable Deposit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-100">
            {/* Daily Price */}
            <div>
              <label className="block font-bold text-blue-950 mb-1">
                Daily Rental Fee (RM / day) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                  RM
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="e.g. 10"
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border bg-white ${
                    errors.price ? 'border-rose-400' : 'border-slate-200'
                  } text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">Your rental income per day</span>
              {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
            </div>

            {/* Refundable Security Deposit */}
            <div>
              <label className="block font-bold text-emerald-950 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Refundable Deposit (RM) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                  RM
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  placeholder="e.g. 50"
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border bg-white ${
                    errors.deposit ? 'border-rose-400' : 'border-slate-200'
                  } text-emerald-800 font-black text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              <span className="text-[10px] text-emerald-700 font-medium mt-0.5 block">
                Tracked separately & refunded on return
              </span>
              {errors.deposit && <p className="text-[11px] text-rose-500 mt-1">{errors.deposit}</p>}
            </div>
          </div>

          {/* Photo Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              Item Photo *
            </label>

            {/* Current preview */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <img
                  src={getEffectiveImageUrl()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800 block">Selected Product Photo</span>
                <span className="text-[11px] text-slate-400">Choose a preset below, paste a link, or upload.</span>
              </div>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESET_RENTAL_IMAGES.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPresetImage(p.url);
                    setUploadedImage(null);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedPresetImage === p.url && !uploadedImage && !customImageUrl
                      ? 'border-blue-600 scale-102 ring-2 ring-blue-100'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                  title={p.name}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Custom upload or link */}
            <div className="flex items-center gap-2 pt-1">
              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  setUploadedImage(null);
                }}
                placeholder="Or paste image URL..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
              />
            </div>
            {errors.image && <p className="text-[11px] text-rose-500">{errors.image}</p>}
          </div>

          {/* Availability Schedule & Pickup Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Available Dates / Schedule *
              </label>
              <input
                type="text"
                value={availableDates}
                onChange={(e) => setAvailableDates(e.target.value)}
                placeholder="e.g. Weekdays & Midterm Week, All semester"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.availableDates && <p className="text-[11px] text-rose-500 mt-1">{errors.availableDates}</p>}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pickup & Return Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {location === 'Other' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Specify Location *
              </label>
              <input
                type="text"
                required
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g. Science Faculty Gazebo"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description & Accessories Included *
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe model, what is bundled (chargers, cases, cables), and ideal use cases..."
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.description ? 'border-rose-400' : 'border-slate-200'
              } text-slate-800 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
          </div>

          {/* Rental Rules & Instructions */}
          <div>
            <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              <span>Rental Rules & Instructions</span>
            </label>
            <textarea
              rows={2}
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="e.g. Keep lens cap on when not in use. Return with battery recharged. Do not sub-rent."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : editItem ? 'Save Changes' : 'Publish Rental Listing'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
