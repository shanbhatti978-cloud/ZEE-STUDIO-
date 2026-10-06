/**
 * System Intents & Media Access Permissions Service
 * Handles:
 * - Camera Access (High-res photo capture & real-time video recording)
 * - Media Gallery Access (Read/Write storage for images & videos)
 * - File Picker Intent (Multi-format videos, RAW photos, audio files)
 * - Export & Share Intent (Direct sharing to local storage and social platforms)
 */

export type PermissionType = 'camera' | 'microphone' | 'gallery' | 'storage';
export type PermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

export interface SystemPermissionStatus {
  camera: PermissionState;
  microphone: PermissionState;
  gallery: PermissionState;
  storage: PermissionState;
}

export interface IntentMediaFile {
  id: string;
  name: string;
  type: 'video' | 'photo' | 'audio' | 'raw';
  mimeType: string;
  size: number;
  url: string;
  dataUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
  dateAdded: number;
}

const STORAGE_KEY_PERMISSIONS = 'zstudio_permissions_status';
const STORAGE_KEY_GALLERY = 'zstudio_media_gallery';

class SystemIntentsManager {
  private permissions: SystemPermissionStatus = {
    camera: 'prompt',
    microphone: 'prompt',
    gallery: 'granted',
    storage: 'granted',
  };

  private listeners: ((status: SystemPermissionStatus) => void)[] = [];

  constructor() {
    this.loadSavedPermissions();
    this.checkBrowserPermissions();
  }

