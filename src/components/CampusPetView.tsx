import React, { useState } from 'react';
import { 
  Heart, 
  Zap, 
  Utensils, 
  Sparkles, 
  Smile, 
  ShoppingBag, 
  Target, 
  Plus, 
  CheckCircle2, 
  Shirt, 
  Home, 
  Layers
} from 'lucide-react';
import { VirtualPet, PetType, PetMood, PetAccessory, SavingsGoal } from '../types';
import { storageService } from '../services/storageService';
import { CartoonPetAvatar } from './CartoonPetAvatar';

interface CampusPetViewProps {
  pet: VirtualPet;
  onRefreshPet: () => void;
}

const PET_SPECIES: { type: PetType; name: string; desc: string; personality: string; tag: string }[] = [
  { type: 'kitten', name: 'Cream Kitten', desc: 'Curious & affectionate round companion with soft peach paws', personality: 'Cozy & Playful', tag: 'Most Popular' },
  { type: 'puppy', name: 'Floppy Puppy', desc: 'Loyal dorm explorer with floppy ears and a wagging tail', personality: 'Energetic & Caring', tag: 'High Energy' },
  { type: 'bunny', name: 'Chubby Bunny', desc: 'Gentle, round white bunny that loves library study corners', personality: 'Calm & Studious', tag: 'Gentle' },
  { type: 'dragon', name: 'Baby Dragon', desc: 'Mythical pastel blue fledgling who dreams of campus adventures', personality: 'Bold & Creative', tag: 'Mythical' },
  { type: 'penguin', name: 'Round Penguin', desc: 'Waddling friend dressed for arctic lecture halls and exam prep', personality: 'Focused & Neat', tag: 'Exam Hero' },
  { type: 'hamster', name: 'Sleepy Hamster', desc: 'Chubby pocket buddy with rosy cheeks who loves power naps', personality: 'Relaxed & Sweet', tag: 'Pocket Size' },
];

const ACCESSORIES: { id: PetAccessory; name: string; desc: string; icon: string; unlockLevel: number }[] = [
  { id: 'none', name: 'Natural', desc: 'No accessory', icon: '✨', unlockLevel: 1 },
  { id: 'grad_cap', name: 'Dean\'s Scholar Cap', desc: 'Proud academic cap with golden tassel', icon: '🎓', unlockLevel: 2 },
  { id: 'glasses', name: 'Honor Roll Glasses', desc: 'Gold wire round spectacles for late-night study', icon: '👓', unlockLevel: 1 },
  { id: 'bow', name: 'Peach Ribbon Bow', desc: 'Soft pastel bow hand-tied for campus festivities', icon: '🎀', unlockLevel: 1 },
  { id: 'scarf', name: 'Chilly Lecture Scarf', desc: 'Warm knitted scarf for air-conditioned halls', icon: '🧣', unlockLevel: 3 },
  { id: 'sweater', name: 'Varsity Knit Sweater', desc: 'Warm knit pullover with collegiate stripes', icon: '🧶', unlockLevel: 4 },
  { id: 'backpack', name: 'Mini Campus Satchel', desc: 'Tiny student bag carrying miniature stationery', icon: '🎒', unlockLevel: 2 },
  { id: 'badge', name: 'Eco Champion Badge', desc: 'Shiny golden star for sustainable second-hand trades', icon: '⭐', unlockLevel: 1 },
];

const ROOM_ITEMS = [
  { id: 'cushion_bed', name: 'Velvet Cloud Pet Bed', icon: '🛋️', desc: 'Plush resting spot for afternoon catnaps', owned: true },
  { id: 'snack_bowl', name: 'Ceramic Food & Water Bowls', icon: '🥣', desc: 'Filled with nutrient-rich dorm treats', owned: true },
  { id: 'potted_monstera', name: 'Campus Monstera Plant', icon: '🪴', desc: 'Air-purifying green leaf friend', owned: true },
  { id: 'wool_yarn', name: 'Playful Yarn & Bell Toy', icon: '🧶', desc: 'Bounces gently when poked', owned: true },
  { id: 'fairy_lights', name: 'Warm Study Fairy Lights', icon: '✨', desc: 'Gentle amber glow for late night vibes', owned: true },
  { id: 'mini_bookshelf', name: 'Miniature Textbook Stack', icon: '📚', desc: 'Mini engineering and economics texts', owned: false, cost: 50 },
];

