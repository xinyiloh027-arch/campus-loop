import React, { useState } from 'react';
import { 
  VirtualPet, 
  PetActionState 
} from '../../types';
import { PetVisual } from './PetVisual';
import { soundService } from '../../services/soundService';

interface PetRoomProps {
  pet: VirtualPet;
  actionState: PetActionState;
  onPetClick: () => void;
  onHotspotClick: (action: 'feed' | 'bathe' | 'rest' | 'toilet' | 'dress' | 'play' | 'talk') => void;
  bubbleText?: string;
}

export const PetRoom: React.FC<PetRoomProps> = ({
  pet,
  actionState,
  onPetClick,
  onHotspotClick,
  bubbleText,
}) => {
  const [showHearts, setShowHearts] = useState(false);
  const theme = pet.roomTheme || 'dorm';
  const isNight = actionState === 'sleeping' || pet.mood === 'sleepy';

  const handlePetTap = () => {
    setShowHearts(true);
    soundService.playChime();
    onPetClick();
    setTimeout(() => setShowHearts(false), 1400);
  };

  // Background gradient per theme and time
  const getBackgroundStyle = () => {
    if (isNight) {
      return 'from-slate-900 via-indigo-950 to-slate-900 text-white';
    }
    switch (theme) {
      case 'garden':
        return 'from-emerald-50/80 via-pink-50/50 to-amber-50/40';
      case 'library':
        return 'from-amber-50/80 via-orange-50/40 to-stone-100';
      case 'dreamland':
        return 'from-purple-50 via-pink-50/70 to-sky-50';
      case 'tropical':
        return 'from-teal-50/80 via-emerald-50/50 to-sky-50';
      case 'dorm':
      default:
        return 'from-amber-50/70 via-rose-50/30 to-sky-50/60';
    }
  };

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-gradient-to-b ${getBackgroundStyle()} transition-colors duration-700 min-h-[360px] sm:min-h-[440px] flex flex-col justify-between p-4 sm:p-6 select-none`}>
      
      {/* Wall Decor & Window */}
      <div className="relative z-10 flex items-start justify-between w-full">
        
        {/* Left Wall: Room Shelf or Window */}
        <div className="flex items-center gap-3">
          {/* Window */}
          <div className="relative w-24 sm:w-28 h-28 sm:h-32 rounded-2xl overflow-hidden border-4 border-white/80 shadow-sm bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100">
            {isNight ? (
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center relative">
                {/* Crescent Moon */}
                <div className="w-8 h-8 rounded-full shadow-[inset_6px_-2px_0_0_#FDE047] rotate-[-20deg]" />
                <span className="text-[10px] text-indigo-300 font-bold mt-1">Night Sky</span>
                {/* Tiny stars */}
                <div className="absolute top-3 left-4 text-xs text-white">✦</div>
                <div className="absolute bottom-5 right-4 text-[10px] text-amber-200">★</div>
              </div>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center">
                {/* Sun */}
                <div className="w-10 h-10 rounded-full bg-amber-400 border-2 border-amber-300 animate-pulse" />
                {/* Clouds */}
                <div className="absolute bottom-2 left-2 text-base opacity-90">☁️</div>
                <div className="absolute bottom-4 right-1 text-xs opacity-75">☁️</div>
                {/* Window panes */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
                  <div className="border-r-2 border-b-2 border-white/80" />
                  <div className="border-b-2 border-white/80" />
                  <div className="border-r-2 border-white/80" />
                  <div />
                </div>
              </div>
            )}
          </div>

          {/* Hanging Plant / Fairy Lights */}
          <div className="hidden sm:flex flex-col items-center space-y-1">
            <span className="text-xl">🪴</span>
            <div className="w-0.5 h-10 bg-amber-800/40" />
          </div>
        </div>

        {/* Right Wall: Wardrobe & Clock */}
        <div className="flex items-center gap-2">
          {/* Wardrobe Hotspot */}
          <button
            onClick={() => onHotspotClick('dress')}
            className="flex flex-col items-center p-2 rounded-2xl bg-white/70 hover:bg-white backdrop-blur-xs border border-white/60 shadow-2xs hover:scale-105 transition-all cursor-pointer group"
            title="Open Wardrobe & Dress Up"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">🚪</span>
            <span className="text-[10px] font-bold text-slate-700 mt-0.5">Wardrobe</span>
          </button>

          {/* Theme Banner Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-xs border border-white/60 text-xs font-bold text-slate-700 shadow-2xs">
            <span>✨</span>
            <span className="capitalize">{theme} Theme</span>
          </div>
        </div>
      </div>

      {/* Center Stage: The Pet + Interactive Speech Bubble */}
      <div className="relative z-20 flex flex-col items-center justify-center my-auto">
        
        {/* Interactive Speech / Reaction Bubble */}
        {bubbleText && (
          <div className="mb-2 max-w-xs sm:max-w-md px-4 py-2 rounded-2xl bg-white text-slate-800 text-xs font-semibold shadow-md border border-indigo-100 animate-fadeIn relative">
            <p className="leading-snug">{bubbleText}</p>
            {/* Bubble arrow pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
          </div>
        )}

        {/* Pet Visual Container */}
        <div className="relative cursor-pointer hover:scale-103 transition-transform" onClick={handlePetTap}>
          <PetVisual
            type={pet.type}
            mood={pet.mood}
            actionState={actionState}
            accessory={pet.accessory}
            growthStage={pet.growthStage}
            isCustomPet={pet.isCustomPet}
            customHead={pet.customHead}
            size={220}
            showHearts={showHearts}
          />
        </div>
      </div>

      {/* Floor & Room Hotspots (Bed, Bowls, Bath, Litter, Toys) */}
      <div className="relative z-10 w-full pt-3 border-t border-slate-200/50 flex flex-wrap items-center justify-around gap-2 sm:gap-4 bg-white/40 backdrop-blur-xs rounded-2xl p-2 sm:p-3">
        
        {/* Hotspot 1: Pet Bed */}
        <button
          onClick={() => onHotspotClick('rest')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
            actionState === 'sleeping' ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-105' : 'hover:bg-white/80'
          }`}
          title="Tuck into bed to rest"
        >
          <span className="text-xl sm:text-2xl">🛏️</span>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Pet Bed</span>
        </button>

        {/* Hotspot 2: Food & Water Bowl */}
        <button
          onClick={() => onHotspotClick('feed')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
            actionState === 'eating' ? 'bg-pink-100 ring-2 ring-pink-500 scale-105' : 'hover:bg-white/80'
          }`}
          title="Feed treats and snacks"
        >
          <span className="text-xl sm:text-2xl">🥣</span>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Food Bowl</span>
        </button>

        {/* Hotspot 3: Bath Area */}
        <button
          onClick={() => onHotspotClick('bathe')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
            actionState === 'bathing' ? 'bg-sky-100 ring-2 ring-sky-500 scale-105' : 'hover:bg-white/80'
          }`}
          title="Wash and bathe pet"
        >
          <span className="text-xl sm:text-2xl">🛁</span>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Bath Basin</span>
        </button>

        {/* Hotspot 4: Toilet / Litter Area */}
        <button
          onClick={() => onHotspotClick('toilet')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
            actionState === 'toilet' ? 'bg-emerald-100 ring-2 ring-emerald-500 scale-105' : 'hover:bg-white/80'
          }`}
          title="Tidy potty / litter area"
        >
          <span className="text-xl sm:text-2xl">🚽</span>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Litter Tray</span>
        </button>

        {/* Hotspot 5: Toy Basket */}
        <button
          onClick={() => onHotspotClick('play')}
          className={`flex flex-col items-center p-2 rounded-xl transition-all cursor-pointer ${
            actionState === 'playing' ? 'bg-amber-100 ring-2 ring-amber-500 scale-105' : 'hover:bg-white/80'
          }`}
          title="Play with toys & mini-games"
        >
          <span className="text-xl sm:text-2xl">🎾</span>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Toy Basket</span>
        </button>

      </div>

    </div>
  );
};
