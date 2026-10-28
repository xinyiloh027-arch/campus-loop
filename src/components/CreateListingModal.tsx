import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  Sparkles
} from 'lucide-react';
import { Category, Condition, Listing } from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: Listing) => void;
}

const PRESET_IMAGES = [
  { name: 'Calculus Textbook', url: '/src/assets/images/calculus_textbook_stewart_1793108041994.jpg' },
  { name: 'Wireless Mouse', url: '/src/assets/images/wireless_mouse_desk_1793108041826.jpg' },
  { name: 'Dorm Study Lamp', url: '/src/assets/images/desk_lamp_dorm_1793108042346.jpg' },
  { name: 'Graphing Calculator', url: '/src/assets/images/graphing_calculator_1793108043646.jpg' },
  { name: 'Arduino Lab Kit', url: '/src/assets/images/arduino_starter_kit_1793108043062.jpg' },
];

const CATEGORIES: Exclude<Category, 'All'>[] = [
  'Textbooks',
  'Electronics',
  'Dorm Essentials',
  'Stationery',
  'Project Equipment',
  'Other',
];

const CONDITIONS: Condition[] = ['Brand New', 'Like New', 'Good', 'Fair'];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Textbooks');
  const [condition, setCondition] = useState<Condition>('Like New');
  const [location, setLocation] = useState(POPULAR_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  
  // Authentic Photos state (multiple photos)
  const [photos, setPhotos] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [isActualPhoto, setIsActualPhoto] = useState<boolean>(true);
  const [sellerExplanation, setSellerExplanation] = useState('');

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Please choose images under 2MB each for fast browser storage.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
        setIsActualPhoto(true);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPreset = (url: string) => {
    setPhotos((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Please enter a title for your item.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a brief description of the condition and details.';
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice)) {
      newErrors.price = 'Please enter a valid price in RM.';
    } else if (numPrice < 0) {
      newErrors.price = 'Price cannot be negative. For free items, enter 0.';
    }

    if (photos.length === 0) {
      newErrors.photos = 'Please provide at least 1 photo of your item.';
    }

    const finalLocation = location === 'Other' ? customLocation.trim() : location;
    if (!finalLocation) {
      newErrors.location = 'Please specify a campus pickup location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalLocation = location === 'Other' ? customLocation.trim() : location;

    setTimeout(() => {
      import('../services/storageService').then(({ storageService }) => {
        const created = storageService.createListing({
          title: title.trim(),
          description: description.trim(),
          price: parseFloat(price),
          category,
          condition,
          location: finalLocation,
          campusLocation: finalLocation,
          listingType: 'Trade',
          imageUrl: photos[0],
          additionalImages: photos,
          isActualPhoto,
          sellerExplanation: sellerExplanation.trim() || undefined,
          sellerName: 'Alex Tan (You)',
          sellerFaculty: 'Computer Science (Year 2)',
          sellerRating: 5.0,
          marketAverage: Math.max(15, Math.round(parseFloat(price) * 0.9)),
          referencePriceMin: Math.max(10, Math.round(parseFloat(price) * 0.8)),
          referencePriceMax: Math.round(parseFloat(price) * 1.2),
          competitors: [
            { platform: 'Shopee', price: Math.round(parseFloat(price) * 1.1), condition: 'Brand New', matchConfidence: 'Exact' }
          ]
        });

        setIsSubmitting(false);
        onListingCreated(created);
        onClose();
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-lg font-bold text-slate-900">List an Item on CampusLoop</h3>
            <p className="text-xs text-slate-500">
              Pass down campus gear, upload authentic photos, and help classmates find essentials.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Calculus: Early Transcendentals (8th Ed) or Logitech MX Master 3S"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {errors.title}
              </p>
            )}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<Category, 'All'>)}
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Condition <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
                {CONDITIONS.map((cond) => (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => setCondition(cond)}
                    className={`py-1.5 text-xs font-medium rounded-md transition-colors ${
                      condition === cond
                        ? 'bg-white text-indigo-600 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price (in RM) & Pickup Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (RM) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
                  RM
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="45"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full pl-11 pr-3.5 py-2.5 text-sm bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 tabular-nums ${
                    errors.price ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.price}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Pickup Location <span className="text-rose-500">*</span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {POPULAR_CAMPUS_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
                <option value="Other">Other Custom Campus Spot...</option>
              </select>

              {location === 'Other' && (
                <input
                  type="text"
                  placeholder="e.g. Mahallah Ali Courtyard or Sports Complex"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  className="mt-2 w-full px-3.5 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Authentic Multi-Photo Upload Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Product Photos (Authentic Photos Strongly Preferred)
                </label>
                <span className="text-[11px] text-slate-400">
                  Upload multiple angles or condition close-ups from your camera or library:
                </span>
              </div>

              {/* Photo Type Flag */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsActualPhoto(true)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                    isActualPhoto
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Actual Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActualPhoto(false)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                    !isActualPhoto
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  Reference Image
                </button>
              </div>
            </div>

            {/* Photos Strip Preview & Upload Trigger */}
            <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0 group border border-slate-300">
                  <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors opacity-90"
                    title="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[9px] text-center font-bold">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Button */}
              <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/50 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                <Camera className="w-5 h-5 text-indigo-600" />
                <span className="text-[9px] font-bold text-slate-600 mt-0.5">+ Add Photo</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFiles}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preset quick picks */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
              <span>Or choose preset sample photography:</span>
              {PRESET_IMAGES.slice(0, 3).map((p) => (
                <button
                  type="button"
                  key={p.name}
                  onClick={() => handleAddPreset(p.url)}
                  className="text-indigo-600 hover:underline font-medium text-[11px]"
                >
                  +{p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Price Explanation / Value Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Specification or Price Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Includes past exam solutions binder (RM25 value), or brand new replacement batteries"
              value={sellerExplanation}
              onChange={(e) => setSellerExplanation(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Explains to buyers why your price is fair if it includes bundled accessories or rare textbooks.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Item Details & Condition Notes <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe condition, course code it was used for, included accessories, or reason for selling..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3.5 py-2.5 text-sm bg-white rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
              }`}
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Listing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
