import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle, 
  PlusCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import { Category, Condition, Listing, MALL_CATEGORIES, MallCategory } from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: any) => void;
}

const PRESET_IMAGES = [
  { name: 'Calculus Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Wireless Mouse', url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80' },
  { name: 'GaN Fast Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80' },
  { name: 'Study Desk & Chair', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80' },
  { name: 'Muji Stationery', url: 'https://images.unsplash.com/photo-1585336261026-62024dbdbffc?auto=format&fit=crop&w=600&q=80' },
  { name: 'Varsity Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Badminton Racket', url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80' },
  { name: 'Buldak Ramen', url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80' },
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
  const [category, setCategory] = useState<MallCategory>(MALL_CATEGORIES[0]);
  const [condition, setCondition] = useState<Condition>('Like New');
  const [location, setLocation] = useState(POPULAR_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_IMAGES[0].url);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Please select an image smaller than 2MB.' }));
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

    if (!title.trim()) {
      newErrors.title = 'Product title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    if (!description.trim()) {
      newErrors.description = 'Please provide a brief description of the item.';
    }

    const numPrice = parseFloat(price);
    if (!price || isNaN(numPrice)) {
      newErrors.price = 'Please enter a valid price in RM.';
    } else if (numPrice < 0) {
      newErrors.price = 'Price cannot be negative.';
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
    const finalImage = getEffectiveImageUrl();

    const newListingData = {
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      condition,
      location: finalLocation,
      campusLocation: finalLocation,
      imageUrl: finalImage,
      additionalImages: [finalImage],
      isActualPhoto: true,
      sellerName: 'Alex Tan',
      sellerContact: 'alex.tan@student.edu.my',
      sellerFaculty: 'FCSIT (Year 2)',
      isUserCreated: true,
      status: 'Active',
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onListingCreated(newListingData);
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
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              <span>Sell an Item on CampusLoop</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              List textbooks, calculators, dorm gear, or electronics for fellow students.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Product Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Stewart Calculus 8th Edition, Casio fx-570EX Calculator..."
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.title ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
              } text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.title && <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Price & Category in 2 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Price in RM */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Price (RM) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs sm:text-sm">
                  RM
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border ${
                    errors.price ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  } text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MallCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Item Condition *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CONDITIONS.map((cond) => (
                <button
                  key={cond}
                  type="button"
                  onClick={() => setCondition(cond)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    condition === cond
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Product Image Selection */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700">
              Product Image *
            </label>

            {/* Current Image Preview */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                <img
                  src={getEffectiveImageUrl()}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800 block">Selected Photo</span>
                <span className="text-[11px] text-slate-400">Choose a preset below, paste a URL, or upload from device.</span>
              </div>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Quick Presets:</span>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_IMAGES.slice(0, 4).map((p, idx) => (
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
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload / Image URL */}
            <div className="flex items-center gap-2 pt-1">
              <label className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload File</span>
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

          {/* Campus Pickup Location */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Campus Handover Location *
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
                placeholder="e.g. Faculty of Economics Foyer"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description & Highlights *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition, include what's bundled, reasons for selling, and when you are free to meet up on campus..."
              className={`w-full px-3.5 py-2 rounded-xl border ${
                errors.description ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
              } text-slate-800 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
            {errors.description && <p className="text-[11px] text-rose-500 mt-1">{errors.description}</p>}
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
              <span>{isSubmitting ? 'Publishing...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
