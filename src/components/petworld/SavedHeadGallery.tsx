import React, { useState } from 'react';
import { 
  Trash2, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  Eye, 
  X, 
  RotateCcw,
  Image as ImageIcon
} from 'lucide-react';
import { SavedHeadImage, VirtualPet } from '../../types';
import { petWorldService } from '../../services/petWorldService';
import { soundService } from '../../services/soundService';

interface SavedHeadGalleryProps {
  currentPet: VirtualPet;
  onUpdatePet: (updated: VirtualPet) => void;
  onOpenStudio?: () => void;
}

export const SavedHeadGallery: React.FC<SavedHeadGalleryProps> = ({
  currentPet,
  onUpdatePet,
  onOpenStudio,
}) => {
  const [savedHeads, setSavedHeads] = useState<SavedHeadImage[]>(() => 
    petWorldService.getSavedHeads()
  );

  // Deletion state
  const [pendingDeleteHead, setPendingDeleteHead] = useState<SavedHeadImage | null>(null);
  const [isCurrentlyActive, setIsCurrentlyActive] = useState(false);
  const [activeHandlingChoice, setActiveHandlingChoice] = useState<'revert' | 'keepOther'>('revert');

  // Preview modal
  const [previewHead, setPreviewHead] = useState<SavedHeadImage | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleStartDelete = (head: SavedHeadImage) => {
    soundService.playPop();
    const isActive = Boolean(
      currentPet.isCustomPet && 
      currentPet.customHead && 
      currentPet.customHead.imageUrl === head.imageUrl
    );
    setIsCurrentlyActive(isActive);
    setPendingDeleteHead(head);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteHead) return;

    soundService.playFlush();
    const res = petWorldService.deleteSavedHead(pendingDeleteHead.id);
    setSavedHeads(res.updatedHeads);

    // If it was the head currently worn by the pet:
    if (res.wasActivePetHead) {
      if (activeHandlingChoice === 'revert' || res.updatedHeads.length === 0) {
        // Revert pet to standard animal head without deleting the pet
        const revertedPet = petWorldService.removeCustomHeadFromPet();
        onUpdatePet(revertedPet);
        showToast(`Image deleted. ${currentPet.name} reverted to plush animal head.`);
      } else {
        // Switch to the first available other saved head
        const alternative = res.updatedHeads[0];
        const nextPet = petWorldService.applySavedHeadToPet(alternative);
        onUpdatePet(nextPet);
        showToast(`Image deleted. Replaced with "${alternative.name}".`);
      }
    } else {
      showToast('Image deleted from your gallery.');
    }

    setPendingDeleteHead(null);
  };

  const handleApplyHead = (head: SavedHeadImage) => {
    soundService.playLevelUp();
    const nextPet = petWorldService.applySavedHeadToPet(head);
    onUpdatePet(nextPet);
    showToast(`Applied "${head.name}" to ${nextPet.name}! ✨`);
  };

  const handleRevertToStandard = () => {
    soundService.playPop();
    const reverted = petWorldService.removeCustomHeadFromPet();
    onUpdatePet(reverted);
    showToast(`${currentPet.name} is now using its standard plush animal head.`);
  };

  return (
    <div className="bg-white rounded-3xl border border-pink-100 p-5 sm:p-7 shadow-xs text-left space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-xl">🖼️</span>
              <span>My Saved Heads Gallery</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 font-bold text-xs border border-pink-200">
              {savedHeads.length} saved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your uploaded head photos. Reuse them on your pets or delete them anytime.
          </p>
        </div>

        {currentPet.isCustomPet && (
          <button
            onClick={handleRevertToStandard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all self-start sm:self-auto"
            title="Switch back to original animal plush head"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Switch to Standard Head</span>
          </button>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="p-2.5 bg-pink-50 border border-pink-200 text-pink-900 rounded-xl text-xs font-bold text-center animate-fadeIn">
          {toastMsg}
        </div>
      )}

      {/* Gallery Grid */}
      {savedHeads.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="text-xs font-bold text-slate-700">No saved head photos yet!</div>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            When you create a custom pet in the Pet Studio, your uploaded photo will be safely stored here for reuse.
          </p>
          {onOpenStudio && (
            <button
              onClick={onOpenStudio}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Open Pet Studio
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {savedHeads.map((head) => {
            const isEquipped = Boolean(
              currentPet.isCustomPet && 
              currentPet.customHead && 
              currentPet.customHead.imageUrl === head.imageUrl
            );

            return (
              <div
                key={head.id}
                className={`relative rounded-2xl p-2.5 border transition-all flex flex-col justify-between space-y-2 group ${
                  isEquipped
                    ? 'border-pink-400 bg-pink-50/40 ring-2 ring-pink-300 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-pink-300 hover:shadow-xs'
                }`}
              >
                {/* Thumbnail Frame */}
                <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={head.imageUrl}
                    alt={head.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Active Badge */}
                  {isEquipped && (
                    <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-pink-600 text-white text-[9px] font-black shadow-xs flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Wearing</span>
                    </div>
                  )}

                  {/* Top Right: Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleStartDelete(head)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-500 text-slate-500 hover:text-white flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                    title="Delete image from gallery"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details */}
                <div className="px-0.5">
                  <div className="text-xs font-bold text-slate-800 truncate">{head.name}</div>
                  <div className="text-[10px] text-slate-400">{head.savedAt}</div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-1 flex items-center gap-1.5">
                  {isEquipped ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-1.5 rounded-lg bg-pink-100 text-pink-700 text-[11px] font-bold"
                    >
                      Active Head ✓
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleApplyHead(head)}
                      className="w-full py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      Equip on Pet
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPreviewHead(head)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    title="Preview enlarged photo"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONFIRMATION DELETION MODAL */}
      {pendingDeleteHead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-rose-200 shadow-xl max-w-md w-full p-6 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Saved Head Image?</h4>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={pendingDeleteHead.imageUrl}
                alt={pendingDeleteHead.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate">{pendingDeleteHead.name}</div>
                <div className="text-[10px] text-slate-400">Saved on {pendingDeleteHead.savedAt}</div>
              </div>
            </div>

            {/* If currently used by active pet */}
            {isCurrentlyActive && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2 text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <span>⚠️</span>
                  <span>Currently worn by {currentPet.name}!</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Deleting this image will not delete {currentPet.name}. How would you like {currentPet.name}'s appearance handled?
                </p>

                <div className="space-y-1 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                    <input
                      type="radio"
                      name="headAction"
                      checked={activeHandlingChoice === 'revert'}
                      onChange={() => setActiveHandlingChoice('revert')}
                      className="accent-pink-500"
                    />
                    <span>Revert to original plush animal head (Recommended)</span>
                  </label>
                  {savedHeads.length > 1 && (
                    <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                      <input
                        type="radio"
                        name="headAction"
                        checked={activeHandlingChoice === 'keepOther'}
                        onChange={() => setActiveHandlingChoice('keepOther')}
                        className="accent-pink-500"
                      />
                      <span>Replace with another saved head</span>
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDeleteHead(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENLARGED PREVIEW MODAL */}
      {previewHead && (
        <div 
          onClick={() => setPreviewHead(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full p-5 text-center space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">{previewHead.name}</span>
              <button
                onClick={() => setPreviewHead(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-56 h-56 mx-auto rounded-2xl overflow-hidden border-2 border-pink-200 shadow-sm bg-slate-50 flex items-center justify-center">
              <img
                src={previewHead.imageUrl}
                alt={previewHead.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleApplyHead(previewHead);
                  setPreviewHead(null);
                }}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm"
              >
                Equip on {currentPet.name}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
