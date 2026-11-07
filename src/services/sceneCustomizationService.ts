import { 
  PetSceneId, 
  SceneCustomization, 
  DEFAULT_SCENE_CONFIGS 
} from '../types/petScenes';

const SCENE_CUSTOMIZATION_KEY = 'campusloop_pet_room_customization_v1';

export const sceneCustomizationService = {
  /**
   * Retrieves all scenes configurations map.
   */
  getAllConfigs(): Record<PetSceneId, SceneCustomization> {
    try {
      const stored = localStorage.getItem(SCENE_CUSTOMIZATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          dining: { ...DEFAULT_SCENE_CONFIGS.dining, ...(parsed.dining || {}) },
          bathroom: { ...DEFAULT_SCENE_CONFIGS.bathroom, ...(parsed.bathroom || {}) },
          bathe: { ...DEFAULT_SCENE_CONFIGS.bathe, ...(parsed.bathe || {}) },
          playroom: { ...DEFAULT_SCENE_CONFIGS.playroom, ...(parsed.playroom || {}) },
          bedroom: { ...DEFAULT_SCENE_CONFIGS.bedroom, ...(parsed.bedroom || {}) },
          dressing: { ...DEFAULT_SCENE_CONFIGS.dressing, ...(parsed.dressing || {}) },
        };
      }
    } catch (e) {
      console.warn('Failed to parse scene customization from storage:', e);
    }
    return { ...DEFAULT_SCENE_CONFIGS };
  },

  /**
   * Get configuration for a specific scene.
   */
  getSceneConfig(sceneId: PetSceneId): SceneCustomization {
    const all = this.getAllConfigs();
    return all[sceneId] || DEFAULT_SCENE_CONFIGS[sceneId];
  },

  /**
   * Save configuration for a specific scene independently.
   * Changing bedroom will NEVER affect dining or bathroom!
   */
  saveSceneConfig(sceneId: PetSceneId, config: SceneCustomization): Record<PetSceneId, SceneCustomization> {
    const all = this.getAllConfigs();
    const updated = {
      ...all,
      [sceneId]: { ...config }
    };

    try {
      localStorage.setItem(SCENE_CUSTOMIZATION_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save scene customization:', e);
    }

    return updated;
  },

  /**
   * Reset a specific scene to its cozy hand-drawn default.
   */
  resetSceneConfig(sceneId: PetSceneId): SceneCustomization {
    const defaultConfig = DEFAULT_SCENE_CONFIGS[sceneId];
    this.saveSceneConfig(sceneId, defaultConfig);
    return defaultConfig;
  }
};
