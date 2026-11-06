/**
 * Persistent Image Storage and Canvas Image Processing Service
 * Uses IndexedDB for resilient local storage of user-uploaded custom pet head images
 * with Canvas-based image downscaling, cropping, and format normalization.
 */

import { CustomHeadConfig, SavedHeadImage } from '../types';

const DB_NAME = 'CampusLoopPetImagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'saved_pet_heads';
const LOCAL_FALLBACK_KEY = 'campusloop_saved_heads_indexed_fallback';

export interface StoredHeadRecord {
  id: string;
  name: string;
  imageUrl: string;
  savedAt: string;
  config: CustomHeadConfig;
}

class ImageStorageService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private memoryCache: Map<string, StoredHeadRecord> = new Map();
  private isInitialized = false;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase(): Promise<IDBDatabase | null> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB is not available in this environment. Falling back to storage.');
      return null;
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve) => {
        try {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
          };
          req.onsuccess = () => {
            const db = req.result;
            this.isInitialized = true;
            this.preloadToMemoryCache(db);
            resolve(db);
          };
          req.onerror = (e) => {
            console.error('Failed to open IndexedDB for pet images:', e);
            resolve(null);
          };
        } catch (err) {
          console.error('IndexedDB init error:', err);
          resolve(null);
        }
      });
    }

    return this.dbPromise;
  }

  private async preloadToMemoryCache(db: IDBDatabase) {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const records: StoredHeadRecord[] = req.result || [];
        records.forEach((rec) => {
          this.memoryCache.set(rec.id, rec);
        });
      };
    } catch (e) {
      console.warn('Could not preload IndexedDB to memory:', e);
    }
  }

  /**
   * Optimize and downscale user-uploaded photos via HTML5 Canvas
   * Ensures high-resolution phone camera photos (12-50MP) are resized to max 600x600,
   * avoiding memory crashes, lagging SVG rendering, and localStorage quota errors.
   */
  public async optimizeAndCropImage(
    fileOrUrl: File | string,
    maxDim = 600
  ): Promise<{ dataUrl: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      let src = '';
      if (typeof fileOrUrl === 'string') {
        src = fileOrUrl;
      } else {
        src = URL.createObjectURL(fileOrUrl);
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        if (typeof fileOrUrl !== 'string') {
          URL.revokeObjectURL(src);
        }

        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;

        // Calculate aspect-preserving dimensions
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        // Export as WebP if supported, fallback to PNG
        let outputDataUrl = '';
        try {
          outputDataUrl = canvas.toDataURL('image/webp', 0.92);
          if (!outputDataUrl.startsWith('data:image/webp')) {
            outputDataUrl = canvas.toDataURL('image/png');
          }
        } catch {
          outputDataUrl = canvas.toDataURL('image/png');
        }

        resolve({
          dataUrl: outputDataUrl,
          width: w,
          height: h,
        });
      };

      img.onerror = () => {
        if (typeof fileOrUrl !== 'string') {
          URL.revokeObjectURL(src);
        }
        reject(new Error('Failed to load and process image.'));
      };

      img.src = src;
    });
  }

  /**
   * Save a head photo permanently in IndexedDB + memory cache
   */
  public async saveHead(
    name: string,
    dataUrl: string,
    config: CustomHeadConfig,
    existingId?: string
  ): Promise<SavedHeadImage> {
    const id = existingId || `head-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const record: StoredHeadRecord = {
      id,
      name: name.trim() || 'My Custom Head',
      imageUrl: dataUrl,
      savedAt: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      config: {
        ...config,
        imageUrl: dataUrl,
      },
    };

    // Update memory cache
    this.memoryCache.set(id, record);

    // Save to IndexedDB
    try {
      const db = await this.initDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(record);
      }
    } catch (e) {
      console.warn('Could not write image to IndexedDB:', e);
    }

    // Also sync to localStorage lightweight list (excluding huge redundant base64 where possible, or kept compressed)
    this.syncToLocalStorage();

    return {
      id: record.id,
      name: record.name,
      imageUrl: record.imageUrl,
      savedAt: record.savedAt,
      config: record.config,
    };
  }

  /**
   * Retrieve all saved heads
   */
  public async getAllHeads(): Promise<SavedHeadImage[]> {
    // Check IndexedDB
    try {
      const db = await this.initDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        const records: StoredHeadRecord[] = await new Promise((resolve) => {
          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => resolve([]);
        });

        if (records.length > 0) {
          records.forEach((r) => this.memoryCache.set(r.id, r));
          return records.map((r) => ({
            id: r.id,
            name: r.name,
            imageUrl: r.imageUrl,
            savedAt: r.savedAt,
            config: r.config,
          }));
        }
      }
    } catch (e) {
      console.warn('IndexedDB getAll error:', e);
    }

    // Memory cache fallback
    if (this.memoryCache.size > 0) {
      return Array.from(this.memoryCache.values()).map((r) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl,
        savedAt: r.savedAt,
        config: r.config,
      }));
    }

    // LocalStorage fallback
    try {
      const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch {}

    return [];
  }

  /**
   * Synchronously get cached heads for fast UI rendering
   */
  public getCachedHeads(): SavedHeadImage[] {
    if (this.memoryCache.size > 0) {
      return Array.from(this.memoryCache.values()).map((r) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl,
        savedAt: r.savedAt,
        config: r.config,
      }));
    }

    try {
      const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((h: SavedHeadImage) => {
            this.memoryCache.set(h.id, {
              id: h.id,
              name: h.name,
              imageUrl: h.imageUrl,
              savedAt: h.savedAt,
              config: h.config,
            });
          });
          return list;
        }
      }
    } catch {}

    return [];
  }

  /**
   * Delete an image from IndexedDB and storage
   */
  public async deleteHead(id: string): Promise<boolean> {
    this.memoryCache.delete(id);

    try {
      const db = await this.initDatabase();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
      }
    } catch (e) {
      console.warn('IndexedDB delete error:', e);
    }

    this.syncToLocalStorage();

    // Also update any legacy or secondary list
    try {
      const raw = localStorage.getItem('campusloop_saved_heads_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter((h: any) => h.id !== id);
          localStorage.setItem('campusloop_saved_heads_v1', JSON.stringify(filtered));
        }
      }
    } catch {}

    return true;
  }

  private syncToLocalStorage() {
    try {
      const list = Array.from(this.memoryCache.values()).map((r) => ({
        id: r.id,
        name: r.name,
        imageUrl: r.imageUrl,
        savedAt: r.savedAt,
        config: r.config,
      }));
      localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(list));
      localStorage.setItem('campusloop_saved_heads_v1', JSON.stringify(list));
    } catch (e) {
      console.warn('LocalStorage backup full, IndexedDB remains active:', e);
    }
  }
}

export const imageStorageService = new ImageStorageService();
