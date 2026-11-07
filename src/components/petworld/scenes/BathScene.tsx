import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface BathSceneProps {
  customization: SceneCustomization;
  isBathing: boolean;
  onBatheClick: () => void;
}

export const BathScene: React.FC<BathSceneProps> = ({
  customization,
  isBathing,
  onBatheClick,
}) => {
  const [tubTapped, setTubTapped] = useState(false);
  const [poppedBubbles, setPoppedBubbles] = useState<number[]>([]);

  const handleTubTap = () => {
    setTubTapped(true);
    soundService.playPop();
    onBatheClick();
    setTimeout(() => setTubTapped(false), 800);
  };

  const handleBubblePop = (index: number) => {
    soundService.playPop();
    setPoppedBubbles((prev) => [...prev, index]);
    setTimeout(() => {
      setPoppedBubbles((prev) => prev.filter((i) => i !== index));
    }, 1500);
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
      {customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-floral)" />
      )}

      {/* Wainscoting Trim */}
      <rect x="0" y="336" width="800" height="16" fill="#BAE6FD" stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 2. FLOOR: Tile Floor */}
      <rect x="0" y="352" width="800" height="148" fill={customization.floorColor} />
      <rect x="0" y="352" width="800" height="148" fill="url(#pattern-floor-tile)" />

      {/* 3. WALL DECORATIONS (LEFT): Golden Shower Head with gentle drops */}
      <g id="bath-shower-head" transform="translate(90, 40)">
        {/* Curved Pipe from ceiling */}
        <path d="M 0 0 L 0 50 Q 0 85 40 85 L 80 85" stroke="#F59E0B" strokeWidth="6" fill="none" strokeLinecap="round" />
        {/* Bell Shower Head */}
        <path d="M 75 80 L 95 65 L 105 105 L 85 90 Z" fill="#FBBF24" stroke="#4A3728" strokeWidth="2.6" />
        {/* Soft Water Drops Doodles */}
        <circle cx="115" cy="115" r="3" fill="#38BDF8" opacity="0.8" />
        <circle cx="125" cy="135" r="2.5" fill="#38BDF8" opacity="0.7" />
        <circle cx="110" cy="155" r="3" fill="#38BDF8" opacity="0.8" />
        <circle cx="130" cy="175" r="2.5" fill="#38BDF8" opacity="0.7" />
      </g>

      {/* 4. WALL DECORATIONS (RIGHT): Bathroom Shampoo Shelf & Strawberry Bottles */}
      <g id="shampoo-shelf" transform="translate(620, 90)">
        <rect x="0" y="35" width="120" height="8" rx="3" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.4" />
        {/* Strawberry Shampoo */}
        <rect x="15" y="5" width="22" height="30" rx="5" fill="#FDA4AF" stroke="#4A3728" strokeWidth="2" />
        <circle cx="26" cy="18" r="4" fill="#F43F5E" />
        <rect x="22" y="0" width="8" height="5" rx="1.5" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.6" />
        {/* Oat Bubble Bath Bottle */}
        <rect x="45" y="0" width="24" height="35" rx="6" fill="#FEF08A" stroke="#4A3728" strokeWidth="2" />
        <text x="57" y="22" fontSize="7" fill="#854D0E" textAnchor="middle" fontWeight="bold">OAT</text>
        <rect x="52" y="-5" width="10" height="5" rx="1.5" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.6" />
        {/* Yellow Bath Sponge */}
        <ellipse cx="90" cy="24" rx="14" ry="10" fill="#FDE047" stroke="#4A3728" strokeWidth="2" />
        <circle cx="85" cy="22" r="1.5" fill="#CA8A04" />
        <circle cx="92" cy="26" r="1.5" fill="#CA8A04" />
      </g>

      {/* 5. SPLASH MAT (Under Bathtub) */}
      <g id="bath-mat" transform="translate(240, 400)">
        <ellipse cx="160" cy="35" rx="180" ry="42" fill="#E0F2FE" stroke="#4A3728" strokeWidth="2.8" />
        <ellipse cx="160" cy="35" rx="166" ry="34" fill="#BAE6FD" stroke="#4A3728" strokeWidth="1.6" strokeDasharray="6,4" />
        {/* Wet Paw Prints */}
        <circle cx="100" cy="35" r="4" fill="#0284C7" opacity="0.35" />
        <circle cx="106" cy="31" r="1.8" fill="#0284C7" opacity="0.35" />
        <circle cx="100" cy="28" r="1.8" fill="#0284C7" opacity="0.35" />
        <circle cx="94" cy="31" r="1.8" fill="#0284C7" opacity="0.35" />
      </g>

      {/* 6. CLAWFOOT BATHTUB WITH WARM SUDS & DUCKIE */}
      <g 
        id="clawfoot-tub" 
        transform={`translate(450, 310) ${tubTapped ? 'scale(1.06)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleTubTap}
      >
        {/* Golden Claw Feet */}
        <path d="M 30 110 C 25 125 15 125 12 135 L 34 135 C 38 128 35 118 30 110 Z" fill="#F59E0B" stroke="#4A3728" strokeWidth="2.4" />
        <path d="M 170 110 C 175 125 185 125 188 135 L 166 135 C 162 128 165 118 170 110 Z" fill="#F59E0B" stroke="#4A3728" strokeWidth="2.4" />

        {/* Tub Ceramic Outer Body */}
        <path 
          d="M 10 30 Q 10 115 100 115 Q 190 115 190 30 L 195 24 Q 100 40 5 24 Z" 
          fill="#FFFDF8" 
          stroke="#4A3728" 
          strokeWidth="3.4" 
          strokeLinejoin="round" 
        />
        {/* Tub Rim */}
        <ellipse cx="100" cy="24" rx="95" ry="24" fill="#F8FAFC" stroke="#4A3728" strokeWidth="3" />
        {/* Warm Water Interior */}
        <ellipse cx="100" cy="24" rx="84" ry="18" fill="#7DD3FC" stroke="#4A3728" strokeWidth="2" />

        {/* Big Mountain of Fluffy Foam Bubbles */}
        <circle cx="45" cy="18" r="16" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        <circle cx="70" cy="10" r="20" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        <circle cx="100" cy="8" r="22" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        <circle cx="130" cy="12" r="18" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />
        <circle cx="155" cy="18" r="15" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2" />

        {/* Secondary Foam Highlights */}
        <circle cx="55" cy="12" r="10" fill="#FFFFFF" />
        <circle cx="85" cy="6" r="12" fill="#FFFFFF" />
        <circle cx="115" cy="6" r="12" fill="#FFFFFF" />
        <circle cx="140" cy="12" r="9" fill="#FFFFFF" />

        {/* Squeaky Rubber Duckie floating on bubbles */}
        <g id="rubber-duck" transform="translate(68, -12)">
          <ellipse cx="18" cy="14" rx="14" ry="10" fill="#FDE047" stroke="#4A3728" strokeWidth="2" />
          <circle cx="24" cy="6" r="8" fill="#FDE047" stroke="#4A3728" strokeWidth="2" />
          {/* Orange Bill */}
          <ellipse cx="32" cy="7" rx="5" ry="3" fill="#F97316" stroke="#4A3728" strokeWidth="1.4" />
          {/* Eye */}
          <circle cx="26" cy="5" r="1.4" fill="#1E293B" />
        </g>

        {/* Action Button Label */}
        <rect x="50" y="138" width="100" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="100" y="150" fontSize="8.5" fill="#4A3728" textAnchor="middle" fontWeight="bold">🛁 Click Tub to Bathe</text>
      </g>

      {/* 7. FLOATING INTERACTIVE BUBBLES ACROSS THE ROOM */}
      {[
        { id: 1, cx: 320, cy: 180, r: 16 },
        { id: 2, cx: 370, cy: 120, r: 22 },
        { id: 3, cx: 280, cy: 90, r: 14 },
        { id: 4, cx: 440, cy: 80, r: 18 },
        { id: 5, cx: 530, cy: 140, r: 20 },
      ].map((bubble) => {
        if (poppedBubbles.includes(bubble.id)) return null;
        return (
          <g
            key={bubble.id}
            onClick={() => handleBubblePop(bubble.id)}
            className="cursor-pointer pointer-events-auto transition-transform hover:scale-125"
          >
            <title>Pop me!</title>
            <circle cx={bubble.cx} cy={bubble.cy} r={bubble.r} fill="#E0F2FE" stroke="#4A3728" strokeWidth="1.8" opacity="0.85" />
            <circle cx={bubble.cx - bubble.r * 0.3} cy={bubble.cy - bubble.r * 0.3} r={bubble.r * 0.35} fill="#FFFFFF" opacity="0.9" />
            <circle cx={bubble.cx + bubble.r * 0.25} cy={bubble.cy + bubble.r * 0.25} r={bubble.r * 0.15} fill="#FFFFFF" opacity="0.8" />
          </g>
        );
      })}

      {/* 8. ACTIVE BATHING SOAP SUDS PARTICLES */}
      {isBathing && (
        <g id="bathing-active" transform="translate(400, 240)">
          <text x="-50" y="-30" fontSize="22" fill="#38BDF8" className="animate-bounce">🫧</text>
          <text x="40" y="-35" fontSize="22" fill="#38BDF8" className="animate-bounce">🧼</text>
          <text x="-10" y="-60" fontSize="18" fill="#F472B6" className="animate-ping">✨</text>
          <text x="0" y="-45" fontSize="13" fontWeight="bold" fill="#0284C7" textAnchor="middle">SPLISH SPLASH!</text>
        </g>
      )}
    </svg>
  );
};
