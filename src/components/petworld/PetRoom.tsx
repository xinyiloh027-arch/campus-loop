import React, { useState, useEffect } from 'react';
import { 
  VirtualPet, 
  PetActionState 
} from '../../types';
import { 
  PetSceneId, 
  SceneCustomization, 
  SCENE_META_LIST 
} from '../../types/petScenes';
import { sceneCustomizationService } from '../../services/sceneCustomizationService';
import { soundService } from '../../services/soundService';
import { PetVisual } from './PetVisual';
import { CrayonFilterDef } from './CrayonFilterDef';
import { DiningScene } from './scenes/DiningScene';
import { BathroomScene } from './scenes/BathroomScene';
import { BathScene } from './scenes/BathScene';
import { PlayroomScene } from './scenes/PlayroomScene';
import { BedroomScene } from './scenes/BedroomScene';
import { DressingScene } from './scenes/DressingScene';
import { SceneCustomizerModal } from './SceneCustomizerModal';

interface PetRoomProps {
  pet: VirtualPet;
  actionState: PetActionState;
  onPetClick: () => void;
  onHotspotClick: (action: 'feed' | 'bathe' | 'rest' | 'toilet' | 'dress' | 'play' | 'talk') => void;
  bubbleText?: string;
  activeSceneId?: PetSceneId;
  onSceneChange?: (sceneId: PetSceneId) => void;
}

