import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface DiningSceneProps {
  customization: SceneCustomization;
  isEating: boolean;
  onFeedClick: () => void;
}

export const DiningScene: React.FC<DiningSceneProps> = ({
  customization,
  isEating,
  onFeedClick,
}) => {
  const [bowlTapped, setBowlTapped] = useState(false);
  const [mugSteam, setMugSteam] = useState(false);

  const handleBowlTap = () => {
    setBowlTapped(true);
    soundService.playPop();
    onFeedClick();
    setTimeout(() => setBowlTapped(false), 800);
  };

  const handleMugTap = () => {
    setMugSteam(prev => !prev);
    soundService.playChime();
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
        height="360" 
        fill={customization.wallColor} 
      />

      {/* Wallpaper Pattern Overlay */}
      {customization.wallpaperPattern === 'dots' && (
        <rect x="0" y="0" width="800" height="360" fill="url(#pattern-dots)" />
      )}
      {customization.wallpaperPattern === 'grid' && (
        <rect x="0" y="0" width="800" height="360" fill="url(#pattern-grid)" />
      )}
      {customization.wallpaperPattern === 'stars' && (
        <rect x="0" y="0" width="800" height="360" fill="url(#pattern-stars)" />
      )}
      {customization.wallpaperPattern === 'stripes' && (
        <rect x="0" y="0" width="800" height="360" fill="url(#pattern-stripes)" />
      )}
      {customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="360" fill="url(#pattern-floral)" />
      )}

      {/* 2. BASEBOARD / WAINSCOTING (Warm hand-drawn moulding) */}
      <rect x="0" y="348" width="800" height="16" fill="#F0DFC8" stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="352" x2="800" y2="352" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 3. FLOOR */}
      <rect x="0" y="364" width="800" height="136" fill={customization.floorColor} />
      {customization.floorPattern === 'wood_plank' && (
        <rect x="0" y="364" width="800" height="136" fill="url(#pattern-wood-plank)" />
      )}
      {customization.floorPattern === 'pastel_tile' && (
        <rect x="0" y="364" width="800" height="136" fill="url(#pattern-floor-tile)" />
      )}

      {/* 4. WALL DECORATIONS (LEFT): Window with Sunny Clouds */}
      <g id="dining-window" transform="translate(60, 48)">
        {/* Soft Window Frame with Arched Top */}
        <path 
          d="M 0 40 Q 0 0 50 0 Q 100 0 100 40 L 100 140 L 0 140 Z" 
          fill="#BAE6FD" 
          stroke="#4A3728" 
          strokeWidth="3.2" 
          strokeLinejoin="round" 
        />
        {/* Soft Sun in Window */}
        <circle cx="75" cy="45" r="18" fill="#FDE047" opacity="0.9" />
        <circle cx="75" cy="45" r="24" fill="#FEF08A" opacity="0.4" />
        {/* Fluffy Crayon Clouds */}
        <path 
          d="M 15 105 C 10 95 30 85 45 92 C 55 80 85 85 85 98 C 95 100 95 112 80 115 L 20 115 C 10 115 10 105 15 105 Z" 
          fill="#FFFDF8" 
          stroke="#4A3728" 
          strokeWidth="2.2" 
        />
        {/* Window Mullions / Cross Panes */}
        <line x1="50" y1="5" x2="50" y2="140" stroke="#4A3728" strokeWidth="2.4" />
        <line x1="0" y1="75" x2="100" y2="75" stroke="#4A3728" strokeWidth="2.4" />
        {/* Window Sill with Little Flower Pot */}
        <rect x="-8" y="140" width="116" height="12" rx="3" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.8" />
        <path d="M 12 140 L 16 122 L 32 122 L 36 140 Z" fill="#FFAAA6" stroke="#4A3728" strokeWidth="2" />
        <circle cx="24" cy="116" r="6" fill="#10B981" />
        <circle cx="21" cy="112" r="4" fill="#34D399" />
        <circle cx="27" cy="112" r="4" fill="#34D399" />
      </g>

      {/* 5. WALL DECORATIONS (RIGHT): Kitchen Shelving & Ceramic Mugs */}
      <g id="dining-shelves" transform="translate(610, 60)">
        {/* Top Shelf */}
        <rect x="0" y="40" width="130" height="10" rx="3" fill="#EAD5BB" stroke="#4A3728" strokeWidth="2.6" />
        <path d="M 15 50 L 15 65 L 25 50" stroke="#4A3728" strokeWidth="2.2" fill="none" />
        <path d="M 115 50 L 115 65 L 105 50" stroke="#4A3728" strokeWidth="2.2" fill="none" />
        {/* Pastel Mugs on Shelf */}
        <g onClick={handleMugTap} className="cursor-pointer pointer-events-auto">
          <title>Click to warm up the hot cocoa!</title>
          <rect x="18" y="18" width="22" height="22" rx="4" fill="#FFD6E0" stroke="#4A3728" strokeWidth="2" />
          <path d="M 40 23 C 46 23 46 35 40 35" stroke="#4A3728" strokeWidth="2" fill="none" />
          {/* Steam Doodle */}
          <path 
            d={mugSteam ? "M 26 12 Q 24 5 28 0" : "M 27 14 Q 29 9 27 5"} 
            stroke="#4A3728" 
            strokeWidth="1.8" 
            strokeLinecap="round" 
            fill="none" 
            opacity="0.6" 
          />
        </g>
        {/* Honey Jar with cute label */}
        <rect x="52" y="14" width="24" height="26" rx="5" fill="#FEF08A" stroke="#4A3728" strokeWidth="2" />
        <rect x="56" y="22" width="16" height="12" rx="2" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1" />
        <text x="64" y="31" fontSize="7" fill="#4A3728" textAnchor="middle" fontWeight="bold">HONEY</text>
        {/* Small Tea Tin */}
        <rect x="86" y="12" width="26" height="28" rx="4" fill="#A7F3D0" stroke="#4A3728" strokeWidth="2" />
        <line x1="86" y1="18" x2="112" y2="18" stroke="#4A3728" strokeWidth="1.4" />

        {/* Hanging Garlic / Herb bundle */}
        <path d="M 25 50 Q 28 75 22 90" stroke="#854D0E" strokeWidth="1.5" fill="none" />
        <circle cx="22" cy="94" r="5" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <circle cx="26" cy="92" r="4.5" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
      </g>

      {/* 6. FLOOR RUG (Center) */}
      <g id="dining-rug" transform="translate(230, 390)">
        {customization.rugStyle === 'checker' ? (
          <g>
            <ellipse cx="170" cy="40" rx="190" ry="48" fill="#FFF9ED" stroke="#4A3728" strokeWidth="2.8" />
            <ellipse cx="170" cy="40" rx="176" ry="40" fill="#FED7AA" stroke="#4A3728" strokeWidth="1.6" strokeDasharray="6,4" />
          </g>
        ) : customization.rugStyle === 'daisy' ? (
          <g>
            <ellipse cx="170" cy="40" rx="180" ry="46" fill="#FEF3C7" stroke="#4A3728" strokeWidth="2.8" />
            {/* Tiny daisy petals */}
            <circle cx="80" cy="38" r="8" fill="#FFFDF8" />
            <circle cx="80" cy="38" r="3" fill="#F59E0B" />
            <circle cx="260" cy="42" r="8" fill="#FFFDF8" />
            <circle cx="260" cy="42" r="3" fill="#F59E0B" />
          </g>
        ) : customization.rugStyle === 'bear' ? (
          <g>
            <ellipse cx="170" cy="40" rx="180" ry="46" fill="#F5D0A9" stroke="#4A3728" strokeWidth="2.8" />
            {/* Bear ears */}
            <circle cx="40" cy="20" r="16" fill="#F5D0A9" stroke="#4A3728" strokeWidth="2.6" />
            <circle cx="300" cy="20" r="16" fill="#F5D0A9" stroke="#4A3728" strokeWidth="2.6" />
          </g>
        ) : (
          <ellipse cx="170" cy="40" rx="180" ry="44" fill="#FFF5EB" stroke="#4A3728" strokeWidth="2.8" />
        )}
      </g>

      {/* 7. DINING TABLE (Left/Center background) */}
      <g id="dining-table" transform="translate(130, 260)">
        {/* Table Legs */}
        <line x1="20" y1="80" x2="16" y2="150" stroke="#4A3728" strokeWidth="6" strokeLinecap="round" />
        <line x1="170" y1="80" x2="174" y2="150" stroke="#4A3728" strokeWidth="6" strokeLinecap="round" />
        {/* Table Top Surface with Pastel Checkered Cloth */}
        <ellipse cx="95" cy="80" rx="95" ry="26" fill="#E8D5B5" stroke="#4A3728" strokeWidth="3" />
        {/* Table Cloth Drape */}
        <path 
          d="M 10 80 Q 95 106 180 80 L 176 112 Q 95 130 14 112 Z" 
          fill="#FFD6E0" 
          stroke="#4A3728" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Checkered pattern dashes on tablecloth */}
        <path d="M 30 88 L 30 114 M 60 92 L 60 118 M 95 94 L 95 120 M 130 92 L 130 118 M 160 88 L 160 114" stroke="#FB7185" strokeWidth="2" opacity="0.6" />
        {/* Table Top Fruit Bowl / Bread Basket */}
        <ellipse cx="95" cy="74" rx="28" ry="12" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        <circle cx="86" cy="70" r="6.5" fill="#EF4444" stroke="#4A3728" strokeWidth="1.2" />
        <circle cx="98" cy="68" r="7" fill="#F59E0B" stroke="#4A3728" strokeWidth="1.2" />
        <circle cx="106" cy="71" r="5.5" fill="#10B981" stroke="#4A3728" strokeWidth="1.2" />
      </g>

      {/* 8. PET FOOD & WATER BOWLS (Foreground interactive hotspots) */}
      <g 
        id="pet-bowls" 
        transform={`translate(490, 360) ${bowlTapped ? 'scale(1.08)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleBowlTap}
      >
        {/* Bowl Floor Mat */}
        <rect x="0" y="24" width="150" height="58" rx="20" fill="#FFFBEB" stroke="#4A3728" strokeWidth="2.4" />
        <text x="75" y="40" fontSize="8" fill="#B45309" textAnchor="middle" fontWeight="bold" letterSpacing="1">CAMPUS TREATS</text>

        {/* Left Bowl: Food Bowl */}
        <g id="food-bowl">
          <ellipse cx="44" cy="54" rx="26" ry="16" fill="#FFAAA6" stroke="#4A3728" strokeWidth="2.6" />
          <ellipse cx="44" cy="50" rx="22" ry="11" fill="#78350F" />
          {/* Kibble / Treats mounds */}
          <circle cx="36" cy="48" r="3.2" fill="#D97706" />
          <circle cx="44" cy="46" r="3.5" fill="#B45309" />
          <circle cx="52" cy="49" r="3.2" fill="#D97706" />
          <circle cx="40" cy="52" r="3" fill="#F59E0B" />
          <circle cx="48" cy="53" r="3" fill="#92400E" />
          {/* Paw print on bowl */}
          <circle cx="44" cy="63" r="2.2" fill="#FFFDF8" />
          <circle cx="41" cy="60" r="1.2" fill="#FFFDF8" />
          <circle cx="44" cy="59" r="1.2" fill="#FFFDF8" />
          <circle cx="47" cy="60" r="1.2" fill="#FFFDF8" />
        </g>

        {/* Right Bowl: Fresh Water Bowl */}
        <g id="water-bowl">
          <ellipse cx="106" cy="54" rx="26" ry="16" fill="#BAE6FD" stroke="#4A3728" strokeWidth="2.6" />
          <ellipse cx="106" cy="50" rx="22" ry="11" fill="#38BDF8" />
          <ellipse cx="106" cy="50" rx="16" ry="7" fill="#7DD3FC" opacity="0.8" />
          {/* Ripple reflection */}
          <path d="M 96 49 Q 106 52 116 49" stroke="#FFFDF8" strokeWidth="1.6" fill="none" opacity="0.85" />
        </g>

        {/* Hint Pill */}
        <rect x="25" y="86" width="100" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="75" y="98" fontSize="8.5" fill="#4A3728" textAnchor="middle" fontWeight="bold">🍴 Click Bowl to Feed</text>
      </g>

      {/* 9. POTTED MONSTERA PLANT (Right Corner) */}
      <g id="potted-plant" transform="translate(710, 270)">
        {/* Pot */}
        <path d="M 12 120 L 18 170 L 62 170 L 68 120 Z" fill="#FDBA74" stroke="#4A3728" strokeWidth="2.8" />
        <ellipse cx="40" cy="120" rx="28" ry="8" fill="#C2410C" stroke="#4A3728" strokeWidth="2.4" />
        {/* Big Monstera Leaves */}
        <path d="M 40 120 Q 30 60 -10 40 Q 15 50 38 100" fill="#059669" stroke="#4A3728" strokeWidth="2.4" />
        <path d="M 40 115 Q 50 40 85 20 Q 65 45 42 100" fill="#10B981" stroke="#4A3728" strokeWidth="2.4" />
        <path d="M 40 118 Q 40 20 35 -10 Q 55 20 42 100" fill="#34D399" stroke="#4A3728" strokeWidth="2.4" />
      </g>

      {/* 10. EATING SPARKLES / CRUMB PARTICLES IF EATING */}
      {isEating && (
        <g id="eating-particles" transform="translate(380, 280)">
          <circle cx="-30" cy="-20" r="3" fill="#F59E0B" className="animate-ping" />
          <circle cx="35" cy="-25" r="3.5" fill="#EC4899" className="animate-ping" />
          <text x="-40" y="-40" fontSize="16" fill="#F59E0B">✨</text>
          <text x="30" y="-45" fontSize="16" fill="#EC4899">💖</text>
          <text x="0" y="-55" fontSize="13" fontWeight="bold" fill="#B45309">YUM!</text>
        </g>
      )}
    </svg>
  );
};
