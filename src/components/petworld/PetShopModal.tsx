import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Check, 
  X, 
  Trophy, 
  Target, 
  Shirt, 
  AlertCircle 
} from 'lucide-react';
import { VirtualPet, PetShopItem, PetAccessory, DailyMission } from '../../types';
import { SHOP_ITEMS, petWorldService } from '../../services/petWorldService';
import { soundService } from '../../services/soundService';

interface PetShopModalProps {
  pet: VirtualPet;
  onUpdatePet: (updated: VirtualPet) => void;
  onClose: () => void;
  initialTab?: 'shop' | 'wardrobe' | 'missions';
}

export const PetShopModal: React.FC<PetShopModalProps> = ({
  pet,
  onUpdatePet,
  onClose,
  initialTab = 'shop',
}) => {
  const [activeTab, setActiveTab] = useState<'shop' | 'wardrobe' | 'missions'>(initialTab);
  const [shopCategory, setShopCategory] = useState<'all' | 'food' | 'toy' | 'accessory' | 'theme'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [missions, setMissions] = useState<DailyMission[]>(() => {
    return petWorldService.getDailyMissions();
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyItem = (item: PetShopItem) => {
    if (pet.inventory.includes(item.id)) {
      showToast(`You already own ${item.name}!`);
      return;
    }

    if (pet.petPoints < item.cost) {
      showToast(`Not enough Pet Points! You need 🐾 ${item.cost - pet.petPoints} more.`);
      return;
    }

    soundService.playChime();

    // Deduct points, add to inventory
    let updatedPet: VirtualPet = {
      ...pet,
      petPoints: pet.petPoints - item.cost,
      inventory: [...pet.inventory, item.id],
    };

    // If it's a theme, switch immediately
    if (item.category === 'theme') {
      const themeKey = item.id.replace('theme_', '') as VirtualPet['roomTheme'];
      updatedPet.roomTheme = themeKey;
    }

    // If it's an accessory, equip it
    if (item.category === 'accessory') {
      const accKey = item.id.replace('acc_', '') as PetAccessory;
      updatedPet.accessory = accKey;
    }

    petWorldService.savePet(updatedPet);
    onUpdatePet(updatedPet);
    showToast(`Purchased ${item.name}! 🎉`);
  };

  const handleEquipAccessory = (accId: PetAccessory) => {
    soundService.playPop();
    const updated = petWorldService.equipAccessory(pet, accId);
    onUpdatePet(updated);
    showToast(`Equipped ${accId.replace('_', ' ')}! ✨`);
  };

  const handleEquipTheme = (themeId: VirtualPet['roomTheme']) => {
    soundService.playChime();
    const updated = petWorldService.changeRoomTheme(pet, themeId);
    onUpdatePet(updated);
    showToast(`Theme changed to ${themeId}! 🌸`);
  };

  const handleClaimMission = (mId: string) => {
    const res = petWorldService.claimMissionReward(mId, pet);
    if (res.awarded > 0) {
      soundService.playLevelUp();
      setMissions(res.missions);
      onUpdatePet(res.pet);
      showToast(`Claimed +${res.awarded} Pet Points! 🐾`);
    }
  };

  const filteredShopItems = SHOP_ITEMS.filter((item) => {
    if (shopCategory === 'all') return true;
    return item.category === shopCategory;
  });

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden flex flex-col max-h-[85vh] max-w-3xl mx-auto text-left">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-indigo-50 p-5 border-b border-indigo-100 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900">Pet World Shop & Wardrobe</h3>
            <div className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center gap-1 shadow-2xs">
              <span>🐾</span>
              <span>{pet.petPoints} Points</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spend your points on snacks, cozy furniture, and fashionable collegiate outfits.
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-3 bg-slate-50 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'shop'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Treats & Decor Shop</span>
        </button>

        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'wardrobe'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>My Wardrobe</span>
        </button>

        <button
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'missions'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-white'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Daily Missions</span>
        </button>
      </div>

      {/* Toast Banner */}
      {toastMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold text-center animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* TAB 1: SHOP */}
      {activeTab === 'shop' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'food', label: '🍱 Treats & Snacks' },
              { id: 'toy', label: '🎾 Toys' },
              { id: 'accessory', label: '👗 Outfits & Hats' },
              { id: 'theme', label: '🌸 Room Themes' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setShopCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  shopCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredShopItems.map((item) => {
              const isOwned = pet.inventory.includes(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-300 shadow-2xs flex flex-col justify-between space-y-2.5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 border border-slate-100">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                      {item.effectLabel && (
                        <span className="inline-block mt-1 text-[10px] font-bold text-pink-600 bg-pink-50 px-1.5 py-0.2 rounded">
                          {item.effectLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                      <span>🐾</span>
                      <span>{item.cost === 0 ? 'Free' : item.cost}</span>
                    </span>

                    {isOwned ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <Check className="w-3.5 h-3.5" />
                        <span>Owned</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={pet.petPoints < item.cost}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* TAB 2: WARDROBE */}
      {activeTab === 'wardrobe' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Outfits & Accessories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-indigo-600" />
              <span>Equipped & Owned Accessories</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'none', name: 'Natural (No accessory)', icon: '✨' },
                { id: 'grad_cap', name: 'Dean\'s Scholar Cap', icon: '🎓' },
                { id: 'glasses', name: 'Honor Roll Wire Glasses', icon: '👓' },
                { id: 'party_crown', name: 'Royal Golden Crown', icon: '👑' },
                { id: 'flower_crown', name: 'Pastel Daisy Crown', icon: '🌸' },
                { id: 'beanie', name: 'Campus Knitted Beanie', icon: '🧢' },
                { id: 'cool_shades', name: 'Star-Strut Sunshades', icon: '🕶️' },
                { id: 'bow', name: 'Peach Ribbon Bow', icon: '🎀' },
                { id: 'scarf', name: 'Lecture Hall Scarf', icon: '🧣' },
                { id: 'sweater', name: 'Varsity Knit Sweater', icon: '🧶' },
                { id: 'raincoat', name: 'Puddle Raincoat', icon: '🧥' },
                { id: 'chef_hat', name: 'Master Chef Hat', icon: '🧑‍🍳' },
                { id: 'badge', name: 'Eco Champion Star', icon: '⭐' },
                { id: 'bell_collar', name: 'Golden Bell Collar', icon: '🔔' },
              ].map((acc) => {
                const isEquipped = pet.accessory === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleEquipAccessory(acc.id as PetAccessory)}
                    className={`p-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      isEquipped
                        ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400 font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{acc.icon}</span>
                    <span className="text-xs truncate max-w-full">{acc.name}</span>
                    {isEquipped && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.2 rounded-full font-bold">
                        Equipped
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Themes */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🌸</span>
              <span>Room Themes</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'dorm', name: 'Cozy Campus Dorm', icon: '🛏️', desc: 'Textbook shelves & warm lights' },
                { id: 'garden', name: 'Pastel Sakura Garden', icon: '🌸', desc: 'Blossoms & stone pathway' },
                { id: 'library', name: 'Midnight Library Nook', icon: '📚', desc: 'Mahogany shelves & brass lamp' },
                { id: 'dreamland', name: 'Cloud Dreamland', icon: '☁️', desc: 'Fluffy pastel clouds' },
                { id: 'tropical', name: 'Tropical River Haven', icon: '🌴', desc: 'Lush ferns & river stones' },
              ].map((thm) => {
                const isCurrent = pet.roomTheme === thm.id;
                return (
                  <button
                    key={thm.id}
                    onClick={() => handleEquipTheme(thm.id as any)}
                    className={`p-3 rounded-2xl flex items-center gap-3 transition-all text-left cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-md font-bold'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <span className="text-2xl">{thm.icon}</span>
                    <div>
                      <div className="text-xs font-bold">{thm.name}</div>
                      <div className={`text-[10px] ${isCurrent ? 'text-amber-100' : 'text-slate-400'}`}>
                        {thm.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DAILY MISSIONS */}
      {activeTab === 'missions' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              <div>
                <h4 className="text-xs font-bold text-emerald-950">Campus Daily Missions</h4>
                <p className="text-[11px] text-emerald-700">
                  Complete caring actions to earn bonus Pet Points every day.
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-emerald-800">
                {missions.filter((m) => m.claimed).length} / {missions.length} Claimed
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {missions.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900">{m.title}</h5>
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      +🐾 {m.rewardPoints}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{m.description}</p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-400">
                    {m.currentCount} / {m.targetCount}
                  </span>

                  {m.claimed ? (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs">
                      Claimed ✓
                    </span>
                  ) : m.completed ? (
                    <button
                      onClick={() => handleClaimMission(m.id)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs animate-bounce"
                    >
                      Claim 🐾
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-400 font-semibold text-xs border border-slate-200">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
