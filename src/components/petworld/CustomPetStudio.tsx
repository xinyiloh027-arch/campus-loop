import React, { useState } from 'react';
import { 
  Upload, 
  RotateCw, 
  ZoomIn, 
  Move, 
  FlipHorizontal, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  Palette
} from 'lucide-react';
import { PetType, PersonalityType, CustomHeadConfig, VirtualPet } from '../../types';
import { PetVisual } from './PetVisual';
import { PET_SPECIES_LIST, PERSONALITY_PRESETS } from '../../services/petWorldService';
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
    currentPet.selectedBodyType || currentPet.type || 'corgi'
  );
  const [petName, setPetName] = useState(currentPet.name || 'My Buddy');
  const [personality, setPersonality] = useState<PersonalityType>(
    currentPet.personalityType || 'playful_puppy'
  );

  // Uploaded Head Image Config
  const [headConfig, setHeadConfig] = useState<CustomHeadConfig>(() => {
    if (currentPet.customHead) {
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
  const [isSaving, setIsSaving] = useState(false);

  // File Upload Handler with strict validation & friendly error messaging
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported format! Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('Image is too large! Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHeadConfig((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        zoom: 1.0,
        offsetX: 0,
        offsetY: 0,
        rotation: 0,
      }));
      soundService.playChime();
    };
    reader.onerror = () => {
      setErrorMessage('Could not load image file. Please try another photo.');
    };
    reader.readAsDataURL(file);
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

  const handleSave = () => {
    if (!headConfig.imageUrl) {
      setErrorMessage('Please upload a head photo before creating your custom pet!');
      return;
    }

    setIsSaving(true);
    soundService.playLevelUp();
    setTimeout(() => {
      onSaveCustomPet(petName, selectedBody, personality, headConfig);
      setIsSaving(false);
    }, 400);
  };

  // Sample presets for quick testing if user doesn't have an image on hand
  const sampleAvatars = [
    { label: 'Happy Student', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
    { label: 'Smiley Guy', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' },
    { label: 'Glasses Student', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
    { label: 'Art Student', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 sm:p-8 text-left space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200/60 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" />
            <span>Build-Your-Own Pet Studio</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Your Custom Campus Companion
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Choose a cute cartoon animal body and fit your own photo as the head! Adjust position, zoom, and rotation with smooth alignment controls.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          Cancel
        </button>
      </div>

      {/* Main Grid: Left is Live Preview & Body, Right is Alignment Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (5 cols): Live Stage & Body Picker */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Composite Preview Card */}
          <div className="relative bg-gradient-to-b from-sky-50/70 via-rose-50/40 to-amber-50/30 rounded-3xl p-6 border border-indigo-100/60 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs text-[11px] font-bold text-indigo-700 shadow-2xs">
              Live Preview
            </div>

            {/* Pet Graphic */}
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

            {/* Pet Name Caption */}
            <div className="text-center mt-2">
              <div className="text-base font-extrabold text-slate-900">{petName || 'Unnamed Pet'}</div>
              <div className="text-[11px] font-semibold text-slate-500">
                {PET_SPECIES_LIST.find((s) => s.type === selectedBody)?.name} Body • {PERSONALITY_PRESETS[personality]?.title}
              </div>
            </div>
          </div>

          {/* Step 1: Select Animal Body */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-pink-500" />
              <span>1. Choose Animal Body</span>
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
                    className={`p-2 rounded-2xl flex flex-col items-center gap-1 transition-all text-center ${
                      isSelected
                        ? 'bg-pink-500 text-white shadow-sm ring-2 ring-pink-500 scale-102 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center pointer-events-none">
                      <PetVisual type={sp.type} mood="happy" size={50} />
                    </div>
                    <span className="text-[10px] truncate max-w-full leading-tight">{sp.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Photo Upload & Alignment Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Step 2: Upload Photo */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-500" />
              <span>2. Upload Head Photo (JPG, PNG, WebP)</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:flex-1 flex flex-col items-center justify-center p-5 border-2 border-dashed border-pink-200 hover:border-pink-400 bg-pink-50/30 hover:bg-pink-50/60 rounded-2xl cursor-pointer transition-all">
                <Upload className="w-6 h-6 text-pink-500 mb-1" />
                <span className="text-xs font-bold text-slate-800">Click to upload head photo</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG, WebP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Sample Photos for quick testing */}
              <div className="w-full sm:w-auto shrink-0 flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400">Or try a campus sample:</span>
                <div className="flex items-center gap-1.5">
                  {sampleAvatars.map((samp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setHeadConfig((prev) => ({
                          ...prev,
                          imageUrl: samp.url,
                          zoom: 1.0,
                          offsetX: 0,
                          offsetY: 0,
                          rotation: 0,
                        }));
                        soundService.playChime();
                      }}
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-white hover:border-pink-500 shadow-2xs hover:scale-105 transition-all"
                      title={samp.label}
                    >
                      <img src={samp.url} alt={samp.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Step 3: Manual Head Alignment Controls */}
          {headConfig.imageUrl ? (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Move className="w-4 h-4 text-pink-500" />
                  <span>3. Fine-Tune Alignment & Fit</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetAlignment}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Alignment</span>
                </button>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
                {/* Zoom */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                      <span>Zoom: {Math.round(headConfig.zoom * 100)}%</span>
                    </span>
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

                {/* Rotation */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Tilt / Rotation: {headConfig.rotation}°</span>
                    </span>
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

                {/* Offset X */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span>Left / Right Position: {headConfig.offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={headConfig.offsetX}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, offsetX: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                {/* Offset Y */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span>Up / Down Position: {headConfig.offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={headConfig.offsetY}
                    onChange={(e) =>
                      setHeadConfig((prev) => ({ ...prev, offsetY: parseInt(e.target.value, 10) }))
                    }
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Mask Shape & Flip Row */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">Cutout Mask:</span>
                  <div className="flex items-center gap-1">
                    {(['smooth', 'circle', 'oval', 'collar'] as const).map((mask) => (
                      <button
                        key={mask}
                        type="button"
                        onClick={() => setHeadConfig((prev) => ({ ...prev, maskShape: mask }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                          headConfig.maskShape === mask
                            ? 'bg-indigo-600 text-white'
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    headConfig.flipHorizontal
                      ? 'bg-pink-100 text-pink-700 font-bold'
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
              Upload a head photo or select a sample above to activate manual alignment controls.
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
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-md shadow-pink-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Creating Buddy...' : 'Save & Bring to Room'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
