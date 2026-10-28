import React, { useState } from 'react';
import { 
  Share2, 
  Download, 
  Copy, 
  Check, 
  X, 
  Globe, 
  Lock, 
  Heart, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { VirtualPet, UTMUser } from '../../types';
import { PetVisual } from './PetVisual';
import { soundService } from '../../services/soundService';
import { petWorldService } from '../../services/petWorldService';

interface PetShareModalProps {
  pet: VirtualPet;
  currentUser?: UTMUser | null;
  onClose: () => void;
  onPublishSuccess?: () => void;
}

export const PetShareModal: React.FC<PetShareModalProps> = ({
  pet,
  currentUser,
  onClose,
  onPublishSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [customQuote, setCustomQuote] = useState(pet.catchphrase || 'Having a cozy day in Pet World!');
  const [isPublic, setIsPublic] = useState(pet.isPublicInShowcase !== false);

  const ownerName = currentUser?.name || 'Alex Tan';
  const ownerFaculty = currentUser?.faculty || 'Universiti Teknologi Malaysia';

  const handleCopyLink = () => {
    soundService.playPop();
    const shareUrl = `${window.location.origin}?pet=${encodeURIComponent(pet.name)}`;
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handlePublishToShowcase = () => {
    soundService.playLevelUp();
    petWorldService.publishToCommunity(pet, customQuote, ownerName, ownerFaculty);
    setPublished(true);
    if (onPublishSuccess) onPublishSuccess();
  };

  return (
    <div className="bg-white rounded-3xl border border-indigo-100 shadow-xl overflow-hidden flex flex-col max-w-lg mx-auto text-left">
      
      {/* Top Header */}
      <div className="bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 p-4 border-b border-indigo-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-pink-600" />
          <h3 className="text-base font-bold text-slate-900">Share Pet Moment & Card</h3>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        
        {/* POLAROID PET CARD PREVIEW */}
        <div className="bg-gradient-to-br from-amber-50 via-rose-50/50 to-indigo-50/60 p-4 rounded-3xl border border-slate-200 shadow-sm max-w-xs mx-auto text-center space-y-3">
          
          {/* Pet Photo Frame */}
          <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-100 flex flex-col items-center justify-center">
            <PetVisual
              type={pet.type}
              mood={pet.mood}
              size={180}
              isCustomPet={pet.isCustomPet}
              customHead={pet.customHead}
              accessory={pet.accessory}
              growthStage={pet.growthStage}
            />

            <div className="mt-2 text-center">
              <span className="text-base font-black text-slate-900">{pet.name}</span>
              <div className="text-[11px] font-bold text-pink-600">
                Level {pet.level} • {pet.growthStage.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Quote & Owner Info */}
          <div className="space-y-1.5 px-1">
            <p className="text-xs italic text-slate-600 font-medium leading-snug">
              "{customQuote}"
            </p>
            <div className="text-[10px] font-semibold text-slate-400">
              Companion of {ownerName} • {ownerFaculty.split(' ')[0]}
            </div>
            <div className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-100 shadow-2xs">
              <span>🐾 CampusLoop UTM Pet World</span>
            </div>
          </div>
        </div>

        {/* Custom Quote Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Moment Caption / Quote</label>
          <input
            type="text"
            value={customQuote}
            maxLength={80}
            onChange={(e) => setCustomQuote(e.target.value)}
            placeholder="Write a cute message or note..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Privacy & Safety Note */}
        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Privacy Guaranteed:</span>
            <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
              Only your pet card and quote are shared. Private chat conversations and personal phone numbers are never published.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
            </button>

            <button
              onClick={handlePublishToShowcase}
              disabled={published}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60"
            >
              <Globe className="w-4 h-4" />
              <span>{published ? 'Posted to Showcase! ✓' : 'Post to Showcase'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
