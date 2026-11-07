import React, { useState } from 'react';
import { 
  PetSceneId, 
  SceneCustomization, 
  WallpaperPattern, 
  FloorPattern,
  SCENE_META_LIST 
} from '../../types/petScenes';
import { sceneCustomizationService } from '../../services/sceneCustomizationService';
import { soundService } from '../../services/soundService';

interface SceneCustomizerModalProps {
  currentSceneId: PetSceneId;
  initialConfig: SceneCustomization;
  onSave: (sceneId: PetSceneId, newConfig: SceneCustomization) => void;
  onClose: () => void;
}

const PASTEL_WALL_PALETTE = [
  { name: 'Butter Yellow', hex: '#FFF8E7', border: '#FDE047' },
  { name: 'Baby Pink', hex: '#FEEBF1', border: '#F472B6' },
  { name: 'Baby Blue', hex: '#EBF4FD', border: '#60A5FA' },
  { name: 'Soft Mint', hex: '#EAF7F2', border: '#34D399' },
  { name: 'Lavender Mist', hex: '#F6EFFD', border: '#A78BFA' },
  { name: 'Warm Peach', hex: '#FDF2E9', border: '#FB923C' },
  { name: 'Cream Beige', hex: '#FFFDF8', border: '#D97706' },
  { name: 'Oatmeal Milk', hex: '#F5EBE0', border: '#A8A29E' },
];

const FLOOR_PALETTE = [
  { name: 'Warm Pine', hex: '#EEDDC9', pattern: 'wood_plank' as FloorPattern },
  { name: 'Honey Wood', hex: '#F7E7D2', pattern: 'wood_plank' as FloorPattern },
  { name: 'Pastel Mint Tile', hex: '#D7EFE6', pattern: 'pastel_tile' as FloorPattern },
  { name: 'Baby Blue Tile', hex: '#DBECFB', pattern: 'pastel_tile' as FloorPattern },
  { name: 'Soft Lilac Carpet', hex: '#ECE0F8', pattern: 'soft_carpet' as FloorPattern },
  { name: 'Cream Tile', hex: '#FFF9ED', pattern: 'pastel_tile' as FloorPattern },
];

const WALLPAPERS: { id: WallpaperPattern; label: string; icon: string }[] = [
  { id: 'dots', label: 'Journal Dots', icon: '• • •' },
  { id: 'stars', label: 'Crayon Stars', icon: '✦ ★' },
  { id: 'grid', label: 'Graph Grid', icon: '⊞' },
  { id: 'stripes', label: 'Soft Stripes', icon: '///' },
  { id: 'floral', label: 'Daisy Doodles', icon: '🌸' },
  { id: 'plain', label: 'Clean Cozy', icon: '◻' },
];

const RUGS: { id: string; label: string; icon: string }[] = [
  { id: 'bear', label: 'Bear Silhouette Rug', icon: '🐻' },
  { id: 'daisy', label: 'Daisy Floral Rug', icon: '🌼' },
  { id: 'checker', label: 'Pastel Check Rug', icon: '🏁' },
  { id: 'woven', label: 'Woven Oval Mat', icon: '🧶' },
];

