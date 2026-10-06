export type AspectRatio = '9:16' | '1:1' | '4:5' | '16:9' | '3:4';

export type ClipType = 'video' | 'image' | 'audio' | 'text' | 'effect' | 'sticker';

export interface Keyframe {
  id: string;
  time: number; // relative to clip start in seconds
  scale?: number;
  x?: number; // offset in % of canvas (-50 to +50)
  y?: number;
  rotation?: number; // in degrees
  opacity?: number;
}

export interface Transition {
  id: string;
  type:
    | 'none'
    | 'fade'
    | 'dissolve'
    | 'zoom-in'
    | 'zoom-out'
    | 'spin'
    | 'swipe-left'
    | 'swipe-right'
    | 'swipe-up'
    | 'swipe-down'
    | 'blur-flash'
    | 'glitch'
    | 'camera-whip'
    | 'cube-flip'
    | 'warp'
    | 'mask';
  duration: number; // in seconds (e.g. 0.3 - 1.5)
}

export interface ColorAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure?: number; // -100 to 100
  temperature: number; // -100 to 100 (warm/cool)
  tint: number; // -100 to 100 (green/magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  sharpen: number; // 0 to 100
  vignette: number; // 0 to 100
  fade: number; // 0 to 100
  presetName?: string;
}

export type EffectType =
  | 'none'
  | 'blur'
  | 'motion-blur'
  | 'glitch'
  | 'vhs'
  | 'rgb-split'
  | 'shake'
  | 'flash'
  | 'neon-glow'
  | 'cinematic-bars'
  | 'retro-film'
  | 'light-leak'
  | 'particles'
  | 'distortion'
  | 'cyberpunk'
  | 'vintage-grain'
  | 'ai-depth';

export interface EffectConfig {
  type: EffectType;
  intensity: number; // 0 to 100
  speed: number; // 0.5 to 3
}

export type TextAnimationType =
  | 'none'
  | 'typewriter'
  | 'pop'
  | 'bounce'
  | 'fade'
  | 'slide'
  | 'word-by-word'
  | 'karaoke';

export interface TextWordHighlight {
  word: string;
  start: number;
  end: number;
}

export interface TextConfig {
  text: string;
  fontFamily: string;
  fontSize: number; // in px on 1080 canvas
  color: string;
  bold: boolean;
  italic: boolean;
  letterSpacing: number; // in px
  lineSpacing: number;
  align: 'left' | 'center' | 'right';
  gradient: {
    enabled: boolean;
    startColor: string;
    endColor: string;
    angle: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
  shadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  glow: {
    enabled: boolean;
    color: string;
    intensity: number;
  };
  backgroundBox: {
    enabled: boolean;
    color: string;
    padding: number;
    borderRadius: number;
  };
  animation: TextAnimationType;
  karaokeWords?: TextWordHighlight[];
}

export interface StickerConfig {
  type: 'emoji' | 'shape' | 'arrow' | 'badge' | 'custom' | 'social';
  content: string; // emoji char, SVG path identifier, or image data URL
  color?: string;
  width: number;
  height: number;
}

export interface Clip {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  start: number; // timeline start time in seconds
  duration: number; // duration on timeline in seconds
  sourceStart: number; // in-point in source media
  sourceDuration: number;
  src?: string; // Media URL or data URI
  thumbnail?: string;

  // Visual Transform
  x: number; // offset % (-50 to 50)
  y: number;
  scale: number; // 1 = 100%
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Playback
  speed: number; // 0.2 to 10
  reversed: boolean;
  freezeFrame?: boolean;

  // Audio settings (for video or audio clips)
  volume: number; // 0 to 2 (1 = 100%)
  fadeIn: number; // seconds
  fadeOut: number; // seconds
  noiseReduction?: boolean;

  // Effects & Color
  adjustments: ColorAdjustments;
  effect: EffectConfig;
  transitionIn?: Transition;

  // Text / Caption specifics
  textConfig?: TextConfig;

  // Sticker specifics
  stickerConfig?: StickerConfig;

  // Keyframes
  keyframes: Keyframe[];

