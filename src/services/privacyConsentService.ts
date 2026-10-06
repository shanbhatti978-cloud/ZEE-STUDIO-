export interface CloudConsentRequest {
  providerName: string;
  featureName: string;
  dataSummary: string; // e.g., "1 High-resolution Photo (JPEG)"
  purpose: string; // e.g., "Deep neural matting & background cutout segmentation"
  dataRetentionPolicy: string; // e.g., "Transient memory processing only. No media retained on external servers."
}

const STORAGE_KEY_CONSENTS = 'ai_creator_cloud_consents_v1';

export class PrivacyConsentService {
  private static savedConsents: Set<string> = new Set();

  static {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_CONSENTS);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => this.savedConsents.add(item));
          }
        }
      } catch (e) {
        console.warn('Failed to load cloud consents', e);
      }
    }
  }

  public static hasConsent(providerName: string, featureName: string): boolean {
    const key = `${providerName}::${featureName}`;
    return this.savedConsents.has(key);
  }

  public static grantConsent(providerName: string, featureName: string, remember: boolean) {
    if (remember) {
      const key = `${providerName}::${featureName}`;
      this.savedConsents.add(key);
      try {
        localStorage.setItem(STORAGE_KEY_CONSENTS, JSON.stringify(Array.from(this.savedConsents)));
      } catch (e) {
        console.error('Failed to save cloud consent', e);
      }
    }
  }

  public static revokeAllConsents() {
    this.savedConsents.clear();
    try {
      localStorage.removeItem(STORAGE_KEY_CONSENTS);
    } catch (e) {
      console.error('Failed to clear cloud consents', e);
    }
  }

  public static getSavedConsents(): string[] {
    return Array.from(this.savedConsents);
  }
}
