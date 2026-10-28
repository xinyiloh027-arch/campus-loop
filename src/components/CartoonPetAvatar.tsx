import React from 'react';
import { PetType, PetMood } from '../types';

interface CartoonPetAvatarProps {
  type?: PetType;
  petType?: PetType;
  mood: PetMood;
  accessory?: string;
  size?: number;
  className?: string;
}

export const CartoonPetAvatar: React.FC<CartoonPetAvatarProps> = ({
  type: rawType,
  petType,
  mood,
  accessory = 'none',
  size = 200,
  className = '',
}) => {
  const type: PetType = rawType || petType || 'kitten';
  // Eye variations based on mood
  const renderEyes = (xLeft: number, xRight: number, y: number) => {
    switch (mood) {
      case 'sleepy':
        return (
          <g stroke="#3A3A3C" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d={`M ${xLeft - 7} ${y} Q ${xLeft} ${y + 5} ${xLeft + 7} ${y}`} />
            <path d={`M ${xRight - 7} ${y} Q ${xRight} ${y + 5} ${xRight + 7} ${y}`} />
            {/* Floating Zzz */}
            <text x="145" y="45" fill="#9381FF" fontSize="14" fontWeight="bold" className="animate-pulse">Z</text>
            <text x="155" y="32" fill="#B8B8FF" fontSize="11" fontWeight="bold">z</text>
          </g>
        );
      case 'excited':
        return (
          <g fill="#FFB703">
            {/* Star sparkle eyes */}
            <polygon points={`${xLeft},${y-8} ${xLeft+2},${y-2} ${xLeft+8},${y} ${xLeft+2},${y+2} ${xLeft},${y+8} ${xLeft-2},${y+2} ${xLeft-8},${y} ${xLeft-2},${y-2}`} />
            <polygon points={`${xRight},${y-8} ${xRight+2},${y-2} ${xRight+8},${y} ${xRight+2},${y+2} ${xRight},${y+8} ${xRight-2},${y+2} ${xRight-8},${y} ${xRight-2},${y-2}`} />
          </g>
        );
      case 'hungry':
        return (
          <g>
            <circle cx={xLeft} cy={y} r="7" fill="#2B2D42" />
            <circle cx={xRight} cy={y} r="7" fill="#2B2D42" />
            <circle cx={xLeft - 2} cy={y - 2} r="3" fill="#FFFFFF" />
            <circle cx={xRight - 2} cy={y - 2} r="3" fill="#FFFFFF" />
            <circle cx={xLeft + 2} cy={y + 2} r="1.5" fill="#FFFFFF" />
            <circle cx={xRight + 2} cy={y + 2} r="1.5" fill="#FFFFFF" />
            {/* Pleading shine */}
            <circle cx={xLeft} cy={y - 3} r="1.5" fill="#A8DADC" />
            <circle cx={xRight} cy={y - 3} r="1.5" fill="#A8DADC" />
          </g>
        );
      case 'happy':
      case 'content':
      default:
        return (
          <g>
            <ellipse cx={xLeft} cy={y} rx="6.5" ry="7.5" fill="#2B2D42" />
            <ellipse cx={xRight} cy={y} rx="6.5" ry="7.5" fill="#2B2D42" />
            {/* Main Sparkle */}
            <circle cx={xLeft - 2} cy={y - 2.5} r="2.8" fill="#FFFFFF" />
            <circle cx={xRight - 2} cy={y - 2.5} r="2.8" fill="#FFFFFF" />
            {/* Secondary tiny sparkle */}
            <circle cx={xLeft + 2} cy={y + 2} r="1.4" fill="#FFFFFF" />
            <circle cx={xRight + 2} cy={y + 2} r="1.4" fill="#FFFFFF" />
          </g>
        );
    }
  };

  // Mouth & Blush variations
  const renderMouthAndBlush = (centerX: number, y: number) => {
    return (
      <g>
        {/* Soft Pink Blushing Cheeks */}
        <ellipse cx={centerX - 24} cy={y + 1} rx="7" ry="4" fill="#FFAAA6" opacity="0.6" />
        <ellipse cx={centerX + 24} cy={y + 1} rx="7" ry="4" fill="#FFAAA6" opacity="0.6" />

        {/* Mouth */}
        {mood === 'happy' || mood === 'excited' ? (
          <path
            d={`M ${centerX - 6} ${y + 2} Q ${centerX} ${y + 9} ${centerX + 6} ${y + 2}`}
            stroke="#2B2D42"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="#FF758F"
          />
        ) : mood === 'hungry' ? (
          <g>
            <path
              d={`M ${centerX - 5} ${y + 3} Q ${centerX} ${y + 7} ${centerX + 5} ${y + 3}`}
              stroke="#2B2D42"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Tiny cute drool drop */}
            <circle cx={centerX + 7} cy={y + 7} r="2" fill="#90E0EF" />
          </g>
        ) : mood === 'sleepy' ? (
          <ellipse cx={centerX} cy={y + 4} rx="3" ry="4" fill="#2B2D42" />
        ) : (
          /* Content smile */
          <path
            d={`M ${centerX - 6} ${y + 1} Q ${centerX - 2} ${y + 5} ${centerX} ${y + 2} Q ${centerX + 2} ${y + 5} ${centerX + 6} ${y + 1}`}
            stroke="#2B2D42"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
          />
        )}
      </g>
    );
  };

  // Accessories
  const renderAccessory = () => {
    switch (accessory) {
      case 'grad_cap':
        return (
          <g id="grad-cap">
            <polygon points="100,28 138,42 100,56 62,42" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            <rect x="84" y="47" width="32" height="11" rx="4" fill="#1E293B" />
            <circle cx="100" cy="42" r="3" fill="#F59E0B" />
            <path d="M 100 42 Q 128 46 130 65" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="127" y="65" width="6" height="8" rx="2" fill="#F59E0B" />
          </g>
        );
      case 'glasses':
        return (
          <g id="nerd-glasses" stroke="#334155" strokeWidth="3" fill="none">
            <circle cx="85" cy="85" r="14" fill="#F8FAFC" fillOpacity="0.2" />
            <circle cx="115" cy="85" r="14" fill="#F8FAFC" fillOpacity="0.2" />
            <line x1="99" y1="85" x2="101" y2="85" strokeWidth="3.5" />
            <line x1="71" y1="83" x2="62" y2="80" />
            <line x1="129" y1="83" x2="138" y2="80" />
          </g>
        );
      case 'bow':
        return (
          <g id="cute-bow">
            <ellipse cx="100" cy="48" rx="5" ry="5" fill="#F43F5E" />
            <polygon points="100,48 76,36 78,58" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
            <polygon points="100,48 124,36 122,58" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" />
          </g>
        );
      case 'scarf':
        return (
          <g id="winter-scarf">
            <path d="M 72 118 Q 100 130 128 118 Q 100 136 72 118" fill="#34D399" stroke="#059669" strokeWidth="2" />
            <path d="M 112 122 L 122 152 L 108 152 Z" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
            {/* Stripes */}
            <line x1="78" y1="120" x2="84" y2="124" stroke="#A7F3D0" strokeWidth="2.5" />
            <line x1="94" y1="123" x2="100" y2="127" stroke="#A7F3D0" strokeWidth="2.5" />
          </g>
        );
      case 'sweater':
        return (
          <g id="cozy-sweater">
            <path d="M 70 125 Q 100 115 130 125 L 126 156 Q 100 162 74 156 Z" fill="#DDD6FE" stroke="#8B5CF6" strokeWidth="2" />
            <path d="M 86 130 L 100 144 L 114 130" stroke="#C4B5FD" strokeWidth="2.5" fill="none" />
          </g>
        );
      case 'backpack':
        return (
          <g id="mini-backpack">
            <rect x="52" y="112" width="16" height="26" rx="6" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
            <rect x="56" y="122" width="10" height="12" rx="3" fill="#F59E0B" />
          </g>
        );
      case 'badge':
        return (
          <g id="honor-ribbon">
            <circle cx="120" cy="130" r="9" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
            <polygon points="120,124 122,128 126,128 123,131 124,135 120,133 116,135 117,131 114,128 118,128" fill="#FEF3C7" />
            <path d="M 116 137 L 113 148 L 118 145 L 123 148 L 120 137" fill="#EF4444" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`inline-block relative select-none ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible"
        style={{
          filter: 'drop-shadow(0px 8px 16px rgba(100, 116, 139, 0.12))',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Soft Floor Shadow */}
        <ellipse cx="100" cy="172" rx="46" ry="10" fill="#E2E8F0" opacity="0.75" />

        {/* PET 1: KITTEN (Cream, pointed pink ears, whiskers) */}
        {type === 'kitten' && (
          <g id="pet-kitten">
            {/* Pointed Ears */}
            <polygon points="62,72 52,34 82,54" fill="#FFF8E7" stroke="#E6D5B8" strokeWidth="2.5" />
            <polygon points="64,66 58,42 78,56" fill="#FFD1DC" />
            <polygon points="138,72 148,34 118,54" fill="#FFF8E7" stroke="#E6D5B8" strokeWidth="2.5" />
            <polygon points="136,66 142,42 122,56" fill="#FFD1DC" />

            {/* Curled Tail */}
            <path d="M 135 145 C 165 140 170 115 155 105 C 145 100 142 112 146 118" stroke="#E6D5B8" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M 135 145 C 165 140 170 115 155 105 C 145 100 142 112 146 118" stroke="#FFF8E7" strokeWidth="4" strokeLinecap="round" fill="none" />

            {/* Chubby Body */}
            <ellipse cx="100" cy="126" rx="42" ry="38" fill="#FFF8E7" stroke="#E6D5B8" strokeWidth="2.5" />
            <ellipse cx="100" cy="132" rx="26" ry="24" fill="#FFFFFF" />

            {/* Round Head */}
            <circle cx="100" cy="85" r="40" fill="#FFF8E7" stroke="#E6D5B8" strokeWidth="2.5" />

            {/* Tiny cute nose */}
            <polygon points="100,94 97,91 103,91" fill="#FF8FA3" />

            {/* Whiskers */}
            <g stroke="#D4C2A3" strokeWidth="1.5" strokeLinecap="round">
              <line x1="62" y1="92" x2="48" y2="90" />
              <line x1="62" y1="96" x2="48" y2="98" />
              <line x1="138" y1="92" x2="152" y2="90" />
              <line x1="138" y1="96" x2="152" y2="98" />
            </g>

            {/* Face details */}
            {renderEyes(84, 116, 82)}
            {renderMouthAndBlush(100, 97)}

            {/* Front Paws */}
            <ellipse cx="86" cy="158" rx="9" ry="7" fill="#FFFFFF" stroke="#E6D5B8" strokeWidth="2" />
            <ellipse cx="114" cy="158" rx="9" ry="7" fill="#FFFFFF" stroke="#E6D5B8" strokeWidth="2" />
          </g>
        )}

        {/* PET 2: PUPPY (Caramel & cream, floppy ears, button nose) */}
        {type === 'puppy' && (
          <g id="pet-puppy">
            {/* Floppy Drooping Ears */}
            <ellipse cx="58" cy="86" rx="15" ry="32" transform="rotate(-15 58 86)" fill="#D4A373" stroke="#B08968" strokeWidth="2.5" />
            <ellipse cx="142" cy="86" rx="15" ry="32" transform="rotate(15 142 86)" fill="#D4A373" stroke="#B08968" strokeWidth="2.5" />

            {/* Wagging Tail */}
            <path d="M 132 144 Q 160 135 156 118" stroke="#D4A373" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Body */}
            <ellipse cx="100" cy="128" rx="42" ry="36" fill="#FAEDCD" stroke="#CCD5AE" strokeWidth="2.5" />
            <ellipse cx="100" cy="134" rx="25" ry="22" fill="#FEFAE0" />

            {/* Head */}
            <ellipse cx="100" cy="86" rx="39" ry="37" fill="#FAEDCD" stroke="#CCD5AE" strokeWidth="2.5" />

            {/* Caramel Spot over Left Eye */}
            <path d="M 75 62 Q 88 58 92 78 Q 94 96 74 96 Q 64 82 75 62 Z" fill="#E9C46A" opacity="0.45" />

            {/* Big Shiny Button Nose */}
            <ellipse cx="100" cy="94" rx="6" ry="4.5" fill="#3D3A45" />
            <ellipse cx="98.5" cy="92.5" rx="2" ry="1.2" fill="#FFFFFF" />

            {renderEyes(84, 116, 82)}
            {renderMouthAndBlush(100, 99)}

            {/* Paws */}
            <ellipse cx="85" cy="158" rx="10" ry="7.5" fill="#FAEDCD" stroke="#CCD5AE" strokeWidth="2" />
            <ellipse cx="115" cy="158" rx="10" ry="7.5" fill="#FAEDCD" stroke="#CCD5AE" strokeWidth="2" />
          </g>
        )}

        {/* PET 3: BUNNY (Chubby white, tall pastel ears, round tail) */}
        {type === 'bunny' && (
          <g id="pet-bunny">
            {/* Long Fluffy Ears */}
            <ellipse cx="76" cy="42" rx="13" ry="38" transform="rotate(-8 76 42)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
            <ellipse cx="76" cy="42" rx="7" ry="28" transform="rotate(-8 76 42)" fill="#FFD1DC" />
            <ellipse cx="124" cy="42" rx="13" ry="38" transform="rotate(8 124 42)" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
            <ellipse cx="124" cy="42" rx="7" ry="28" transform="rotate(8 124 42)" fill="#FFD1DC" />

            {/* Round Puffy Tail */}
            <circle cx="144" cy="138" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />

            {/* Body */}
            <ellipse cx="100" cy="128" rx="44" ry="38" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />

            {/* Head */}
            <circle cx="100" cy="92" r="38" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />

            {/* Nose */}
            <polygon points="100,99 97,96 103,96" fill="#FFAAA6" />

            {renderEyes(85, 115, 88)}
            {renderMouthAndBlush(100, 102)}

            {/* Paws */}
            <ellipse cx="86" cy="159" rx="8.5" ry="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
            <ellipse cx="114" cy="159" rx="8.5" ry="7" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          </g>
        )}

        {/* PET 4: BABY DRAGON (Pastel mint/blue, golden horns, tiny wings) */}
        {type === 'dragon' && (
          <g id="pet-dragon">
            {/* Tiny Wings */}
            <path d="M 64 100 Q 32 82 44 116 Q 58 112 66 114" fill="#B8E0D2" stroke="#95D5B2" strokeWidth="2.5" />
            <path d="M 136 100 Q 168 82 156 116 Q 142 112 134 114" fill="#B8E0D2" stroke="#95D5B2" strokeWidth="2.5" />

            {/* Tail */}
            <path d="M 132 142 Q 165 148 160 130" stroke="#A8DADC" strokeWidth="8" strokeLinecap="round" fill="none" />
            <polygon points="162,126 156,136 166,134" fill="#F4A261" />

            {/* Body */}
            <ellipse cx="100" cy="128" rx="42" ry="38" fill="#A8DADC" stroke="#83C5BE" strokeWidth="2.5" />
            {/* Golden Scaled Belly */}
            <ellipse cx="100" cy="132" rx="26" ry="26" fill="#FFF3B0" />
            <line x1="88" y1="124" x2="112" y2="124" stroke="#FFE6A7" strokeWidth="2" />
            <line x1="86" y1="134" x2="114" y2="134" stroke="#FFE6A7" strokeWidth="2" />
            <line x1="90" y1="144" x2="110" y2="144" stroke="#FFE6A7" strokeWidth="2" />

            {/* Little Soft Horns */}
            <polygon points="76,56 70,36 86,48" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />
            <polygon points="124,56 130,36 114,48" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />

            {/* Head */}
            <circle cx="100" cy="85" r="39" fill="#A8DADC" stroke="#83C5BE" strokeWidth="2.5" />

            {/* Tiny Nostrils */}
            <circle cx="97" cy="94" r="1.5" fill="#457B9D" />
            <circle cx="103" cy="94" r="1.5" fill="#457B9D" />

            {renderEyes(84, 116, 82)}
            {renderMouthAndBlush(100, 98)}

            {/* Little Feet */}
            <ellipse cx="85" cy="158" rx="9" ry="7" fill="#A8DADC" stroke="#83C5BE" strokeWidth="2" />
            <ellipse cx="115" cy="158" rx="9" ry="7" fill="#A8DADC" stroke="#83C5BE" strokeWidth="2" />
          </g>
        )}

        {/* PET 5: PENGUIN (Round charcoal/navy, crisp white tummy, yellow beak) */}
        {type === 'penguin' && (
          <g id="pet-penguin">
            {/* Flippers */}
            <ellipse cx="56" cy="120" rx="9" ry="24" transform="rotate(22 56 120)" fill="#2B2D42" stroke="#1D3557" strokeWidth="2" />
            <ellipse cx="144" cy="120" rx="9" ry="24" transform="rotate(-22 144 120)" fill="#2B2D42" stroke="#1D3557" strokeWidth="2" />

            {/* Round Body */}
            <ellipse cx="100" cy="115" rx="44" ry="48" fill="#2B2D42" stroke="#1D3557" strokeWidth="2.5" />

            {/* White Tummy Face Mask */}
            <ellipse cx="100" cy="122" rx="32" ry="38" fill="#FFFFFF" />

            {/* Beak */}
            <polygon points="100,88 93,96 107,96" fill="#F4A261" stroke="#E76F51" strokeWidth="1.5" />

            {renderEyes(85, 115, 82)}
            {renderMouthAndBlush(100, 99)}

            {/* Orange Feet */}
            <ellipse cx="86" cy="162" rx="11" ry="6" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />
            <ellipse cx="114" cy="162" rx="11" ry="6" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />
          </g>
        )}

        {/* PET 6: HAMSTER (Chubby golden peach, tiny ears, sunflower seed) */}
        {type === 'hamster' && (
          <g id="pet-hamster">
            {/* Small Rounded Ears */}
            <circle cx="68" cy="58" r="14" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />
            <circle cx="68" cy="58" r="8" fill="#FFCCD5" />
            <circle cx="132" cy="58" r="14" fill="#F4A261" stroke="#E76F51" strokeWidth="2" />
            <circle cx="132" cy="58" r="8" fill="#FFCCD5" />

            {/* Big Chubby Body */}
            <ellipse cx="100" cy="120" rx="46" ry="44" fill="#F4A261" stroke="#E76F51" strokeWidth="2.5" />
            {/* White Belly */}
            <ellipse cx="100" cy="130" rx="30" ry="28" fill="#FFF1E6" />

            {/* Giant Cheek Pouches */}
            <circle cx="70" cy="100" r="18" fill="#F4A261" />
            <circle cx="130" cy="100" r="18" fill="#F4A261" />

            {/* Tiny Pink Nose */}
            <ellipse cx="100" cy="94" rx="4" ry="3" fill="#E76F51" />

            {/* Sunflower seed held in paws */}
            <ellipse cx="100" cy="128" rx="8" ry="12" fill="#4A4E69" stroke="#22223B" strokeWidth="1.5" transform="rotate(-15 100 128)" />
            <line x1="97" y1="118" x2="103" y2="138" stroke="#F2E9E4" strokeWidth="1.5" />

            {renderEyes(84, 116, 84)}
            {renderMouthAndBlush(100, 98)}

            {/* Front Paws holding seed */}
            <circle cx="92" cy="128" r="5" fill="#FFE5D9" />
            <circle cx="108" cy="128" r="5" fill="#FFE5D9" />

            {/* Back Feet */}
            <ellipse cx="80" cy="160" rx="9" ry="6" fill="#FFE5D9" stroke="#E76F51" strokeWidth="1.5" />
            <ellipse cx="120" cy="160" rx="9" ry="6" fill="#FFE5D9" stroke="#E76F51" strokeWidth="1.5" />
          </g>
        )}

        {/* OVERLAY ACCESSORY */}
        {renderAccessory()}
      </svg>
    </div>
  );
};
