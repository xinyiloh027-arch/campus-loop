import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Heart, 
  Zap, 
  Utensils, 
  Bath, 
  Gamepad2, 
  Moon, 
  Shirt, 
  MessageSquare, 
  Share2, 
  ShoppingBag, 
  Target, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  PlusCircle, 
  Compass, 
  Globe, 
  Brain, 
  Trophy, 
  Check, 
  ArrowRight,
  Smile
} from 'lucide-react';
import { 
  VirtualPet, 
  PetType, 
  PetActionState, 
  PetAccessory, 
  CommunityPet, 
  UTMUser 
} from '../types';
import { 
  petWorldService, 
  PET_SPECIES_LIST, 
  PERSONALITY_PRESETS 
} from '../services/petWorldService';
import { soundService } from '../services/soundService';
import { PetRoom } from './petworld/PetRoom';
import { PetVisual } from './petworld/PetVisual';
import { CustomPetStudio } from './petworld/CustomPetStudio';
import { MiniGames } from './petworld/MiniGames';
import { PetChatDrawer } from './petworld/PetChatDrawer';
import { PetShopModal } from './petworld/PetShopModal';
import { PetShareModal } from './petworld/PetShareModal';
import { SavedHeadGallery } from './petworld/SavedHeadGallery';

interface PetWorldViewProps {
  currentUser?: UTMUser | null;
}