export const PetRoom: React.FC<PetRoomProps> = ({
  pet,
  actionState,
  onPetClick,
  onHotspotClick,
  bubbleText,
  activeSceneId,
  onSceneChange,
}) => {
  const [currentScene, setCurrentScene] = useState<PetSceneId>(activeSceneId || 'dining');
  const [sceneConfigs, setSceneConfigs] = useState<Record<PetSceneId, SceneCustomization>>(() => 
    sceneCustomizationService.getAllConfigs()
  );
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Sync with prop if parent controls scene
  useEffect(() => {
    if (activeSceneId && activeSceneId !== currentScene) {
      setCurrentScene(activeSceneId);
    }
  }, [activeSceneId]);

  const handleSceneSelect = (sceneId: PetSceneId) => {
    soundService.playPop();
    setCurrentScene(sceneId);
    if (onSceneChange) onSceneChange(sceneId);
  };

  const handlePetTap = () => {
    setShowHearts(true);
    soundService.playChime();
    onPetClick();
    setTimeout(() => setShowHearts(false), 1400);
  };

  const handleSaveSceneDesign = (sceneId: PetSceneId, newConfig: SceneCustomization) => {
    setSceneConfigs((prev) => ({
      ...prev,
      [sceneId]: newConfig
    }));
  };

  // Helper to trigger activity and switch room
  const handleActivityClick = (
    sceneId: PetSceneId, 
    action: 'feed' | 'bathe' | 'rest' | 'toilet' | 'dress' | 'play'
  ) => {
    handleSceneSelect(sceneId);
    onHotspotClick(action);
  };

  const activeConfig = sceneConfigs[currentScene] || sceneCustomizationService.getSceneConfig(currentScene);
  const currentMeta = SCENE_META_LIST.find((s) => s.id === currentScene) || SCENE_META_LIST[0];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-900/15 shadow-md bg-amber-50/40 select-none flex flex-col justify-between min-h-[500px] sm:min-h-[580px]">
      
      {/* 1. Global Wax Crayon Filters & Patterns */}
      <CrayonFilterDef />

      {/* 2. Top Bar: Room Switcher Pills & Room Customization CTA */}
      <div className="relative z-30 p-3 sm:p-4 bg-white/70 backdrop-blur-md border-b border-amber-900/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Room Pills Switcher (All 6 distinct environments) */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-0.5">
          {SCENE_META_LIST.map((scene) => {
            const isSel = currentScene === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => handleSceneSelect(scene.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-amber-900 text-white shadow-xs scale-102 font-black'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-amber-900/10'
                }`}
                title={`Tour ${scene.name} (${scene.actionLabel})`}
              >
                <span>{scene.icon}</span>
                <span>{scene.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Room Name Badge & Room Customization Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100/70 border border-amber-200 text-amber-900 text-xs font-semibold">
            <span>{currentMeta.icon}</span>
            <span>{currentMeta.description}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomizer(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            title={`Customize ${currentMeta.name}'s wallpaper, floor, and furniture!`}
          >
            <span>🎨</span>
            <span>Customise Room</span>
          </button>
        </div>
      </div>

      {/* 3. SCENE VISUAL CANVAS (Wax Crayon Illustrated Room) */}
      <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between">
        
        {/* Dynamic Scene Illustrated Background */}
        {currentScene === 'dining' && (
          <DiningScene
            customization={activeConfig}
            isEating={actionState === 'eating'}
            onFeedClick={() => onHotspotClick('feed')}
          />
        )}
        {currentScene === 'bathroom' && (
          <BathroomScene
            customization={activeConfig}
            isToiletActive={actionState === 'toilet'}
            onToiletClick={() => onHotspotClick('toilet')}
          />
        )}
        {currentScene === 'bathe' && (
          <BathScene
            customization={activeConfig}
            isBathing={actionState === 'bathing'}
            onBatheClick={() => onHotspotClick('bathe')}
          />
        )}
        {currentScene === 'playroom' && (
          <PlayroomScene
            customization={activeConfig}
            isPlaying={actionState === 'playing'}
            onPlayClick={() => onHotspotClick('play')}
          />
        )}
        {currentScene === 'bedroom' && (
          <BedroomScene
            customization={activeConfig}
            isSleeping={actionState === 'sleeping'}
            onRestClick={() => onHotspotClick('rest')}
          />
        )}
        {currentScene === 'dressing' && (
          <DressingScene
            customization={activeConfig}
            onDressClick={() => onHotspotClick('dress')}
          />
        )}

        {/* 4. Center Stage: The Pet + Interactive Speech Bubble */}
        <div className="relative z-20 flex flex-col items-center justify-center my-auto pt-6 pb-2">
          
          {/* Hand-Drawn Reaction / Thought Bubble */}
          {bubbleText && (
            <div className="mb-3 max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-xs text-slate-800 text-xs font-semibold shadow-md border-2 border-amber-900/15 animate-fadeIn relative">
              <p className="leading-snug">{bubbleText}</p>
              {/* Bubble pointer */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
            </div>
          )}

          {/* Pet Visual Character (Soft Kawaii Shin-chan/Miffy aesthetic) */}
          <div 
            className="relative cursor-pointer hover:scale-104 transition-transform active:scale-98" 
            onClick={handlePetTap}
            title={`Pet ${pet.name}!`}
          >
            <PetVisual
              type={pet.type}
              mood={pet.mood}
              actionState={actionState}
              accessory={pet.accessory}
              growthStage={pet.growthStage}
              isCustomPet={pet.isCustomPet}
              customHead={pet.customHead}
              size={230}
              showHearts={showHearts}
            />
          </div>
        </div>

      </div>

      {/* 5. Activity Bottom Navigation Dock (Seamless room-switching care actions) */}
      <div className="relative z-30 p-2.5 sm:p-3.5 bg-white/90 backdrop-blur-md border-t-2 border-amber-900/10 flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
        
        {/* 1. FEED -> Dining Room */}
        <button
          type="button"
          onClick={() => handleActivityClick('dining', 'feed')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'dining'
              ? 'bg-amber-100/90 text-amber-900 ring-2 ring-amber-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Dining Room and Feed"
        >
          <span className="text-xl">🍽️</span>
          <span className="text-[11px] font-extrabold">Feed</span>
        </button>

        {/* 2. TOILET -> Bathroom */}
        <button
          type="button"
          onClick={() => handleActivityClick('bathroom', 'toilet')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'bathroom'
              ? 'bg-emerald-100/90 text-emerald-900 ring-2 ring-emerald-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-emerald-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Bathroom and Tidy Potty"
        >
          <span className="text-xl">🚽</span>
          <span className="text-[11px] font-extrabold">Toilet</span>
        </button>

        {/* 3. BATHE -> Bath Area */}
        <button
          type="button"
          onClick={() => handleActivityClick('bathe', 'bathe')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'bathe'
              ? 'bg-sky-100/90 text-sky-900 ring-2 ring-sky-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-sky-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Bath Area and Bathe"
        >
          <span className="text-xl">🛁</span>
          <span className="text-[11px] font-extrabold">Bathe</span>
        </button>

        {/* 4. PLAY -> Playroom & Garden */}
        <button
          type="button"
          onClick={() => handleActivityClick('playroom', 'play')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'playroom'
              ? 'bg-amber-100/90 text-amber-900 ring-2 ring-amber-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Playroom and Play"
        >
          <span className="text-xl">🎾</span>
          <span className="text-[11px] font-extrabold">Play</span>
        </button>

        {/* 5. REST -> Bedroom */}
        <button
          type="button"
          onClick={() => handleActivityClick('bedroom', 'rest')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'bedroom'
              ? 'bg-indigo-100/90 text-indigo-900 ring-2 ring-indigo-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-indigo-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Bedroom and Rest"
        >
          <span className="text-xl">🛏️</span>
          <span className="text-[11px] font-extrabold">{actionState === 'sleeping' ? 'Wake' : 'Rest'}</span>
        </button>

        {/* 6. DRESS UP -> Dressing Room */}
        <button
          type="button"
          onClick={() => handleActivityClick('dressing', 'dress')}
          className={`flex-1 min-w-[72px] py-2 px-1.5 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
            currentScene === 'dressing'
              ? 'bg-purple-100/90 text-purple-900 ring-2 ring-purple-500 scale-102 shadow-xs'
              : 'bg-white hover:bg-purple-50 text-slate-700 border border-slate-200/80'
          }`}
          title="Switch to Dressing Room and Dress Up"
        >
          <span className="text-xl">👗</span>
          <span className="text-[11px] font-extrabold">Dress Up</span>
        </button>

      </div>

      {/* 6. Room Customizer Modal */}
      {showCustomizer && (
        <SceneCustomizerModal
          currentSceneId={currentScene}
          initialConfig={activeConfig}
          onSave={handleSaveSceneDesign}
          onClose={() => setShowCustomizer(false)}
        />
      )}

    </div>
  );
};
