import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle, 
  PlusCircle, 
  Image as ImageIcon,
  Layers,
  Sparkles,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { Condition, Listing, MALL_CATEGORIES, MallCategory } from '../types';
import { POPULAR_CAMPUS_LOCATIONS } from '../data/mockData';
import { imageStorageService } from '../services/imageStorageService';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: (newListing: any) => Promise<void> | void;
  initialListing?: Listing | null;
  onListingUpdated?: (updatedListing: Listing) => Promise<void> | void;
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
  initialListing,
  onListingUpdated,
}) => {
  const isEditing = Boolean(initialListing);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [category, setCategory] = useState<MallCategory>(MALL_CATEGORIES[0]);
  const [condition, setCondition] = useState<Condition>('Like New');
  const [location, setLocation] = useState(POPULAR_CAMPUS_LOCATIONS[0]);
  const [customLocation, setCustomLocation] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [selectedPresetImage, setSelectedPresetImage] = useState(PRESET_IMAGES[0].url);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when opening in create or edit mode
  useEffect(() => {
    if (initialListing) {
      setTitle(initialListing.title || '');
      setDescription(initialListing.description || '');
      setPrice(initialListing.price ? initialListing.price.toString() : '');
      const existingQty = typeof initialListing.remainingQuantity === 'number'
        ? initialListing.remainingQuantity
        : (initialListing.originalQuantity || 1);
      setQuantity(existingQty.toString());
      setCategory((initialListing.category as MallCategory) || MALL_CATEGORIES[0]);
      setCondition(initialListing.condition || 'Like New');
      
      const loc = initialListing.campusLocation || initialListing.location || POPULAR_CAMPUS_LOCATIONS[0];
      if (POPULAR_CAMPUS_LOCATIONS.includes(loc)) {
        setLocation(loc);
        setCustomLocation('');
      } else {
        setLocation('Other');
        setCustomLocation(loc);
      }

      if (initialListing.imageUrl) {
        setUploadedImage(initialListing.imageUrl);
        setCustomImageUrl('');
      }
    } else {
      // Reset form for new listing
      setTitle('');
      setDescription('');
      setPrice('');
      setQuantity('1');
      setCategory(MALL_CATEGORIES[0]);
      setCondition('Like New');
      setLocation(POPULAR_CAMPUS_LOCATIONS[0]);
      setCustomLocation('');
      setUploadedImage(null);
      setCustomImageUrl('');
      setSelectedPresetImage(PRESET_IMAGES[0].url);
      setImageFileName('');
      setErrors({});
    }
  }, [initialListing, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file format
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrors((prev) => ({ ...prev, image: 'Please select a valid image format (JPG, PNG, or WEBP).' }));
      return;
    }

    // Clear previous errors
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });

    setIsProcessingImage(true);
    setImageFileName(file.name);

    try {
      // Process & compress photo to optimal WebP/JPEG dataUrl (< 80KB)
      // This prevents localStorage quota overflow and keeps UI rendering lightning fast
      const optimizedDataUrl = await imageStorageService.processImageFile(file, 800);
      setUploadedImage(optimizedDataUrl);
      setCustomImageUrl('');
    } catch (err: any) {
      console.error('Image compression error:', err);
      setErrors((prev) => ({ ...prev, image: 'Failed to process image. Please try another photo.' }));
    } finally {
      setIsProcessingImage(false);
      // Reset the input value so the same file can be re-selected if desired
      e.target.value = '';
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setImageFileName('');
    setCustomImageUrl('');
    setSelectedPresetImage(PRESET_IMAGES[0].url);
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

    const numQty = parseInt(quantity, 10);
    if (!quantity || isNaN(numQty) || numQty < 1) {
      newErrors.quantity = 'Available quantity must be a positive whole number (at least 1).';
    } else if (!Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'Quantity must be a whole integer (e.g. 1, 2, 5).';
    }

    const finalLocation = location === 'Other' ? customLocation.trim() : location;
    if (!finalLocation) {
      newErrors.location = 'Please specify a campus pickup location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalLocation = location === 'Other' ? customLocation.trim() : location;
    const finalImage = getEffectiveImageUrl();
    const numQty = parseInt(quantity, 10);

    if (isEditing && initialListing && onListingUpdated) {
      const updatedListing: Listing = {
        ...initialListing,
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        condition,
        location: finalLocation,
        campusLocation: finalLocation,
        imageUrl: finalImage,
        additionalImages: [finalImage],
        originalQuantity: initialListing.originalQuantity && initialListing.originalQuantity >= numQty 
          ? initialListing.originalQuantity 
          : numQty,
        remainingQuantity: numQty,
        status: numQty === 0 ? 'Sold' : 'Active',
      };

      try {
        await onListingUpdated(updatedListing);
        setIsSubmitting(false);
        onClose();
      } catch (err) {
        setIsSubmitting(false);
      }
      return;
    }

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
      isActualPhoto: Boolean(uploadedImage),
      originalQuantity: numQty,
      remainingQuantity: numQty,
      sellerName: '', // Populated by App.tsx with verified user info
      sellerContact: '',
      sellerFaculty: '',
      isUserCreated: true,
      status: numQty === 0 ? 'Sold' : 'Active',
      createdAt: new Date().toISOString(),
    };

    try {
      await onListingCreated(newListingData);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      // Keep modal open so the student does not lose entered data
      setIsSubmitting(false);
    }
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
              {isEditing ? (
                <>
                  <Edit3 className="w-5 h-5 text-indigo-600" />
                  <span>Edit Campus Listing</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5 text-blue-600" />
                  <span>Sell an Item on CampusLoop</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing 
                ? 'Update price, remaining inventory, pickup spot, or product photos.' 
                : 'List textbooks, electronics, dorm gear, or notes for fellow students.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
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

          {/* Price, Quantity & Category in Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

            {/* Available Quantity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>Available Qty *</span>
                <span className="text-[10px] text-slate-400 font-normal">Units</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.quantity ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  } text-slate-800 font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
              {errors.quantity && <p className="text-[11px] text-rose-500 mt-1">{errors.quantity}</p>}
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
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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

          {/* Product Image Section (with real photo upload, preview, replace, remove) */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-slate-700">
                Product Photo *
              </label>
              <span className="text-[11px] text-slate-400">
                Supports JPG, PNG, WEBP (Camera & Desktop)
              </span>
            </div>

            {/* Active Image Preview Card */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                  <img
                    src={getEffectiveImageUrl()}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                  {uploadedImage && (
                    <div className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-bold py-0.5 text-center">
                      Uploaded
                    </div>
                  )}
                </div>

                <div className="min-w-0 text-xs">
                  <span className="font-bold text-slate-800 block truncate">
                    {uploadedImage 
                      ? (imageFileName || 'Custom Item Photo') 
                      : (customImageUrl ? 'Web Photo' : 'Quick Preset')}
                  </span>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {uploadedImage ? 'Real photo processed & saved.' : 'Select a preset or upload your own.'}
                  </span>
                  {isProcessingImage && (
                    <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1 mt-0.5 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Optimizing image...
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons on current image */}
              <div className="flex items-center gap-1.5 shrink-0">
                <label className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>{uploadedImage ? 'Replace' : 'Upload'}</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove custom photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Preset Images */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Or choose standard campus presets:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_IMAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPresetImage(p.url);
                      setUploadedImage(null);
                      setImageFileName('');
                      setCustomImageUrl('');
                    }}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedPresetImage === p.url && !uploadedImage && !customImageUrl
                        ? 'border-blue-600 scale-105 ring-2 ring-blue-100 shadow-xs'
                        : 'border-slate-200 opacity-65 hover:opacity-100'
                    }`}
                    title={p.name}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Image URL fallback */}
            <div className="pt-1">
              <input
                type="text"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value);
                  setUploadedImage(null);
                  setImageFileName('');
                }}
                placeholder="Or paste an image web URL (https://...)"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {errors.image && <p className="text-[11px] text-rose-500 font-medium">{errors.image}</p>}
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
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isProcessingImage}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? (isEditing ? 'Saving...' : 'Publishing...') 
                  : (isEditing ? 'Save Changes' : 'Publish Listing')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
