import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  RotateCw, 
  ZoomIn, 
  ZoomOut,
  Move, 
  FlipHorizontal, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Palette,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Loader2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { PetType, PersonalityType, CustomHeadConfig, VirtualPet, SavedHeadImage } from '../../types';
import { PetVisual } from './PetVisual';
import { PET_SPECIES_LIST, PERSONALITY_PRESETS } from '../../services/petWorldService';
import { imageStorageService } from '../../services/imageStorageService';
import { soundService } from '../../services/soundService';

interface CustomPetStudioProps {
  currentPet: VirtualPet;
  onSaveCustomPet: (name: string, bodyType: PetType, personality: PersonalityType, headConfig: CustomHeadConfig) => void;
  onCancel: () => void;
}

export const CustomPetStudio: React.FC<CustomPetStudioProps> = ({
  currentPet,
  onSaveCustomPet,
  onCancel,
}) => {
  // Body Selection
  const [selectedBody, setSelectedBody] = useState<PetType>(
    currentPet.selectedBodyType || currentPet.type || 'puppy'
  );
  const [petName, setPetName] = useState(currentPet.name || 'My Buddy');
  const [personality, setPersonality] = useState<PersonalityType>(
    currentPet.personalityType || 'playful_puppy'
  );

  // Uploaded Head Image Config
  const [headConfig, setHeadConfig] = useState<CustomHeadConfig>(() => {
    if (currentPet.customHead && currentPet.customHead.imageUrl) {
      return { ...currentPet.customHead };
    }
    return {
      imageUrl: '',
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipHorizontal: false,
      maskShape: 'smooth',
    };
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedHeads, setSavedHeads] = useState<SavedHeadImage[]>([]);
  const [pendingDeletePhoto, setPendingDeletePhoto] = useState<SavedHeadImage | null>(null);

  // Load existing saved photos to let user reuse photos effortlessly
  useEffect(() => {
    imageStorageService.getAllHeads().then((list) => {
      setSavedHeads(list);
    });
  }, []);

  const handleConfirmDeletePhoto = async () => {
    if (!pendingDeletePhoto) return;
    soundService.playFlush();
    await imageStorageService.deleteHead(pendingDeletePhoto.id);
    setSavedHeads((prev) => prev.filter((h) => h.id !== pendingDeletePhoto.id));
    if (headConfig.imageUrl === pendingDeletePhoto.imageUrl) {
      setHeadConfig((prev) => ({ ...prev, imageUrl: '' }));
    }
    setPendingDeletePhoto(null);
  };

  // File Upload Handler with Canvas optimization & robust format validation
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate format (support all common photo formats)
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/jfif'];
    const hasValidExt = /\.(jpe?g|png|webp|jfif)$/i.test(file.name);

    if (!validMimes.includes(file.type.toLowerCase()) && !hasValidExt) {
      setErrorMessage('Unsupported format! Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    // Validate size (max 8MB before compression)
    const maxSize = 8 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Image is too large! Please choose a photo under 8MB.');
      return;
    }

    setIsProcessing(true);

    try {
      // Process and optimize image with HTML5 Canvas (downscales to crisp max 600x600 WebP/PNG)
      const optimized = await imageStorageService.optimizeAndCropImage(file, 600);
      setHeadConfig((prev) => ({
        ...prev,
        imageUrl: optimized.dataUrl,
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      }));
      soundService.playChime();
    } catch (err: any) {
      console.error('Image processing failed:', err);
      setErrorMessage('Could not process this image. Please try another photo or format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectSavedPhoto = (saved: SavedHeadImage) => {
    setHeadConfig({
      ...saved.config,
      imageUrl: saved.imageUrl,
    });
    soundService.playChime();
  };

  const handleResetAlignment = () => {
    setHeadConfig((prev) => ({
      ...prev,
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
      rotation: 0,
      flipHorizontal: false,
      maskShape: 'smooth',
    }));
  };

  const handleNudge = (dx: number, dy: number) => {
    setHeadConfig((prev) => ({
      ...prev,
      offsetX: Math.max(-60, Math.min(60, prev.offsetX + dx)),
      offsetY: Math.max(-60, Math.min(60, prev.offsetY + dy)),
    }));
  };

  const handleZoomStep = (delta: number) => {
    setHeadConfig((prev) => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(2.5, parseFloat((prev.zoom + delta).toFixed(2)))),
    }));
  };

  const handleRotateStep = (deg: number) => {
    setHeadConfig((prev) => ({
      ...prev,
      rotation: Math.max(-45, Math.min(45, prev.rotation + deg)),
    }));
  };

  const handleSave = async () => {
    if (!headConfig.imageUrl) {
      setErrorMessage('Please upload a head photo before creating your custom pet!');
      return;
    }

    setIsSaving(true);
    soundService.playLevelUp();

    try {
      // Store image permanently in IndexedDB
      await imageStorageService.saveHead(petName || 'My Custom Head', headConfig.imageUrl, headConfig);
      onSaveCustomPet(petName, selectedBody, personality, headConfig);
    } catch (err) {
      console.warn('Error saving to image storage:', err);
      onSaveCustomPet(petName, selectedBody, personality, headConfig);
    } finally {
      setIsSaving(false);
    }
  };

  // Sample avatars for quick preview testing
  const sampleAvatars = [
    { label: 'Happy Student', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80' },
    { label: 'Smiley Guy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80' },
    { label: 'Glasses Scholar', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80' },
    { label: 'Creative Student', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-xl p-5 sm:p-8 text-left space-y-7 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/60 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Option B: Custom Photo Head Pet</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Custom Pet Studio — Combine Photo & Animal Body
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Pick a cute cartoon animal body and fit your personal photo as its head. Adjust position, zoom, and rotation with smooth live alignment controls.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Main Grid: Left is Live Composite Stage, Right is Step Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* Left Column (5 cols): Live Composite Preview & Body Carousel */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Live Preview Card */}
          <div className="relative bg-gradient-to-b from-sky-50 via-rose-50/50 to-amber-50/40 rounded-3xl p-5 border border-pink-100 flex flex-col items-center justify-center min-h-[300px] overflow-hidden shadow-2xs">
            <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-extrabold text-pink-700 shadow-2xs">
              Live Head Fitting
            </div>

            {/* Pet Graphic with Custom Head */}
            <div className="my-2">
              <PetVisual
                type={selectedBody}
                mood="happy"
                size={230}
                isCustomPet={Boolean(headConfig.imageUrl)}
                customHead={headConfig}
                growthStage={currentPet.growthStage}
                accessory={currentPet.accessory}
              />
            </div>

            {/* Pet Info Tag */}
            <div className="text-center mt-1">
              <div className="text-sm sm:text-base font-extrabold text-slate-900">{petName || 'My Custom Companion'}</div>
              <div className="text-[11px] font-semibold text-slate-500">
                {PET_SPECIES_LIST.find((s) => s.type === selectedBody)?.name} Body • {PERSONALITY_PRESETS[personality]?.title}
              </div>
            </div>
          </div>

          {/* Step 1: Choose Animal Body */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>1. Select Animal Body</span>
              </span>
              <span className="text-[11px] text-pink-600 font-semibold lowercase">
                {selectedBody}
              </span>
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
              {PET_SPECIES_LIST.map((sp) => {
                const isSelected = selectedBody === sp.type;
                return (
                  <button
                    key={sp.type}
                    type="button"
                    onClick={() => {
                      setSelectedBody(sp.type);
                      soundService.playChime();
                    }}
                    className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all text-center cursor-pointer ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-500 scale-102 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium'
                    }`}
                  >
                    <div className="w-11 h-11 flex items-center justify-center pointer-events-none">
                      <PetVisual type={sp.type} mood="happy" size={46} />
                    </div>
                    <span className="text-[10px] truncate max-w-full leading-tight">{sp.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Upload Photo, Alignment Tools & Personality */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 2: Upload Photo */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>2. Upload Head Photo (JPG, PNG, WebP)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* File input dropzone */}
              <label className="flex-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/70 rounded-2xl cursor-pointer transition-all">
                {isProcessing ? (
                  <div className="flex flex-col items-center gap-1 text-pink-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-bold">Optimizing image...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-pink-500 mb-1" />
                    <span className="text-xs font-bold text-slate-800">Click to upload photo</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (Automatically optimized via Canvas)</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg,image/jfif"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>

              {/* Quick sample avatars */}
              <div className="shrink-0 flex flex-col justify-center gap-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500">Quick Samples:</span>
                <div className="flex items-center gap-1.5">
                  {sampleAvatars.map((samp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          const optimized = await imageStorageService.optimizeAndCropImage(samp.url, 500);
                          setHeadConfig((prev) => ({
                            ...prev,
                            imageUrl: optimized.dataUrl,
                            zoom: 1.0,
                            offsetX: 0,
                            offsetY: 0,
                            rotation: 0,
                          }));
                          soundService.playChime();
                        } catch {
                          setHeadConfig((prev) => ({ ...prev, imageUrl: samp.url }));
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      className="w-9 h-9 rounded-full overflow-hidden border-2 border-white hover:border-pink-500 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                      title={samp.label}
                    >
                      <img src={samp.url} alt={samp.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Saved Photos Quick Reuse Row */}
            {savedHeads.length > 0 && (
              <div className="p-3.5 bg-pink-50/50 rounded-2xl border border-pink-200/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-pink-900">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                    <span>My Saved Photos ({savedHeads.length})</span>
                  </span>
                  <span className="text-[10px] text-pink-600 font-normal">Click to reuse or delete</span>
                </div>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                  {savedHeads.map((sh) => {
                    const isSelected = headConfig.imageUrl === sh.imageUrl;
                    return (
                      <div
                        key={sh.id}
                        className={`relative group shrink-0 w-13 h-13 rounded-2xl overflow-hidden border-2 transition-all ${
                          isSelected ? 'border-pink-500 ring-2 ring-pink-300 shadow-xs' : 'border-slate-200 hover:border-pink-400'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectSavedPhoto(sh)}
                          className="w-full h-full cursor-pointer"
                          title={`Select "${sh.name}" as pet head`}
                        >
                          <img src={sh.imageUrl} alt={sh.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundService.playPop();
                            setPendingDeletePhoto(sh);
                          }}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                          title="Delete photo from saved history"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Delete Photo Confirmation Modal inside Studio */}
            {pendingDeletePhoto && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl space-y-2.5 animate-fadeIn text-xs">
                <div className="flex items-start gap-2.5 text-rose-950 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div>Delete photo from saved history?</div>
                    <p className="text-[11px] font-normal text-rose-800 mt-0.5">
                      This will permanently remove "{pendingDeletePhoto.name}" from your photo library. Your pet itself will NOT be deleted.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPendingDeletePhoto(null)}
                    className="px-3 py-1 rounded-lg text-slate-600 hover:bg-white text-[11px] font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDeletePhoto}
                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-2xs cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Step 3: Interactive Head Alignment & Fit Controls */}
          {headConfig.imageUrl ? (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Move className="w-4 h-4 text-pink-500" />
                  <span>3. Fit & Align Head onto Body</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetAlignment}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Alignment</span>
                </button>
              </div>

              {/* Sliders and Nudge Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                
                {/* Zoom Control */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-pink-500" />
                      <span>Zoom: {Math.round(headConfig.zoom * 100)}%</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleZoomStep(-0.1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleZoomStep(0.1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={headConfig.zoom}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, zoom: parseFloat(e.target.value) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Tilt / Rotation Control */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-pink-500" />
                      <span>Tilt: {headConfig.rotation}°</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleRotateStep(-5)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        -5°
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotateStep(5)}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 hover:bg-slate-200 font-bold"
                      >
                        +5°
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="1"
                    value={headConfig.rotation}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, rotation: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Offset X Slider */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Left / Right: {headConfig.offsetX}px</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleNudge(-3, 0)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Nudge Left"
                      >
                        <ChevronLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(3, 0)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Nudge Right"
                      >
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="1"
                    value={headConfig.offsetX}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, offsetX: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Offset Y Slider */}
                <div className="space-y-1.5 p-2.5 bg-white rounded-xl border border-slate-200/80">
                  <div className="flex justify-between items-center text-[11px]">
                    <span>Up / Down: {headConfig.offsetY}px</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleNudge(0, -3)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Nudge Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNudge(0, 3)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        title="Nudge Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="60"
                    step="1"
                    value={headConfig.offsetY}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, offsetY: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mask Shape & Flip Controls */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-600">Head Cutout:</span>
                  <div className="flex items-center gap-1">
                    {(['smooth', 'circle', 'oval', 'collar'] as const).map((mask) => (
                      <button
                        key={mask}
                        type="button"
                        onClick={() => setHeadConfig((prev) => ({ ...prev, maskShape: mask }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                          headConfig.maskShape === mask
                            ? 'bg-pink-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {mask}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setHeadConfig((prev) => ({ ...prev, flipHorizontal: !prev.flipHorizontal }))
                  }
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    headConfig.flipHorizontal
                      ? 'bg-pink-100 text-pink-700 font-bold border border-pink-300'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip Horizontal</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
              Upload a head photo or pick a sample above to activate manual alignment controls.
            </div>
          )}

          {/* Step 4: Name & Personality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pet Name</label>
              <input
                type="text"
                value={petName}
                maxLength={20}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="e.g. Professor Whiskers"
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Personality</label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value as PersonalityType)}
                className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white cursor-pointer"
              >
                {Object.entries(PERSONALITY_PRESETS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSaving || isProcessing}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{isSaving ? 'Saving & Applying...' : 'Apply to My Pet 🐾'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