export const SceneCustomizerModal: React.FC<SceneCustomizerModalProps> = ({
  currentSceneId,
  initialConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<SceneCustomization>({ ...initialConfig });
  const [activeTab, setActiveTab] = useState<'wall' | 'floor' | 'wallpaper' | 'rug'>('wall');

  const sceneMeta = SCENE_META_LIST.find((s) => s.id === currentSceneId) || SCENE_META_LIST[0];

  const handleWallColorSelect = (hex: string) => {
    soundService.playPop();
    setConfig((prev) => ({ ...prev, wallColor: hex }));
  };

  const handleFloorSelect = (hex: string, pattern: FloorPattern) => {
    soundService.playPop();
    setConfig((prev) => ({ ...prev, floorColor: hex, floorPattern: pattern }));
  };

  const handleWallpaperSelect = (pattern: WallpaperPattern) => {
    soundService.playPop();
    setConfig((prev) => ({ ...prev, wallpaperPattern: pattern }));
  };

  const handleRugSelect = (rug: string) => {
    soundService.playPop();
    setConfig((prev) => ({ ...prev, rugStyle: rug }));
  };

  const handleReset = () => {
    soundService.playChime();
    const res = sceneCustomizationService.resetSceneConfig(currentSceneId);
    setConfig(res);
  };

  const handleSave = () => {
    soundService.playLevelUp();
    sceneCustomizationService.saveSceneConfig(currentSceneId, config);
    onSave(currentSceneId, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-pink-200/90 shadow-2xl max-w-2xl w-full text-left overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50/80 via-pink-50/80 to-purple-50/80 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white border border-pink-200 flex items-center justify-center text-2xl shadow-xs shrink-0">
              {sceneMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Customise {sceneMeta.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                  Room Design Studio
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Designs are saved independently. Editing this room will not change your other 5 rooms!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Live Mini Preview Box */}
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🎨 Live Scene Preview</span>
            <span className="text-[11px] font-semibold text-slate-400 capitalize">
              {config.wallpaperPattern} wallpaper • {config.floorPattern.replace('_', ' ')}
            </span>
          </div>

          <div 
            className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-amber-900/20 shadow-inner flex flex-col justify-between p-3"
            style={{ backgroundColor: config.wallColor }}
          >
            {/* Wall Decor Mini Preview */}
            <div className="flex items-center justify-between">
              <span className="text-2xl opacity-90">{sceneMeta.icon}</span>
              <span className="text-xs font-bold text-slate-700 bg-white/70 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {sceneMeta.name}
              </span>
            </div>

            {/* Floor Preview */}
            <div 
              className="w-full h-12 rounded-xl border-t-2 border-amber-900/30 flex items-center justify-center shadow-xs"
              style={{ backgroundColor: config.floorColor }}
            >
              <div className="px-4 py-1 rounded-full bg-white/80 text-[10px] font-bold text-slate-700 shadow-2xs">
                Rug: {config.rugStyle}
              </div>
            </div>
          </div>
        </div>

        {/* Customization Tabs */}
        <div className="p-4 sm:p-6 space-y-5">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('wall')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'wall'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wall Color
            </button>
            <button
              onClick={() => setActiveTab('wallpaper')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'wallpaper'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Wallpaper
            </button>
            <button
              onClick={() => setActiveTab('floor')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'floor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor Style
            </button>
            <button
              onClick={() => setActiveTab('rug')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                activeTab === 'rug'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Floor Rug
            </button>
          </div>

          {/* TAB 1: WALL COLOR */}
          {activeTab === 'wall' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Select Pastel Macaron Wall Paint
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PASTEL_WALL_PALETTE.map((c) => {
                  const isSel = config.wallColor === c.hex;
                  return (
                    <button
                      key={c.name}
                      onClick={() => handleWallColorSelect(c.hex)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 ring-2 ring-indigo-400 bg-white shadow-xs font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-slate-300 shrink-0 shadow-2xs" 
                        style={{ backgroundColor: c.hex }} 
                      />
                      <span className="text-xs text-slate-800 truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: WALLPAPER PATTERN */}
          {activeTab === 'wallpaper' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Select Hand-Drawn Bullet Journal Pattern
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {WALLPAPERS.map((wp) => {
                  const isSel = config.wallpaperPattern === wp.id;
                  return (
                    <button
                      key={wp.id}
                      onClick={() => handleWallpaperSelect(wp.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 ring-2 ring-indigo-400 bg-indigo-50/50 shadow-xs font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className="text-lg w-7 text-center">{wp.icon}</span>
                      <span className="text-xs text-slate-800">{wp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FLOOR STYLE */}
          {activeTab === 'floor' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Select Floor Pattern & Wood Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {FLOOR_PALETTE.map((fp) => {
                  const isSel = config.floorColor === fp.hex && config.floorPattern === fp.pattern;
                  return (
                    <button
                      key={fp.name}
                      onClick={() => handleFloorSelect(fp.hex, fp.pattern)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 ring-2 ring-indigo-400 bg-white shadow-xs font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-lg border border-slate-300 shrink-0 shadow-2xs" 
                        style={{ backgroundColor: fp.hex }} 
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-slate-800 font-bold truncate">{fp.name}</div>
                        <div className="text-[10px] text-slate-400 capitalize">{fp.pattern.replace('_', ' ')}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: FLOOR RUG */}
          {activeTab === 'rug' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Select Hand-Drawn Room Rug
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {RUGS.map((r) => {
                  const isSel = config.rugStyle === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => handleRugSelect(r.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 ring-2 ring-indigo-400 bg-white shadow-xs font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <span className="text-xl">{r.icon}</span>
                      <span className="text-xs text-slate-800 font-bold">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 rounded-xl hover:bg-slate-200/70 transition-colors"
          >
            Reset {sceneMeta.name} Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-200 transition-all cursor-pointer"
            >
              Save {sceneMeta.name} Design ✨
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
