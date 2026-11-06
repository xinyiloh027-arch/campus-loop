import React from 'react';
import { PetType, PetMood, PetAccessory } from '../types';
import { PetVisual } from './petworld/PetVisual';

interface CartoonPetAvatarProps {
  type?: PetType;
  petType?: PetType;
  mood: PetMood;
  accessory?: string;
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * CartoonPetAvatar: unified with PetVisual to ensure 100% visual consistency
 * across all legacy and current views.
 */
export const CartoonPetAvatar: React.FC<CartoonPetAvatarProps> = ({
  type: rawType,
  petType,
  mood = 'happy',
  accessory = 'none',
  size = 200,
  className = '',
  onClick,
}) => {
  const resolvedType: PetType = rawType || petType || 'puppy';
  return (
    <PetVisual
      type={resolvedType}
      mood={mood}
      accessory={accessory as PetAccessory}
      size={size}
      className={className}
      onClick={onClick}
    />
  );
};