  private loadSavedPermissions() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PERMISSIONS);
      if (saved) {
        this.permissions = { ...this.permissions, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read saved permissions', e);
    }
  }

  private savePermissions() {
    try {
      localStorage.setItem(STORAGE_KEY_PERMISSIONS, JSON.stringify(this.permissions));
      this.notifyListeners();
    } catch (e) {
      console.warn('Could not save permissions', e);
    }
  }

  public subscribe(cb: (status: SystemPermissionStatus) => void) {
    this.listeners.push(cb);
    cb(this.permissions);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l(this.permissions));
  }

  public getPermissions(): SystemPermissionStatus {
    return { ...this.permissions };
  }

  /**
   * Check browser navigator.permissions if supported
   */
  public async checkBrowserPermissions(): Promise<SystemPermissionStatus> {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      try {
        // Query Camera
        const camPerm = await (navigator.permissions as any).query({ name: 'camera' as any }).catch(() => null);
        if (camPerm) {
          this.permissions.camera = camPerm.state;
          camPerm.onchange = () => {
            this.permissions.camera = camPerm.state;
            this.savePermissions();
          };
        }

        // Query Microphone
        const micPerm = await (navigator.permissions as any).query({ name: 'microphone' as any }).catch(() => null);
        if (micPerm) {
          this.permissions.microphone = micPerm.state;
          micPerm.onchange = () => {
            this.permissions.microphone = micPerm.state;
            this.savePermissions();
          };
        }
      } catch (e) {
        // Ignored if querying names is restricted
      }
    }
    this.savePermissions();
    return this.permissions;
  }

  /**
   * Request Camera & Audio Access Permission
   */
  public async requestCameraPermission(withAudio: boolean = true): Promise<MediaStream | null> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.permissions.camera = 'unsupported';
        this.savePermissions();
        throw new Error('Camera hardware access is not supported by your browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: withAudio,
      });

      this.permissions.camera = 'granted';
      if (withAudio) this.permissions.microphone = 'granted';
      this.savePermissions();
      return stream;
    } catch (err: any) {
      console.warn('Camera permission error:', err);
      this.permissions.camera = 'denied';
      this.savePermissions();
      return null;
    }
  }

  /**
   * Request Media Gallery Access Permission
   */
  public async requestMediaGalleryPermission(): Promise<boolean> {
    // In web apps, gallery access is granted via File Picker or local storage sandbox
    this.permissions.gallery = 'granted';
    this.permissions.storage = 'granted';
    this.savePermissions();
    return true;
  }

  /**
   * File Picker Intent:
   * Multi-format video (MP4, WebM, MOV), RAW photos (RAW, DNG, PNG, JPG, HEIC), and audio (MP3, WAV, AAC)
   */
  public async dispatchFilePickerIntent(
    category: 'all' | 'video' | 'photo' | 'audio' = 'all',
    multiple: boolean = false
  ): Promise<IntentMediaFile[]> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;

      // Construct accepted mime types
      if (category === 'video') {
        input.accept = 'video/mp4,video/webm,video/quicktime,video/x-matroska,.mov,.mp4,.webm';
      } else if (category === 'photo') {
        input.accept = 'image/png,image/jpeg,image/webp,image/heic,image/x-adobe-dng,image/*,.raw,.dng';
      } else if (category === 'audio') {
        input.accept = 'audio/mp3,audio/wav,audio/aac,audio/m4a,audio/ogg,audio/*';
      } else {
        input.accept = 'video/*,image/*,audio/*,.raw,.dng,.mov';
      }

      input.onchange = async () => {
        if (!input.files || input.files.length === 0) {
          resolve([]);
          return;
        }

        const files: IntentMediaFile[] = [];
        for (let i = 0; i < input.files.length; i++) {
          const file = input.files[i];
          const url = URL.createObjectURL(file);
          const isVid = file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|mov|mkv)$/i);
          const isAud = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|aac|m4a)$/i);
          const isRaw = file.name.match(/\.(raw|dng|cr2|nef|arw)$/i);
          
          let mediaType: IntentMediaFile['type'] = 'photo';
          if (isVid) mediaType = 'video';
          else if (isAud) mediaType = 'audio';
          else if (isRaw) mediaType = 'raw';

          const intentItem: IntentMediaFile = {
            id: `intent-file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: file.name,
            type: mediaType,
            mimeType: file.type || 'application/octet-stream',
            size: file.size,
            url,
            dateAdded: Date.now(),
          };

          // Save to local gallery cache
          this.addToGallery(intentItem);
          files.push(intentItem);
        }

        resolve(files);
      };

      input.click();
    });
  }

  /**
   * Media Gallery Storage Access:
   * Read saved photos and videos
   */
  public getGalleryItems(): IntentMediaFile[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GALLERY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load gallery items', e);
    }

    // Default sample curated gallery
    return [
      {
        id: 'gal-sample-1',
        name: 'Cinematic_Tokyo_Neon.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 14200000,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        width: 1920,
        height: 1080,
        duration: 15.0,
        dateAdded: Date.now() - 3600000,
      },
      {
        id: 'gal-sample-2',
        name: 'Cyberpunk_Portrait_RAW.jpg',
        type: 'photo',
        mimeType: 'image/jpeg',
        size: 4200000,
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 1600,
        dateAdded: Date.now() - 7200000,
      },
      {
        id: 'gal-sample-3',
        name: 'Urban_Street_Action.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 9800000,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        width: 1920,
        height: 1080,
        duration: 15.0,
        dateAdded: Date.now() - 12000000,
      },
      {
        id: 'gal-sample-4',
        name: 'Studio_Fashion_4K.jpg',
        type: 'photo',
        mimeType: 'image/jpeg',
        size: 6100000,
        url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 1500,
        dateAdded: Date.now() - 15000000,
      }
    ];
  }

  public addToGallery(item: IntentMediaFile) {
    try {
      const items = this.getGalleryItems();
      const updated = [item, ...items.filter((i) => i.id !== item.id)].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to gallery', e);
    }
  }

  public deleteGalleryItem(id: string) {
    try {
      const items = this.getGalleryItems().filter((i) => i.id !== id);
      localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to delete item from gallery', e);
    }
  }

  /**
   * Export & Share Intent:
   * Direct sharing to local storage or social platforms (TikTok, Instagram Reels, YouTube Shorts, X/Twitter, WhatsApp)
   */
  public async dispatchExportAndShareIntent(options: {
    title: string;
    text?: string;
    url?: string;
    blob?: Blob;
    fileName?: string;
    targetPlatform?: 'system' | 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'whatsapp' | 'download';
  }): Promise<{ success: boolean; message: string }> {
    const { title, text = '', url, blob, fileName = 'ZStudio_Export.mp4', targetPlatform = 'system' } = options;

    // Direct platform deep link / share intents
    if (targetPlatform === 'tiktok') {
      window.open('https://www.tiktok.com/upload?lang=en', '_blank');
      return { success: true, message: 'Opening TikTok Creator Upload intent...' };
    }

    if (targetPlatform === 'instagram') {
      window.open('https://www.instagram.com/create/style/', '_blank');
      return { success: true, message: 'Opening Instagram Reels Share intent...' };
    }

    if (targetPlatform === 'youtube') {
      window.open('https://studio.youtube.com/channel/upload', '_blank');
      return { success: true, message: 'Opening YouTube Studio Shorts Share intent...' };
    }

    if (targetPlatform === 'twitter') {
      const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `${title} - Created with #ZStudio AI Media Suite! ${text}`
      )}`;
      window.open(shareUrl, '_blank');
      return { success: true, message: 'Opening X (Twitter) Share intent...' };
    }

    if (targetPlatform === 'whatsapp') {
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${title} \n${text} \nCreated with Z-Studio AI Editor`
      )}`;
      window.open(shareUrl, '_blank');
      return { success: true, message: 'Opening WhatsApp Share intent...' };
    }

    // Direct Download to local device storage
    if (targetPlatform === 'download') {
      return this.triggerDirectDownload(blob, url, fileName);
    }

    // System Native Share Intent (Web Share API)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        const shareData: ShareData = {
          title,
          text,
          url: url || window.location.href,
        };

        if (blob && (navigator as any).canShare) {
          const file = new File([blob], fileName, { type: blob.type || 'video/mp4' });
          if ((navigator as any).canShare({ files: [file] })) {
            shareData.files = [file];
          }
        }

        await navigator.share(shareData);
        return { success: true, message: 'Shared successfully via System Share Intent!' };
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('System Share API fallback triggered', err);
          return this.triggerDirectDownload(blob, url, fileName);
        }
        return { success: false, message: 'Share action cancelled.' };
      }
    }

    // Fallback: Trigger direct download
    return this.triggerDirectDownload(blob, url, fileName);
  }

  private triggerDirectDownload(blob?: Blob, url?: string, fileName: string = 'ZStudio_Export.mp4'): { success: boolean; message: string } {
    try {
      const downloadUrl = blob ? URL.createObjectURL(blob) : (url || '');
      if (!downloadUrl) {
        return { success: false, message: 'No media content provided to save.' };
      }

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      return {
        success: true,
        message: `Saved ${fileName} directly to local device storage!`,
      };
    } catch (e) {
      return { success: false, message: 'Failed to write file to local device storage.' };
    }
  }
}

export const SystemIntents = new SystemIntentsManager();