export const PetWorldView: React.FC<PetWorldViewProps> = ({ currentUser }) => {
  const [pet, setPet] = useState<VirtualPet>(() => petWorldService.getPet());
  const [actionState, setActionState] = useState<PetActionState>('idle');
  const [bubbleText, setBubbleText] = useState<string | undefined>(
    `"${pet.name} is happy to see you back on campus!"`
  );
  const [isMuted, setIsMuted] = useState<boolean>(soundService.isMuted());

  // Active secondary modals / drawers
  const [showStudio, setShowStudio] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [showGamesModal, setShowGamesModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopInitialTab, setShopInitialTab] = useState<'shop' | 'wardrobe' | 'missions'>('shop');
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'room' | 'gallery' | 'community'>('room');
  const [savedHeadsCount, setSavedHeadsCount] = useState<number>(() => petWorldService.getSavedHeads().length);

  // Community Showcase pets
  const [communityPets, setCommunityPets] = useState<CommunityPet[]>(() => 
    petWorldService.getCommunityPets()
  );

  // Adopt modal state
  const [adoptType, setAdoptType] = useState<PetType>('corgi');
  const [adoptName, setAdoptName] = useState('Boba');
  const [adoptPersonality, setAdoptPersonality] = useState('playful_puppy');

  // Feeding treat selector modal
  const [showFeedMenu, setShowFeedMenu] = useState(false);

  // Synchronize with storage
  const handleUpdatePet = (updated: VirtualPet) => {
    setPet(updated);
    petWorldService.savePet(updated);
  };

  const handleToggleSound = () => {
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) soundService.playChime();
  };

  // 1. FEED INTERACTION
  const handleFeed = (foodId?: string) => {
    soundService.playMunch();
    setActionState('eating');
    const { pet: nextPet, message } = petWorldService.feedPet(pet, foodId);
    handleUpdatePet(nextPet);
    setBubbleText(message);
    setShowFeedMenu(false);

    setTimeout(() => {
      setActionState('idle');
    }, 2800);
  };

  // 2. BATHE INTERACTION
  const handleBathe = () => {
    soundService.playPop();
    setActionState('bathing');
    const { pet: nextPet, message } = petWorldService.bathePet(pet);
    handleUpdatePet(nextPet);
    setBubbleText(message);

    setTimeout(() => {
      setActionState('idle');
    }, 3200);
  };

  // 3. REST INTERACTION
  const handleRest = () => {
    soundService.playSnore();
    const isAlreadySleeping = actionState === 'sleeping';
    if (isAlreadySleeping) {
      setActionState('idle');
      setBubbleText(`*Yawns and stretches* ${pet.name} is fully awake and ready for study sessions!`);
    } else {
      setActionState('sleeping');
      const { pet: nextPet, message } = petWorldService.restPet(pet);
      handleUpdatePet(nextPet);
      setBubbleText(message);
    }
  };

  // 4. TOILET INTERACTION
  const handleToilet = () => {
    soundService.playFlush();
    setActionState('toilet');
    const { pet: nextPet, message } = petWorldService.toiletPet(pet);
    handleUpdatePet(nextPet);
    setBubbleText(message);

    setTimeout(() => {
      setActionState('idle');
    }, 2500);
  };

  // 5. DAILY CHECK-IN
  const handleDailyCheckin = () => {
    const res = petWorldService.claimDailyCheckin(pet);
    if (res.success) {
      soundService.playLevelUp();
      handleUpdatePet(res.pet);
    } else {
      soundService.playPop();
    }
    setBubbleText(res.message);
  };

  // High-paw community pet
  const handleHighPaw = (id: string) => {
    soundService.playChime();
    const updated = petWorldService.toggleHighPaw(id);
    setCommunityPets(updated);
  };

  // Confirm ready-made adoption
  const handleConfirmAdopt = () => {
    soundService.playLevelUp();
    const adopted = petWorldService.adoptPet(adoptType, adoptName, adoptPersonality as any);
    handleUpdatePet(adopted);
    setShowAdoptModal(false);
    setBubbleText(`🎉 Welcome home ${adopted.name}! They are delighted to be your campus friend!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-left space-y-6">
      
      {/* Top Banner: Status Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-indigo-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Pet identity & Growth */}
        <div className="flex items-center gap-3.5">
          <div className="relative cursor-pointer" onClick={() => setShowChatDrawer(true)}>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 to-indigo-400 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                <PetVisual
                  type={pet.type}
                  mood={pet.mood}
                  size={52}
                  isCustomPet={pet.isCustomPet}
                  customHead={pet.customHead}
                />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-black shadow-xs">
              Lv.{pet.level}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {pet.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-200 capitalize">
                {pet.growthStage} Companion
              </span>
              {pet.isCustomPet && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Custom Studio 🎨
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {pet.personalityTitle} • Friendship Rank {pet.friendshipLevel} (⭐ {pet.friendshipExp}/100)
            </p>
          </div>
        </div>

        {/* Right: Currency Balance, Daily Check-In, Sound & Switchers */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Pet Points Balance */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 shadow-2xs">
            <span className="text-base">🐾</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider leading-none">Pet Points</span>
              <span className="text-sm font-black tabular-nums">{pet.petPoints}</span>
            </div>
          </div>

          {/* Daily Check-In Claim Button */}
          <button
            onClick={handleDailyCheckin}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Claim daily 50 Pet Points"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Check-in</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-slate-100 border-slate-200 text-slate-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
            title={isMuted ? 'Unmute cozy pet sounds' : 'Mute pet sounds'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Adopt / Create Pet button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowAdoptModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Adopt Pet
            </button>
            <button
              onClick={() => setShowStudio(true)}
              className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Studio</span>
              <Sparkles className="w-3 h-3 text-pink-500" />
            </button>
          </div>
        </div>

      </div>

      {/* Sub-navigation: My Pet Room vs Saved Heads Gallery vs Campus Community Showcase */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('room')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'room'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏠 My Pet Room</span>
        </button>

        <button
          onClick={() => {
            setSavedHeadsCount(petWorldService.getSavedHeads().length);
            setActiveSubTab('gallery');
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'gallery'
              ? 'bg-pink-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🖼️ Saved Heads ({savedHeadsCount})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('community')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'community'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-pink-400" />
          <span>Campus Pet Showcase ({communityPets.length})</span>
        </button>
      </div>

      {/* TAB 1: MY PET ROOM */}
      {activeSubTab === 'room' && (
        <div className="space-y-6">
          
          {/* Main Visual Room */}
          <PetRoom
            pet={pet}
            actionState={actionState}
            onPetClick={() => {
              setBubbleText(`*Happy purr* ${pet.name} loves being petted by you! (+5 Happiness)`);
              const updated = { ...pet, happiness: Math.min(100, pet.happiness + 5) };
              handleUpdatePet(updated);
            }}
            onHotspotClick={(action) => {
              if (action === 'feed') setShowFeedMenu(true);
              if (action === 'bathe') handleBathe();
              if (action === 'rest') handleRest();
              if (action === 'toilet') handleToilet();
              if (action === 'dress') {
                setShopInitialTab('wardrobe');
                setShowShopModal(true);
              }
              if (action === 'play') setShowGamesModal(true);
              if (action === 'talk') setShowChatDrawer(true);
            }}
            bubbleText={bubbleText}
          />

          {/* Status Vitals Panel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Hunger */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>🍔</span>
                  <span>Hunger</span>
                </span>
                <span className="text-slate-500 font-mono">{pet.hunger}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${pet.hunger}%` }}
                />
              </div>
            </div>

            {/* Happiness */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>💖</span>
                  <span>Happiness</span>
                </span>
                <span className="text-slate-500 font-mono">{pet.happiness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-pink-500 transition-all duration-500"
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
            </div>

            {/* Energy */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>⚡</span>
                  <span>Energy</span>
                </span>
                <span className="text-slate-500 font-mono">{pet.energy}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-500 transition-all duration-500"
                  style={{ width: `${pet.energy}%` }}
                />
              </div>
            </div>

            {/* Cleanliness */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1 text-slate-700">
                  <span>🛁</span>
                  <span>Cleanliness</span>
                </span>
                <span className="text-slate-500 font-mono">{pet.cleanliness}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{ width: `${pet.cleanliness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Action Dock (Interactive functional controls) */}
          <div className="p-3 sm:p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
            {/* Feed */}
            <button
              onClick={() => setShowFeedMenu(true)}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">🍴</span>
              <span className="text-xs">Feed</span>
            </button>

            {/* Bathe */}
            <button
              onClick={handleBathe}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">🧼</span>
              <span className="text-xs">Bathe</span>
            </button>

            {/* Play */}
            <button
              onClick={() => setShowGamesModal(true)}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">🎾</span>
              <span className="text-xs">Play</span>
            </button>

            {/* Rest */}
            <button
              onClick={handleRest}
              className={`flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl flex flex-col items-center gap-1 transition-all cursor-pointer font-bold ${
                actionState === 'sleeping'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
              }`}
            >
              <span className="text-xl">🛏️</span>
              <span className="text-xs">{actionState === 'sleeping' ? 'Wake Up' : 'Rest'}</span>
            </button>

            {/* Toilet */}
            <button
              onClick={handleToilet}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">🚽</span>
              <span className="text-xs">Toilet</span>
            </button>

            {/* Dress Up */}
            <button
              onClick={() => {
                setShopInitialTab('wardrobe');
                setShowShopModal(true);
              }}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">👗</span>
              <span className="text-xs">Dress Up</span>
            </button>

            {/* Talk with Memory */}
            <button
              onClick={() => setShowChatDrawer(true)}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">💬</span>
              <span className="text-xs">Talk</span>
            </button>

            {/* Share Moment */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-1 min-w-[70px] py-2.5 px-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex flex-col items-center gap-1 transition-all cursor-pointer font-bold"
            >
              <span className="text-xl">📸</span>
              <span className="text-xs">Share</span>
            </button>
          </div>

          {/* Bottom Secondary Cards (Shop & Missions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Pet Shop & Wardrobe */}
            <div 
              onClick={() => {
                setShopInitialTab('shop');
                setShowShopModal(true);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-200/80 hover:border-amber-400 p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
                  🛍️
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pet World Shop</h4>
                  <p className="text-xs text-slate-500">Buy treats, toys, seasonal outfits & themes</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>

            {/* Card 2: Daily Missions */}
            <div 
              onClick={() => {
                setShopInitialTab('missions');
                setShowShopModal(true);
              }}
              className="p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-200/80 hover:border-emerald-400 p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-sm">
                  🎯
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Campus Missions</h4>
                  <p className="text-xs text-slate-500">Earn bonus Pet Points by caring for {pet.name}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SAVED HEADS GALLERY */}
      {activeSubTab === 'gallery' && (
        <SavedHeadGallery
          currentPet={pet}
          onUpdatePet={(updated) => {
            handleUpdatePet(updated);
            setSavedHeadsCount(petWorldService.getSavedHeads().length);
          }}
          onOpenStudio={() => setShowStudio(true)}
        />
      )}

      {/* TAB 3: CAMPUS PET SHOWCASE */}
      {activeSubTab === 'community' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-pink-50 via-indigo-50 to-amber-50 rounded-3xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-pink-700 bg-pink-100/70 px-2.5 py-0.5 rounded-full mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Campus Community</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">University Pet Friends Showcase</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Visit pets created by your fellow university classmates and give them a friendly High-Paw!
              </p>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0"
            >
              Post My Pet Card
            </button>
          </div>

          {/* Community Pets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {communityPets.map((cpet) => (
              <div
                key={cpet.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <PetVisual
                      type={cpet.petType}
                      mood={cpet.mood}
                      size={52}
                      accessory={cpet.accessory}
                      growthStage={cpet.growthStage}
                      isCustomPet={cpet.isCustomPet}
                      customHead={cpet.customHead}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{cpet.petName}</h4>
                      <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.2 rounded-full">
                        Lv.{cpet.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {cpet.ownerName} • {cpet.ownerFaculty.split(' ')[0]}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-xs italic text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                  "{cpet.quote}"
                </p>

                {/* Footer with High-Paw */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 capitalize text-[11px]">{cpet.roomTheme} Room</span>

                  <button
                    onClick={() => handleHighPaw(cpet.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      cpet.hasHighPawed
                        ? 'bg-pink-500 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>🐾</span>
                    <span>High-Paw ({cpet.pawsCount})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODALS */}
      {/* ==================================================== */}

      {/* 1. Custom Pet Studio Modal */}
      {showStudio && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-5xl my-8">
            <CustomPetStudio
              currentPet={pet}
              onSaveCustomPet={(name, bodyType, personality, headConfig) => {
                const updated = petWorldService.saveCustomPet(name, bodyType, personality, headConfig);
                handleUpdatePet(updated);
                setShowStudio(false);
                setBubbleText(`Ta-da! Meet your new custom companion ${updated.name}! 🎨`);
              }}
              onCancel={() => setShowStudio(false)}
            />
          </div>
        </div>
      )}

      {/* 2. Adopt Ready-Made Pet Modal */}
      {showAdoptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl p-6 sm:p-8 max-w-3xl w-full text-left space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Adopt a Ready-Made Pet</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose from our diverse collection of cute campus cartoon animals!
                </p>
              </div>
              <button
                onClick={() => setShowAdoptModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Species selection grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Cute Companion
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                {PET_SPECIES_LIST.map((sp) => {
                  const isSel = adoptType === sp.type;
                  return (
                    <button
                      key={sp.type}
                      type="button"
                      onClick={() => {
                        setAdoptType(sp.type);
                        setAdoptPersonality(sp.defaultPersonality);
                        soundService.playChime();
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                        isSel
                          ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 scale-102 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 font-medium'
                      }`}
                    >
                      <div className="w-11 h-11 flex items-center justify-center pointer-events-none">
                        <PetVisual type={sp.type} mood="happy" size={48} />
                      </div>
                      <span className="text-[11px] truncate max-w-full leading-tight">{sp.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adopt Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Pet Name</label>
                <input
                  type="text"
                  value={adoptName}
                  maxLength={20}
                  onChange={(e) => setAdoptName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Personality</label>
                <select
                  value={adoptPersonality}
                  onChange={(e) => setAdoptPersonality(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                >
                  {Object.entries(PERSONALITY_PRESETS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setShowAdoptModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdopt}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Adopt {adoptName || 'Pet'} 🐾
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Feed Treat Selector Modal */}
      {showFeedMenu && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl p-5 sm:p-6 max-w-md w-full text-left space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Select a Delicious Campus Treat</h3>
              <button
                onClick={() => setShowFeedMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'food_bento', name: 'Campus Bento', icon: '🍱', desc: '+35 Hunger' },
                { id: 'food_berries', name: 'Sweet Berries', icon: '🍓', desc: '+20 Hunger, +20 Happy' },
                { id: 'food_boba', name: 'Matcha Boba', icon: '🧋', desc: '+25 Happy' },
                { id: 'food_fish_treat', name: 'Salmon Jerky', icon: '🐟', desc: '+25 Hunger' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => handleFeed(f.id)}
                  className="p-3 rounded-2xl border border-slate-200/80 hover:border-pink-300 hover:bg-pink-50/50 flex items-center gap-3 transition-all cursor-pointer text-left"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-800">{f.name}</div>
                    <div className="text-[10px] text-pink-600 font-semibold">{f.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Mini-Games Modal */}
      {showGamesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <MiniGames
              petName={pet.name}
              onReward={(points, happy, exp, reason) => {
                const { pet: nextPet } = petWorldService.awardPoints(
                  { ...pet, happiness: Math.min(100, pet.happiness + happy) },
                  points,
                  reason
                );
                handleUpdatePet(nextPet);
                setBubbleText(`🎉 Great job! You and ${pet.name} earned 🐾 ${points} Pet Points and had a blast!`);
              }}
              onClose={() => setShowGamesModal(false)}
            />
          </div>
        </div>
      )}

      {/* 5. Chat & Memories Drawer */}
      {showChatDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <PetChatDrawer
              pet={pet}
              onUpdatePet={handleUpdatePet}
              onClose={() => setShowChatDrawer(false)}
              userName={currentUser?.name || 'Alex'}
            />
          </div>
        </div>
      )}

      {/* 6. Shop & Wardrobe Modal */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <PetShopModal
              pet={pet}
              onUpdatePet={handleUpdatePet}
              onClose={() => setShowShopModal(false)}
              initialTab={shopInitialTab}
            />
          </div>
        </div>
      )}

      {/* 7. Share Moment Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg my-8">
            <PetShareModal
              pet={pet}
              currentUser={currentUser}
              onClose={() => setShowShareModal(false)}
              onPublishSuccess={() => {
                setCommunityPets(petWorldService.getCommunityPets());
                setActiveSubTab('community');
                setShowShareModal(false);
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
