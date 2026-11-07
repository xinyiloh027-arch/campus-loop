export type PetSceneId = 'dining' | 'bathroom' | 'bathe' | 'playroom' | 'bedroom' | 'dressing';

export type WallpaperPattern = 'dots' | 'stars' | 'stripes' | 'grid' | 'floral' | 'plain';
export type FloorPattern = 'wood_plank' | 'tatami' | 'pastel_tile' | 'checker' | 'soft_carpet';
export type WindowView = 'sunny' | 'afternoon' | 'starry_night' | 'sakura_rain';

export interface SceneCustomization {
  wallColor: string; // Pastel macaron hex
  floorColor: string; // Floor base hex
  floorPattern: FloorPattern;
  wallpaperPattern: WallpaperPattern;
  furnitureStyle: string; // 'style_a' | 'style_b' | 'style_c'
  rugStyle: string; // 'bear' | 'daisy' | 'checker' | 'woven' | 'none'
  wallDecor: string; // 'shelf' | 'bunting' | 'clock' | 'lights' | 'none'
  windowView: WindowView;
  accentItem: string; // 'plant' | 'toy' | 'basket' | 'lamp' | 'none'
}

export interface SceneMeta {
  id: PetSceneId;
  name: string;
  icon: string;
  actionLabel: string;
  actionVerb: 'feed' | 'toilet' | 'bathe' | 'play' | 'rest' | 'dress';
  description: string;
  primaryStat: string;
  vitalKey: 'hunger' | 'cleanliness' | 'happiness' | 'energy';
}

export const SCENE_META_LIST: SceneMeta[] = [
  {
    id: 'dining',
    name: 'Dining Room',
    icon: '🍽️',
    actionLabel: 'Feed',
    actionVerb: 'feed',
    description: 'Cozy kitchen & dining room with warm treats and fresh snacks',
    primaryStat: 'Hunger & Nutrition',
    vitalKey: 'hunger',
  },
  {
    id: 'bathroom',
    name: 'Bathroom',
    icon: '🚽',
    actionLabel: 'Toilet',
    actionVerb: 'toilet',
    description: 'Tidy pastel bathroom with pet toilet, washbasin, and towels',
    primaryStat: 'Hygiene & Cleanliness',
    vitalKey: 'cleanliness',
  },
  {
    id: 'bathe',
    name: 'Bath Area',
    icon: '🛁',
    actionLabel: 'Bathe',
    actionVerb: 'bathe',
    description: 'Bubbly spa sanctuary with warm suds, sponge, and rubber duck',
    primaryStat: 'Sparkle Cleanliness',
    vitalKey: 'cleanliness',
  },
  {
    id: 'playroom',
    name: 'Playroom & Garden',
    icon: '🎾',
    actionLabel: 'Play',
    actionVerb: 'play',
    description: 'Sunny play area with wooden slide, toy train, and bouncy balls',
    primaryStat: 'Happiness & Fun',
    vitalKey: 'happiness',
  },
  {
    id: 'bedroom',
    name: 'Bedroom',
    icon: '🛏️',
    actionLabel: 'Rest',
    actionVerb: 'rest',
    description: 'Quiet sleepy bedroom with plush quilt, nightstand, and star mobile',
    primaryStat: 'Rest & Energy',
    vitalKey: 'energy',
  },
  {
    id: 'dressing',
    name: 'Dressing Room',
    icon: '👗',
    actionLabel: 'Dress Up',
    actionVerb: 'dress',
    description: 'Boutique vanity with standing mirror, open wardrobe, and outfits',
    primaryStat: 'Style & Charm',
    vitalKey: 'happiness',
  },
];

export const DEFAULT_SCENE_CONFIGS: Record<PetSceneId, SceneCustomization> = {
  dining: {
    wallColor: '#FFF8E7', // Butter yellow / cream
    floorColor: '#EEDDC9', // Warm pine
    floorPattern: 'wood_plank',
    wallpaperPattern: 'dots',
    furnitureStyle: 'style_a', // Checkered dining table
    rugStyle: 'checker',
    wallDecor: 'shelf', // Shelf with mugs and spice jars
    windowView: 'sunny',
    accentItem: 'plant', // Monstera
  },
  bathroom: {
    wallColor: '#EAF7F2', // Soft mint
    floorColor: '#D7EFE6', // Pastel mint tile
    floorPattern: 'pastel_tile',
    wallpaperPattern: 'grid',
    furnitureStyle: 'style_a', // Modern cute litter tray
    rugStyle: 'daisy',
    wallDecor: 'clock', // Cute cat clock
    windowView: 'sunny',
    accentItem: 'plant', // Pothos
  },
  bathe: {
    wallColor: '#EBF4FD', // Baby blue
    floorColor: '#DBECFB', // Soft water blue tiles
    floorPattern: 'pastel_tile',
    wallpaperPattern: 'dots',
    furnitureStyle: 'style_a', // Clawfoot tub with suds
    rugStyle: 'woven',
    wallDecor: 'lights', // Fairy bubble lights
    windowView: 'sunny',
    accentItem: 'toy', // Rubber duck basket
  },
  playroom: {
    wallColor: '#FDF2E9', // Soft peach
    floorColor: '#F7E7D2', // Light honey floor
    floorPattern: 'wood_plank',
    wallpaperPattern: 'stars',
    furnitureStyle: 'style_a', // Pastel wooden slide
    rugStyle: 'bear',
    wallDecor: 'bunting', // Flag bunting
    windowView: 'afternoon',
    accentItem: 'toy', // Toy blocks
  },
  bedroom: {
    wallColor: '#F6EFFD', // Lavender mist
    floorColor: '#ECE0F8', // Soft lavender carpet
    floorPattern: 'soft_carpet',
    wallpaperPattern: 'stars',
    furnitureStyle: 'style_a', // Curved wooden bed with quilt
    rugStyle: 'daisy',
    wallDecor: 'lights', // Star mobile & string lights
    windowView: 'starry_night',
    accentItem: 'lamp', // Mushroom lamp
  },
  dressing: {
    wallColor: '#FEEBF1', // Baby pink
    floorColor: '#F9DFE8', // Soft blush floor
    floorPattern: 'wood_plank',
    wallpaperPattern: 'floral',
    furnitureStyle: 'style_a', // Full-length arched mirror & rack
    rugStyle: 'bear',
    wallDecor: 'shelf', // Perfume & bows shelf
    windowView: 'sunny',
    accentItem: 'basket', // Hat & accessory basket
  },
};
