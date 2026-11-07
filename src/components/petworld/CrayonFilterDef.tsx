import React from 'react';

/**
 * Shared SVG filters, wallpaper patterns, and decorative elements
 * providing the authentic Wax Crayon Bullet Journal illustration style.
 */
export const CrayonFilterDef: React.FC = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
      <defs>
        {/* 1. Wax Crayon Rough Stroke Filter */}
        <filter id="crayon-roughness" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          <feBlend in="SourceGraphic" in2="displaced" mode="multiply" />
        </filter>

        {/* 2. Soft Colored Pencil / Crayon Texture for fills */}
        <filter id="crayon-paper" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="grain" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.28   0 0 0 0 0.22   0 0 0 0 0.18  0 0 0 0.12 0" />
          <feBlend in="SourceGraphic" in2="grain" mode="multiply" />
        </filter>

        {/* 3. Bullet Journal Dot Grid Pattern */}
        <pattern id="pattern-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="1.2" fill="#5C4434" opacity="0.14" />
        </pattern>

        {/* 4. Hand-drawn Graph Grid Pattern */}
        <pattern id="pattern-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#5C4434" strokeWidth="0.8" opacity="0.12" strokeDasharray="1,1" />
        </pattern>

        {/* 5. Crayon Little Stars Pattern */}
        <pattern id="pattern-stars" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M 12 12 Q 18 12 18 6 Q 18 12 24 12 Q 18 12 18 18 Q 18 12 12 12" fill="#F59E0B" opacity="0.22" />
          <circle cx="30" cy="28" r="1.5" fill="#EC4899" opacity="0.18" />
        </pattern>

        {/* 6. Soft Crayon Stripes Pattern */}
        <pattern id="pattern-stripes" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="28" stroke="#5C4434" strokeWidth="3" opacity="0.08" />
        </pattern>

        {/* 7. Cute Floral Doodles Pattern */}
        <pattern id="pattern-floral" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="2.5" fill="#F472B6" opacity="0.28" />
          <circle cx="20" cy="15" r="2" fill="#FBCFE8" opacity="0.25" />
          <circle cx="20" cy="25" r="2" fill="#FBCFE8" opacity="0.25" />
          <circle cx="15" cy="20" r="2" fill="#FBCFE8" opacity="0.25" />
          <circle cx="25" cy="20" r="2" fill="#FBCFE8" opacity="0.25" />
          <path d="M 34 32 Q 36 34 38 32" stroke="#10B981" strokeWidth="1.2" fill="none" opacity="0.25" />
        </pattern>

        {/* 8. Floor Tile Pattern */}
        <pattern id="pattern-floor-tile" width="32" height="32" patternUnits="userSpaceOnUse">
          <rect width="32" height="32" fill="none" stroke="#5C4434" strokeWidth="1.4" opacity="0.18" strokeDasharray="31,1" />
        </pattern>

        {/* 9. Floor Wood Plank Pattern */}
        <pattern id="pattern-wood-plank" width="60" height="16" patternUnits="userSpaceOnUse">
          <line x1="0" y1="16" x2="60" y2="16" stroke="#5C4434" strokeWidth="1.2" opacity="0.2" />
          <line x1="30" y1="0" x2="30" y2="16" stroke="#5C4434" strokeWidth="1" opacity="0.16" />
        </pattern>
      </defs>
    </svg>
  );
};
