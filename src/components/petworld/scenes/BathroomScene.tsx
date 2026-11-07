import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface BathroomSceneProps {
  customization: SceneCustomization;
  isToiletActive: boolean;
  onToiletClick: () => void;
}

export const BathroomScene: React.FC<BathroomSceneProps> = ({
  customization,
  isToiletActive,
  onToiletClick,
}) => {
  const [toiletTapped, setToiletTapped] = useState(false);
  const [tapDrips, setTapDrips] = useState(false);

  const handleToiletTap = () => {
    setToiletTapped(true);
    soundService.playFlush();
    onToiletClick();
    setTimeout(() => setToiletTapped(false), 800);
  };

  const handleTapDrip = () => {
    setTapDrips(true);
    soundService.playPop();
    setTimeout(() => setTapDrips(false), 1200);
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
      {customization.wallpaperPattern === 'grid' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-grid)" />
      )}
      {customization.wallpaperPattern === 'dots' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-dots)" />
      )}
      {customization.wallpaperPattern === 'stars' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stars)" />
      )}
      {customization.wallpaperPattern === 'stripes' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stripes)" />
      )}
      {customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-floral)" />
      )}

      {/* Pastel Bathroom Wall Tile Trim (Mid-Wall Chair Rail) */}
      <rect x="0" y="336" width="800" height="16" fill="#A7F3D0" stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 2. FLOOR: Pastel Tiles */}
      <rect x="0" y="352" width="800" height="148" fill={customization.floorColor} />
      <rect x="0" y="352" width="800" height="148" fill="url(#pattern-floor-tile)" />

      {/* 3. WALL DECORATIONS (LEFT): Pastel Washbasin & Arched Mirror */}
      <g id="bathroom-sink" transform="translate(70, 70)">
        {/* Arched Mirror with Steam Doodles */}
        <path 
          d="M 15 40 Q 15 0 55 0 Q 95 0 95 40 L 95 130 L 15 130 Z" 
          fill="#E0F2FE" 
          stroke="#4A3728" 
          strokeWidth="3.2" 
        />
        {/* Mirror Reflection Shading */}
        <path d="M 30 15 L 75 125" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        <path d="M 45 15 L 85 115" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        {/* Steam Doodle on Mirror */}
        <path d="M 60 70 Q 70 60 65 50 Q 60 40 70 30" stroke="#BAE6FD" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Ceramic Sink Basin */}
        <g 
          transform="translate(0, 130)" 
          onClick={handleTapDrip}
          className="cursor-pointer pointer-events-auto"
        >
          <title>Click to turn on the faucet!</title>
          {/* Sink Body */}
          <path d="M 0 20 Q 55 42 110 20 L 100 80 Q 55 90 10 80 Z" fill="#FFFDF8" stroke="#4A3728" strokeWidth="3" />
          {/* Sink Rim */}
          <ellipse cx="55" cy="20" rx="55" ry="16" fill="#F8FAFC" stroke="#4A3728" strokeWidth="2.8" />
          <ellipse cx="55" cy="20" rx="42" ry="10" fill="#E2E8F0" />
          <ellipse cx="55" cy="21" rx="40" ry="8" fill="#BAE6FD" opacity="0.7" />

          {/* Golden Curved Faucet */}
          <path d="M 55 10 L 55 -15 Q 55 -32 40 -32 Q 30 -32 30 -22 L 30 -16" stroke="#F59E0B" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <circle cx="55" cy="-30" r="3.5" fill="#D97706" />

          {/* Water Drip from Tap */}
          {tapDrips && (
            <g className="animate-bounce">
              <path d="M 30 -12 Q 30 -4 28 0 Q 30 4 30 8" stroke="#38BDF8" strokeWidth="3" fill="none" strokeLinecap="round" />
              <ellipse cx="30" cy="22" rx="6" ry="2.5" fill="#38BDF8" />
            </g>
          )}

          {/* Mini Soap Bottle */}
          <rect x="78" y="2" width="14" height="20" rx="4" fill="#F472B6" stroke="#4A3728" strokeWidth="1.8" />
          <line x1="85" y1="2" x2="85" y2="-4" stroke="#4A3728" strokeWidth="2" />
          <line x1="85" y1="-4" x2="81" y2="-4" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>

      {/* 4. WALL DECORATIONS (RIGHT): Wooden Towel Rack & Hanging Plant */}
      <g id="towel-ladder" transform="translate(640, 70)">
        {/* Wooden Ladder Poles */}
        <line x1="15" y1="20" x2="15" y2="280" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
        <line x1="85" y1="20" x2="85" y2="280" stroke="#78350F" strokeWidth="4.5" strokeLinecap="round" />
        {/* Ladder Rungs */}
        <line x1="15" y1="70" x2="85" y2="70" stroke="#78350F" strokeWidth="3.5" />
        <line x1="15" y1="130" x2="85" y2="130" stroke="#78350F" strokeWidth="3.5" />
        <line x1="15" y1="190" x2="85" y2="190" stroke="#78350F" strokeWidth="3.5" />

        {/* Folded Striped Towel on Top Rung */}
        <rect x="22" y="66" width="56" height="48" rx="5" fill="#FFD6E0" stroke="#4A3728" strokeWidth="2.4" />
        <line x1="22" y1="84" x2="78" y2="84" stroke="#FB7185" strokeWidth="2" opacity="0.6" />
        <line x1="22" y1="94" x2="78" y2="94" stroke="#FB7185" strokeWidth="2" opacity="0.6" />

        {/* Second Towel (Mint) */}
        <rect x="26" y="126" width="48" height="52" rx="5" fill="#A7F3D0" stroke="#4A3728" strokeWidth="2.4" />
        <line x1="26" y1="146" x2="74" y2="146" stroke="#059669" strokeWidth="2" opacity="0.6" />

        {/* Hanging Ivy Plant from top rung */}
        <circle cx="50" cy="18" r="9" fill="#FDBA74" stroke="#4A3728" strokeWidth="2" />
        <path d="M 46 25 Q 40 50 35 70" stroke="#10B981" strokeWidth="2" fill="none" />
        <circle cx="38" cy="45" r="4.5" fill="#34D399" />
        <circle cx="34" cy="65" r="4" fill="#059669" />
      </g>

      {/* 5. CUTE TOILET PAPER ROLL (On Left Wall) */}
      <g id="toilet-paper" transform="translate(195, 230)">
        <rect x="0" y="10" width="30" height="24" rx="4" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.4" />
        <ellipse cx="30" cy="22" rx="4" ry="12" fill="#E2E8F0" stroke="#4A3728" strokeWidth="2.4" />
        <ellipse cx="30" cy="22" rx="1.5" ry="5" fill="#78350F" />
        {/* Hanging Paper Ribbon with Smiley Face Doodle */}
        <path d="M 0 22 L 0 54 L 26 54 L 26 34" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        {/* Sweet smiley */}
        <circle cx="10" cy="44" r="1.2" fill="#4A3728" />
        <circle cx="16" cy="44" r="1.2" fill="#4A3728" />
        <path d="M 11 48 Q 13 51 15 48" stroke="#4A3728" strokeWidth="1" fill="none" />
      </g>

      {/* 6. FLOOR BATH MAT (Center) */}
      <g id="bathroom-mat" transform="translate(260, 395)">
        <ellipse cx="140" cy="35" rx="160" ry="40" fill="#E6FFFA" stroke="#4A3728" strokeWidth="2.8" />
        <ellipse cx="140" cy="35" rx="146" ry="32" fill="#B2F5EA" stroke="#4A3728" strokeWidth="1.6" strokeDasharray="5,4" />
        {/* Soft paw print in center of mat */}
        <ellipse cx="140" cy="37" rx="8" ry="6" fill="#319795" opacity="0.4" />
        <circle cx="133" cy="28" r="2.8" fill="#319795" opacity="0.4" />
        <circle cx="140" cy="26" r="2.8" fill="#319795" opacity="0.4" />
        <circle cx="147" cy="28" r="2.8" fill="#319795" opacity="0.4" />
      </g>

      {/* 7. ADORABLE PET TOILET / LITTER TRAY (Interactive Foreground) */}
      <g 
        id="pet-litter-box" 
        transform={`translate(470, 350) ${toiletTapped ? 'scale(1.08)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleToiletTap}
      >
        {/* Litter Tray Outer Shell with Soft Rounded Rim */}
        <rect x="0" y="20" width="160" height="74" rx="24" fill="#FEF3C7" stroke="#4A3728" strokeWidth="3" />
        {/* Clean Sand / Pellets Bed */}
        <ellipse cx="80" cy="52" rx="66" ry="24" fill="#FDE68A" stroke="#4A3728" strokeWidth="2.4" />
        {/* Pastel Litter Granules */}
        <circle cx="45" cy="50" r="2" fill="#F59E0B" />
        <circle cx="65" cy="48" r="2.2" fill="#D97706" />
        <circle cx="85" cy="54" r="2" fill="#F59E0B" />
        <circle cx="105" cy="50" r="2.2" fill="#D97706" />
        <circle cx="120" cy="55" r="2" fill="#F59E0B" />
        <circle cx="55" cy="58" r="2" fill="#B45309" />
        <circle cx="95" cy="60" r="2" fill="#B45309" />

        {/* Cute Scoop resting on edge */}
        <path d="M 125 15 L 145 65 L 155 60 L 135 10 Z" fill="#F472B6" stroke="#4A3728" strokeWidth="2.2" />
        <circle cx="148" cy="58" r="3" fill="#FFFDF8" />

        {/* Clean Sparkles */}
        <text x="140" y="24" fontSize="14" fill="#10B981">✨</text>
        <text x="10" y="32" fontSize="14" fill="#F59E0B">✨</text>

        {/* Action Button Label */}
        <rect x="30" y="86" width="100" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="80" y="98" fontSize="8.5" fill="#4A3728" textAnchor="middle" fontWeight="bold">🚽 Click to Tidy Potty</text>
      </g>

      {/* 8. ACTIVE TOILET REACTION PARTICLES */}
      {isToiletActive && (
        <g id="toilet-active" transform="translate(400, 260)">
          <text x="-40" y="-30" fontSize="18" fill="#10B981" className="animate-bounce">✨</text>
          <text x="30" y="-35" fontSize="18" fill="#3B82F6" className="animate-bounce">🫧</text>
          <text x="0" y="-45" fontSize="12" fontWeight="bold" fill="#047857" textAnchor="middle">SPARKLE CLEAN!</text>
        </g>
      )}
    </svg>
  );
};
