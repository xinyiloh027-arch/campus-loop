import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface DressingSceneProps {
  customization: SceneCustomization;
  onDressClick: () => void;
}

export const DressingScene: React.FC<DressingSceneProps> = ({
  customization,
  onDressClick,
}) => {
  const [mirrorTapped, setMirrorTapped] = useState(false);
  const [perfumeSpritz, setPerfumeSpritz] = useState(false);

  const handleMirrorTap = () => {
    setMirrorTapped(true);
    soundService.playChime();
    onDressClick();
    setTimeout(() => setMirrorTapped(false), 800);
  };

  const handlePerfumeTap = () => {
    setPerfumeSpritz(true);
    soundService.playPop();
    setTimeout(() => setPerfumeSpritz(false), 1200);
  };

  return (
    <svg 
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 800 500" 
      preserveAspectRatio="xMidYMid slice"
    >
      {/* 1. ROOM WALL BACKGROUND */}
      <rect 
        x="0" 
        y="0" 
        width="800" 
        height="350" 
        fill={customization.wallColor} 
      />

      {/* Wallpaper Pattern */}
      {customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-floral)" />
      )}
      {customization.wallpaperPattern === 'dots' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-dots)" />
      )}
      {customization.wallpaperPattern === 'grid' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-grid)" />
      )}
      {customization.wallpaperPattern === 'stars' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stars)" />
      )}
      {customization.wallpaperPattern === 'stripes' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stripes)" />
      )}

      {/* Wainscoting Trim */}
      <rect x="0" y="336" width="800" height="16" fill="#FBCFE8" stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 2. FLOOR: Chic Soft Flooring */}
      <rect x="0" y="352" width="800" height="148" fill={customization.floorColor} />
      <rect x="0" y="352" width="800" height="148" fill="url(#pattern-wood-plank)" />

      {/* 3. FULL-LENGTH ARCHED STANDING MIRROR (Left Foreground) */}
      <g 
        id="standing-mirror" 
        transform={`translate(80, 80) ${mirrorTapped ? 'scale(1.05)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleMirrorTap}
      >
        {/* Mirror Wooden Stand Legs */}
        <line x1="10" y1="280" x2="0" y2="340" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        <line x1="120" y1="280" x2="130" y2="340" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />

        {/* Outer Wooden Arched Frame */}
        <path 
          d="M 10 70 Q 10 10 65 10 Q 120 10 120 70 L 120 290 Q 65 300 10 290 Z" 
          fill="#FED7AA" 
          stroke="#4A3728" 
          strokeWidth="3.4" 
          strokeLinejoin="round" 
        />
        {/* Mirror Glass Surface */}
        <path 
          d="M 22 75 Q 22 25 65 25 Q 108 25 108 75 L 108 275 Q 65 285 22 275 Z" 
          fill="#EFF6FF" 
          stroke="#4A3728" 
          strokeWidth="2.2" 
        />
        {/* Mirror Glaze Reflection Lines */}
        <path d="M 35 45 L 85 240" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        <path d="M 50 40 L 95 210" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

        {/* Cute Bow on top of mirror */}
        <circle cx="65" cy="10" r="5" fill="#FB7185" stroke="#4A3728" strokeWidth="1.8" />
        <ellipse cx="56" cy="10" rx="6" ry="4" fill="#FDA4AF" stroke="#4A3728" strokeWidth="1.6" />
        <ellipse cx="74" cy="10" rx="6" ry="4" fill="#FDA4AF" stroke="#4A3728" strokeWidth="1.6" />

        {/* Action Label */}
        <rect x="15" y="300" width="100" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="65" y="312" fontSize="8" fill="#4A3728" textAnchor="middle" fontWeight="bold">👗 Mirror & Fitting</text>
      </g>

      {/* 4. WALL DECORATIONS (CENTER TOP): Vanity Shelf & Perfume Bottle */}
      <g id="vanity-shelf" transform="translate(340, 80)">
        <rect x="0" y="35" width="130" height="10" rx="3" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.4" />
        {/* Perfume Bottle with Atomizer */}
        <g 
          transform="translate(18, 5)" 
          onClick={handlePerfumeTap} 
          className="cursor-pointer pointer-events-auto"
        >
          <title>Click to spritz perfume!</title>
          <rect x="0" y="10" width="20" height="20" rx="6" fill="#F472B6" stroke="#4A3728" strokeWidth="2" />
          <circle cx="10" cy="5" r="3.5" fill="#FBBF24" stroke="#4A3728" strokeWidth="1.4" />
          <circle cx="24" cy="7" r="4.5" fill="#F43F5E" stroke="#4A3728" strokeWidth="1.4" />
          {perfumeSpritz && (
            <g className="animate-ping">
              <circle cx="-6" cy="2" r="2.5" fill="#EC4899" />
              <circle cx="-12" cy="6" r="2" fill="#EC4899" />
              <circle cx="-15" cy="-2" r="2" fill="#F472B6" />
            </g>
          )}
        </g>

        {/* Hair Bow Display */}
        <ellipse cx="65" cy="22" rx="10" ry="7" fill="#FBCFE8" stroke="#4A3728" strokeWidth="1.8" />
        <circle cx="65" cy="22" r="3" fill="#F43F5E" />

        {/* Wire Glasses resting on velvet tray */}
        <circle cx="95" cy="24" r="6" fill="#FFFFFF" fillOpacity="0.4" stroke="#4A3728" strokeWidth="1.6" />
        <circle cx="109" cy="24" r="6" fill="#FFFFFF" fillOpacity="0.4" stroke="#4A3728" strokeWidth="1.6" />
        <line x1="101" y1="24" x2="103" y2="24" stroke="#4A3728" strokeWidth="2" />
      </g>

      {/* 5. OPEN WOODEN WARDROBE RACK (Right Foreground) */}
      <g id="wardrobe-rack" transform="translate(540, 150)">
        {/* A-Frame Wooden Rack */}
        <line x1="20" y1="60" x2="0" y2="270" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        <line x1="180" y1="60" x2="200" y2="270" stroke="#78350F" strokeWidth="5" strokeLinecap="round" />
        {/* Top Hanging Bar */}
        <line x1="15" y1="70" x2="185" y2="70" stroke="#4A3728" strokeWidth="5" strokeLinecap="round" />

        {/* Outfit 1: Varsity Sweater on Hanger */}
        <g transform="translate(35, 70)">
          <path d="M 0 0 L 15 15 L -15 15 Z" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <path d="M -16 15 L -24 35 L -14 38 L -10 24 L -10 65 L 10 65 L 10 24 L 14 38 L 24 35 L 16 15 Z" fill="#C4B5FD" stroke="#4A3728" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M -6 20 L 0 28 L 6 20" stroke="#7C3AED" strokeWidth="1.8" fill="none" />
        </g>

        {/* Outfit 2: Yellow Monsoon Raincoat */}
        <g transform="translate(85, 70)">
          <path d="M 0 0 L 15 15 L -15 15 Z" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <path d="M -18 15 L -26 40 L -16 42 L -12 26 L -12 70 L 12 70 L 12 26 L 16 42 L 26 40 L 18 15 Z" fill="#FDE047" stroke="#4A3728" strokeWidth="2.2" strokeLinejoin="round" />
          <line x1="0" y1="20" x2="0" y2="70" stroke="#4A3728" strokeWidth="1.6" />
          <circle cx="4" cy="32" r="1.8" fill="#1E293B" />
          <circle cx="4" cy="46" r="1.8" fill="#1E293B" />
        </g>

        {/* Outfit 3: Pastel Campus Hoodie */}
        <g transform="translate(135, 70)">
          <path d="M 0 0 L 15 15 L -15 15 Z" fill="none" stroke="#F59E0B" strokeWidth="2" />
          <path d="M -18 15 L -28 38 L -18 40 L -12 25 L -12 68 L 12 68 L 12 25 L 18 40 L 28 38 L 18 15 Z" fill="#FBCFE8" stroke="#4A3728" strokeWidth="2.2" strokeLinejoin="round" />
          <rect x="-8" y="44" width="16" height="14" rx="3" fill="#F472B6" />
        </g>

        {/* Bottom Shoe / Storage Shelf */}
        <rect x="15" y="220" x2="170" width="170" height="8" rx="2" fill="#E2D4C0" stroke="#4A3728" strokeWidth="2.2" />
        {/* Campus Sneakers */}
        <ellipse cx="60" cy="216" rx="14" ry="7" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <ellipse cx="90" cy="216" rx="14" ry="7" fill="#FDA4AF" stroke="#4A3728" strokeWidth="1.8" />
        <ellipse cx="140" cy="216" rx="14" ry="7" fill="#38BDF8" stroke="#4A3728" strokeWidth="1.8" />
      </g>

      {/* 6. SOFT VELVET DRESSING STOOL (Center) */}
      <g id="dressing-stool" transform="translate(350, 395)">
        <line x1="20" y1="20" x2="12" y2="55" stroke="#4A3728" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="80" y1="20" x2="88" y2="55" stroke="#4A3728" strokeWidth="4.5" strokeLinecap="round" />
        <ellipse cx="50" cy="20" rx="42" ry="16" fill="#F472B6" stroke="#4A3728" strokeWidth="2.8" />
        <ellipse cx="50" cy="18" rx="36" ry="12" fill="#FBCFE8" />
        {/* Tufted Cushion Center Button */}
        <circle cx="50" cy="18" r="2.5" fill="#DB2777" />
      </g>
    </svg>
  );
};
