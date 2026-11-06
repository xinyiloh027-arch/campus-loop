import React, { useState, useEffect, useId } from 'react';
import { 
  PetType, 
  PetMood, 
  PetAccessory, 
  GrowthStage, 
  CustomHeadConfig, 
  PetActionState 
} from '../../types';

interface PetVisualProps {
  type: PetType;
  mood: PetMood;
  actionState?: PetActionState;
  accessory?: PetAccessory;
  growthStage?: GrowthStage;
  isCustomPet?: boolean;
  customHead?: CustomHeadConfig | null;
  size?: number; // Default 240
  className?: string;
  onClick?: () => void;
  showHearts?: boolean;
}

/**
 * Soft Kawaii Cartoon Character Visual System
 * Inspired by Miffy, Cinnamoroll, and Crayon Shin-chan:
 * - Soft, rounded, continuous organic outlines (warm charcoal, stroke-width 3.4-4, rounded joins)
 * - Chubby mochi cheek contours & gentle 2.5D volumetric shading
 * - Expressive glossy anime cartoon eyes with natural dual light reflections
 * - Smooth live idle animations: breathing, blinking, ear wiggles, tail wags
 * - Zero paper cutouts, zero collage, zero flat geometric stickers
 */
export const PetVisual: React.FC<PetVisualProps> = ({
  type = 'puppy',
  mood = 'happy',
  actionState = 'idle',
  accessory = 'none',
  growthStage = 'young',
  isCustomPet = false,
  customHead = null,
  size = 240,
  className = '',
  onClick,
  showHearts = false,
}) => {
  const [blink, setBlink] = useState(false);
  const [breathe, setBreathe] = useState(false);
  const [tailWag, setTailWag] = useState(false);
  const [earWiggle, setEarWiggle] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Stable unique ID for SVG clipPaths
  const baseId = useId().replace(/:/g, '_');
  const clipId = `head-mask-${baseId}`;

  // Periodic natural blinking and subtle lively micro-motions
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3400 + Math.random() * 2000);

    const breatheInterval = setInterval(() => {
      setBreathe((prev) => !prev);
    }, 1800);

    const tailInterval = setInterval(() => {
      setTailWag(true);
      setTimeout(() => setTailWag(false), 900);
    }, 4000 + Math.random() * 1500);

    const earInterval = setInterval(() => {
      setEarWiggle(true);
      setTimeout(() => setEarWiggle(false), 600);
    }, 5000 + Math.random() * 2000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(breatheInterval);
      clearInterval(tailInterval);
      clearInterval(earInterval);
    };
  }, []);

  // Growth scale adjustments
  const growthScale = growthStage === 'baby' ? 0.88 : growthStage === 'grown' ? 1.12 : 1.0;
  const isSleepy = mood === 'sleepy' || actionState === 'sleeping';
  const isEating = actionState === 'eating';
  const isBathing = actionState === 'bathing';
  const isPlaying = actionState === 'playing';
  const isExcited = mood === 'excited' || isPlaying;

  // Eye Rendering Helper: Miffy & Cinnamoroll & Shin-chan inspired expressions
  const renderEyes = (lx: number, rx: number, y: number, eyeRadius: number = 7) => {
    // Sleeping or Blinking: Soft curved upward happy crescents
    if (isSleepy || blink) {
      return (
        <g stroke="#2C1B18" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 6} ${y + 1} Q ${lx} ${y + 6} ${lx + 6} ${y + 1}`} />
          <path d={`M ${rx - 6} ${y + 1} Q ${rx} ${y + 6} ${rx + 6} ${y + 1}`} />
        </g>
      );
    }

    // Excited / Playing: Sparkling gleam with happy anime arches
    if (isExcited) {
      return (
        <g>
          <path d={`M ${lx - 6} ${y + 2} Q ${lx} ${y - 5} ${lx + 6} ${y + 2}`} stroke="#2C1B18" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d={`M ${rx - 6} ${y + 2} Q ${rx} ${y - 5} ${rx + 6} ${y + 2}`} stroke="#2C1B18" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          {/* Sweet golden sparkle stars */}
          <polygon points={`${lx + 9},${y - 8} ${lx + 10},${y - 5} ${lx + 13},${y - 5} ${lx + 11},${y - 3} ${lx + 12},${y} ${lx + 9},${y - 2} ${lx + 7},${y} ${lx + 8},${y - 3} ${lx + 5},${y - 5} ${lx + 8},${y - 5}`} fill="#F59E0B" />
          <polygon points={`${rx - 9},${y - 8} ${rx - 8},${y - 5} ${rx - 5},${y - 5} ${rx - 7},${y - 3} ${rx - 6},${y} ${rx - 9},${y - 2} ${rx - 11},${y} ${rx - 10},${y - 3} ${rx - 13},${y - 5} ${rx - 10},${y - 5}`} fill="#F59E0B" />
        </g>
      );
    }

    // Hungry / Pleading: Big glossy anime eyes with liquid reflections
    if (mood === 'hungry') {
      return (
        <g>
          <ellipse cx={lx} cy={y} rx={eyeRadius + 1.2} ry={eyeRadius * 1.3} fill="#1E293B" stroke="#2C1B18" strokeWidth="1" />
          <ellipse cx={rx} cy={y} rx={eyeRadius + 1.2} ry={eyeRadius * 1.3} fill="#1E293B" stroke="#2C1B18" strokeWidth="1" />
          <circle cx={lx - 2.8} cy={y - 3} r="3.4" fill="#FFFFFF" />
          <circle cx={rx - 2.8} cy={y - 3} r="3.4" fill="#FFFFFF" />
          <circle cx={lx + 2.5} cy={y + 2.5} r="1.8" fill="#FFFFFF" />
          <circle cx={rx + 2.5} cy={y + 2.5} r="1.8" fill="#FFFFFF" />
        </g>
      );
    }

    // Default Soft Kawaii Eyes: Rich glossy dark bean/oval with dual crisp reflections
    return (
      <g>
        <ellipse cx={lx} cy={y} rx={eyeRadius} ry={eyeRadius * 1.15} fill="#231A18" />
        <ellipse cx={rx} cy={y} rx={eyeRadius} ry={eyeRadius * 1.15} fill="#231A18" />
        {/* Primary glossy reflection */}
        <circle cx={lx - 2.2} cy={y - 2.5} r="2.8" fill="#FFFFFF" />
        <circle cx={rx - 2.2} cy={y - 2.5} r="2.8" fill="#FFFFFF" />
        {/* Subtle secondary light speck */}
        <circle cx={lx + 1.8} cy={y + 2} r="1.4" fill="#FFFFFF" opacity="0.9" />
        <circle cx={rx + 1.8} cy={y + 2} r="1.4" fill="#FFFFFF" opacity="0.9" />
      </g>
    );
  };

  // Cheeks & Mouth: Soft rosy blush and sweet curved cartoon smiles
  const renderMouthAndCheeks = (
    cx: number, 
    cy: number, 
    blushWidth: number = 24, 
    style: 'miffy_x' | 'cat_w' | 'dog_smile' | 'beak' | 'simple' = 'simple'
  ) => {
    return (
      <g>
        {/* Soft, diffuse rosy blush on chubby cheek bulges */}
        <ellipse cx={cx - blushWidth} cy={cy + 1} rx="9" ry="5.5" fill="#FFAAA6" opacity="0.65" />
        <ellipse cx={cx + blushWidth} cy={cy + 1} rx="9" ry="5.5" fill="#FFAAA6" opacity="0.65" />

        {/* Eating Mouth */}
        {isEating ? (
          <g>
            <ellipse cx={cx} cy={cy + 4} rx="5.5" ry="4.5" fill="#E11D48" />
            <path d={`M ${cx - 4.5} ${cy + 3} Q ${cx} ${cy + 1} ${cx + 4.5} ${cy + 3}`} stroke="#2C1B18" strokeWidth="2" fill="none" />
          </g>
        ) : isSleepy ? (
          <ellipse cx={cx} cy={cy + 3} rx="2.5" ry="3" fill="#4A3E3D" />
        ) : style === 'miffy_x' ? (
          // Iconic Miffy 'x' mouth
          <g stroke="#2C1B18" strokeWidth="2.4" strokeLinecap="round">
            <line x1={cx - 3.5} y1={cy - 1} x2={cx + 3.5} y2={cy + 5} />
            <line x1={cx + 3.5} y1={cy - 1} x2={cx - 3.5} y2={cy + 5} />
          </g>
        ) : style === 'cat_w' ? (
          // Sweet :3 curved cat mouth
          <path
            d={`M ${cx - 5.5} ${cy + 1} Q ${cx - 2.8} ${cy + 4.8} ${cx} ${cy + 1.5} Q ${cx + 2.8} ${cy + 4.8} ${cx + 5.5} ${cy + 1}`}
            stroke="#2C1B18"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        ) : style === 'dog_smile' ? (
          <g>
            <path d={`M ${cx} ${cy - 1} L ${cx} ${cy + 2}`} stroke="#2C1B18" strokeWidth="2" strokeLinecap="round" />
            <path
              d={`M ${cx - 4.5} ${cy + 2} Q ${cx} ${cy + 5.5} ${cx + 4.5} ${cy + 2}`}
              stroke="#2C1B18"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : style === 'beak' ? (
          // Rounded cartoon bill/beak
          <g>
            <ellipse cx={cx} cy={cy + 1} rx="9" ry="5.5" fill="#F97316" stroke="#2C1B18" strokeWidth="2" />
            <circle cx={cx - 2} cy={cy} r="0.8" fill="#7C2D12" />
            <circle cx={cx + 2} cy={cy} r="0.8" fill="#7C2D12" />
          </g>
        ) : (
          // Simple sweet curved smile
          <path
            d={`M ${cx - 4} ${cy + 1.5} Q ${cx} ${cy + 4.8} ${cx + 4} ${cy + 1.5}`}
            stroke="#2C1B18"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>
    );
  };

  // Accessories: Rendered with smooth rounded cartoon line art
  const renderAccessory = () => {
    switch (accessory) {
      case 'grad_cap':
        return (
          <g id="acc-grad-cap" transform="translate(100, 40) rotate(-6)">
            <polygon points="0,-18 36,-6 0,6 -36,-6" fill="#1E293B" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M -18,-5 L -18,6 C -18,12 18,12 18,6 L 18,-5 Z" fill="#334155" stroke="#2C1B18" strokeWidth="2.4" />
            <circle cx="0" cy="-6" r="3.2" fill="#F59E0B" />
            <path d="M 0,-6 Q 24,-2 26,14" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <rect x="23" y="14" width="6" height="8" rx="2" fill="#F59E0B" />
          </g>
        );
      case 'glasses':
        return (
          <g id="acc-glasses" stroke="#2C1B18" strokeWidth="2.8" fill="none">
            <circle cx="82" cy="76" r="13" fill="#FFFFFF" fillOpacity="0.25" />
            <circle cx="118" cy="76" r="13" fill="#FFFFFF" fillOpacity="0.25" />
            <line x1="95" y1="76" x2="105" y2="76" strokeWidth="3" />
            <line x1="69" y1="74" x2="60" y2="72" />
            <line x1="131" y1="74" x2="140" y2="72" />
          </g>
        );
      case 'party_crown':
        return (
          <g id="acc-crown" transform="translate(100, 44)">
            <path d="M -22,0 L -24,-18 L -10,-8 L 0,-22 L 10,-8 L 24,-18 L 22,0 Z" fill="#FBBF24" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
            <circle cx="0" cy="-4" r="3" fill="#EF4444" />
            <circle cx="-12" cy="-4" r="2.5" fill="#3B82F6" />
            <circle cx="12" cy="-4" r="2.5" fill="#10B981" />
          </g>
        );
      case 'flower_crown':
        return (
          <g id="acc-flower-crown" transform="translate(100, 52)">
            <path d="M -34,0 Q 0,-8 34,0" stroke="#15803D" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            {[-24, -12, 0, 12, 24].map((fx, i) => (
              <g key={i} transform={`translate(${fx}, ${i % 2 === 0 ? -2 : 0})`}>
                <circle cx="0" cy="0" r="5" fill={i % 2 === 0 ? "#F472B6" : "#FDE047"} />
                <circle cx="0" cy="0" r="2" fill="#FFFFFF" />
              </g>
            ))}
          </g>
        );
      case 'bow':
        return (
          <g id="acc-bow" transform="translate(100, 48)">
            <path d="M 0,0 C -16,-14 -22,14 0,0 Z" fill="#FB7185" stroke="#2C1B18" strokeWidth="2.2" strokeLinejoin="round" />
            <path d="M 0,0 C 16,-14 22,14 0,0 Z" fill="#FB7185" stroke="#2C1B18" strokeWidth="2.2" strokeLinejoin="round" />
            <ellipse cx="0" cy="0" rx="4.5" ry="4.5" fill="#F43F5E" stroke="#2C1B18" strokeWidth="2.2" />
          </g>
        );
      case 'scarf':
        return (
          <g id="acc-scarf">
            <path d="M 70 114 Q 100 126 130 114 Q 100 134 70 114" fill="#34D399" stroke="#2C1B18" strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M 112 118 L 122 148 L 108 148 Z" fill="#10B981" stroke="#2C1B18" strokeWidth="2.2" strokeLinejoin="round" />
            <line x1="76" y1="117" x2="82" y2="121" stroke="#A7F3D0" strokeWidth="2.4" />
            <line x1="92" y1="120" x2="98" y2="124" stroke="#A7F3D0" strokeWidth="2.4" />
          </g>
        );
      case 'sweater':
        return (
          <g id="acc-sweater">
            <path d="M 68 122 Q 100 114 132 122 L 128 154 Q 100 162 72 154 Z" fill="#DDD6FE" stroke="#2C1B18" strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M 86 128 L 100 142 L 114 128" stroke="#8B5CF6" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'cool_shades':
        return (
          <g id="acc-cool-shades" transform="translate(100, 76)">
            <path d="M -30,-4 L -8,-4 L -12,12 L -26,12 Z" fill="#0F172A" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M 8,-4 L 30,-4 L 26,12 L 12,12 Z" fill="#0F172A" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
            <line x1="-8" y1="0" x2="8" y2="0" stroke="#0F172A" strokeWidth="3" />
            <line x1="-24" y1="0" x2="-14" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="14" y1="0" x2="24" y2="8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </g>
        );
      case 'chef_hat':
        return (
          <g id="acc-chef-hat" transform="translate(100, 42)">
            <path d="M -22,-6 C -32,-22 -14,-34 0,-34 C 14,-34 32,-22 22,-6 Z" fill="#FFFFFF" stroke="#2C1B18" strokeWidth="2.6" strokeLinejoin="round" />
            <rect x="-18" y="-6" width="36" height="10" rx="3" fill="#F8FAFC" stroke="#2C1B18" strokeWidth="2.4" />
          </g>
        );
      case 'backpack':
        return (
          <g id="acc-backpack">
            <rect x="52" y="112" width="16" height="26" rx="6" fill="#FBBF24" stroke="#2C1B18" strokeWidth="2.4" />
            <rect x="56" y="122" width="10" height="12" rx="3" fill="#F59E0B" />
          </g>
        );
      default:
        return null;
    }
  };

  // Custom Uploaded Head Layer
  const renderCustomHeadLayer = () => {
    if (!isCustomPet || !customHead || !customHead.imageUrl) return null;

    const ox = customHead.offsetX || 0;
    const oy = customHead.offsetY || 0;
    const zoom = customHead.zoom || 1.0;
    const rot = customHead.rotation || 0;
    const flip = customHead.flipHorizontal ? -1 : 1;

    return (
      <g id="custom-pet-head-composite">
        <defs>
          <clipPath id={clipId}>
            {customHead.cropShape === 'heart' ? (
              <path d="M 100 48 C 84 32 64 44 64 64 C 64 88 100 114 100 114 C 100 114 136 88 136 64 C 136 44 116 32 100 48 Z" />
            ) : customHead.cropShape === 'star' ? (
              <polygon points="100,44 108,62 128,62 112,74 118,92 100,82 82,92 88,74 72,62 92,62" />
            ) : customHead.cropShape === 'rounded_rect' ? (
              <rect x="66" y="46" width="68" height="68" rx="20" />
            ) : (
              // Default Soft Squishy Head Mask (perfectly matched to kawaii proportions)
              <ellipse cx="100" cy="80" rx="36" ry="32" />
            )}
          </clipPath>
        </defs>

        {/* Ambient Drop Shadow under Head */}
        <ellipse cx="100" cy="115" rx="30" ry="8" fill="#000000" opacity="0.12" />

        {/* Clipped Uploaded Image */}
        <g clipPath={`url(#${clipId})`}>
          {!imageError ? (
            <g transform={`translate(${100 + ox}, ${80 + oy}) rotate(${rot}) scale(${zoom * flip}, ${zoom}) translate(-55, -55)`}>
              <image
                href={customHead.imageUrl}
                xlinkHref={customHead.imageUrl}
                x="0"
                y="0"
                width="110"
                height="110"
                preserveAspectRatio="xMidYMid slice"
                onError={() => setImageError(true)}
              />
            </g>
          ) : (
            <g>
              <rect x="65" y="44" width="70" height="74" fill="#FDE8E8" />
              <text x="100" y="85" textAnchor="middle" fill="#EF4444" fontSize="10" fontWeight="bold">Image Error</text>
            </g>
          )}
        </g>

        {/* Soft Outline Ring around Custom Head */}
        {customHead.cropShape === 'heart' ? (
          <path d="M 100 48 C 84 32 64 44 64 64 C 64 88 100 114 100 114 C 100 114 136 88 136 64 C 136 44 116 32 100 48 Z" fill="none" stroke="#2C1B18" strokeWidth="3.2" />
        ) : (
          <ellipse cx="100" cy="80" rx="36" ry="32" fill="none" stroke="#2C1B18" strokeWidth="3.2" />
        )}
      </g>
    );
  };

  /**
   * =========================================================================
   * SPECIES-SPECIFIC SOFT KAWAII CARTOON VECTOR BODIES & HEADS
   * Inspired by Miffy, Cinnamoroll, and Crayon Shin-chan:
   * Continuous organic curves, gentle 2.5D shading, rich character personality
   * =========================================================================
   */
  const renderAnimalBodyAndHead = () => {
    // 1. PUPPY & FLOPPY PUPPY (Golden Cream / Honey, Drooping Ears)
    if (type === 'puppy' || type === 'floppy_puppy') {
      const isFloppy = type === 'floppy_puppy';
      return (
        <g id="puppy">
          {/* Wagging Tail */}
          <path
            d={tailWag ? "M 134 140 Q 158 126 156 112" : "M 134 140 Q 152 136 148 122"}
            stroke="#C2884A"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Chubby Pear Body with Soft 2.5D Shading */}
          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-warm-biscuit)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {/* White Chest Patch */}
          <path d="M 86 122 C 94 136 106 136 114 122 C 118 148 108 160 100 160 C 92 160 82 148 86 122 Z" fill="#FFFDF8" />

          {/* Chubby Little Paws */}
          <ellipse cx="82" cy="164" rx="9.5" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9.5" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="puppy-head">
              {/* Velvety Soft Drooping Ears */}
              <g transform={earWiggle ? "rotate(-4, 62, 58)" : "rotate(0, 62, 58)"}>
                <path
                  d={isFloppy ? "M 66 58 C 42 66 40 106 58 110 C 70 112 74 88 70 70 Z" : "M 68 58 C 48 66 52 98 64 100 C 72 102 74 84 70 70 Z"}
                  fill="#B97A38"
                  stroke="#2C1B18"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
              </g>

              <g transform={earWiggle ? "rotate(4, 138, 58)" : "rotate(0, 138, 58)"}>
                <path
                  d={isFloppy ? "M 134 58 C 158 66 160 106 142 110 C 130 112 126 88 130 70 Z" : "M 132 58 C 152 66 148 98 136 100 C 128 102 126 84 130 70 Z"}
                  fill="#B97A38"
                  stroke="#2C1B18"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
              </g>

              {/* Squishy Chubby Head Contour (Shin-chan / Cinnamoroll style cheeks) */}
              <path
                d="M 64 80 C 60 98 74 110 100 110 C 126 110 140 98 136 80 C 134 58 118 52 100 52 C 82 52 66 58 64 80 Z"
                fill="url(#grad-warm-biscuit)"
                stroke="#2C1B18"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              {/* Cream Muzzle */}
              <ellipse cx="100" cy="88" rx="15" ry="10.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
              {/* Button Nose */}
              <ellipse cx="100" cy="82.5" rx="4.5" ry="3.2" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'dog_smile')}
            </g>
          )}
        </g>
      );
    }

    // 2. CORGI (Chubby Loaf, Big Rounded Perky Ears, Heart Butt)
    if (type === 'corgi') {
      return (
        <g id="corgi">
          {/* Chubby Loaf Body */}
          <path
            d="M 70 120 C 58 138 64 166 100 166 C 136 166 142 138 130 120 C 124 110 76 110 70 120 Z"
            fill="url(#grad-warm-caramel)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          {/* White Chest Loaf */}
          <path d="M 84 122 C 94 138 106 138 116 122 C 122 148 112 162 100 162 C 88 162 78 148 84 122 Z" fill="#FFFDF8" />

          {/* Little Front Paws */}
          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="corgi-head">
              {/* Big Perky Rounded Ears (Not sharp triangles!) */}
              <g transform={earWiggle ? "rotate(-3, 64, 46)" : "rotate(0, 64, 46)"}>
                <path d="M 68 68 C 50 56 46 26 66 24 C 80 22 84 48 78 68 Z" fill="#D97706" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 67 62 C 55 52 53 32 66 30 C 76 28 78 48 74 62 Z" fill="#FDE68A" />
              </g>
              <g transform={earWiggle ? "rotate(3, 136, 46)" : "rotate(0, 136, 46)"}>
                <path d="M 132 68 C 150 56 154 26 134 24 C 120 22 116 48 122 68 Z" fill="#D97706" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 133 62 C 145 52 147 32 134 30 C 124 28 122 48 126 62 Z" fill="#FDE68A" />
              </g>

              {/* Head with Squishy Cheeks */}
              <path
                d="M 64 80 C 60 98 74 110 100 110 C 126 110 140 98 136 80 C 134 58 118 52 100 52 C 82 52 66 58 64 80 Z"
                fill="url(#grad-warm-caramel)"
                stroke="#2C1B18"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              {/* White Blaze Forehead Stripe */}
              <path d="M 94 54 C 98 52 102 52 106 54 L 108 92 C 100 96 100 96 92 92 Z" fill="#FFFDF8" />
              <ellipse cx="100" cy="88" rx="14" ry="10" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
              <ellipse cx="100" cy="82.5" rx="4.5" ry="3.2" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'dog_smile')}
            </g>
          )}
        </g>
      );
    }

    // 3. SHIBA INU (Toasted Mochi Cheeks, Curly Tail, White Urajiro)
    if (type === 'shiba') {
      return (
        <g id="shiba">
          {/* Curly Doughnut Tail */}
          <path
            d="M 132 136 C 154 122 152 102 142 102 C 132 102 130 116 138 122"
            stroke="#D97706"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-warm-caramel)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="142" rx="22" ry="19" fill="#FFFDF8" />

          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="shiba-head">
              {/* Rounded Ears */}
              <g transform={earWiggle ? "rotate(-3, 66, 48)" : "rotate(0, 66, 48)"}>
                <path d="M 68 68 C 56 56 54 32 72 32 C 82 32 86 50 80 68 Z" fill="#B45309" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 68 62 C 60 52 58 38 70 38 C 76 38 78 50 74 62 Z" fill="#FDE68A" />
              </g>
              <g transform={earWiggle ? "rotate(3, 134, 48)" : "rotate(0, 134, 48)"}>
                <path d="M 132 68 C 144 56 146 32 128 32 C 118 32 114 50 120 68 Z" fill="#B45309" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 132 62 C 140 52 142 38 130 38 C 124 38 122 50 126 62 Z" fill="#FDE68A" />
              </g>

              {/* Head with Toasted Squishy Cheeks */}
              <path
                d="M 64 80 C 60 98 74 110 100 110 C 126 110 140 98 136 80 C 134 58 118 52 100 52 C 82 52 66 58 64 80 Z"
                fill="url(#grad-warm-caramel)"
                stroke="#2C1B18"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              {/* White Cheek Patches (Urajiro) */}
              <ellipse cx="76" cy="88" rx="14" ry="12" fill="#FFFDF8" />
              <ellipse cx="124" cy="88" rx="14" ry="12" fill="#FFFDF8" />

              {/* Cute White Eyebrow Dots */}
              <circle cx="83" cy="65" r="3.2" fill="#FFFDF8" />
              <circle cx="117" cy="65" r="3.2" fill="#FFFDF8" />

              <ellipse cx="100" cy="88" rx="12" ry="8.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
              <ellipse cx="100" cy="83" rx="4.5" ry="3" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'dog_smile')}
            </g>
          )}
        </g>
      );
    }

    // 4. KITTEN, FLUFFY CAT & CALICO (Miffy & Cinnamoroll Softness, :3 Mouth)
    if (type === 'kitten' || type === 'fluffy_cat' || type === 'calico_cat' || type === 'cat') {
      const isCalico = type === 'calico_cat';
      const isFluffy = type === 'fluffy_cat';
      return (
        <g id="kitten">
          {/* Gentle Waving Tail */}
          <path
            d={tailWag ? "M 134 142 C 160 134 158 114 150 114" : "M 134 142 C 154 142 152 124 146 124"}
            stroke={isCalico ? "#D97706" : isFluffy ? "#C4B5FD" : "#FDA4AF"}
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
          />

          {/* Chubby Marshmallow Body */}
          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill={isFluffy ? "url(#grad-soft-cloud)" : "url(#grad-soft-peach)"}
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="21" ry="17" fill="#FFFDF8" />

          {/* Paws */}
          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="kitten-head">
              {/* Soft Rounded Cat Ears */}
              <g transform={earWiggle ? "rotate(-4, 68, 50)" : "rotate(0, 68, 50)"}>
                <path d="M 70 68 C 58 54 56 34 76 36 C 84 38 86 52 82 68 Z" fill={isCalico ? "#D97706" : isFluffy ? "#C4B5FD" : "#FB7185"} stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 71 62 C 63 50 62 40 73 40 C 78 40 79 50 76 62 Z" fill="#FFE4E6" />
              </g>
              <g transform={earWiggle ? "rotate(4, 132, 50)" : "rotate(0, 132, 50)"}>
                <path d="M 130 68 C 142 54 144 34 124 36 C 116 38 114 52 118 68 Z" fill={isCalico ? "#475569" : isFluffy ? "#C4B5FD" : "#FB7185"} stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
                <path d="M 129 62 C 137 50 138 40 127 40 C 122 40 121 50 124 62 Z" fill="#FFE4E6" />
              </g>

              {/* Head with Squishy Round Cheeks */}
              <path
                d="M 64 80 C 60 98 74 110 100 110 C 126 110 140 98 136 80 C 134 58 118 52 100 52 C 82 52 66 58 64 80 Z"
                fill={isFluffy ? "url(#grad-soft-cloud)" : "url(#grad-soft-peach)"}
                stroke="#2C1B18"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              {/* Calico forehead patch */}
              {isCalico && (
                <path d="M 110 56 C 122 52 130 68 126 76 C 118 78 110 68 110 56 Z" fill="#D97706" opacity="0.85" />
              )}

              {/* Tiny Pink Nose */}
              <polygon points="97,83 103,83 100,86" fill="#FB7185" />

              {/* Whiskers */}
              <g stroke="#2C1B18" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
                <line x1="62" y1="84" x2="50" y2="82" />
                <line x1="62" y1="88" x2="50" y2="90" />
                <line x1="138" y1="84" x2="150" y2="82" />
                <line x1="138" y1="88" x2="150" y2="90" />
              </g>

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 24, 'cat_w')}
            </g>
          )}
        </g>
      );
    }

    // 5. BUNNY (Iconic Miffy-Inspired Tall Rounded Pill Ears & 'x' Mouth)
    if (type === 'rabbit' || type === 'bunny') {
      return (
        <g id="bunny">
          {/* Cotton Ball Tail */}
          <circle cx="138" cy="146" r="10" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {/* Chubby Pear Body */}
          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-pure-cream)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="bunny-head">
              {/* Tall Rounded Pill Ears (Miffy Style!) */}
              <g transform={earWiggle ? "rotate(-3, 76, 20)" : "rotate(0, 76, 20)"}>
                <rect x="68" y="10" width="20" height="56" rx="10" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3.4" />
                <rect x="73" y="16" width="10" height="42" rx="5" fill="#FFD1DC" opacity="0.6" />
              </g>
              <g transform={earWiggle ? "rotate(3, 124, 20)" : "rotate(0, 124, 20)"}>
                <rect x="112" y="10" width="20" height="56" rx="10" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3.4" />
                <rect x="117" y="16" width="10" height="42" rx="5" fill="#FFD1DC" opacity="0.6" />
              </g>

              {/* Round Chubby Head */}
              <ellipse cx="100" cy="80" rx="36" ry="30" fill="url(#grad-pure-cream)" stroke="#2C1B18" strokeWidth="3.4" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 87, 24, 'miffy_x')}
            </g>
          )}
        </g>
      );
    }

    // 6. PIGLET (Strawberry-Milk Marshmallow, Teardrop Snout, Curly Tail)
    if (type === 'piglet') {
      return (
        <g id="piglet">
          {/* Curly Pig Tail */}
          <path d="M 134 144 C 148 140 152 130 144 126 C 138 122 148 114 154 120" stroke="#F472B6" strokeWidth="5" strokeLinecap="round" fill="none" />

          <path
            d="M 70 120 C 58 138 64 166 100 166 C 136 166 142 138 130 120 C 124 110 76 110 70 120 Z"
            fill="url(#grad-strawberry-milk)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="22" ry="18" fill="#FFF1F2" />

          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#FFF1F2" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#FFF1F2" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="piglet-head">
              {/* Folded Soft Piglet Ears */}
              <g transform={earWiggle ? "rotate(-4, 66, 56)" : "rotate(0, 66, 56)"}>
                <path d="M 66 66 C 52 50 56 34 76 42 C 78 54 74 66 66 66 Z" fill="#F472B6" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
              </g>
              <g transform={earWiggle ? "rotate(4, 134, 56)" : "rotate(0, 134, 56)"}>
                <path d="M 134 66 C 148 50 144 34 124 42 C 122 54 126 66 134 66 Z" fill="#F472B6" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
              </g>

              {/* Plump Round Head */}
              <ellipse cx="100" cy="80" rx="36" ry="30" fill="url(#grad-strawberry-milk)" stroke="#2C1B18" strokeWidth="3.4" />

              {/* Big Cute Oval Snout */}
              <ellipse cx="100" cy="88" rx="14" ry="10" fill="#FB7185" stroke="#2C1B18" strokeWidth="2.4" />
              <ellipse cx="96" cy="88" rx="2.5" ry="3.5" fill="#9F1239" />
              <ellipse cx="104" cy="88" rx="2.5" ry="3.5" fill="#9F1239" />

              {renderEyes(81, 119, 74, 7)}
              {renderMouthAndCheeks(100, 91, 25, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 7. HAMSTER (Giant Squishy Mochi Cheeks, Sunflower Seed)
    if (type === 'hamster') {
      return (
        <g id="hamster">
          <circle cx="100" cy="144" r="32" fill="url(#grad-soft-golden)" stroke="#2C1B18" strokeWidth="3.4" />
          <ellipse cx="100" cy="146" rx="20" ry="18" fill="#FFFDF8" />

          {/* Tiny Paws holding Sunflower Seed */}
          <ellipse cx="88" cy="154" rx="6" ry="5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
          <ellipse cx="112" cy="154" rx="6" ry="5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
          {/* Sunflower seed */}
          <ellipse cx="100" cy="152" rx="5" ry="7" fill="#78350F" stroke="#2C1B18" strokeWidth="1.8" />
          <line x1="100" y1="146" x2="100" y2="158" stroke="#FDE68A" strokeWidth="1.2" />

          {!isCustomPet && (
            <g id="hamster-head">
              {/* Round Little Ears */}
              <circle cx="68" cy="54" r="11" fill="#FDE68A" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="68" cy="54" r="6" fill="#F472B6" />
              <circle cx="132" cy="54" r="11" fill="#FDE68A" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="132" cy="54" r="6" fill="#F472B6" />

              {/* Extra Squishy Mochi Cheeks Head Silhouette */}
              <path
                d="M 60 84 C 54 102 72 112 100 112 C 128 112 146 102 140 84 C 136 60 120 54 100 54 C 80 54 64 60 60 84 Z"
                fill="url(#grad-soft-golden)"
                stroke="#2C1B18"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />

              <ellipse cx="100" cy="85" rx="3.5" ry="2.5" fill="#FB7185" />
              {renderEyes(82, 118, 76, 7)}
              {renderMouthAndCheeks(100, 89, 26, 'cat_w')}
            </g>
          )}
        </g>
      );
    }

    // 8. BABY CROCODILE (Mint/Pistachio Green, Rounded Friendly Snout, Sweet Tooth)
    if (type === 'crocodile') {
      return (
        <g id="crocodile">
          {/* Rounded Scalloped Back Ridges */}
          <circle cx="66" cy="132" r="5" fill="#34D399" stroke="#2C1B18" strokeWidth="2.2" />
          <circle cx="62" cy="144" r="6" fill="#34D399" stroke="#2C1B18" strokeWidth="2.2" />
          <circle cx="66" cy="156" r="5" fill="#34D399" stroke="#2C1B18" strokeWidth="2.2" />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-pastel-mint)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="20" ry="17" fill="#ECFDF5" />

          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#ECFDF5" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#ECFDF5" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="croc-head">
              {/* Rounded Head */}
              <ellipse cx="100" cy="78" rx="36" ry="28" fill="url(#grad-pastel-mint)" stroke="#2C1B18" strokeWidth="3.4" />
              {/* Friendly Rounded Snout */}
              <path d="M 74 84 C 74 100 126 100 126 84 C 126 78 74 78 74 84 Z" fill="#6EE7B7" stroke="#2C1B18" strokeWidth="2.6" />
              {/* Nostril Dots */}
              <circle cx="94" cy="83" r="1.8" fill="#065F46" />
              <circle cx="106" cy="83" r="1.8" fill="#065F46" />

              {/* Single Sweet Cartoon Tooth Peeking */}
              <polygon points="98,92 102,92 100,97" fill="#FFFFFF" stroke="#2C1B18" strokeWidth="1.6" />

              {renderEyes(82, 118, 73, 7)}
              {renderMouthAndCheeks(100, 90, 24, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 9. PENGUIN (Round Waddler, Snow-White Heart Belly, Orange Beak)
    if (type === 'penguin') {
      return (
        <g id="penguin">
          {/* Flipper Wings */}
          <path d="M 68 126 C 54 134 52 150 64 154 C 72 156 74 140 70 126 Z" fill="#1E293B" stroke="#2C1B18" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 132 126 C 146 134 148 150 136 154 C 128 156 126 140 130 126 Z" fill="#1E293B" stroke="#2C1B18" strokeWidth="3" strokeLinejoin="round" />

          {/* Chubby Midnight Body */}
          <ellipse cx="100" cy="140" rx="34" ry="28" fill="#1E293B" stroke="#2C1B18" strokeWidth="3.4" />
          {/* White Belly */}
          <ellipse cx="100" cy="142" rx="22" ry="20" fill="#FFFFFF" />

          {/* Orange Webbed Feet */}
          <ellipse cx="84" cy="166" rx="9" ry="5.5" fill="#F97316" stroke="#2C1B18" strokeWidth="2.4" />
          <ellipse cx="116" cy="166" rx="9" ry="5.5" fill="#F97316" stroke="#2C1B18" strokeWidth="2.4" />

          {!isCustomPet && (
            <g id="penguin-head">
              <ellipse cx="100" cy="78" rx="35" ry="30" fill="#1E293B" stroke="#2C1B18" strokeWidth="3.4" />
              {/* White Face Mask */}
              <path d="M 72 80 C 72 96 128 96 128 80 C 128 66 72 66 72 80 Z" fill="#FFFFFF" />
              {renderEyes(82, 118, 76, 7)}
              {renderMouthAndCheeks(100, 84, 23, 'beak')}
            </g>
          )}
        </g>
      );
    }

    // 10. DUCK (Sunny Yellow Marshmallow, Orange Paddle Bill)
    if (type === 'duck') {
      return (
        <g id="duck">
          {/* Tiny Tail Tuft */}
          <path d="M 134 142 C 148 140 152 132 144 126 Z" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.4" />

          <ellipse cx="100" cy="142" rx="34" ry="27" fill="#FDE047" stroke="#2C1B18" strokeWidth="3.4" />
          <ellipse cx="84" cy="166" rx="9.5" ry="5.5" fill="#F97316" stroke="#2C1B18" strokeWidth="2.4" />
          <ellipse cx="116" cy="166" rx="9.5" ry="5.5" fill="#F97316" stroke="#2C1B18" strokeWidth="2.4" />

          {!isCustomPet && (
            <g id="duck-head">
              {/* Head Feather Tuft */}
              <path d="M 100 52 C 96 42 104 38 102 34 C 108 38 106 46 102 52 Z" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.2" />
              <ellipse cx="100" cy="78" rx="35" ry="29" fill="#FDE047" stroke="#2C1B18" strokeWidth="3.4" />
              {renderEyes(82, 118, 74, 7)}
              {renderMouthAndCheeks(100, 83, 23, 'beak')}
            </g>
          )}
        </g>
      );
    }

    // 11. BEAR (Honey Caramel Teddy, Round Scoop Ears)
    if (type === 'bear') {
      return (
        <g id="bear">
          <path
            d="M 70 120 C 58 138 64 166 100 166 C 136 166 142 138 130 120 C 124 110 76 110 70 120 Z"
            fill="url(#grad-warm-honey)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="22" ry="19" fill="#FFFBEB" />
          <ellipse cx="82" cy="164" rx="9.5" ry="6.5" fill="#FFFBEB" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9.5" ry="6.5" fill="#FFFBEB" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="bear-head">
              <circle cx="68" cy="54" r="12" fill="#B45309" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="68" cy="54" r="6.5" fill="#FDE68A" />
              <circle cx="132" cy="54" r="12" fill="#B45309" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="132" cy="54" r="6.5" fill="#FDE68A" />

              <ellipse cx="100" cy="80" rx="36" ry="30" fill="url(#grad-warm-honey)" stroke="#2C1B18" strokeWidth="3.4" />
              <ellipse cx="100" cy="88" rx="15" ry="10.5" fill="#FFFBEB" stroke="#2C1B18" strokeWidth="2.2" />
              <ellipse cx="100" cy="82.5" rx="5" ry="3.5" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 12. FOX (Warm Russet, Fluffy White Cheek Tufts, Giant Bushy Tail)
    if (type === 'fox') {
      return (
        <g id="fox">
          {/* Big Bushy Tail with White Tip */}
          <path d="M 130 138 C 166 128 174 94 156 86 C 142 80 136 102 138 120" stroke="#EA580C" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d="M 158 88 C 166 94 164 104 156 108 Z" fill="#FFFDF8" />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-warm-apricot)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="20" ry="17" fill="#FFFDF8" />

          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#1E293B" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#1E293B" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="fox-head">
              {/* Pointed Rounded Ears */}
              <path d="M 66 68 C 50 52 50 28 72 32 C 82 34 84 52 78 68 Z" fill="#EA580C" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 66 62 C 56 50 56 36 68 38 C 76 40 76 52 72 62 Z" fill="#FFFDF8" />

              <path d="M 134 68 C 150 52 150 28 128 32 C 118 34 116 52 122 68 Z" fill="#EA580C" stroke="#2C1B18" strokeWidth="3.2" strokeLinejoin="round" />
              <path d="M 134 62 C 144 50 144 36 132 38 C 124 40 124 52 128 62 Z" fill="#FFFDF8" />

              {/* Head with Fluffy Cheek Tufts */}
              <ellipse cx="100" cy="80" rx="36" ry="29" fill="url(#grad-warm-apricot)" stroke="#2C1B18" strokeWidth="3.4" />
              <path d="M 64 88 C 60 96 74 98 80 90 Z" fill="#FFFDF8" />
              <path d="M 136 88 C 140 96 126 98 120 90 Z" fill="#FFFDF8" />

              <ellipse cx="100" cy="88" rx="12" ry="8.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
              <polygon points="97,83 103,83 100,86" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 13. CAPYBARA (Zen Chill, Rectangular Head, Yuzu Fruit on Head)
    if (type === 'capybara') {
      return (
        <g id="capybara">
          {/* Broad Huggable Body */}
          <path
            d="M 68 120 C 56 138 60 166 100 166 C 140 166 144 138 132 120 C 126 110 74 110 68 120 Z"
            fill="url(#grad-warm-biscuit)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#A86E3C" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#A86E3C" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="capybara-head">
              {/* Tiny Round Ears */}
              <circle cx="68" cy="62" r="8" fill="#A86E3C" stroke="#2C1B18" strokeWidth="2.6" />
              <circle cx="132" cy="62" r="8" fill="#A86E3C" stroke="#2C1B18" strokeWidth="2.6" />

              {/* Characteristic Rounded Block Head */}
              <rect x="68" y="56" width="64" height="48" rx="20" fill="url(#grad-warm-biscuit)" stroke="#2C1B18" strokeWidth="3.4" />

              {/* Sweet Yuzu Fruit Resting on Head */}
              <g transform="translate(100, 48)">
                <circle cx="0" cy="0" r="9" fill="#FBBF24" stroke="#2C1B18" strokeWidth="2.2" />
                <path d="M 0,-9 C 4,-14 10,-12 8,-7 Z" fill="#15803D" stroke="#2C1B18" strokeWidth="1.6" />
              </g>

              {/* Broad Rounded Snout */}
              <ellipse cx="100" cy="92" rx="14" ry="10" fill="#935728" stroke="#2C1B18" strokeWidth="2.2" />
              <ellipse cx="96" cy="90" rx="2.5" ry="3.5" fill="#2C1B18" />
              <ellipse cx="104" cy="90" rx="2.5" ry="3.5" fill="#2C1B18" />

              {/* Serene Zen Slit Eyes */}
              <g stroke="#2C1B18" strokeWidth="3.2" strokeLinecap="round" fill="none">
                <line x1="76" y1="74" x2="86" y2="74" />
                <line x1="114" y1="74" x2="124" y2="74" />
              </g>
              {renderMouthAndCheeks(100, 95, 26, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 14. RED PANDA (Cinnamon Russet, Ringed Tail, White Brow Marks)
    if (type === 'red_panda') {
      return (
        <g id="red-panda">
          {/* Ringed Bushy Tail */}
          <path d="M 132 138 C 166 128 174 94 156 86 C 142 80 136 102 138 120" stroke="#C2410C" strokeWidth="13" strokeLinecap="round" fill="none" />
          <path d="M 152 94 C 162 100 162 110 152 116" stroke="#FEF3C7" strokeWidth="4" strokeLinecap="round" fill="none" />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-warm-apricot)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#451A03" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#451A03" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="red-panda-head">
              <circle cx="68" cy="54" r="12" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="68" cy="54" r="7" fill="#C2410C" />
              <circle cx="132" cy="54" r="12" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3.2" />
              <circle cx="132" cy="54" r="7" fill="#C2410C" />

              <ellipse cx="100" cy="80" rx="36" ry="29" fill="url(#grad-warm-apricot)" stroke="#2C1B18" strokeWidth="3.4" />
              {/* White Tear Marks and Brows */}
              <ellipse cx="78" cy="86" rx="10" ry="12" fill="#FFFDF8" />
              <ellipse cx="122" cy="86" rx="10" ry="12" fill="#FFFDF8" />
              <circle cx="84" cy="65" r="3" fill="#FFFDF8" />
              <circle cx="116" cy="65" r="3" fill="#FFFDF8" />

              <ellipse cx="100" cy="88" rx="12" ry="8.5" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="2.2" />
              <polygon points="97,83 103,83 100,86" fill="#2C1B18" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 25, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 15. BABY DINOSAUR (Pastel Sage Green, Rounded Gumdrop Back Plates)
    if (type === 'dino') {
      return (
        <g id="dino">
          {/* Soft Rounded Back Plates */}
          <circle cx="68" cy="126" r="6" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.2" />
          <circle cx="62" cy="140" r="7" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.2" />
          <circle cx="64" cy="154" r="6" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.2" />

          {/* Sweet Tail */}
          <path d="M 132 144 C 154 142 160 134 154 126" stroke="#86EFAC" strokeWidth="8" strokeLinecap="round" fill="none" />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-pastel-mint)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="21" ry="18" fill="#ECFDF5" />

          <ellipse cx="82" cy="164" rx="9" ry="6.5" fill="#ECFDF5" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="9" ry="6.5" fill="#ECFDF5" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="dino-head">
              <ellipse cx="100" cy="78" rx="36" ry="29" fill="url(#grad-pastel-mint)" stroke="#2C1B18" strokeWidth="3.4" />
              {/* Soft Snout */}
              <ellipse cx="100" cy="86" rx="14" ry="9.5" fill="#A7F3D0" stroke="#2C1B18" strokeWidth="2.2" />
              <circle cx="96" cy="85" r="1.6" fill="#065F46" />
              <circle cx="104" cy="85" r="1.6" fill="#065F46" />

              {renderEyes(82, 118, 74, 7)}
              {renderMouthAndCheeks(100, 89, 24, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 16. BABY DRAGON (Pastel Periwinkle, Rounded Horns, Soft Little Wings)
    if (type === 'dragon') {
      return (
        <g id="dragon">
          {/* Soft Wings */}
          <path d="M 66 122 C 48 114 44 98 56 104 C 64 108 68 116 66 122 Z" fill="#DDD6FE" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 134 122 C 152 114 156 98 144 104 C 136 108 132 116 134 122 Z" fill="#DDD6FE" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />

          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-soft-cloud)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="100" cy="144" rx="20" ry="18" fill="#EDE9FE" />

          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#EDE9FE" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#EDE9FE" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="dragon-head">
              {/* Cute Little Rounded Horns */}
              <path d="M 72 58 C 64 42 76 34 82 48 Z" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
              <path d="M 128 58 C 136 42 124 34 118 48 Z" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />

              <ellipse cx="100" cy="78" rx="36" ry="29" fill="url(#grad-soft-cloud)" stroke="#2C1B18" strokeWidth="3.4" />
              <ellipse cx="100" cy="86" rx="14" ry="9" fill="#C4B5FD" stroke="#2C1B18" strokeWidth="2.2" />

              {renderEyes(82, 118, 74, 7)}
              {renderMouthAndCheeks(100, 89, 24, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // 17. DREAMY UNICORN (Pastel Rainbow Mane, Spiral Pearl Horn)
    if (type === 'unicorn') {
      return (
        <g id="unicorn">
          <path
            d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
            fill="url(#grad-pure-cream)"
            stroke="#2C1B18"
            strokeWidth="3.4"
            strokeLinejoin="round"
          />
          <ellipse cx="82" cy="164" rx="8.5" ry="6" fill="#FBCFE8" stroke="#2C1B18" strokeWidth="2.8" />
          <ellipse cx="118" cy="164" rx="8.5" ry="6" fill="#FBCFE8" stroke="#2C1B18" strokeWidth="2.8" />

          {!isCustomPet && (
            <g id="unicorn-head">
              {/* Ears */}
              <path d="M 70 66 C 58 52 60 36 76 42 Z" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3" strokeLinejoin="round" />
              <path d="M 130 66 C 142 52 140 36 124 42 Z" fill="#FFFDF8" stroke="#2C1B18" strokeWidth="3" strokeLinejoin="round" />

              {/* Spiral Golden Pearl Horn */}
              <polygon points="100,16 93,52 107,52" fill="#FDE047" stroke="#2C1B18" strokeWidth="2.4" strokeLinejoin="round" />
              <line x1="95" y1="42" x2="105" y2="40" stroke="#F59E0B" strokeWidth="2" />
              <line x1="97" y1="30" x2="103" y2="28" stroke="#F59E0B" strokeWidth="2" />

              {/* Soft Rainbow Forelock Mane */}
              <path d="M 86 52 C 80 62 88 74 94 66" stroke="#F472B6" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 94 50 C 90 60 98 72 104 64" stroke="#67E8F9" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 104 52 C 100 62 108 74 114 66" stroke="#C084FC" strokeWidth="5" strokeLinecap="round" fill="none" />

              <ellipse cx="100" cy="80" rx="36" ry="29" fill="url(#grad-pure-cream)" stroke="#2C1B18" strokeWidth="3.4" />
              <ellipse cx="100" cy="88" rx="13" ry="9" fill="#FDF2F8" stroke="#2C1B18" strokeWidth="2.2" />

              {renderEyes(82, 118, 75, 7)}
              {renderMouthAndCheeks(100, 89, 24, 'simple')}
            </g>
          )}
        </g>
      );
    }

    // Default Fallback: Classic Cute Puppy
    return (
      <g id="default-pet">
        <path
          d="M 72 120 C 62 138 66 166 100 166 C 134 166 138 138 128 120 C 122 110 78 110 72 120 Z"
          fill="url(#grad-warm-biscuit)"
          stroke="#2C1B18"
          strokeWidth="3.4"
          strokeLinejoin="round"
        />
        <ellipse cx="100" cy="80" rx="36" ry="30" fill="url(#grad-warm-biscuit)" stroke="#2C1B18" strokeWidth="3.4" />
        {renderEyes(82, 118, 75, 7)}
        {renderMouthAndCheeks(100, 89, 25, 'dog_smile')}
      </g>
    );
  };

  return (
    <div 
      className={`inline-block relative select-none ${className}`} 
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible"
        style={{
          filter: 'drop-shadow(0px 8px 18px rgba(35, 26, 24, 0.08))',
          transform: `scale(${growthScale})`,
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <defs>
          {/* Subtle 2.5D Volumetric Color Gradients (Soft, rich marshmallow/mochi depth) */}
          <radialGradient id="grad-warm-biscuit" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF9EB" />
            <stop offset="60%" stopColor="#F6DFC2" />
            <stop offset="100%" stopColor="#E5C197" />
          </radialGradient>

          <radialGradient id="grad-warm-caramel" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>

          <radialGradient id="grad-soft-peach" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="60%" stopColor="#FFE4E6" />
            <stop offset="100%" stopColor="#FECDD3" />
          </radialGradient>

          <radialGradient id="grad-pure-cream" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#FFFDF5" />
            <stop offset="100%" stopColor="#F5EFE6" />
          </radialGradient>

          <radialGradient id="grad-strawberry-milk" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFF1F2" />
            <stop offset="60%" stopColor="#FBCFE8" />
            <stop offset="100%" stopColor="#F472B6" />
          </radialGradient>

          <radialGradient id="grad-soft-golden" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="65%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </radialGradient>

          <radialGradient id="grad-pastel-mint" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ECFDF5" />
            <stop offset="60%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </radialGradient>

          <radialGradient id="grad-warm-honey" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="60%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </radialGradient>

          <radialGradient id="grad-warm-apricot" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="60%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </radialGradient>

          <radialGradient id="grad-soft-cloud" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#F0F9FF" />
            <stop offset="60%" stopColor="#E0E7FF" />
            <stop offset="100%" stopColor="#C7D2FE" />
          </radialGradient>
        </defs>

        {/* Soft Floor Shadow so Pet Sits Comfortably */}
        <ellipse cx="100" cy="174" rx="44" ry="7.5" fill="#2C1B18" opacity="0.09" />

        {/* Live Breathing Micro-Motion Group */}
        <g 
          transform={breathe ? "translate(0, -1.8) scale(1.015, 0.99)" : "translate(0, 0) scale(1, 1)"}
          style={{ transformOrigin: '100px 166px', transition: 'transform 1.8s ease-in-out' }}
        >
          {/* Main Animal Body & Head Vector Art */}
          {renderAnimalBodyAndHead()}

          {/* Custom Uploaded Head if Active */}
          {renderCustomHeadLayer()}

          {/* Accessories Layer */}
          {renderAccessory()}
        </g>

        {/* Floating Tap Reaction Hearts */}
        {showHearts && (
          <g className="animate-bounce pointer-events-none">
            <path d="M 80 40 C 74 30 62 36 62 48 C 62 62 80 74 80 74 C 80 74 98 62 98 48 C 98 36 86 30 80 40 Z" fill="#FB7185" />
            <path d="M 125 35 C 120 27 110 32 110 42 C 110 54 125 64 125 64 C 125 64 140 54 140 42 C 140 32 130 27 125 35 Z" fill="#F43F5E" />
          </g>
        )}
      </svg>
    </div>
  );
};
