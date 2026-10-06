export type AppLanguage = 'en' | 'ur';

export interface I18nConfig {
  language: AppLanguage;
  useUrduDigits: boolean;
}

const STORAGE_KEY_LANG = 'ai_creator_studio_lang_v1';
const STORAGE_KEY_DIGITS = 'ai_creator_studio_urdu_digits_v1';

const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

export const TRANSLATIONS = {
  en: {
    // App Bar & Branding
    appName: 'AI CREATOR STUDIO',
    tagline: 'All-in-One Photo, Video & Template Studio',
    online: 'Online',
    offline: 'Offline',
    
    // Bottom Dock & Modes
    photoEdit: 'Photo Edit',
    templates: 'Templates',
    videoEdit: 'Video Edit',
    
    // Home Main Card
    pasteLinkOrUpload: 'PASTE LINK / UPLOAD VIDEO',
    pasteLinkDesc: 'Analyze public reels, TikToks, or upload an edited video to reconstruct an editable template with measured fidelity',
    pasteLinkBtn: 'Paste Public Link',
    uploadVideoBtn: 'Upload Video',
    continueEditing: 'Continue Editing',
    recentProjects: 'Recent Projects',
    myTemplates: 'My Templates',
    aiTools: 'AI Tools',
    
    // Template Studio & Categories
    templateStudio: 'Template Studio',
    importTemplate: 'Import Template',
    createTemplate: 'Create Template',
    useTemplate: 'Use Template',
    templateProfile: 'Template Profile',
    searchTemplates: 'Search 35+ categories (Urdu, Velocity, Reels)...',
    slots: 'Slots',
    duration: 'Duration',
    favorite: 'Favorite',
    duplicateDetected: 'Duplicate Template Detected',
    reconstructionReport: 'Template Reconstruction Report',
    confidenceScore: 'Measured Fidelity Score',
    
    // Photo Studio & AI Tools
    adjustments: 'Adjustments',
    filters: 'Filters',
    cutout: 'Edge-to-Edge Cutout',
    replaceBg: 'Replace Background',
    styleMatch: 'Style Match ("Make It Like This")',
    photoToVideo: 'Photo to Video Motion',
    aiEnhance: 'AI Enhance & Upscale',
    holdForOriginal: 'Hold for Original',
    brightness: 'Brightness',
    contrast: 'Contrast',
    saturation: 'Saturation',
    temperature: 'Temperature',
    vignette: 'Vignette',
    exportPhoto: 'Export Photo',
    
    // Video Studio & Timeline
    timeline: 'Multi-Track Timeline',
    split: 'Split',
    trim: 'Trim',
    speed: 'Speed & Velocity',
    transitions: 'Transitions',
    effects: 'Visual Effects',
    textCaptions: 'Text & Captions',
    audioMusic: 'Music & Beat Sync',
    stickers: 'Stickers & Badges',
    canvasRatio: 'Canvas Aspect Ratio',
    exportVideo: 'Export Video',
    
    // Settings & Appearance
    appearance: 'Appearance & Themes',
    aiProviders: 'AI Providers Architecture',
    privacySecurity: 'Privacy & Cloud Consent',
    storageBackup: 'Storage & Backup (.actbackup)',
    language: 'Language / زبان',
    urduDigits: 'Urdu Digits (اردو اعداد)',
    
    // Cloud Privacy
    cloudConsentTitle: 'Cloud AI Processing Consent',
    cloudConsentNotice: 'To use this AI feature, your selected photo or video will be securely transmitted to the cloud provider.',
    cancel: 'Cancel',
    continueBtn: 'Continue',
    rememberChoice: 'Remember my consent for this provider',
    
    // Common Actions
    save: 'Save',
    discard: 'Discard',
    recover: 'Recover',
    delete: 'Delete',
    duplicate: 'Duplicate',
    export: 'Export',
    undo: 'Undo',
    redo: 'Redo',
    search: 'Search'
  },
  ur: {
    // App Bar & Branding
    appName: 'اے آئی کری ایٹر اسٹوڈیو',
    tagline: 'تصویر، ویڈیو اور ٹیمپلیٹ اسٹوڈیو',
    online: 'آن لائن',
    offline: 'آف لائن',
    
    // Bottom Dock & Modes
    photoEdit: 'تصویر ایڈیٹر',
    templates: 'ٹیمپلیٹس',
    videoEdit: 'ویڈیو ایڈیٹر',
    
    // Home Main Card
    pasteLinkOrUpload: 'لنک درج کریں / ویڈیو اپلوڈ کریں',
    pasteLinkDesc: 'ٹک ٹاک، ریلز یا کوئی بھی ویڈیو اپلوڈ کر کے خودکار ایڈیٹیبل ٹیمپلیٹ تیار کریں',
    pasteLinkBtn: 'لنک پیسٹ کریں',
    uploadVideoBtn: 'ویڈیو اپلوڈ کریں',
    continueEditing: 'کام جاری رکھیں',
    recentProjects: 'حالیہ پروجیکٹس',
    myTemplates: 'میرے ٹیمپلیٹس',
    aiTools: 'اے آئی ٹولز',
    
    // Template Studio & Categories
    templateStudio: 'ٹیمپلیٹ اسٹوڈیو',
    importTemplate: 'درآمد ٹیمپلیٹ',
    createTemplate: 'نیا ٹیمپلیٹ بنائیں',
    useTemplate: 'ٹیمپلیٹ استعمال کریں',
    templateProfile: 'ٹیمپلیٹ پروفائل',
    searchTemplates: 'اردو، سلو مو، اور ریلز ٹیمپلیٹس تلاش کریں...',
    slots: 'خانے',
    duration: 'مدت',
    favorite: 'پسندیدہ',
    duplicateDetected: 'ملتا جلتا ٹیمپلیٹ پہلے سے موجود ہے',
    reconstructionReport: 'ٹیمپلیٹ تجزیاتی رپورٹ',
    confidenceScore: 'درستگی کا تناسب',
    
    // Photo Studio & AI Tools
    adjustments: 'ایڈجسٹمنٹ',
    filters: 'فلٹرز',
    cutout: 'بیک گراؤنڈ کٹ آؤٹ',
    replaceBg: 'بیک گراؤنڈ تبدیل کریں',
    styleMatch: 'اسٹائل میچ ("اس جیسا بنائیں")',
    photoToVideo: 'تصویر سے ویڈیو اینیمیشن',
    aiEnhance: 'اے آئی کوالٹی انہانس',
    holdForOriginal: 'اصل تصویر دیکھنے کیلئے دبا کر رکھیں',
    brightness: 'روشنی',
    contrast: 'کنٹراسٹ',
    saturation: 'رنگ گہرائی',
    temperature: 'گرمی / ٹھنڈک',
    vignette: 'وگنیٹ سائیہ',
    exportPhoto: 'تصویر محفوظ کریں',
    
    // Video Studio & Timeline
    timeline: 'ملٹی ٹریک ٹائم لائن',
    split: 'کٹ لگائیں',
    trim: 'چھوٹا کریں',
    speed: 'رفتار (وولاسٹی)',
    transitions: 'ٹرانزیشنز',
    effects: 'اسپیشل ایفیکٹس',
    textCaptions: 'اردو کیپشنز و ٹیکسٹ',
    audioMusic: 'موسیقی و بیٹ سنک',
    stickers: 'اسٹیکرز',
    canvasRatio: 'کینوس تناسب',
    exportVideo: 'ویڈیو ایکسپورٹ کریں',
    
    // Settings & Appearance
    appearance: 'تھیمز اور ظاہری شکل',
    aiProviders: 'اے آئی پرووائیڈرز آرکیٹیکچر',
    privacySecurity: 'رازداری اور کلاؤڈ رضامندی',
    storageBackup: 'اسٹوریج اور بیک اپ',
    language: 'زبان / Language',
    urduDigits: 'اردو ہندسے (۰-۹)',
    
    // Cloud Privacy
    cloudConsentTitle: 'کلاؤڈ پروسیسنگ کی اجازت',
    cloudConsentNotice: 'اس فیچر کے استعمال کیلئے آپ کی تصویر کلاؤڈ سروس کو پروسیسنگ کیلئے بھیجی جائے گی۔',
    cancel: 'منسوخ',
    continueBtn: 'جاری رکھیں',
    rememberChoice: 'میری اجازت یاد رکھیں',
    
    // Common Actions
    save: 'محفوظ کریں',
    discard: 'رد کریں',
    recover: 'بحال کریں',
    delete: 'حذف کریں',
    duplicate: 'نقل بنائیں',
    export: 'ایکسپورٹ',
    undo: 'واپس',
    redo: 'دوبارہ',
    search: 'تلاش کریں'
  }
};