export const CampusPetView: React.FC<CampusPetViewProps> = ({
  pet,
  onRefreshPet,
}) => {
  const [activeTab, setActiveTab] = useState<'room' | 'savings' | 'adopt' | 'wardrobe'>('room');
  const [interactionMessage, setInteractionMessage] = useState<string>(
    `"${pet.name} is happy to see you back on campus!"`
  );
  const [isBouncing, setIsBouncing] = useState(false);
  
  // Savings Goal State (Pocket Garden)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    return storageService.getSavingsGoals();
  });
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState(150);
  const [newGoalCategory, setNewGoalCategory] = useState('Textbooks');

  // Adopt state
  const [selectedSpecies, setSelectedSpecies] = useState<PetType>(pet.petType || 'kitten');
  const [customPetName, setCustomPetName] = useState(pet.name);

  // Trigger expressive interaction
  const triggerReaction = (mood: PetMood, message: string, expGain = 10, hungerDiff = 0, energyDiff = 0, happinessDiff = 0) => {
    setIsBouncing(true);
    setInteractionMessage(message);

    const updated: VirtualPet = {
      ...pet,
      mood,
      exp: pet.exp + expGain,
      hunger: Math.max(0, Math.min(100, pet.hunger + hungerDiff)),
      energy: Math.max(0, Math.min(100, pet.energy + energyDiff)),
      happiness: Math.max(0, Math.min(100, pet.happiness + happinessDiff)),
      lastFed: hungerDiff > 0 ? 'Just now' : pet.lastFed,
    };

    if (updated.exp >= 100) {
      updated.level += 1;
      updated.exp = updated.exp - 100;
      setInteractionMessage(`🎉 Level Up! ${pet.name} reached Level ${updated.level}! Unlocked new accessories!`);
    }

    storageService.updateVirtualPet(updated);
    onRefreshPet();

    setTimeout(() => {
      setIsBouncing(false);
    }, 900);
  };

  const handleFeed = () => {
    if (pet.hunger >= 95) {
      triggerReaction('content', `"${pet.name} is already full and content!"`, 5, 0, -2, 5);
      return;
    }
    triggerReaction('happy', `*Munch munch!* ${pet.name} loved the warm campus waffle! (+25 Hunger)`, 15, 25, 5, 15);
  };

  const handlePlay = () => {
    if (pet.energy <= 15) {
      triggerReaction('sleepy', `"${pet.name} is feeling too tired to chase toys. Time for a rest!"`, 0, 0, 0, 0);
      return;
    }
    triggerReaction('excited', `*Boing boing!* You played yarn toss with ${pet.name}! (+20 Happiness, -15 Energy)`, 20, -10, -15, 20);
  };

  const handleRest = () => {
    triggerReaction('sleepy', `"${pet.name} curled up on the plush velvet pillow for a cozy nap..." (+35 Energy)`, 10, -5, 35, 10);
  };

  const handlePet = () => {
    triggerReaction('happy', `*Purr purr~* You gently patted ${pet.name}'s soft head! (+10 Happiness)`, 10, 0, 0, 10);
  };

  const handleAdoptPet = (species: PetType) => {
    setSelectedSpecies(species);
    const chosen = PET_SPECIES.find((p) => p.type === species);
    if (chosen && (!customPetName || customPetName === pet.name)) {
      setCustomPetName(chosen.name);
    }
  };

  const handleConfirmAdoption = () => {
    const updated: VirtualPet = {
      ...pet,
      petType: selectedSpecies,
      name: customPetName.trim() || 'Mochi',
      happiness: 100,
      hunger: 90,
      energy: 90,
      mood: 'happy',
    };
    storageService.updateVirtualPet(updated);
    onRefreshPet();
    setActiveTab('room');
    setInteractionMessage(`Welcome home, ${updated.name}! You have a loyal study buddy now.`);
  };

  const handleEquipAccessory = (acc: PetAccessory) => {
    const updated: VirtualPet = {
      ...pet,
      accessory: acc,
      mood: 'excited',
    };
    storageService.updateVirtualPet(updated);
    onRefreshPet();
    setInteractionMessage(`✨ ${pet.name} looks splendid wearing the ${ACCESSORIES.find(a => a.id === acc)?.name}!`);
  };

  // Savings Goal Actions
  const handleContributeGoal = (goalId: string, amount: number) => {
    const updated = savingsGoals.map((g) => {
      if (g.id === goalId) {
        const nextCurrent = Math.min(g.targetAmount, g.currentAmount + amount);
        const isNowCompleted = nextCurrent >= g.targetAmount;
        return {
          ...g,
          currentAmount: nextCurrent,
          isCompleted: isNowCompleted,
        };
      }
      return g;
    });
    setSavingsGoals(updated);
    storageService.saveSavingsGoals(updated);

    // Reward the pet with happiness and garden growth
    triggerReaction('excited', `🌱 Savings boost! You saved RM${amount.toFixed(2)} towards your goal! Pocket Garden is blooming!`, 25, 0, 10, 20);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim() || newGoalTarget <= 0) return;

    const newGoal: SavingsGoal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      targetAmount: Number(newGoalTarget),
      currentAmount: 0,
      deadline: 'End of Semester',
      category: newGoalCategory,
      plantStage: 'seed',
      rewardPetItem: 'Dean\'s Scholar Cap',
      isCompleted: false,
    };

    const nextGoals = [newGoal, ...savingsGoals];
    setSavingsGoals(nextGoals);
    storageService.saveSavingsGoals(nextGoals);
    setShowAddGoalModal(false);
    setNewGoalTitle('');
    setNewGoalTarget(150);
    setInteractionMessage(`🌱 Planted a new savings goal: "${newGoal.title}". Save wisely by buying second-hand on CampusLoop to help it grow!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-2xl p-6 border border-sky-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-sky-200 text-xs font-semibold text-sky-800 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin-slow" />
            <span>CampusLoop Cozy Companion & Pocket Garden</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Meet {pet.name}
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Your adorable, stress-free campus study friend. Care for your pet, customize their room, 
            and grow your Pocket Garden by saving money through second-hand campus trades!
          </p>
        </div>

        {/* Level & Mood Badge */}
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-indigo-100 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-black text-xl shadow-xs">
            Lv.{pet.level}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pet Mood</div>
            <div className="text-sm font-bold text-slate-800 capitalize flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              {pet.mood} & Cozy
            </div>
            <div className="text-xs text-indigo-600 mt-0.5 font-medium">
              EXP: {pet.exp}/100 to Lv.{pet.level + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('room')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'room'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Pet Room & Sanctuary</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'savings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Pocket Garden Savings</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {savingsGoals.filter(g => !g.isCompleted).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'wardrobe'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>Dress Up Wardrobe</span>
        </button>

        <button
          onClick={() => setActiveTab('adopt')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'adopt'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Adopt / Change Buddy</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'room' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left 7 Cols: The Cozy Illustrated Room Scene */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* The Pastel Room Environment */}
            <div className="relative w-full h-[440px] rounded-3xl bg-gradient-to-b from-sky-100/60 via-purple-50/50 to-amber-50/60 border border-slate-200/80 shadow-inner overflow-hidden flex flex-col items-center justify-between p-6 select-none">
              
              {/* Wallpaper & Wall Decor */}
              <div className="absolute top-4 left-6 flex items-center gap-3">
                <div className="w-16 h-12 rounded-lg bg-white/70 border border-sky-100 shadow-xs flex flex-col items-center justify-center p-1">
                  <div className="text-[10px] font-semibold text-slate-500">SCHEDULE</div>
                  <div className="text-[9px] text-indigo-600 font-bold">Midterm: Free!</div>
                </div>
                <div className="text-xl opacity-80" title="Warm fairy lights">✨💡✨</div>
              </div>

              <div className="absolute top-4 right-6 flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-700 shadow-xs">
                <span>Room Cozy Meter:</span>
                <span className="font-bold text-indigo-600">100% Bliss</span>
              </div>

              {/* Speech / Thought Bubble */}
              <div className="mt-8 z-10 max-w-sm px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-md text-center text-sm font-medium text-slate-800 transition-all duration-300">
                {interactionMessage}
              </div>

              {/* Center Cartoon Character Avatar */}
              <div 
                onClick={handlePet}
                className={`cursor-pointer transform transition-transform duration-300 ${isBouncing ? '-translate-y-3 scale-105' : 'hover:scale-102'} z-10 flex flex-col items-center`}
                title="Click to pet!"
              >
                <CartoonPetAvatar 
                  petType={pet.petType || 'kitten'} 
                  mood={pet.mood || 'happy'} 
                  accessory={pet.accessory || 'none'} 
                  size={240} 
                />
              </div>

              {/* Room Ground / Floor Items */}
              <div className="w-full flex items-center justify-between px-6 z-10">
                {/* Pet Bed */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-9 rounded-2xl bg-gradient-to-r from-rose-200 to-pink-300 shadow-sm border border-rose-300 flex items-center justify-center text-base">
                    🛋️
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Velvet Bed</span>
                </div>

                {/* Bowls */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-9 rounded-2xl bg-gradient-to-r from-sky-200 to-indigo-200 shadow-sm border border-sky-300 flex items-center justify-center text-base">
                    🥣
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Snack Bowl</span>
                </div>

                {/* House Plant */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-9 rounded-2xl bg-gradient-to-r from-emerald-200 to-teal-200 shadow-sm border border-emerald-300 flex items-center justify-center text-base">
                    🪴
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Campus Plant</span>
                </div>

                {/* Study Toys */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-9 rounded-2xl bg-gradient-to-r from-amber-200 to-orange-200 shadow-sm border border-amber-300 flex items-center justify-center text-base">
                    🧶
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 mt-1">Yarn Toy</span>
                </div>
              </div>

              {/* Room Baseboard & Floor Texture */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-amber-100/70 to-transparent border-t border-amber-200/40 pointer-events-none"></div>
            </div>

            {/* Quick Action Buttons (Feed, Play, Rest, Pet) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={handleFeed}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50 text-slate-800 font-semibold shadow-xs hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Utensils className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-normal">Action</div>
                  <div className="text-sm font-bold">Feed Snack</div>
                </div>
              </button>

              <button
                onClick={handlePlay}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-800 font-semibold shadow-xs hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-normal">Action</div>
                  <div className="text-sm font-bold">Play Toss</div>
                </div>
              </button>

              <button
                onClick={handleRest}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-slate-800 font-semibold shadow-xs hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-normal">Action</div>
                  <div className="text-sm font-bold">Dorm Nap</div>
                </div>
              </button>

              <button
                onClick={handlePet}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-800 font-semibold shadow-xs hover:shadow-sm transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-normal">Action</div>
                  <div className="text-sm font-bold">Gentle Pet</div>
                </div>
              </button>
            </div>
          </div>

          {/* Right 5 Cols: Status Bars & Cozy Room Details */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Status Indicators */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Vitals & Energy
              </h3>

              {/* Hunger Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Utensils className="w-3.5 h-3.5 text-amber-500" />
                    Hunger / Nourishment
                  </span>
                  <span className="text-slate-900">{pet.hunger}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                    style={{ width: `${pet.hunger}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Last fed: {pet.lastFed}</span>
                  {pet.hunger < 40 && <span className="text-amber-600 font-semibold">Feeling peckish!</span>}
                </div>
              </div>

              {/* Happiness Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Happiness / Mood
                  </span>
                  <span className="text-slate-900">{pet.happiness}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-500"
                    style={{ width: `${pet.happiness}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Likes study tunes & head pats</span>
                  {pet.happiness > 80 && <span className="text-emerald-600 font-semibold">Super joyful!</span>}
                </div>
              </div>

              {/* Energy Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-slate-700">
                    <Zap className="w-3.5 h-3.5 text-sky-500" />
                    Stamina / Energy
                  </span>
                  <span className="text-slate-900">{pet.energy}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-all duration-500"
                    style={{ width: `${pet.energy}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Restores with dorm naps</span>
                  {pet.energy < 30 && <span className="text-sky-600 font-semibold">Ready for a snooze</span>}
                </div>
              </div>
            </div>

            {/* Room Furnishing List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Room Sanctuary Furnishings</h3>
                <span className="text-xs font-semibold text-indigo-600">5/6 Placed</span>
              </div>
              <p className="text-xs text-slate-500">
                Cozy accessories unlock as you save money on CampusLoop trades and level up.
              </p>

              <div className="space-y-2 pt-1">
                {ROOM_ITEMS.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <div>
                      {item.owned ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Placed
                        </span>
                      ) : (
                        <button 
                          onClick={() => triggerReaction('happy', `✨ Unlocked ${item.name}! Added to your pet's dorm room.`)}
                          className="text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200 transition-colors"
                        >
                          Unlock (Lv. 3)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Pocket Garden Savings Goal Tab */}
      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-emerald-950 flex items-center gap-2">
                <span>🌱</span> Pocket Garden: Grow Savings with Campus Trades
              </h2>
              <p className="text-sm text-emerald-800 max-w-2xl">
                Every time you buy second-hand or borrow on CampusLoop instead of buying brand new,
                allocate your savings here. As your savings reach 100%, your plant blooms and unlocks special pet outfits!
              </p>
            </div>
            <button
              onClick={() => setShowAddGoalModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Plant New Savings Goal</span>
            </button>
          </div>

          {/* Goal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {savingsGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div 
                  key={goal.id}
                  className={`bg-white rounded-2xl border ${goal.isCompleted ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'} p-5 shadow-xs space-y-4`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-2xl flex items-center justify-center border border-emerald-200">
                        {goal.isCompleted ? '🌸' : pct > 60 ? '🌿' : pct > 30 ? '🌱' : '🌰'}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">{goal.category}</div>
                        <h4 className="text-base font-bold text-slate-900">{goal.title}</h4>
                        <div className="text-xs text-slate-500">Target: {goal.deadline}</div>
                      </div>
                    </div>

                    {goal.isCompleted ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Bloomed!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                        {pct}% Grown
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Saved: RM{goal.currentAmount.toFixed(2)}</span>
                      <span>Target: RM{goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${goal.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Reward & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-slate-500">
                      Reward: <span className="font-semibold text-indigo-600">{goal.rewardPetItem}</span>
                    </div>

                    {!goal.isCompleted && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleContributeGoal(goal.id, 10)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition-colors"
                        >
                          +RM10 Saved
                        </button>
                        <button
                          onClick={() => handleContributeGoal(goal.id, 25)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                        >
                          +RM25 Saved
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wardrobe Tab */}
      {activeTab === 'wardrobe' && (
        <div className="space-y-6">
          <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-purple-950 flex items-center gap-2">
                <Shirt className="w-5 h-5 text-purple-600" /> Campus Wardrobe & Accessories
              </h2>
              <p className="text-sm text-purple-800">
                Dress {pet.name} with academic regalia, comfy dorm scarves, and honor accessories earned through active campus loop trades.
              </p>
            </div>
            <div className="text-sm font-bold text-purple-900 bg-white px-3 py-1.5 rounded-xl border border-purple-200">
              Current Outfit: <span className="text-indigo-600 uppercase font-black">{pet.accessory || 'Natural'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ACCESSORIES.map((acc) => {
              const isEquipped = (pet.accessory || 'none') === acc.id;
              const isUnlocked = pet.level >= acc.unlockLevel;

              return (
                <div 
                  key={acc.id}
                  className={`bg-white rounded-2xl border p-4 shadow-xs flex flex-col justify-between gap-3 ${
                    isEquipped ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
                      {acc.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                      <div className="text-xs text-slate-500">{acc.desc}</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Requires Lv.{acc.unlockLevel}
                    </span>

                    {isEquipped ? (
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                        Equipped
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleEquipAccessory(acc.id)}
                        className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-lg transition-colors shadow-2xs"
                      >
                        Wear
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Adopt / Change Character Tab */}
      {activeTab === 'adopt' && (
        <div className="space-y-6">
          <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-6 space-y-2">
            <h2 className="text-xl font-bold text-sky-950 flex items-center gap-2">
              <Smile className="w-5 h-5 text-sky-600" /> Choose Your Cartoon Pet Companion
            </h2>
            <p className="text-sm text-sky-800 max-w-2xl">
              Switch anytime without losing your pet level, savings goals, or wardrobe. 
              Give your companion a custom student nickname!
            </p>
          </div>

          {/* 6 Pet Types Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PET_SPECIES.map((species) => {
              const isSelected = selectedSpecies === species.type;

              return (
                <div
                  key={species.type}
                  onClick={() => handleAdoptPet(species.type)}
                  className={`cursor-pointer bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col items-center text-center gap-3 relative ${
                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-100 scale-102' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {species.tag}
                  </span>

                  <CartoonPetAvatar 
                    petType={species.type} 
                    mood="happy" 
                    accessory="none" 
                    size={130} 
                  />

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{species.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{species.desc}</p>
                    <div className="text-[11px] font-semibold text-indigo-600 mt-2">
                      Trait: {species.personality}
                    </div>
                  </div>

                  <div className="w-full pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Selected Companion' : 'Choose This Buddy'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nickname & Confirmation Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1 max-w-md">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Pet Nickname
              </label>
              <input
                type="text"
                value={customPetName}
                onChange={(e) => setCustomPetName(e.target.value)}
                placeholder="e.g. Mochi, Biscuit, Boba, Pip"
                maxLength={24}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="w-full sm:w-auto">
              <button
                onClick={handleConfirmAdoption}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition-colors"
              >
                Save & Set As Companion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Savings Goal Modal */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🌱</span> Plant a Savings Seed
              </h3>
              <button 
                onClick={() => setShowAddGoalModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Set a savings target for your textbooks, semester rent, or tech upgrades. 
              Track what you save on CampusLoop!
            </p>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next Semester Textbooks, iPad fund"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Amount (RM)
                </label>
                <input
                  type="number"
                  min="10"
                  step="5"
                  required
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={newGoalCategory}
                  onChange={(e) => setNewGoalCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Textbooks">Textbooks & Notes</option>
                  <option value="Electronics">Electronics & Calculators</option>
                  <option value="Dorm">Dorm Life & Room Essentials</option>
                  <option value="Emergency">Emergency Student Fund</option>
                  <option value="Graduation">Graduation & Career</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs"
                >
                  Plant Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
