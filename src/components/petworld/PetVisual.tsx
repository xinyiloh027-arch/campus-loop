import React, { useState, useEffect } from 'react';
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

export const PetVisual: React.FC<PetVisualProps> = ({
  type = 'corgi',
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

  // Periodic blinking and breathing
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800 + Math.random() * 2000);

    const breatheInterval = setInterval(() => {
      setBreathe(prev => !prev);
    }, 1800);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(breatheInterval);
    };
  }, []);

  // Growth scale adjustments
  const growthScale = growthStage === 'baby' ? 0.86 : growthStage === 'grown' ? 1.12 : 1.0;
  const isSleepy = mood === 'sleepy' || actionState === 'sleeping';
  const isEating = actionState === 'eating';
  const isBathing = actionState === 'bathing';
  const isPlaying = actionState === 'playing';

  // Eye Rendering Helper
  const renderEyes = (lx: number, rx: number, y: number, eyeSize: number = 7) => {
    if (isSleepy || blink) {
      return (
        <g stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d={`M ${lx - 6} ${y} Q ${lx} ${y + 4} ${lx + 6} ${y}`} />
          <path d={`M ${rx - 6} ${y} Q ${rx} ${y + 4} ${rx + 6} ${y}`} />
        </g>
      );
    }

    if (mood === 'excited' || isPlaying) {
      return (
        <g fill="#F59E0B">
          {/* Star eyes */}
          <polygon points={`${lx},${y-7} ${lx+2},${y-2} ${lx+7},${y} ${lx+2},${y+2} ${lx},${y+7} ${lx-2},${y+2} ${lx-7},${y} ${lx-2},${y-2}`} />
          <polygon points={`${rx},${y-7} ${rx+2},${y-2} ${rx+7},${y} ${rx+2},${y+2} ${rx},${y+7} ${rx-2},${y+2} ${rx-7},${y} ${rx-2},${y-2}`} />
        </g>
      );
    }

    if (mood === 'hungry') {
      return (
        <g>
          <ellipse cx={lx} cy={y} rx={eyeSize} ry={eyeSize * 1.15} fill="#1E293B" />
          <ellipse cx={rx} cy={y} rx={eyeSize} ry={eyeSize * 1.15} fill="#1E293B" />
          {/* Shiny pleading highlights */}
          <circle cx={lx - 2} cy={y - 2.5} r="3" fill="#FFFFFF" />
          <circle cx={rx - 2} cy={y - 2.5} r="3" fill="#FFFFFF" />
          <circle cx={lx + 2} cy={y + 2.5} r="1.5" fill="#FFFFFF" />
          <circle cx={rx + 2} cy={y + 2.5} r="1.5" fill="#FFFFFF" />
        </g>
      );
    }

    // Default cute sparkling eyes
    return (
      <g>
        <ellipse cx={lx} cy={y} rx={eyeSize} ry={eyeSize * 1.12} fill="#1A1A24" />
        <ellipse cx={rx} cy={y} rx={eyeSize} ry={eyeSize * 1.12} fill="#1A1A24" />
        {/* Main highlight */}
        <circle cx={lx - 2.2} cy={y - 2.2} r="2.8" fill="#FFFFFF" />
        <circle cx={rx - 2.2} cy={y - 2.2} r="2.8" fill="#FFFFFF" />
        {/* Secondary tiny sparkle */}
        <circle cx={lx + 2} cy={y + 2} r="1.3" fill="#FFFFFF" />
        <circle cx={rx + 2} cy={y + 2} r="1.3" fill="#FFFFFF" />
      </g>
    );
  };

  // Cheeks & Mouth
  const renderMouthAndCheeks = (cx: number, cy: number, blushWidth: number = 24) => {
    return (
      <g>
        {/* Rosy blush */}
        <ellipse cx={cx - blushWidth} cy={cy + 1} rx="8" ry="4.5" fill="#FFAAA6" opacity="0.65" />
        <ellipse cx={cx + blushWidth} cy={cy + 1} rx="8" ry="4.5" fill="#FFAAA6" opacity="0.65" />

        {/* Mouth */}
        {isEating ? (
          <ellipse cx={cx} cy={cy + 4} rx="4.5" ry="3.5" fill="#E11D48" />
        ) : isSleepy ? (
          <ellipse cx={cx} cy={cy + 3} rx="2.5" ry="3" fill="#4A3E3D" />
        ) : mood === 'excited' || mood === 'happy' ? (
          <path
            d={`M ${cx - 6} ${cy + 2} Q ${cx} ${cy + 8} ${cx + 6} ${cy + 2}`}
            stroke="#2C1810"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="#FF758F"
          />
        ) : (
          <path
            d={`M ${cx - 5} ${cy + 2} Q ${cx - 2} ${cy + 5} ${cx} ${cy + 2} Q ${cx + 2} ${cy + 5} ${cx + 5} ${cy + 2}`}
            stroke="#2C1810"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>
    );
  };

  // Accessories rendering
  const renderAccessoryOverlay = () => {
    switch (accessory) {
      case 'grad_cap':
        return (
          <g id="acc-grad-cap" transform="translate(0, -6)">
            <polygon points="100,26 142,40 100,54 58,40" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="83" y="45" width="34" height="12" rx="4" fill="#1E293B" />
            <circle cx="100" cy="40" r="3.2" fill="#F59E0B" />
            <path d="M 100 40 Q 132 44 134 66" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="131" y="66" width="6" height="8" rx="2" fill="#F59E0B" />
          </g>
        );
      case 'party_crown':
        return (
          <g id="acc-party-crown" transform="translate(0, -8)">
            <polygon points="76,46 82,24 92,36 100,20 108,36 118,24 124,46" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
            <rect x="74" y="44" width="52" height="7" rx="3" fill="#F59E0B" />
            <circle cx="100" cy="47.5" r="2.2" fill="#DC2626" />
            <circle cx="85" cy="47.5" r="1.8" fill="#2563EB" />
            <circle cx="115" cy="47.5" r="1.8" fill="#10B981" />
          </g>
        );
      case 'flower_crown':
        return (
          <g id="acc-flower-crown" transform="translate(0, -6)">
            {/* Vine */}
            <path d="M 70 48 Q 100 42 130 48" stroke="#059669" strokeWidth="2.5" fill="none" />
            {/* Flowers */}
            {[74, 87, 100, 113, 126].map((fx, i) => (
              <g key={i}>
                <circle cx={fx} cy={45 + (i % 2) * 2} r="5" fill={i % 2 === 0 ? '#FDA4AF' : '#FDE047'} />
                <circle cx={fx} cy={45 + (i % 2) * 2} r="2" fill="#FFFFFF" />
              </g>
            ))}
          </g>
        );
      case 'beanie':
        return (
          <g id="acc-beanie" transform="translate(0, -6)">
            <ellipse cx="100" cy="46" rx="28" ry="18" fill="#E0E7FF" stroke="#6366F1" strokeWidth="1.5" />
            <rect x="72" y="48" width="56" height="9" rx="4" fill="#C7D2FE" stroke="#6366F1" strokeWidth="1.2" />
            <circle cx="100" cy="27" r="6" fill="#818CF8" />
          </g>
        );
      case 'chef_hat':
        return (
          <g id="acc-chef-hat" transform="translate(0, -10)">
            <ellipse cx="88" cy="28" rx="14" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <ellipse cx="112" cy="28" rx="14" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <ellipse cx="100" cy="22" rx="16" ry="14" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
            <rect x="80" y="38" width="40" height="12" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          </g>
        );
      case 'glasses':
        return (
          <g id="acc-glasses" stroke="#334155" strokeWidth="2.5" fill="none">
            <circle cx="85" cy="85" r="13" fill="#F8FAFC" fillOpacity="0.25" />
            <circle cx="115" cy="85" r="13" fill="#F8FAFC" fillOpacity="0.25" />
            <line x1="98" y1="85" x2="102" y2="85" strokeWidth="3" />
            <line x1="72" y1="83" x2="64" y2="80" />
            <line x1="128" y1="83" x2="136" y2="80" />
          </g>
        );
      case 'cool_shades':
        return (
          <g id="acc-cool-shades">
            <polygon points="70,78 98,78 94,94 74,94" fill="#0F172A" />
            <polygon points="102,78 130,78 126,94 106,94" fill="#0F172A" />
            <line x1="98" y1="80" x2="102" y2="80" stroke="#0F172A" strokeWidth="3.5" />
            <line x1="70" y1="80" x2="62" y2="78" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="130" y1="80" x2="138" y2="78" stroke="#0F172A" strokeWidth="2.5" />
            {/* White shine lines */}
            <line x1="74" y1="82" x2="86" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="106" y1="82" x2="118" y2="92" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
          </g>
        );
      case 'bow':
        return (
          <g id="acc-bow" transform="translate(0, 10)">
            <polygon points="100,105 84,95 84,115" fill="#FB7185" />
            <polygon points="100,105 116,95 116,115" fill="#FB7185" />
            <circle cx="100" cy="105" r="4.5" fill="#F43F5E" />
            {/* Ribbon tails */}
            <path d="M 98 108 Q 94 120 90 124" stroke="#FB7185" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 102 108 Q 106 120 110 124" stroke="#FB7185" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'scarf':
        return (
          <g id="acc-scarf">
            <ellipse cx="100" cy="114" rx="28" ry="10" fill="#E11D48" />
            <ellipse cx="100" cy="114" rx="28" ry="10" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" />
            {/* Tail hanging down */}
            <rect x="110" y="112" width="12" height="24" rx="4" fill="#E11D48" />
            <line x1="110" y1="122" x2="122" y2="122" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="110" y1="130" x2="122" y2="130" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="112" y1="136" x2="112" y2="140" stroke="#FDE047" strokeWidth="1.5" />
            <line x1="116" y1="136" x2="116" y2="140" stroke="#FDE047" strokeWidth="1.5" />
            <line x1="120" y1="136" x2="120" y2="140" stroke="#FDE047" strokeWidth="1.5" />
          </g>
        );
      case 'sweater':
        return (
          <g id="acc-sweater">
            <path d="M 72 120 C 72 110 128 110 128 120 L 134 160 L 66 160 Z" fill="#2563EB" opacity="0.95" />
            {/* Varsity V */}
            <polygon points="90,120 100,135 110,120 106,120 100,130 94,120" fill="#FBBF24" />
            <line x1="68" y1="154" x2="132" y2="154" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        );
      case 'raincoat':
        return (
          <g id="acc-raincoat">
            <path d="M 70 118 C 70 108 130 108 130 118 L 136 160 L 64 160 Z" fill="#FBBF24" opacity="0.95" />
            <circle cx="100" cy="128" r="2.5" fill="#B45309" />
            <circle cx="100" cy="140" r="2.5" fill="#B45309" />
            <circle cx="100" cy="152" r="2.5" fill="#B45309" />
          </g>
        );
      case 'badge':
        return (
          <g id="acc-badge" transform="translate(18, 28)">
            <polygon points="100,90 103,96 110,96 105,100 107,106 100,102 93,106 95,100 90,96 97,96" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
          </g>
        );
      case 'bell_collar':
        return (
          <g id="acc-bell-collar">
            <path d="M 75 112 Q 100 118 125 112" stroke="#DC2626" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="116" r="4.5" fill="#FBBF24" stroke="#B45309" strokeWidth="1" />
            <circle cx="100" cy="117" r="1.2" fill="#78350F" />
          </g>
        );
      default:
        return null;
    }
  };

  // Custom Uploaded Head Render
  const renderCustomHead = () => {
    if (!customHead?.imageUrl) return null;

    const zoom = customHead.zoom || 1.0;
    const ox = customHead.offsetX || 0;
    const oy = customHead.offsetY || 0;
    const rot = customHead.rotation || 0;
    const flip = customHead.flipHorizontal ? -1 : 1;
    const mask = customHead.maskShape || 'smooth';

    const clipId = `head-mask-${Math.random().toString(36).substring(2, 7)}`;

    return (
      <g id="custom-head-container">
        <defs>
          <clipPath id={clipId}>
            {mask === 'circle' ? (
              <circle cx="100" cy="80" r="38" />
            ) : mask === 'oval' ? (
              <ellipse cx="100" cy="80" rx="35" ry="42" />
            ) : mask === 'collar' ? (
              <path d="M 68 80 C 68 55 132 55 132 80 C 132 108 118 116 100 116 C 82 116 68 108 68 80 Z" />
            ) : (
              // Default smooth rounded
              <rect x="66" y="44" width="68" height="72" rx="32" ry="32" />
            )}
          </clipPath>
        </defs>

        {/* Head Collar Ring to blend seamlessly */}
        <ellipse cx="100" cy="114" rx="28" ry="8" fill="#3B82F6" opacity="0.3" />

        {/* The Clipped Uploaded Image with Pan / Zoom / Rotation */}
        <g clipPath={`url(#${clipId})`}>
          <g transform={`translate(${100 + ox}, ${80 + oy}) rotate(${rot}) scale(${zoom * flip}, ${zoom}) translate(-50, -50)`}>
            <image
              href={customHead.imageUrl}
              x="0"
              y="0"
              width="100"
              height="100"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </g>

        {/* Charming aesthetic head border highlight */}
        <rect
          x="66"
          y="44"
          width="68"
          height="72"
          rx="32"
          ry="32"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeOpacity="0.6"
        />

        {/* Cute blush applied on top */}
        <ellipse cx="76" cy="94" rx="7" ry="4" fill="#FFAAA6" opacity="0.65" />
        <ellipse cx="124" cy="94" rx="7" ry="4" fill="#FFAAA6" opacity="0.65" />
      </g>
    );
  };

  // Dedicated Renderers for each species
  const renderAnimalBody = () => {
    // 1. CORGI
    if (type === 'corgi') {
      return (
        <g id="corgi">
          {/* Rear Little Feet */}
          <ellipse cx="72" cy="168" rx="10" ry="6" fill="#D97706" />
          <ellipse cx="128" cy="168" rx="10" ry="6" fill="#D97706" />

          {/* Body */}
          <ellipse cx="100" cy="136" rx="36" ry="30" fill="#F59E0B" />
          {/* White Chest & Tummy */}
          <path d="M 86 118 Q 100 134 114 118 Q 120 156 100 162 Q 80 156 86 118 Z" fill="#FFFBEB" />

          {/* Front Paws */}
          <ellipse cx="84" cy="166" rx="8" ry="6" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
          <ellipse cx="116" cy="166" rx="8" ry="6" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />

          {!isCustomPet && (
            <g id="corgi-head">
              {/* Giant Perky Ears */}
              <polygon points="65,68 52,24 82,46" fill="#D97706" />
              <polygon points="66,64 56,30 78,46" fill="#FDE68A" />

              <polygon points="135,68 148,24 118,46" fill="#D97706" />
              <polygon points="134,64 144,30 122,46" fill="#FDE68A" />

              {/* Head */}
              <ellipse cx="100" cy="80" rx="34" ry="28" fill="#F59E0B" />
              {/* White Blaze between eyes */}
              <path d="M 94 56 Q 100 52 106 56 L 108 94 Q 100 100 92 94 Z" fill="#FFFBEB" />

              {/* Cute Snout */}
              <ellipse cx="100" cy="88" rx="13" ry="9" fill="#FFFBEB" />
              <ellipse cx="100" cy="84" rx="4.5" ry="3" fill="#2C1810" />

              {renderEyes(84, 116, 76)}
              {renderMouthAndCheeks(100, 89, 24)}
            </g>
          )}
        </g>
      );
    }

    // 2. SHIBA INU
    if (type === 'shiba') {
      return (
        <g id="shiba">
          <ellipse cx="74" cy="166" rx="10" ry="6" fill="#B45309" />
          <ellipse cx="126" cy="166" rx="10" ry="6" fill="#B45309" />
          {/* Curly tail */}
          <path d="M 132 136 Q 148 120 144 112 Q 138 108 132 122" stroke="#D97706" strokeWidth="8" strokeLinecap="round" fill="none" />

          <ellipse cx="100" cy="136" rx="34" ry="28" fill="#D97706" />
          <path d="M 88 120 Q 100 134 112 120 Q 118 156 100 162 Q 82 156 88 120 Z" fill="#FEF3C7" />

          <ellipse cx="86" cy="164" rx="8" ry="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />
          <ellipse cx="114" cy="164" rx="8" ry="6" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.5" />

          {!isCustomPet && (
            <g id="shiba-head">
              <polygon points="68,66 60,32 86,52" fill="#B45309" />
              <polygon points="70,62 64,38 82,52" fill="#FDE68A" />
              <polygon points="132,66 140,32 114,52" fill="#B45309" />
              <polygon points="130,62 136,38 118,52" fill="#FDE68A" />

              <ellipse cx="100" cy="80" rx="34" ry="28" fill="#D97706" />
              {/* White cheek patches (Urajiro) */}
              <ellipse cx="78" cy="88" rx="14" ry="12" fill="#FEF3C7" />
              <ellipse cx="122" cy="88" rx="14" ry="12" fill="#FEF3C7" />
              {/* White eyebrows */}
              <ellipse cx="84" cy="67" rx="3.5" ry="2.5" fill="#FEF3C7" />
              <ellipse cx="116" cy="67" rx="3.5" ry="2.5" fill="#FEF3C7" />

              <ellipse cx="100" cy="88" rx="11" ry="8" fill="#FEF3C7" />
              <polygon points="96,82 104,82 100,86" fill="#2C1810" />

              {renderEyes(85, 115, 76)}
              {renderMouthAndCheeks(100, 89, 23)}
            </g>
          )}
        </g>
      );
    }

    // 3. FLOPPY HOUND PUPPY
    if (type === 'floppy_puppy' || type === 'puppy') {
      return (
        <g id="puppy">
          <ellipse cx="74" cy="166" rx="10" ry="6" fill="#F59E0B" />
          <ellipse cx="126" cy="166" rx="10" ry="6" fill="#F59E0B" />
          <ellipse cx="100" cy="138" rx="34" ry="28" fill="#FDE68A" />
          <ellipse cx="100" cy="140" rx="20" ry="18" fill="#FFFFFF" />

          <ellipse cx="86" cy="164" rx="8" ry="6" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />
          <ellipse cx="114" cy="164" rx="8" ry="6" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="1" />

          {!isCustomPet && (
            <g id="puppy-head">
              {/* Big Velvety Drooping Ears */}
              <path d="M 68 64 C 52 74 46 102 54 116 C 60 120 70 114 72 100 Z" fill="#D97706" />
              <path d="M 132 64 C 148 74 154 102 146 116 C 140 120 130 114 128 100 Z" fill="#D97706" />

              <ellipse cx="100" cy="80" rx="33" ry="28" fill="#FDE68A" />
              <ellipse cx="100" cy="88" rx="14" ry="10" fill="#FFFFFF" />
              <ellipse cx="100" cy="84" rx="5" ry="3.5" fill="#2C1810" />

              {renderEyes(84, 116, 75, 7.5)}
              {renderMouthAndCheeks(100, 89, 23)}
            </g>
          )}
        </g>
      );
    }

    // 4. KITTEN / FLUFFY CAT / CALICO CAT
    if (type === 'kitten' || type === 'fluffy_cat' || type === 'calico_cat' || type === 'cat') {
      const isCalico = type === 'calico_cat';
      const isFluffy = type === 'fluffy_cat';
      const baseBodyColor = isFluffy ? '#EDE9FE' : '#FDF4E3';

      return (
        <g id="cat">
          {/* Swishing Tail */}
          <path d="M 130 144 Q 152 140 148 116" stroke={isCalico ? '#EA580C' : baseBodyColor} strokeWidth="7" strokeLinecap="round" fill="none" />

          <ellipse cx="100" cy="140" rx="34" ry="28" fill={baseBodyColor} />
          {isCalico && (
            <ellipse cx="118" cy="136" rx="14" ry="12" fill="#334155" opacity="0.8" />
          )}

          {/* Front Paws */}
          <ellipse cx="86" cy="164" rx="8" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <ellipse cx="114" cy="164" rx="8" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

          {!isCustomPet && (
            <g id="cat-head">
              {/* Pointed Cat Ears */}
              <polygon points="68,64 60,30 84,48" fill={isCalico ? '#334155' : baseBodyColor} />
              <polygon points="70,60 64,36 80,48" fill="#FFAAA6" />
              <polygon points="132,64 140,30 116,48" fill={isCalico ? '#EA580C' : baseBodyColor} />
              <polygon points="130,60 136,36 120,48" fill="#FFAAA6" />

              {/* Head */}
              <ellipse cx="100" cy="80" rx="34" ry="27" fill={baseBodyColor} />
              {isCalico && (
                <path d="M 76 60 Q 90 60 90 74 Q 74 78 76 60 Z" fill="#EA580C" />
              )}

              {/* Whiskers */}
              <line x1="60" y1="88" x2="76" y2="87" stroke="#94A3B8" strokeWidth="1.4" />
              <line x1="58" y1="94" x2="76" y2="92" stroke="#94A3B8" strokeWidth="1.4" />
              <line x1="140" y1="88" x2="124" y2="87" stroke="#94A3B8" strokeWidth="1.4" />
              <line x1="142" y1="94" x2="124" y2="92" stroke="#94A3B8" strokeWidth="1.4" />

              <polygon points="97,84 103,84 100,87" fill="#F43F5E" />

              {renderEyes(84, 116, 76, 7)}
              {renderMouthAndCheeks(100, 89, 23)}
            </g>
          )}
        </g>
      );
    }

    // 5. TEACUP PIGLET
    if (type === 'piglet') {
      return (
        <g id="piglet">
          {/* Little curly tail */}
          <path d="M 132 142 Q 146 134 142 126 Q 134 122 136 132" stroke="#FB7185" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Chubby Pink Body */}
          <ellipse cx="100" cy="140" rx="35" ry="29" fill="#FCE7F3" />
          <ellipse cx="85" cy="165" rx="8" ry="6" fill="#F472B6" />
          <ellipse cx="115" cy="165" rx="8" ry="6" fill="#F472B6" />

          {!isCustomPet && (
            <g id="piglet-head">
              {/* Floppy Triangle Ears */}
              <polygon points="70,65 58,40 82,48" fill="#F472B6" />
              <polygon points="130,65 142,40 118,48" fill="#F472B6" />

              <ellipse cx="100" cy="80" rx="34" ry="28" fill="#FCE7F3" />

              {/* Big Cute Snout */}
              <ellipse cx="100" cy="88" rx="14" ry="10" fill="#F472B6" />
              <ellipse cx="96" cy="88" rx="2.5" ry="3.5" fill="#BE185D" />
              <ellipse cx="104" cy="88" rx="2.5" ry="3.5" fill="#BE185D" />

              {renderEyes(84, 116, 75, 6.8)}
              {renderMouthAndCheeks(100, 93, 24)}
            </g>
          )}
        </g>
      );
    }

    // 6. BABY CROCODILE
    if (type === 'crocodile') {
      return (
        <g id="crocodile">
          {/* Ridged Tail */}
          <path d="M 126 148 Q 156 154 152 132" stroke="#10B981" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Body */}
          <ellipse cx="100" cy="142" rx="34" ry="26" fill="#10B981" />
          <ellipse cx="100" cy="142" rx="22" ry="18" fill="#A7F3D0" />

          {/* Paws with gentle claws */}
          <ellipse cx="84" cy="165" rx="8" ry="5" fill="#059669" />
          <ellipse cx="116" cy="165" rx="8" ry="5" fill="#059669" />

          {!isCustomPet && (
            <g id="croc-head">
              {/* Back head bumps */}
              <circle cx="82" cy="58" r="9" fill="#059669" />
              <circle cx="118" cy="58" r="9" fill="#059669" />

              <ellipse cx="100" cy="80" rx="34" ry="26" fill="#10B981" />

              {/* Snout */}
              <rect x="80" y="80" width="40" height="18" rx="9" fill="#059669" />
              <circle cx="92" cy="84" r="2" fill="#064E3B" />
              <circle cx="108" cy="84" r="2" fill="#064E3B" />
              {/* Friendly tooth */}
              <polygon points="98,92 102,92 100,96" fill="#FFFFFF" />

              {renderEyes(82, 118, 68, 7.5)}
              {renderMouthAndCheeks(100, 91, 24)}
            </g>
          )}
        </g>
      );
    }

    // 7. RABBIT / BUNNY
    if (type === 'rabbit' || type === 'bunny') {
      return (
        <g id="rabbit">
          {/* Fluffy tail */}
          <circle cx="134" cy="144" r="9" fill="#FFFFFF" />

          <ellipse cx="100" cy="140" rx="33" ry="28" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <ellipse cx="85" cy="165" rx="8" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <ellipse cx="115" cy="165" rx="8" ry="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />

          {!isCustomPet && (
            <g id="rabbit-head">
              {/* Long Ears */}
              <ellipse cx="78" cy="40" rx="9" ry="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              <ellipse cx="78" cy="40" rx="5" ry="20" fill="#FFAAA6" opacity="0.7" />

              <ellipse cx="122" cy="40" rx="9" ry="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              <ellipse cx="122" cy="40" rx="5" ry="20" fill="#FFAAA6" opacity="0.7" />

              <ellipse cx="100" cy="80" rx="33" ry="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
              <polygon points="97,84 103,84 100,87" fill="#F43F5E" />

              {renderEyes(84, 116, 75, 7)}
              {renderMouthAndCheeks(100, 90, 22)}
            </g>
          )}
        </g>
      );
    }

    // 8. HAMSTER
    if (type === 'hamster') {
      return (
        <g id="hamster">
          <ellipse cx="100" cy="140" rx="35" ry="30" fill="#FBBF24" />
          <ellipse cx="100" cy="142" rx="22" ry="18" fill="#FFFBEB" />
          <ellipse cx="85" cy="166" rx="8" ry="5" fill="#F59E0B" />
          <ellipse cx="115" cy="166" rx="8" ry="5" fill="#F59E0B" />

          {!isCustomPet && (
            <g id="hamster-head">
              <circle cx="68" cy="58" r="9" fill="#F59E0B" />
              <circle cx="68" cy="58" r="5" fill="#FDE68A" />
              <circle cx="132" cy="58" r="9" fill="#F59E0B" />
              <circle cx="132" cy="58" r="5" fill="#FDE68A" />

              <ellipse cx="100" cy="80" rx="35" ry="28" fill="#FBBF24" />
              {/* Chubby cheek pouches */}
              <circle cx="74" cy="88" r="13" fill="#FFFBEB" />
              <circle cx="126" cy="88" r="13" fill="#FFFBEB" />

              <polygon points="97,83 103,83 100,86" fill="#F43F5E" />
              {/* Holding seed in paws */}
              <ellipse cx="100" cy="116" rx="5" ry="8" fill="#78350F" transform="rotate(15 100 116)" />

              {renderEyes(84, 116, 74, 6.8)}
              {renderMouthAndCheeks(100, 88, 25)}
            </g>
          )}
        </g>
      );
    }

    // 9. PENGUIN
    if (type === 'penguin') {
      return (
        <g id="penguin">
          <ellipse cx="100" cy="140" rx="34" ry="30" fill="#1E293B" />
          {/* White Belly */}
          <ellipse cx="100" cy="142" rx="22" ry="22" fill="#FFFFFF" />

          {/* Little flippers */}
          <path d="M 66 128 Q 54 140 68 152" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 134 128 Q 146 140 132 152" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Orange feet */}
          <ellipse cx="86" cy="168" rx="9" ry="5" fill="#F97316" />
          <ellipse cx="114" cy="168" rx="9" ry="5" fill="#F97316" />

          {!isCustomPet && (
            <g id="penguin-head">
              <ellipse cx="100" cy="80" rx="32" ry="27" fill="#1E293B" />
              <path d="M 80 72 Q 100 68 120 72 L 118 90 Q 100 96 82 90 Z" fill="#FFFFFF" />

              {/* Orange beak */}
              <polygon points="94,84 106,84 100,92" fill="#F97316" />

              {renderEyes(86, 114, 76, 6.5)}
              {renderMouthAndCheeks(100, 89, 21)}
            </g>
          )}
        </g>
      );
    }

    // 10. DUCK
    if (type === 'duck') {
      return (
        <g id="duck">
          <ellipse cx="100" cy="140" rx="34" ry="28" fill="#FACC15" />
          <ellipse cx="86" cy="166" rx="9" ry="5" fill="#F97316" />
          <ellipse cx="114" cy="166" rx="9" ry="5" fill="#F97316" />

          {!isCustomPet && (
            <g id="duck-head">
              {/* Tuft of duck feather */}
              <path d="M 98 52 Q 102 44 106 50" stroke="#EAB308" strokeWidth="2.5" fill="none" />

              <ellipse cx="100" cy="80" rx="32" ry="26" fill="#FACC15" />
              {/* Rounded duck bill */}
              <ellipse cx="100" cy="88" rx="14" ry="7" fill="#F97316" />
              <circle cx="96" cy="86" r="1.5" fill="#7C2D12" />
              <circle cx="104" cy="86" r="1.5" fill="#7C2D12" />

              {renderEyes(84, 116, 75, 6.8)}
              {renderMouthAndCheeks(100, 92, 23)}
            </g>
          )}
        </g>
      );
    }

    // 11. FOX
    if (type === 'fox') {
      return (
        <g id="fox">
          {/* Big White-tipped Fluffy Tail */}
          <path d="M 128 148 Q 156 136 150 110" stroke="#EA580C" strokeWidth="12" strokeLinecap="round" fill="none" />
          <circle cx="150" cy="110" r="7" fill="#FFFFFF" />

          <ellipse cx="100" cy="140" rx="33" ry="28" fill="#EA580C" />
          <path d="M 88 120 Q 100 134 112 120 Q 116 156 100 160 Q 84 156 88 120 Z" fill="#FFFFFF" />

          <ellipse cx="86" cy="164" rx="8" ry="6" fill="#1E293B" />
          <ellipse cx="114" cy="164" rx="8" ry="6" fill="#1E293B" />

          {!isCustomPet && (
            <g id="fox-head">
              <polygon points="66,66 58,28 86,48" fill="#EA580C" />
              <polygon points="68,62 62,34 82,48" fill="#1E293B" />
              <polygon points="134,66 142,28 114,48" fill="#EA580C" />
              <polygon points="132,62 138,34 118,48" fill="#1E293B" />

              <ellipse cx="100" cy="80" rx="34" ry="27" fill="#EA580C" />
              <polygon points="70,82 100,102 100,74" fill="#FFFFFF" />
              <polygon points="130,82 100,102 100,74" fill="#FFFFFF" />
              <polygon points="96,87 104,87 100,91" fill="#1E293B" />

              {renderEyes(85, 115, 75, 6.8)}
              {renderMouthAndCheeks(100, 92, 22)}
            </g>
          )}
        </g>
      );
    }

    // 12. BEAR
    if (type === 'bear') {
      return (
        <g id="bear">
          <ellipse cx="100" cy="140" rx="36" ry="30" fill="#92400E" />
          <ellipse cx="100" cy="142" rx="22" ry="18" fill="#FDE68A" />
          <ellipse cx="85" cy="166" rx="9" ry="6" fill="#78350F" />
          <ellipse cx="115" cy="166" rx="9" ry="6" fill="#78350F" />

          {!isCustomPet && (
            <g id="bear-head">
              <circle cx="68" cy="56" r="10" fill="#92400E" />
              <circle cx="68" cy="56" r="5" fill="#FDE68A" />
              <circle cx="132" cy="56" r="10" fill="#92400E" />
              <circle cx="132" cy="56" r="5" fill="#FDE68A" />

              <ellipse cx="100" cy="80" rx="35" ry="28" fill="#92400E" />
              <ellipse cx="100" cy="88" rx="14" ry="10" fill="#FDE68A" />
              <ellipse cx="100" cy="83" rx="5" ry="3.5" fill="#451A03" />

              {renderEyes(84, 116, 75, 7)}
              {renderMouthAndCheeks(100, 89, 24)}
            </g>
          )}
        </g>
      );
    }

    // 13. CAPYBARA
    if (type === 'capybara') {
      return (
        <g id="capybara">
          <ellipse cx="100" cy="142" rx="36" ry="28" fill="#B45309" />
          <ellipse cx="85" cy="166" rx="8" ry="6" fill="#78350F" />
          <ellipse cx="115" cy="166" rx="8" ry="6" fill="#78350F" />

          {!isCustomPet && (
            <g id="capybara-head">
              {/* Cute tiny round ears */}
              <circle cx="72" cy="62" r="6" fill="#78350F" />
              <circle cx="128" cy="62" r="6" fill="#78350F" />

              {/* Classic Rectangular Capybara Snout Head */}
              <rect x="74" y="60" width="52" height="42" rx="16" fill="#B45309" />
              <ellipse cx="100" cy="94" rx="12" ry="7" fill="#78350F" />
              <circle cx="96" cy="93" r="1.5" fill="#451A03" />
              <circle cx="104" cy="93" r="1.5" fill="#451A03" />

              {/* Zen calm eyes */}
              {renderEyes(86, 114, 76, 6)}
              {renderMouthAndCheeks(100, 96, 22)}

              {/* Tiny yuzu / orange on head! */}
              <circle cx="100" cy="54" r="6.5" fill="#F97316" />
              <ellipse cx="100" cy="48" rx="1.5" ry="3" fill="#15803D" />
            </g>
          )}
        </g>
      );
    }

    // 14. RED PANDA
    if (type === 'red_panda') {
      return (
        <g id="red_panda">
          {/* Ringed Tail */}
          <path d="M 126 148 Q 156 136 150 110" stroke="#C2410C" strokeWidth="12" strokeLinecap="round" fill="none" />
          <line x1="140" y1="130" x2="148" y2="124" stroke="#FFF7ED" strokeWidth="3" />
          <line x1="145" y1="120" x2="152" y2="114" stroke="#FFF7ED" strokeWidth="3" />

          <ellipse cx="100" cy="140" rx="34" ry="28" fill="#C2410C" />
          <ellipse cx="100" cy="144" rx="20" ry="18" fill="#1C1917" />
          <ellipse cx="85" cy="166" rx="8" ry="6" fill="#1C1917" />
          <ellipse cx="115" cy="166" rx="8" ry="6" fill="#1C1917" />

          {!isCustomPet && (
            <g id="red-panda-head">
              <polygon points="68,64 60,34 86,52" fill="#FFFFFF" />
              <polygon points="70,62 64,40 82,52" fill="#C2410C" />
              <polygon points="132,64 140,34 114,52" fill="#FFFFFF" />
              <polygon points="130,62 136,40 118,52" fill="#C2410C" />

              <ellipse cx="100" cy="80" rx="34" ry="27" fill="#C2410C" />
              {/* White muzzle & cheeks */}
              <ellipse cx="78" cy="88" rx="12" ry="10" fill="#FFFFFF" />
              <ellipse cx="122" cy="88" rx="12" ry="10" fill="#FFFFFF" />
              {/* White eyebrow marks */}
              <ellipse cx="84" cy="67" rx="3.5" ry="2.5" fill="#FFFFFF" />
              <ellipse cx="116" cy="67" rx="3.5" ry="2.5" fill="#FFFFFF" />

              <ellipse cx="100" cy="87" rx="9" ry="7" fill="#FFFFFF" />
              <polygon points="97,83 103,83 100,86" fill="#1C1917" />

              {renderEyes(85, 115, 75, 6.8)}
              {renderMouthAndCheeks(100, 89, 23)}
            </g>
          )}
        </g>
      );
    }

    // 15. BABY DINO
    if (type === 'dino') {
      return (
        <g id="dino">
          <path d="M 126 148 Q 156 150 150 130" stroke="#84CC16" strokeWidth="8" strokeLinecap="round" fill="none" />
          <ellipse cx="100" cy="142" rx="34" ry="28" fill="#84CC16" />
          <ellipse cx="100" cy="144" rx="20" ry="18" fill="#ECFCCB" />

          <ellipse cx="85" cy="166" rx="8" ry="6" fill="#65A30D" />
          <ellipse cx="115" cy="166" rx="8" ry="6" fill="#65A30D" />

          {!isCustomPet && (
            <g id="dino-head">
              {/* Soft Spines */}
              <polygon points="100,50 94,42 106,42" fill="#FACC15" />
              <polygon points="90,56 84,48 96,48" fill="#FACC15" />
              <polygon points="110,56 104,48 116,48" fill="#FACC15" />

              <ellipse cx="100" cy="80" rx="34" ry="26" fill="#84CC16" />
              <ellipse cx="100" cy="88" rx="13" ry="8" fill="#ECFCCB" />
              <circle cx="96" cy="86" r="1.5" fill="#3F6212" />
              <circle cx="104" cy="86" r="1.5" fill="#3F6212" />

              {renderEyes(84, 116, 75, 7)}
              {renderMouthAndCheeks(100, 90, 24)}
            </g>
          )}
        </g>
      );
    }

    // 16. DRAGON
    if (type === 'dragon') {
      return (
        <g id="dragon">
          {/* Wings */}
          <path d="M 68 126 Q 42 110 50 90 Q 64 104 68 118" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />
          <path d="M 132 126 Q 158 110 150 90 Q 136 104 132 118" fill="#93C5FD" stroke="#3B82F6" strokeWidth="1" />

          <ellipse cx="100" cy="142" rx="34" ry="28" fill="#60A5FA" />
          <ellipse cx="100" cy="144" rx="20" ry="18" fill="#DBEAFE" />

          <ellipse cx="85" cy="166" rx="8" ry="6" fill="#2563EB" />
          <ellipse cx="115" cy="166" rx="8" ry="6" fill="#2563EB" />

          {!isCustomPet && (
            <g id="dragon-head">
              {/* Tiny Pastel Horns */}
              <polygon points="76,60 70,36 84,48" fill="#FDE047" stroke="#EAB308" strokeWidth="1" />
              <polygon points="124,60 130,36 116,48" fill="#FDE047" stroke="#EAB308" strokeWidth="1" />

              <ellipse cx="100" cy="80" rx="34" ry="26" fill="#60A5FA" />
              <ellipse cx="100" cy="88" rx="14" ry="9" fill="#DBEAFE" />
              <circle cx="95" cy="86" r="1.5" fill="#1E3A8A" />
              <circle cx="105" cy="86" r="1.5" fill="#1E3A8A" />

              {renderEyes(84, 116, 75, 7)}
              {renderMouthAndCheeks(100, 90, 24)}
            </g>
          )}
        </g>
      );
    }

    // 17. UNICORN
    if (type === 'unicorn') {
      return (
        <g id="unicorn">
          <ellipse cx="100" cy="140" rx="34" ry="28" fill="#FFFFFF" stroke="#F1F5F9" strokeWidth="1" />
          <ellipse cx="85" cy="166" rx="8" ry="6" fill="#FDE68A" />
          <ellipse cx="115" cy="166" rx="8" ry="6" fill="#FDE68A" />

          {!isCustomPet && (
            <g id="unicorn-head">
              {/* Iridescent Rainbow Spiral Horn */}
              <polygon points="100,24 94,56 106,56" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
              <line x1="95" y1="48" x2="105" y2="44" stroke="#FB7185" strokeWidth="1.5" />
              <line x1="97" y1="38" x2="103" y2="34" stroke="#60A5FA" strokeWidth="1.5" />

              {/* Pastel Mane */}
              <path d="M 72 58 Q 62 76 68 96" stroke="#F472B6" strokeWidth="6" strokeLinecap="round" fill="none" />
              <path d="M 76 56 Q 66 74 72 94" stroke="#A78BFA" strokeWidth="5" strokeLinecap="round" fill="none" />

              <ellipse cx="100" cy="80" rx="33" ry="26" fill="#FFFFFF" stroke="#F1F5F9" strokeWidth="1" />
              <ellipse cx="100" cy="88" rx="12" ry="8" fill="#FDF2F8" />
              <polygon points="97,84 103,84 100,87" fill="#F43F5E" />

              {renderEyes(84, 116, 75, 7)}
              {renderMouthAndCheeks(100, 90, 22)}
            </g>
          )}
        </g>
      );
    }

    // Default Fallback (Golden Corgi/Puppy)
    return (
      <g id="default-corgi">
        <ellipse cx="100" cy="140" rx="34" ry="28" fill="#F59E0B" />
        <ellipse cx="86" cy="166" rx="8" ry="6" fill="#FFFBEB" />
        <ellipse cx="114" cy="166" rx="8" ry="6" fill="#FFFBEB" />
        {!isCustomPet && (
          <g>
            <ellipse cx="100" cy="80" rx="34" ry="28" fill="#F59E0B" />
            <ellipse cx="100" cy="88" rx="12" ry="8" fill="#FFFBEB" />
            {renderEyes(84, 116, 76)}
            {renderMouthAndCheeks(100, 89, 24)}
          </g>
        )}
      </g>
    );
  };

  // Action overlays (Bubbles when bathing, Snack when eating, Zzz when sleeping, Toilet screen)
  const renderActionOverlay = () => {
    if (isBathing) {
      return (
        <g id="bath-overlay">
          {/* Shower cap or bath bubbles */}
          <ellipse cx="100" cy="50" rx="36" ry="12" fill="#E0F2FE" opacity="0.85" stroke="#38BDF8" strokeWidth="1.5" />
          <circle cx="58" cy="110" r="8" fill="#BAE6FD" opacity="0.75" />
          <circle cx="56" cy="108" r="2.5" fill="#FFFFFF" />
          <circle cx="142" cy="104" r="10" fill="#BAE6FD" opacity="0.75" />
          <circle cx="140" cy="101" r="3" fill="#FFFFFF" />
          <circle cx="148" cy="136" r="7" fill="#BAE6FD" opacity="0.75" />
          <circle cx="50" cy="140" r="9" fill="#BAE6FD" opacity="0.75" />
          {/* Soap lather on body */}
          <circle cx="86" cy="134" r="6" fill="#FFFFFF" opacity="0.9" />
          <circle cx="114" cy="134" r="6" fill="#FFFFFF" opacity="0.9" />
        </g>
      );
    }

    if (isEating) {
      return (
        <g id="eating-overlay">
          {/* Food Bowl between paws */}
          <ellipse cx="100" cy="164" rx="22" ry="7" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
          <ellipse cx="100" cy="162" rx="18" ry="5" fill="#FDE047" />
          {/* Floating tiny heart of satisfaction */}
          <path d="M 124 70 A 3 3 0 0 0 120 74 A 3 3 0 0 0 128 74 A 3 3 0 0 0 124 70 Z" fill="#F43F5E" />
        </g>
      );
    }

    if (isSleepy) {
      return (
        <g id="sleep-overlay">
          {/* Nightcap */}
          <path d="M 82 54 Q 100 32 134 38 Q 146 44 142 58" fill="#6366F1" />
          <circle cx="142" cy="58" r="4.5" fill="#FDE047" />
          {/* Floating Zzz */}
          <text x="146" y="50" fill="#818CF8" fontSize="16" fontWeight="bold" className="animate-pulse">Z</text>
          <text x="156" y="38" fill="#A5B4FC" fontSize="12" fontWeight="bold">z</text>
          <text x="164" y="28" fill="#C7D2FE" fontSize="9" fontWeight="bold">z</text>
        </g>
      );
    }

    if (isPlaying) {
      return (
        <g id="play-overlay">
          {/* Bouncing tennis ball / yarn */}
          <circle cx="140" cy="150" r="12" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1.5" />
          <path d="M 132 144 Q 140 150 148 144" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
        </g>
      );
    }

    if (actionState === 'toilet') {
      return (
        <g id="toilet-overlay">
          {/* Sparkles around */}
          <polygon points="56,70 58,74 62,74 59,77 60,81 56,78 52,81 53,77 50,74 54,74" fill="#FBBF24" />
          <polygon points="144,70 146,74 150,74 147,77 148,81 144,78 140,81 141,77 138,74 142,74" fill="#FBBF24" />
        </g>
      );
    }

    return null;
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-md overflow-visible"
        style={{
          transform: `scale(${growthScale}) translate(0, ${breathe ? '-2px' : '0px'})`,
          transition: 'transform 0.4s ease-in-out'
        }}
      >
        {/* Soft shadow under pet */}
        <ellipse cx="100" cy="174" rx="46" ry="10" fill="#0F172A" opacity="0.12" />

        {/* Animal Body Silhouette */}
        {renderAnimalBody()}

        {/* Custom Head if enabled */}
        {isCustomPet && renderCustomHead()}

        {/* Accessories Overlay (Hats, glasses, scarves, etc.) */}
        {renderAccessoryOverlay()}

        {/* Action states (bath bubbles, eating bowl, Zzz) */}
        {renderActionOverlay()}

        {/* Floating Heart reaction */}
        {showHearts && (
          <g className="animate-bounce">
            <path d="M 94 30 C 94 24 100 20 106 25 C 112 20 118 24 118 30 C 118 38 106 46 106 46 C 106 46 94 38 94 30 Z" fill="#F43F5E" />
          </g>
        )}
      </svg>
    </div>
  );
};
