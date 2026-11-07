import React, { useState } from 'react';
import { SceneCustomization } from '../../../types/petScenes';
import { soundService } from '../../../services/soundService';

interface PlayroomSceneProps {
  customization: SceneCustomization;
  isPlaying: boolean;
  onPlayClick: () => void;
}

export const PlayroomScene: React.FC<PlayroomSceneProps> = ({
  customization,
  isPlaying,
  onPlayClick,
}) => {
  const [slideTapped, setSlideTapped] = useState(false);
  const [ballBounce, setBallBounce] = useState(false);

  const handleSlideTap = () => {
    setSlideTapped(true);
    soundService.playChime();
    onPlayClick();
    setTimeout(() => setSlideTapped(false), 800);
  };

  const handleBallTap = () => {
    setBallBounce(true);
    soundService.playPop();
    setTimeout(() => setBallBounce(false), 600);
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
      {customization.wallpaperPattern === 'stars' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stars)" />
      )}
      {customization.wallpaperPattern === 'dots' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-dots)" />
      )}
      {customization.wallpaperPattern === 'grid' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-grid)" />
      )}
      {customization.wallpaperPattern === 'stripes' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-stripes)" />
      )}
      {customization.wallpaperPattern === 'floral' && (
        <rect x="0" y="0" width="800" height="350" fill="url(#pattern-floral)" />
      )}

      {/* Wainscoting Trim */}
      <rect x="0" y="336" width="800" height="16" fill="#FED7AA" stroke="#4A3728" strokeWidth="2.4" />
      <line x1="0" y1="340" x2="800" y2="340" stroke="#4A3728" strokeWidth="1.2" opacity="0.4" />

      {/* 2. FLOOR: Warm Honey Hardwood Floor */}
      <rect x="0" y="352" width="800" height="148" fill={customization.floorColor} />
      <rect x="0" y="352" width="800" height="148" fill="url(#pattern-wood-plank)" />

      {/* 3. WALL DECORATIONS (TOP): Pennant Flag Bunting Banner */}
      <g id="flag-bunting" transform="translate(100, 30)">
        <path d="M 0 20 Q 300 80 600 20" stroke="#4A3728" strokeWidth="2" fill="none" />
        {[
          { x: 50, y: 35, color: '#F472B6' },
          { x: 120, y: 46, color: '#FBBF24' },
          { x: 190, y: 53, color: '#34D399' },
          { x: 260, y: 55, color: '#60A5FA' },
          { x: 330, y: 53, color: '#A78BFA' },
          { x: 400, y: 47, color: '#FB7185' },
          { x: 470, y: 37, color: '#FDE047' },
          { x: 540, y: 25, color: '#4ADE80' },
        ].map((flag, idx) => (
          <polygon
            key={idx}
            points={`${flag.x - 16},${flag.y} ${flag.x + 16},${flag.y} ${flag.x},${flag.y + 36}`}
            fill={flag.color}
            stroke="#4A3728"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        ))}
      </g>

      {/* 4. WALL DECORATIONS (LEFT): Sunny Garden Window */}
      <g id="playroom-window" transform="translate(60, 80)">
        <path d="M 0 30 Q 0 0 45 0 Q 90 0 90 30 L 90 120 L 0 120 Z" fill="#BAE6FD" stroke="#4A3728" strokeWidth="3" />
        <circle cx="70" cy="35" r="15" fill="#FDE047" />
        {/* Garden Fence peeking in window */}
        <line x1="15" y1="90" x2="15" y2="120" stroke="#FFFFFF" strokeWidth="4" />
        <line x1="35" y1="90" x2="35" y2="120" stroke="#FFFFFF" strokeWidth="4" />
        <line x1="55" y1="90" x2="55" y2="120" stroke="#FFFFFF" strokeWidth="4" />
        <line x1="75" y1="90" x2="75" y2="120" stroke="#FFFFFF" strokeWidth="4" />
        <line x1="5" y1="100" x2="85" y2="100" stroke="#FFFFFF" strokeWidth="3" />
        {/* Window Pane dividers */}
        <line x1="45" y1="0" x2="45" y2="120" stroke="#4A3728" strokeWidth="2.2" />
        <line x1="0" y1="60" x2="90" y2="60" stroke="#4A3728" strokeWidth="2.2" />
        <rect x="-6" y="120" width="102" height="10" rx="3" fill="#FFFDF8" stroke="#4A3728" strokeWidth="2.4" />
      </g>

      {/* 5. CUTE PASTEL WOODEN SLIDE (Left Foreground) */}
      <g 
        id="pastel-slide" 
        transform={`translate(100, 260) ${slideTapped ? 'scale(1.05)' : 'scale(1)'}`}
        className="cursor-pointer pointer-events-auto transition-transform"
        onClick={handleSlideTap}
      >
        {/* Ladder Steps */}
        <line x1="20" y1="30" x2="20" y2="125" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="30" x2="50" y2="125" stroke="#4A3728" strokeWidth="4" strokeLinecap="round" />
        <line x1="20" y1="55" x2="50" y2="55" stroke="#F59E0B" strokeWidth="3.5" />
        <line x1="20" y1="80" x2="50" y2="80" stroke="#F59E0B" strokeWidth="3.5" />
        <line x1="20" y1="105" x2="50" y2="105" stroke="#F59E0B" strokeWidth="3.5" />

        {/* Slide Ramp (Curved pastel ramp) */}
        <path 
          d="M 50 35 C 90 35 140 100 190 120 L 190 135 C 135 120 85 55 50 55 Z" 
          fill="#FDA4AF" 
          stroke="#4A3728" 
          strokeWidth="3" 
          strokeLinejoin="round" 
        />
        {/* Slide Guard Rail */}
        <path d="M 50 25 C 90 25 140 85 190 110" stroke="#F43F5E" strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Action Label */}
        <rect x="65" y="140" width="90" height="18" rx="9" fill="#FFFDF8" stroke="#4A3728" strokeWidth="1.8" />
        <text x="110" y="152" fontSize="8" fill="#4A3728" textAnchor="middle" fontWeight="bold">🎾 Slide & Play</text>
      </g>

      {/* 6. FLOOR RUG (Center Bear Rug) */}
      <g id="playroom-rug" transform="translate(260, 395)">
        <ellipse cx="140" cy="35" rx="160" ry="40" fill="#FED7AA" stroke="#4A3728" strokeWidth="2.8" />
        {/* Bear ears on rug */}
        <circle cx="20" cy="18" r="16" fill="#FDBA74" stroke="#4A3728" strokeWidth="2.6" />
        <circle cx="260" cy="18" r="16" fill="#FDBA74" stroke="#4A3728" strokeWidth="2.6" />
        <ellipse cx="140" cy="35" rx="146" ry="32" fill="#FFEDD5" />
        {/* Soft button eyes on rug */}
        <circle cx="105" cy="32" r="3" fill="#9A3412" />
        <circle cx="175" cy="32" r="3" fill="#9A3412" />
        <ellipse cx="140" cy="40" rx="6" ry="4" fill="#9A3412" />
      </g>

      {/* 7. TOYS: Rainbow Yarn Ball, Toy Train, and Potted Sunflower */}
      <g id="playroom-toys" transform="translate(560, 340)">
        {/* Rainbow Wool Yarn Ball */}
        <g 
          transform={`translate(0, 10) ${ballBounce ? 'translate(0, -20)' : 'translate(0, 0)'}`}
          className="cursor-pointer pointer-events-auto transition-transform"
          onClick={handleBallTap}
        >
          <title>Click to bounce the yarn ball!</title>
          <circle cx="25" cy="35" r="22" fill="#A78BFA" stroke="#4A3728" strokeWidth="2.8" />
          <path d="M 10 25 Q 30 40 40 25 M 15 45 Q 25 20 35 45" stroke="#DDD6FE" strokeWidth="2.6" fill="none" />
          <path d="M 38 48 Q 55 58 70 54" stroke="#A78BFA" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>

        {/* Miniature Wooden Toy Train */}
        <g transform="translate(65, 30)">
          {/* Engine */}
          <rect x="0" y="10" width="36" height="22" rx="4" fill="#38BDF8" stroke="#4A3728" strokeWidth="2.2" />
          <rect x="22" y="0" width="14" height="32" rx="3" fill="#F472B6" stroke="#4A3728" strokeWidth="2" />
          <rect x="4" y="2" width="8" height="10" rx="2" fill="#FDE047" stroke="#4A3728" strokeWidth="1.8" />
          {/* Wheels */}
          <circle cx="8" cy="34" r="5" fill="#4A3728" />
          <circle cx="28" cy="34" r="5" fill="#4A3728" />
          {/* Tiny Cart */}
          <rect x="42" y="16" width="28" height="16" rx="3" fill="#34D399" stroke="#4A3728" strokeWidth="2" />
          <circle cx="48" cy="34" r="5" fill="#4A3728" />
          <circle cx="64" cy="34" r="5" fill="#4A3728" />
        </g>

        {/* Potted Sunflower in Right Corner */}
        <g transform="translate(150, -40)">
          <path d="M 12 110 L 16 150 L 52 150 L 56 110 Z" fill="#FDBA74" stroke="#4A3728" strokeWidth="2.6" />
          <line x1="34" y1="110" x2="34" y2="45" stroke="#15803D" strokeWidth="3.5" strokeLinecap="round" />
          {/* Leaves */}
          <path d="M 34 85 Q 15 75 10 90 Q 25 90 34 85" fill="#22C55E" stroke="#4A3728" strokeWidth="1.8" />
          <path d="M 34 65 Q 55 55 60 70 Q 45 70 34 65" fill="#22C55E" stroke="#4A3728" strokeWidth="1.8" />
          {/* Sunflower Head */}
          <circle cx="34" cy="40" r="14" fill="#78350F" stroke="#4A3728" strokeWidth="2" />
          {/* Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, idx) => (
            <ellipse
              key={idx}
              cx="34"
              cy="20"
              rx="5"
              ry="9"
              fill="#FDE047"
              stroke="#4A3728"
              strokeWidth="1.5"
              transform={`rotate(${deg}, 34, 40)`}
            />
          ))}
        </g>
      </g>

      {/* 8. ACTIVE PLAY CELEBRATION PARTICLES */}
      {isPlaying && (
        <g id="playing-active" transform="translate(400, 240)">
          <text x="-50" y="-35" fontSize="22" fill="#F59E0B" className="animate-bounce">🎾</text>
          <text x="35" y="-35" fontSize="22" fill="#EC4899" className="animate-bounce">🎉</text>
          <text x="0" y="-55" fontSize="13" fontWeight="bold" fill="#D97706" textAnchor="middle">WHEEE! SO MUCH FUN!</text>
        </g>
      )}
    </svg>
  );
};
