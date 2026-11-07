import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface BedroomSceneProps {
  customization: SceneCustomization;
  isSleeping: boolean;
  onRestClick: () => void;
}

export const BedroomScene: React.FC<BedroomSceneProps> = ({
  customization,
  isSleeping,
  onRestClick,
}) => {
  const [bedTapped, setBedTapped] = useState(false);
  const [lampOn, setLampOn] = useState(true);

  const handleBedTap = () => {
    setBedTapped(true);
    soundService.playSnore();
    onRestClick();
    setTimeout(() => setBedTapped(false), 800);
  };

  const handleLampToggle = () => {
    setLampOn((prev) => !prev);
    soundService.playPop();
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
        fill={isSleeping ? '#1E1B4B' : customization.wallColor} 
        className="transition-colors duration-700"
      />

      {/* Wallpaper Pattern */}
      {!isSleeping && customization.wallpaperPattern === 'stars' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stars)" />
      )}
      {!isSleeping && customization.wallpaperPattern === 'dots' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-dots)" />
      )}
      {!isSleeping && customization.wallpaperPattern === 'grid' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-grid)" />
      )}
      {!isSleeping && customization.wallpaperPattern === 'stripes' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stripes)" />
      )}
      {!isSleeping && customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-floral)" />
      )}

      {/* Wainscoting Trim */}
      <rect x="0" y="336" width="800" height="16" fill={isSleeping ? '#312E81' : '#DDD6FE'} stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 2. FLOOR: Cozy Bedroom Carpet / Floor */}
      <rect x="0" y="352" width="800" height="148" fill={isSleeping ? '#2E1065' : customization.floorColor} />
      {customization.floorPattern === 'wood_plank' && (
        <rect x="0" y="352" width="800" height="148" fill="url(#pattern-wood-plank)" />
      )}

      {/* 3. WALL DECORATIONS (LEFT): Starry Window */}
      <g id="bedroom-window" transform="translate(60, 60)">
        <path d="M 0 35 Q 0 0 50 0 Q 100 0 100 35 L 100 135 L 0 135 Z" fill="#0F172A" stroke="#4A3728" strokeWidth="3.2" />
        {/* Crescent Moon in Window */}
        <path d="M 75 45 C 65 45 55 35 55 22 C 55 18 56 14 58 12 C 45 15 36 26 36 40 C 36 56 50 70 66 70 C 78 70 88 63 92 52 C 87 54 81 45 75 45 Z" fill="#FDE047" />
        {/* Tiny Twinkling Stars in Window */}
        <circle cx="25" cy="30" r="1.8" fill="#FFFFFF" />
        <circle cx="45" cy="85" r="2" fill="#FEF08A" />
        <circle cx="85" cy="95" r="1.5" fill="#FFFFFF" />
        <circle cx="30" cy="115" r="1.5" fill="#FEF08A" />
        {/* Window panes */}
        <line x1="50" y1="0" x2="50" y2="135" stroke="#4A3728" strokeWidth="2.4" />
        <line x1="0" y1="70" x2="100" y2="70" stroke="#4A3728" strokeWidth="2.4" />
        {/* Sill */}
        <rect x="-8" y="135" width="116" height="12" rx="3" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.6" />
      </g>

      {/* 4. WALL DECORATIONS (TOP CEILING): Moon & Star Hanging Mobile */}
      <g id="hanging-mobile" transform="translate(420, 20)">
        <line x1="0" y1="0" x2="0" y2="40" stroke="#4A3728" strokeWidth="1.8" />
        <line x1="-50" y1="40" x2="50" y2="40" stroke="#4A3728" strokeWidth="2" strokeLinecap="round" />
        {/* Left String: Star */}
        <line x1="-40" y1="40" x2="-40" y2="75" stroke="#4A3728" strokeWidth="1.4" />
        <polygon points="-40,75 -36,83 -28,83 -34,88 -32,96 -40,91 -48,96 -46,88 -52,83 -44,83" fill="#FDE047" stroke="#4A3728" strokeWidth="1.4" />
        {/* Center String: Cloud */}
        <line x1="0" y1="40" x2="0" y2="60" stroke="#4A3728" strokeWidth="1.4" />
        <ellipse cx="0" cy="65" rx="14" ry="7" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.6" />
        {/* Right String: Tiny Crescent Moon */}
        <line x1="40" y1="40" x2="40" y2="80" stroke="#4A3728" strokeWidth="1.4" />
        <circle cx="40" cy="88" r="8" fill="#FDE047" stroke="#4A3728" strokeWidth="1.4" />
        <circle cx="37" cy="86" r="6" fill={isSleeping ? '#1E1B4B' : customization.wallColor} />
      </g>

      {/* 5. WALL DECORATIONS (RIGHT): Bedside Bookshelf & Fairy String Lights */}
      <g id="bedside-bookshelf" transform="translate(630, 80)">
        {/* Fairy Light String */}
        <path d="M -50 0 Q 30 30 110 5" stroke="#FBBF24" strokeWidth="1.4" fill="none" />
        {[-30, 5, 40, 75, 100].map((lx, i) => (
          <circle key={i} cx={lx} cy={10 + (i % 2) * 5} r="3" fill="#FEF08A" stroke="#D97706" strokeWidth="1" className={lampOn ? "animate-pulse" : ""} />
        ))}

        {/* Shelf */}
        <rect x="0" y="30" width="120" height="10" rx="3" fill="#E2D4C0" stroke="#4A3728" strokeWidth="2.4" />
        {/* Study Notebooks & Textbooks */}
        <rect x="15" y="0" width="8" height="30" rx="1.5" fill="#38BDF8" stroke="#4A3728" strokeWidth="1.6" />
        <rect x="25" y="5" width="7" height="25" rx="1.5" fill="#F472B6" stroke="#4A3728" strokeWidth="1.6" />
        <rect x="34" y="-3" width="9" height="33" rx="1.5" fill="#A78BFA" stroke="#4A3728" strokeWidth="1.6" />
        {/* Leaning Book */}
        <g transform="translate(48, 0) rotate(15)">
          <rect x="0" y="0" width="8" height="30" rx="1.5" fill="#34D399" stroke="#4A3728" strokeWidth="1.6" />
        </g>
        {/* Small Succulent */}
        <circle cx="95" cy="24" r="6" fill="#FDBA74" stroke="#4A3728" strokeWidth="1.6" />
        <circle cx="95" cy="18" r="4" fill="#10B981" />
      </g>

      {/* 6. COZY BED (Center Left to Center Foreground) */}
      <g 
        id="pet-bed" 
        transform={`translate(160, 290) ${bedTapped ? 'scale(1.05)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleBedTap}
      >
        {/* Wooden Headboard */}
        <path d="M 10 120 L 10 30 Q 110 5 210 30 L 210 120 Z" fill="#DDBE9B" stroke="#4A3728" strokeWidth="3.4" strokeLinejoin="round" />
        {/* Bed Base / Frame */}
        <rect x="5" y="90" width="220" height="50" rx="15" fill="#C29F78" stroke="#4A3728" strokeWidth="3" />
        {/* Soft Fluffy Mattress */}
        <rect x="15" y="75" width="200" height="35" rx="12" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.8" />

        {/* Big Soft Pillow */}
        <ellipse cx="65" cy="72" rx="42" ry="18" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.4" />
        <path d="M 40 72 Q 65 77 90 72" stroke="#E2E8F0" strokeWidth="1.6" fill="none" />

        {/* Quilted Pastel Macaron Blanket */}
        <path 
          d="M 65 85 Q 160 85 220 95 L 220 125 Q 140 135 65 125 Z" 
          fill="#DDD6FE" 
          stroke="#4A3728" 
          strokeWidth="2.8" 
          strokeLinejoin="round" 
        />
        {/* Quilt Stitching Lines */}
        <line x1="90" y1="88" x2="90" y2="128" stroke="#C4B5FD" strokeWidth="1.8" strokeDasharray="3,3" />
        <line x1="125" y1="88" x2="125" y2="131" stroke="#C4B5FD" strokeWidth="1.8" strokeDasharray="3,3" />
        <line x1="160" y1="90" x2="160" y2="133" stroke="#C4B5FD" strokeWidth="1.8" strokeDasharray="3,3" />
        <line x1="195" y1="92" x2="195" y2="128" stroke="#C4B5FD" strokeWidth="1.8" strokeDasharray="3,3" />

        {/* Blanket Folded Lapel */}
        <path d="M 65 85 Q 140 80 220 90 L 220 98 Q 140 88 65 93 Z" fill="#EDE9FE" stroke="#4A3728" strokeWidth="2" />

        {/* Action Button Label */}
        <rect x="70" y="140" width="100" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="120" y="152" fontSize="8.5" fill="#4A3728" textAnchor="middle" fontWeight="bold">🛏️ Click Bed to Sleep</text>
      </g>

      {/* 7. WOODEN NIGHTSTAND & MUSHROOM LAMP (Right of Bed) */}
      <g id="nightstand" transform="translate(560, 310)">
        {/* Nightstand Table */}
        <rect x="0" y="55" width="85" height="80" rx="8" fill="#E8D5B5" stroke="#4A3728" strokeWidth="3" />
        <rect x="6" y="65" width="73" height="30" rx="5" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.2" />
        <circle cx="42" cy="80" r="3.5" fill="#D97706" />

        {/* Interactive Glowing Lamp */}
        <g 
          transform="translate(18, 0)" 
          onClick={handleLampToggle} 
          className="cursor-pointer pointer-events-auto"
        >
          <title>Click to toggle lamp on/off!</title>
          {/* Ambient Glow Aura */}
          {lampOn && (
            <ellipse cx="24" cy="25" rx="45" ry="35" fill="#FEF08A" opacity={isSleeping ? "0.35" : "0.55"} filter="blur(8px)" />
          )}
          {/* Lamp Base */}
          <ellipse cx="24" cy="55" rx="14" ry="5" fill="#F59E0B" stroke="#4A3728" strokeWidth="2" />
          <line x1="24" y1="35" x2="24" y2="55" stroke="#D97706" strokeWidth="4" />
          {/* Cute Mushroom Shade */}
          <path d="M 6 35 C 4 10 44 10 42 35 Z" fill={lampOn ? "#FDE047" : "#FBBF24"} stroke="#4A3728" strokeWidth="2.6" />
          {/* White Polka Dots on Shade */}
          <circle cx="16" cy="22" r="3" fill="#FFFDF8" />
          <circle cx="32" cy="22" r="3" fill="#FFFDF8" />
          <circle cx="24" cy="15" r="2.5" fill="#FFFDF8" />
        </g>
      </g>

      {/* 8. SLEEPING SNORE PARTICLES */}
      {isSleeping && (
        <g id="sleeping-snore-doodles" transform="translate(420, 240)">
          <text x="0" y="-30" fontSize="18" fill="#A78BFA" fontWeight="bold" className="animate-bounce">Z</text>
          <text x="18" y="-45" fontSize="22" fill="#818CF8" fontWeight="bold" className="animate-bounce">z</text>
          <text x="36" y="-65" fontSize="26" fill="#6366F1" fontWeight="bold" className="animate-bounce">z...</text>
          <text x="0" y="-85" fontSize="12" fontWeight="bold" fill="#DDD6FE" textAnchor="middle">RESTING PEACEFULLY</text>
        </g>
      )}
    </svg>
  );
};
