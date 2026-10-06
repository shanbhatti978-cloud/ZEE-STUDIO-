export interface DeduplicatedAsset {
  hash: string; // SHA-256 content hash
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
  referenceCount: number;
  referencedBy: string[]; // IDs of templates or projects referencing this asset
  createdAt: number;
  lastReferenced?: number;
}

const STORAGE_KEY_ASSET_REGISTRY = 'ai_creator_asset_registry_v1';

export class AssetDeduplicationService {
  private static assetRegistry: Map<string, DeduplicatedAsset> = new Map();

  static {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_ASSET_REGISTRY);
        if (stored) {
          const list: DeduplicatedAsset[] = JSON.parse(stored);
          if (Array.isArray(list)) {
            list.forEach((asset) => this.assetRegistry.set(asset.hash, asset));
          }
        }
      } catch (e) {
        console.warn('Failed to load asset deduplication registry', e);
      }
    }
  }

  /**
   * Fast asynchronous SHA-256 computation using standard Web Crypto API
   */
  public static async computeHash(dataOrUrl: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      try {
        const msgUint8 = new TextEncoder().encode(dataOrUrl);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // Fallback simple perceptual hashing
      }
    }

    // Deterministic string hash fallback
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < dataOrUrl.length; i++) {
      ch = dataOrUrl.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    return `sha256_${(h1 >>> 0).toString(16).padStart(8, '0')}_${(h2 >>> 0).toString(16).padStart(8, '0')}`;
  }

  /**
   * Registers or increments reference count for an asset
   */
  public static async registerAsset(
    dataUrl: string,
    ownerId: string,
    mimeType = 'image/png'
  ): Promise<{ hash: string; isNew: boolean }> {
    const hash = await this.computeHash(dataUrl);

    let existing = this.assetRegistry.get(hash);
    let isNew = false;

    if (existing) {
      if (!existing.referencedBy.includes(ownerId)) {
        existing.referencedBy.push(ownerId);
        existing.referenceCount = existing.referencedBy.length;
      }
    } else {
      isNew = true;
      existing = {
        hash,
        mimeType,
        sizeBytes: dataUrl.length,
        dataUrl,
        referenceCount: 1,
        referencedBy: [ownerId],
        createdAt: Date.now()
      };
      this.assetRegistry.set(hash, existing);
    }

    this.persistRegistry();
    return { hash, isNew };
  }

  /**
   * Decrements reference count when a project or template is deleted.
   * Only deletes physical asset if referenceCount reaches 0.
   */
  public static releaseAsset(hash: string, ownerId: string): boolean {
    const existing = this.assetRegistry.get(hash);
    if (!existing) return false;

    existing.referencedBy = existing.referencedBy.filter((id) => id !== ownerId);
    existing.referenceCount = existing.referencedBy.length;

    if (existing.referenceCount <= 0) {
      this.assetRegistry.delete(hash);
      this.persistRegistry();
      return true; // Deleted physically
    }

    this.persistRegistry();
    return false; // Still held by another owner
  }

  public static removeAsset(hash: string, ownerId?: string): boolean {
    if (ownerId) {
      return this.releaseAsset(hash, ownerId);
    }
    const existed = this.assetRegistry.delete(hash);
    if (existed) {
      this.persistRegistry();
    }
    return existed;
  }

  public static getAsset(hash: string): DeduplicatedAsset | undefined {
    return this.assetRegistry.get(hash);
  }

  public static getStorageStats(): { totalAssets: number; totalBytes: number; savedBytes: number } {
    let totalBytes = 0;
    let savedBytes = 0;

    this.assetRegistry.forEach((asset) => {
      totalBytes += asset.sizeBytes;
      if (asset.referenceCount > 1) {
        savedBytes += asset.sizeBytes * (asset.referenceCount - 1);
      }
    });

    return {
      totalAssets: this.assetRegistry.size,
      totalBytes,
      savedBytes
    };
  }

  private static persistRegistry() {
    try {
      const list = Array.from(this.assetRegistry.values());
      localStorage.setItem(STORAGE_KEY_ASSET_REGISTRY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist asset registry', e);
    }
  }
}