  // AI & Chroma key
  chromaKey?: {
    enabled: boolean;
    color: string;
    similarity: number;
    smoothness: number;
  };
  aiBackgroundRemoval?: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effect' | 'sticker';
  clips: Clip[];
  muted?: boolean;
  locked?: boolean;
  visible?: boolean;
}

export interface BeatMarker {
  time: number; // seconds
  intensity: 'heavy' | 'light';
}

export interface Project {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  duration: number; // total project duration in seconds
  fps: 24 | 30 | 60;
  tracks: Track[];
  beats: BeatMarker[];
  canvasBackground: {
    type: 'color' | 'blur' | 'pattern';
    color: string;
    blurAmount: number;
  };
  createdAt: number;
  updatedAt: number;
  thumbnail?: string;
  isTemplate?: boolean;
}

export type TemplateCategory =
  | 'Trending'
  | 'Photo Templates'
  | 'Video Templates'
  | 'AI Templates'
  | 'Beat Sync'
  | 'Velocity'
  | 'Slow Motion'
  | 'Cinematic'
  | 'Wedding'
  | 'Birthday'
  | 'Love'
  | 'Travel'
  | 'Business'
  | 'Fashion'
  | 'Portrait'
  | 'Instagram'
  | 'TikTok'
  | 'YouTube Shorts'
  | 'Reels'
  | 'Status'
  | 'Urdu'
  | 'Arabic'
  | 'English'
  | 'Chinese'
  | 'Motivational'
  | 'Emotional'
  | '3D'
  | 'Glitch'
  | 'Flash'
  | 'Zoom'
  | 'Camera'
  | 'Transition'
  | 'Before/After'
  | 'Collage'
  | 'Slideshow'
  | 'Fast Cut'
  | 'Aesthetic'
  | 'Lyrics'
  | 'Montage'
  | 'Lifestyle'
  | 'Fitness'
  | 'Celebration'
  | 'Recap'
  | string;

export interface TemplateSlot {
  id?: string;
  startTime: number;
  duration: number;
  suggestedType: 'video' | 'image';
  aspectRatio?: AspectRatio;
  cropMode?: 'cover' | 'contain' | 'fill';
  transition: Transition['type'];
  effect: EffectType;
  textOverlay?: string;
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  userMediaUrl?: string;
  isEstimated?: boolean;
}

export interface TemplateConfidence {
  text: number;
  timing: number;
  transitions: number;
  effects: number;
  font: number;
  audio: number;
}

export interface TemplateDefinition {
  id: string;
  title: string;
  category: TemplateCategory;
  creator?: string;
  source?: 'BuiltIn' | 'ImportedLink' | 'ImportedVideo' | 'Project' | 'UserCreated';
  sourceUrl?: string;
  thumbnail?: string;
  aspectRatio: AspectRatio;
  duration: number;
  requiredMediaCount: number;
  description: string;
  coverGradient: string;
  photoSlotsCount?: number;
  videoSlotsCount?: number;
  textLayersCount?: number;
  transitionsCount?: number;
  effectsCount?: number;
  audioCount?: number;
  aiElementsCount?: number;
  language?: string;
  tags?: string[];
  importDate?: number;
  lastUsedDate?: number;
  usedCount?: number;
  duplicateFingerprint?: string;
  similarityScore?: number;
  isReconstructed?: boolean;
  confidence?: TemplateConfidence;
  audioTrack: {
    title: string;
    artist: string;
    src: string;
    duration: number;
    beats: number[];
  };
  slots: TemplateSlot[];
  captionStyle?: string;
  isFavorite?: boolean;
}

export interface UnmatchedItem {
  type: 'effect' | 'font' | 'transition';
  original: string;
  closestMatch: string;
  isEstimated: boolean;
}

export interface TemplateFidelityReport {
  overallScore: number;
  cutTimingScore: number;
  textLayoutScore: number;
  textStyleScore: number;
  colorScore: number;
  transitionsScore: number;
  audioBpmScore: number;
  unmatchedItems: UnmatchedItem[];
}

export type DuplicateClassification = 'DUPLICATE' | 'VERY_SIMILAR' | 'UNIQUE';

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  classification: DuplicateClassification;
  similarityPercentage: number;
  existingTemplate: TemplateDefinition | null;
  matchReasons: string[];
  differenceReasons: string[];
}

export interface ExportSettings {
  resolution: '720p' | '1080p' | '2k' | '4k';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'webm';
  quality: 'standard' | 'high' | 'ultra';
  bitrateMbps: number;
}