export class I18nService {
  private static currentLang: AppLanguage = 'en';
  private static useUrduDigits: boolean = false;
  private static listeners: Set<(config: I18nConfig) => void> = new Set();

  public static init(): I18nConfig {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem(STORAGE_KEY_LANG) as AppLanguage;
      const savedDigits = localStorage.getItem(STORAGE_KEY_DIGITS) === 'true';

      if (savedLang === 'ur' || savedLang === 'en') {
        this.currentLang = savedLang;
      }
      this.useUrduDigits = savedDigits;

      this.applyLanguageToDOM();
    }
    return this.getConfig();
  }

  public static getConfig(): I18nConfig {
    return {
      language: this.currentLang,
      useUrduDigits: this.useUrduDigits
    };
  }

  public static getLanguage(): AppLanguage {
    return this.currentLang;
  }

  public static isRTL(): boolean {
    return this.currentLang === 'ur';
  }

  public static setLanguage(lang: AppLanguage) {
    this.currentLang = lang;
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    this.applyLanguageToDOM();
    this.emitChange();
  }

  public static setUrduDigits(enabled: boolean) {
    this.useUrduDigits = enabled;
    localStorage.setItem(STORAGE_KEY_DIGITS, enabled ? 'true' : 'false');
    this.emitChange();
  }

  public static toggleLanguage() {
    this.setLanguage(this.currentLang === 'en' ? 'ur' : 'en');
  }

  public static subscribe(listener: (config: I18nConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static emitChange() {
    const config = this.getConfig();
    this.listeners.forEach((fn) => fn(config));
  }

  public static applyLanguageToDOM() {
    if (typeof document !== 'undefined') {
      const html = document.documentElement;
      const isRtl = this.isRTL();
      html.dir = isRtl ? 'rtl' : 'ltr';
      html.lang = this.currentLang;
      if (isRtl) {
        html.classList.add('rtl-layout');
      } else {
        html.classList.remove('rtl-layout');
      }
    }
  }

  public static t(key: keyof typeof TRANSLATIONS['en']): string {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || (key as string);
  }

  public static formatDigits(val: string | number): string {
    const str = String(val);
    if (!this.useUrduDigits && this.currentLang !== 'ur') return str;
    return str.replace(/[0-9]/g, (digit) => URDU_DIGITS[parseInt(digit, 10)]);
  }
}
