import { TemplateDefinition, ColorAdjustments, BeatMarker } from '../types/editor';

export interface SampleMediaItem {
  id: string;
  title: string;
  type: 'video' | 'image';
  duration: number;
  thumbnail: string;
  url: string;
  theme: 'urban' | 'nature' | 'cyber' | 'action' | 'sunset' | 'lifestyle';
}

export interface SoundEffectItem {
  id: string;
  name: string;
  category: 'whoosh' | 'glitch' | 'impact' | 'foley' | 'ui';
  duration: number; // seconds
  frequency: number;
}

export interface MusicTrackItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  duration: number;
  beats: BeatMarker[];
}

// Procedural video canvases for sample clips: creates visually stunning dynamic footage
export const SAMPLE_VIDEOS: SampleMediaItem[] = [
  {
    id: 'sample-urban-night',
    title: 'Tokyo Cyber Drive',
    type: 'video',
    duration: 12.0,
    theme: 'cyber',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="320" viewBox="0 0 180 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230f172a"/><stop offset="50%" stop-color="%233b0764"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="180" height="320" fill="url(%23g)"/><circle cx="90" cy="160" r="50" fill="%23f43f5e" opacity="0.6"/><path d="M20 280 L90 200 L160 280" stroke="%2338bdf8" stroke-width="4" fill="none"/><text x="90" y="300" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Cyber Drive</text></svg>',
    url: 'sample-video-cyber'
  },
  {
    id: 'sample-sunset-beach',
    title: 'Golden Hour Surf',
    type: 'video',
    duration: 10.0,
    theme: 'sunset',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="320" viewBox="0 0 180 320"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23f97316"/><stop offset="60%" stop-color="%23ec4899"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="180" height="320" fill="url(%23g)"/><circle cx="90" cy="140" r="40" fill="%23fef08a" opacity="0.9"/><path d="M0 240 Q45 220 90 240 T180 240 L180 320 L0 320 Z" fill="%231e3a8a"/><text x="90" y="300" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Golden Coast</text></svg>',
    url: 'sample-video-sunset'
  },
  {
    id: 'sample-skate-action',
    title: 'Street Skate Jump',
    type: 'video',
    duration: 8.0,
    theme: 'action',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="320" viewBox="0 0 180 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2318181b"/><stop offset="100%" stop-color="%2327272a"/></linearGradient></defs><rect width="180" height="320" fill="url(%23g)"/><path d="M40 180 L140 120" stroke="%23eab308" stroke-width="8" stroke-linecap="round"/><circle cx="50" cy="190" r="10" fill="%23f43f5e"/><circle cx="130" cy="130" r="10" fill="%23f43f5e"/><text x="90" y="300" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Action Skate</text></svg>',
    url: 'sample-video-action'
  },
  {
    id: 'sample-aesthetic-coffee',
    title: 'Aesthetic Espresso Pour',
    type: 'video',
    duration: 9.0,
    theme: 'lifestyle',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="320" viewBox="0 0 180 320"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23451a03"/><stop offset="100%" stop-color="%2378350f"/></linearGradient></defs><rect width="180" height="320" fill="url(%23g)"/><circle cx="90" cy="160" r="45" fill="%23fef3c7" stroke="%2392400e" stroke-width="6"/><path d="M80 140 Q90 180 100 140" fill="none" stroke="%2378350f" stroke-width="4"/><text x="90" y="300" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Morning Coffee</text></svg>',
    url: 'sample-video-coffee'
  },
  {
    id: 'sample-drone-mountain',
    title: 'Alpine Peak Flight',
    type: 'video',
    duration: 14.0,
    theme: 'nature',
    thumbnail: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="320" viewBox="0 0 180 320"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="180" height="320" fill="url(%23g)"/><polygon points="30,220 90,120 150,220" fill="%23e2e8f0"/><polygon points="80,240 130,150 180,240" fill="%2394a3b8" opacity="0.8"/><text x="90" y="300" text-anchor="middle" fill="white" font-size="12" font-family="sans-serif">Alpine Drone</text></svg>',
    url: 'sample-video-mountain'
  }
];

export const MUSIC_TRACKS: MusicTrackItem[] = [
  {
    id: 'track-phonk-drift',
    title: 'Midnight Drift (Phonk)',
    artist: 'VeloWave',
    genre: 'Phonk / Trap',
    bpm: 140,
    duration: 20.0,
    beats: [
      { time: 0.0, intensity: 'heavy' },
      { time: 0.85, intensity: 'light' },
      { time: 1.71, intensity: 'heavy' },
      { time: 2.57, intensity: 'light' },
      { time: 3.42, intensity: 'heavy' },
      { time: 4.28, intensity: 'light' },
      { time: 5.14, intensity: 'heavy' },
      { time: 6.0, intensity: 'heavy' },
      { time: 6.85, intensity: 'light' },
      { time: 7.71, intensity: 'heavy' },
      { time: 8.57, intensity: 'light' },
      { time: 9.42, intensity: 'heavy' },
      { time: 10.28, intensity: 'light' },
      { time: 11.14, intensity: 'heavy' },
      { time: 12.0, intensity: 'heavy' }
    ]
  },
  {
    id: 'track-lofi-chill',
    title: 'Rainy Cafe Moments',
    artist: 'Aura Bloom',
    genre: 'Lo-Fi Chill',
    bpm: 85,
    duration: 24.0,
    beats: [
      { time: 0.0, intensity: 'heavy' },
      { time: 1.41, intensity: 'heavy' },
      { time: 2.82, intensity: 'heavy' },
      { time: 4.23, intensity: 'heavy' },
      { time: 5.64, intensity: 'heavy' },
      { time: 7.05, intensity: 'heavy' },
      { time: 8.47, intensity: 'heavy' },
      { time: 9.88, intensity: 'heavy' }
    ]
  },
  {
    id: 'track-synthwave-neon',
    title: 'Neon Horizon 1984',
    artist: 'RetroVibe',
    genre: 'Synthwave',
    bpm: 124,
    duration: 22.0,
    beats: [
      { time: 0.0, intensity: 'heavy' },
      { time: 0.96, intensity: 'light' },
      { time: 1.93, intensity: 'heavy' },
      { time: 2.9, intensity: 'light' },
      { time: 3.87, intensity: 'heavy' },
      { time: 4.83, intensity: 'light' },
      { time: 5.8, intensity: 'heavy' }
    ]
  },
  {
    id: 'track-upbeat-pop',
    title: 'Sunny Days Ahead',
    artist: 'Nova Spark',
    genre: 'Upbeat Pop',
    bpm: 120,
    duration: 18.0,
    beats: [
      { time: 0.0, intensity: 'heavy' },
      { time: 1.0, intensity: 'heavy' },
      { time: 2.0, intensity: 'heavy' },
      { time: 3.0, intensity: 'heavy' },
      { time: 4.0, intensity: 'heavy' },
      { time: 5.0, intensity: 'heavy' },
      { time: 6.0, intensity: 'heavy' }
    ]
  },
  {
    id: 'track-cinematic-trailer',
    title: 'Ascension of Titans',
    artist: 'Velo Cinematic',
    genre: 'Epic Orchestral',
    bpm: 96,
    duration: 25.0,
    beats: [
      { time: 0.0, intensity: 'heavy' },
      { time: 2.5, intensity: 'heavy' },
      { time: 5.0, intensity: 'heavy' },
      { time: 7.5, intensity: 'heavy' },
      { time: 10.0, intensity: 'heavy' }
    ]
  }
];

export const SOUND_EFFECTS: SoundEffectItem[] = [
  { id: 'sfx-whoosh-fast', name: 'Fast Whip Whoosh', category: 'whoosh', duration: 0.4, frequency: 440 },
  { id: 'sfx-whoosh-deep', name: 'Deep Cinematic Swoosh', category: 'whoosh', duration: 0.8, frequency: 180 },
  { id: 'sfx-glitch-digital', name: 'Digital Glitch Zap', category: 'glitch', duration: 0.5, frequency: 880 },
  { id: 'sfx-camera-shutter', name: 'Vintage Camera Click', category: 'foley', duration: 0.3, frequency: 1200 },
  { id: 'sfx-bass-drop', name: 'Sub Bass Drop Impact', category: 'impact', duration: 1.2, frequency: 65 },
  { id: 'sfx-pop-bubble', name: 'Crisp UI Bubble Pop', category: 'ui', duration: 0.2, frequency: 650 },
  { id: 'sfx-tape-stop', name: 'Vinyl Tape Scratch', category: 'glitch', duration: 0.6, frequency: 320 },
  { id: 'sfx-ding-bell', name: 'Sparkling Success Ding', category: 'ui', duration: 0.7, frequency: 1046 }
];

export const COLOR_PRESETS: { name: string; category: string; adjustments: Partial<ColorAdjustments> }[] = [
  {
    name: 'Teal & Orange',
    category: 'Cinematic',
    adjustments: {
      brightness: 4,
      contrast: 22,
      saturation: 25,
      temperature: 15,
      tint: -12,
      highlights: -10,
      shadows: 15,
      vignette: 25,
      fade: 0
    }
  },
  {
    name: '90s Vintage Kodak',
    category: 'Retro',
    adjustments: {
      brightness: -2,
      contrast: 12,
      saturation: -8,
      temperature: 20,
      tint: 8,
      fade: 18,
      vignette: 20,
      highlights: -15
    }
  },
  {
    name: 'Tokyo Cyberpunk',
    category: 'Vibrant',
    adjustments: {
      brightness: 8,
      contrast: 32,
      saturation: 45,
      temperature: -22,
      tint: 28,
      vignette: 30,
      highlights: 12
    }
  },
  {
    name: 'Golden Hour Sunset',
    category: 'Warm',
    adjustments: {
      brightness: 6,
      contrast: 15,
      saturation: 30,
      temperature: 38,
      tint: -5,
      highlights: 5,
      vignette: 15
    }
  },
  {
    name: 'B&W Film Noir',
    category: 'Monochrome',
    adjustments: {
      brightness: 2,
      contrast: 40,
      saturation: -100,
      temperature: 0,
      tint: 0,
      highlights: 10,
      shadows: -15,
      vignette: 45
    }
  },
  {
    name: 'Clean Studio Portrait',
    category: 'Portrait',
    adjustments: {
      brightness: 10,
      contrast: 8,
      saturation: 10,
      temperature: 5,
      tint: -2,
      highlights: -8,
      shadows: 12,
      sharpen: 20
    }
  },
  {
    name: 'Bleach Bypass',
    category: 'Dramatic',
    adjustments: {
      brightness: -5,
      contrast: 45,
      saturation: -40,
      temperature: -10,
      highlights: 20,
      vignette: 25
    }
  },
  {
    name: 'Emerald Moody',
    category: 'Cinematic',
    adjustments: {
      brightness: -4,
      contrast: 18,
      saturation: 8,
      temperature: -15,
      tint: -25,
      fade: 10,
      vignette: 35
    }
  }
];

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'template-trending-beat-sync',
    title: 'Phonk Beat Drop Sync',
    category: 'Trending',
    aspectRatio: '9:16',
    duration: 10.3,
    requiredMediaCount: 6,
    description: 'Fast energetic cuts aligned perfectly with bass hits and whip transitions.',
    coverGradient: 'from-fuchsia-600 via-purple-700 to-indigo-900',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 10.3,
      beats: [0.0, 1.71, 3.42, 5.14, 6.85, 8.57]
    },
    slots: [
      { startTime: 0.0, duration: 1.71, suggestedType: 'video', transition: 'glitch', effect: 'flash', textOverlay: 'WAIT FOR IT...' },
      { startTime: 1.71, duration: 1.71, suggestedType: 'video', transition: 'camera-whip', effect: 'shake', textOverlay: 'LEVEL UP' },
      { startTime: 3.42, duration: 1.72, suggestedType: 'video', transition: 'zoom-in', effect: 'rgb-split' },
      { startTime: 5.14, duration: 1.71, suggestedType: 'video', transition: 'spin', effect: 'motion-blur' },
      { startTime: 6.85, duration: 1.72, suggestedType: 'video', transition: 'cube-flip', effect: 'neon-glow', textOverlay: 'INSANE' },
      { startTime: 8.57, duration: 1.73, suggestedType: 'video', transition: 'fade', effect: 'glitch', textOverlay: 'OUTRO' }
    ]
  },
  {
    id: 'template-smooth-velocity',
    title: 'Smooth Velocity Edit (Speed Ramp)',
    category: 'Velocity',
    aspectRatio: '9:16',
    duration: 8.5,
    requiredMediaCount: 5,
    description: 'Silky smooth slow-motion ramping up to lightning fast beat drops with flash frames.',
    coverGradient: 'from-violet-600 via-indigo-700 to-cyan-900',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 8.5,
      beats: [0.0, 1.7, 3.4, 5.1, 6.8]
    },
    slots: [
      { startTime: 0.0, duration: 1.7, suggestedType: 'video', transition: 'zoom-in', effect: 'shake', textOverlay: 'VELOCITY' },
      { startTime: 1.7, duration: 1.7, suggestedType: 'video', transition: 'camera-whip', effect: 'flash', textOverlay: 'SLOW MO' },
      { startTime: 3.4, duration: 1.7, suggestedType: 'video', transition: 'spin', effect: 'motion-blur', textOverlay: 'DROP' },
      { startTime: 5.1, duration: 1.7, suggestedType: 'video', transition: 'blur-flash', effect: 'rgb-split' },
      { startTime: 6.8, duration: 1.7, suggestedType: 'video', transition: 'zoom-out', effect: 'neon-glow', textOverlay: 'SMOOTH' }
    ]
  },
  {
    id: 'template-drill-velocity',
    title: 'UK Drill / Trap Velocity Glow',
    category: 'Velocity',
    aspectRatio: '9:16',
    duration: 9.6,
    requiredMediaCount: 6,
    description: 'Heavy bass hits paired with neon electric borders, quick zoom snaps, and glitch cuts.',
    coverGradient: 'from-cyan-600 via-blue-800 to-slate-950',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 9.6,
      beats: [0.0, 1.6, 3.2, 4.8, 6.4, 8.0]
    },
    slots: [
      { startTime: 0.0, duration: 1.6, suggestedType: 'video', transition: 'glitch', effect: 'neon-glow', textOverlay: 'LOCK IN' },
      { startTime: 1.6, duration: 1.6, suggestedType: 'video', transition: 'camera-whip', effect: 'shake', textOverlay: 'DRILL' },
      { startTime: 3.2, duration: 1.6, suggestedType: 'video', transition: 'zoom-in', effect: 'flash' },
      { startTime: 4.8, duration: 1.6, suggestedType: 'video', transition: 'blur-flash', effect: 'rgb-split', textOverlay: 'NO MERCY' },
      { startTime: 6.4, duration: 1.6, suggestedType: 'video', transition: 'spin', effect: 'neon-glow' },
      { startTime: 8.0, duration: 1.6, suggestedType: 'video', transition: 'fade', effect: 'glitch', textOverlay: 'FINISH' }
    ]
  },
  {
    id: 'template-photo-montage',
    title: 'Rapid Photo Flip 15 Shots',
    category: 'Montage',
    aspectRatio: '9:16',
    duration: 7.5,
    requiredMediaCount: 5,
    description: 'Rapid photo beat-sync montage designed for photo dumps, vacation recaps, and outfit flips.',
    coverGradient: 'from-amber-600 via-red-600 to-pink-700',
    audioTrack: {
      title: 'Neon Horizon 1984',
      artist: 'RetroVibe',
      src: 'track-synthwave-neon',
      duration: 7.5,
      beats: [0.0, 1.5, 3.0, 4.5, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 1.5, suggestedType: 'image', transition: 'zoom-in', effect: 'none', textOverlay: 'DUMP 01' },
      { startTime: 1.5, duration: 1.5, suggestedType: 'image', transition: 'zoom-out', effect: 'none', textOverlay: 'DUMP 02' },
      { startTime: 3.0, duration: 1.5, suggestedType: 'image', transition: 'swipe-left', effect: 'none', textOverlay: 'DUMP 03' },
      { startTime: 4.5, duration: 1.5, suggestedType: 'image', transition: 'swipe-right', effect: 'none', textOverlay: 'DUMP 04' },
      { startTime: 6.0, duration: 1.5, suggestedType: 'image', transition: 'fade', effect: 'none', textOverlay: 'MEMORIES' }
    ]
  },
  {
    id: 'template-3d-zoom-parallax',
    title: '3D Parallax Photo Pop',
    category: 'Montage',
    aspectRatio: '9:16',
    duration: 8.0,
    requiredMediaCount: 4,
    description: 'Dynamic 3D pop effect bringing 2D portraits and landscapes to life with depth keyframing.',
    coverGradient: 'from-emerald-600 via-teal-700 to-blue-900',
    audioTrack: {
      title: 'Sunny Days Ahead',
      artist: 'Nova Spark',
      src: 'track-upbeat-pop',
      duration: 8.0,
      beats: [0.0, 2.0, 4.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-in', effect: 'particles', textOverlay: 'IMMERSIVE' },
      { startTime: 2.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-out', effect: 'particles', textOverlay: 'DEPTH' },
      { startTime: 4.0, duration: 2.0, suggestedType: 'image', transition: 'spin', effect: 'particles', textOverlay: 'DIMENSION' },
      { startTime: 6.0, duration: 2.0, suggestedType: 'image', transition: 'fade', effect: 'particles', textOverlay: 'PERFECTION' }
    ]
  },
  {
    id: 'template-film-roll-35mm',
    title: 'Analog Film Roll 35mm',
    category: 'Aesthetic',
    aspectRatio: '9:16',
    duration: 9.0,
    requiredMediaCount: 3,
    description: 'Nostalgic 90s film aesthetic with authentic grain texture, warm light leak flares and frame slides.',
    coverGradient: 'from-amber-700 via-orange-800 to-yellow-950',
    audioTrack: {
      title: 'Rainy Cafe Moments',
      artist: 'Aura Bloom',
      src: 'track-lofi-chill',
      duration: 9.0,
      beats: [0.0, 3.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 3.0, suggestedType: 'image', transition: 'dissolve', effect: 'vintage-grain', textOverlay: '35MM ARCHIVE' },
      { startTime: 3.0, duration: 3.0, suggestedType: 'image', transition: 'swipe-left', effect: 'light-leak', textOverlay: 'SUMMER OF 98' },
      { startTime: 6.0, duration: 3.0, suggestedType: 'image', transition: 'dissolve', effect: 'vintage-grain', textOverlay: 'NEVER FORGET' }
    ]
  },
  {
    id: 'template-neon-lyrics',
    title: 'Viral TikTok Karaoke Lyrics',
    category: 'Lyrics',
    aspectRatio: '9:16',
    duration: 8.5,
    requiredMediaCount: 3,
    description: 'Dynamic word-by-word active karaoke text highlight with electric glow and subtle zooms.',
    coverGradient: 'from-pink-600 via-rose-700 to-purple-900',
    audioTrack: {
      title: 'Neon Horizon 1984',
      artist: 'RetroVibe',
      src: 'track-synthwave-neon',
      duration: 8.5,
      beats: [0.0, 2.8, 5.6]
    },
    slots: [
      { startTime: 0.0, duration: 2.8, suggestedType: 'video', transition: 'fade', effect: 'neon-glow', textOverlay: 'Tell me what you see...' },
      { startTime: 2.8, duration: 2.8, suggestedType: 'video', transition: 'dissolve', effect: 'light-leak', textOverlay: '...under city lights!' },
      { startTime: 5.6, duration: 2.9, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'Sing along with me' }
    ]
  },
  {
    id: 'template-aesthetic-lyrics',
    title: 'Lo-Fi Aesthetic Quote',
    category: 'Lyrics',
    aspectRatio: '9:16',
    duration: 11.2,
    requiredMediaCount: 3,
    description: 'Grainy film aesthetic with animated typewriter lyrics and gentle cross-dissolves.',
    coverGradient: 'from-rose-500 via-pink-600 to-purple-800',
    audioTrack: {
      title: 'Rainy Cafe Moments',
      artist: 'Aura Bloom',
      src: 'track-lofi-chill',
      duration: 11.2,
      beats: [0.0, 2.82, 5.64, 8.47]
    },
    slots: [
      { startTime: 0.0, duration: 3.73, suggestedType: 'video', transition: 'dissolve', effect: 'retro-film', textOverlay: 'Sometimes silence speaks...' },
      { startTime: 3.73, duration: 3.73, suggestedType: 'video', transition: 'dissolve', effect: 'light-leak', textOverlay: '...louder than words.' },
      { startTime: 7.46, duration: 3.74, suggestedType: 'video', transition: 'fade', effect: 'retro-film', textOverlay: 'Find your peace.' }
    ]
  },
  {
    id: 'template-before-after',
    title: 'Before & After Reveal',
    category: 'Before/After',
    aspectRatio: '9:16',
    duration: 8.0,
    requiredMediaCount: 2,
    description: 'Classic side-by-side or snap reveal transition for fitness, color grading, or editing.',
    coverGradient: 'from-blue-600 via-indigo-600 to-violet-800',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 8.0,
      beats: [0.0, 4.0]
    },
    slots: [
      { startTime: 0.0, duration: 4.0, suggestedType: 'video', transition: 'glitch', effect: 'vintage-grain', textOverlay: 'BEFORE' },
      { startTime: 4.0, duration: 4.0, suggestedType: 'video', transition: 'blur-flash', effect: 'none', textOverlay: 'AFTER ✨' }
    ]
  },
  {
    id: 'template-cinematic-travel',
    title: 'Cinematic Travel Reel',
    category: 'Travel',
    aspectRatio: '9:16',
    duration: 12.5,
    requiredMediaCount: 4,
    description: 'Slow motion elegance with film letterboxes and warm sunset grading.',
    coverGradient: 'from-amber-500 via-orange-600 to-rose-700',
    audioTrack: {
      title: 'Ascension of Titans',
      artist: 'Velo Cinematic',
      src: 'track-cinematic-trailer',
      duration: 12.5,
      beats: [0.0, 3.1, 6.2, 9.3]
    },
    slots: [
      { startTime: 0.0, duration: 3.1, suggestedType: 'video', transition: 'fade', effect: 'cinematic-bars', textOverlay: 'WHERE MEMORIES LIVE' },
      { startTime: 3.1, duration: 3.1, suggestedType: 'video', transition: 'dissolve', effect: 'light-leak' },
      { startTime: 6.2, duration: 3.1, suggestedType: 'video', transition: 'swipe-left', effect: 'particles', textOverlay: 'LOST IN WONDER' },
      { startTime: 9.3, duration: 3.2, suggestedType: 'video', transition: 'fade', effect: 'cinematic-bars', textOverlay: 'EXPLORE MORE' }
    ]
  },
  {
    id: 'template-fast-cut-vlog',
    title: 'Daily Mini Vlog 9:16',
    category: 'Fast Cut',
    aspectRatio: '9:16',
    duration: 9.0,
    requiredMediaCount: 5,
    description: 'Crisp snappy jump-cuts for daily morning routine, aesthetic fits, and cafe trips.',
    coverGradient: 'from-emerald-500 via-teal-600 to-cyan-800',
    audioTrack: {
      title: 'Sunny Days Ahead',
      artist: 'Nova Spark',
      src: 'track-upbeat-pop',
      duration: 9.0,
      beats: [0.0, 1.8, 3.6, 5.4, 7.2]
    },
    slots: [
      { startTime: 0.0, duration: 1.8, suggestedType: 'video', transition: 'swipe-right', effect: 'none', textOverlay: 'A DAY WITH ME' },
      { startTime: 1.8, duration: 1.8, suggestedType: 'video', transition: 'zoom-out', effect: 'none', textOverlay: 'STEP 1: COFFEE' },
      { startTime: 3.6, duration: 1.8, suggestedType: 'video', transition: 'swipe-left', effect: 'none', textOverlay: 'ON THE GO' },
      { startTime: 5.4, duration: 1.8, suggestedType: 'video', transition: 'camera-whip', effect: 'none', textOverlay: 'WORK MODE' },
      { startTime: 7.2, duration: 1.8, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'SEE YA!' }
    ]
  },
  {
    id: 'template-fitness-beast',
    title: 'Gym Beast Mode PR',
    category: 'Fitness',
    aspectRatio: '9:16',
    duration: 8.5,
    requiredMediaCount: 4,
    description: 'High contrast monochrome styling with red strobe flashes and shake impacts for PR lifts.',
    coverGradient: 'from-red-600 via-neutral-900 to-zinc-950',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 8.5,
      beats: [0.0, 2.1, 4.2, 6.3]
    },
    slots: [
      { startTime: 0.0, duration: 2.1, suggestedType: 'video', transition: 'glitch', effect: 'flash', textOverlay: 'LIGHT WEIGHT' },
      { startTime: 2.1, duration: 2.1, suggestedType: 'video', transition: 'camera-whip', effect: 'shake', textOverlay: 'NEW PR' },
      { startTime: 4.2, duration: 2.1, suggestedType: 'video', transition: 'blur-flash', effect: 'rgb-split', textOverlay: 'NO EXCUSES' },
      { startTime: 6.3, duration: 2.2, suggestedType: 'video', transition: 'zoom-in', effect: 'none', textOverlay: 'BEAST MODE' }
    ]
  },
  {
    id: 'template-ootd-fashion',
    title: 'OOTD Outfit Transition (Shoe Snap)',
    category: 'Lifestyle',
    aspectRatio: '9:16',
    duration: 7.2,
    requiredMediaCount: 4,
    description: 'Viral shoe drop transition jumping straight into fire fits with smooth zoom snaps.',
    coverGradient: 'from-stone-700 via-amber-800 to-stone-900',
    audioTrack: {
      title: 'Sunny Days Ahead',
      artist: 'Nova Spark',
      src: 'track-upbeat-pop',
      duration: 7.2,
      beats: [0.0, 1.8, 3.6, 5.4]
    },
    slots: [
      { startTime: 0.0, duration: 1.8, suggestedType: 'video', transition: 'camera-whip', effect: 'none', textOverlay: 'FIT CHECK' },
      { startTime: 1.8, duration: 1.8, suggestedType: 'video', transition: 'zoom-in', effect: 'none', textOverlay: 'OUTFIT 01' },
      { startTime: 3.6, duration: 1.8, suggestedType: 'video', transition: 'cube-flip', effect: 'none', textOverlay: 'DETAILS' },
      { startTime: 5.4, duration: 1.8, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'WHICH ONE?' }
    ]
  },
  {
    id: 'template-birthday-party',
    title: 'Confetti Birthday Celebration',
    category: 'Celebration',
    aspectRatio: '9:16',
    duration: 8.0,
    requiredMediaCount: 4,
    description: 'Golden confetti particles, champagne bokeh, and popping celebration badges.',
    coverGradient: 'from-yellow-500 via-amber-600 to-pink-700',
    audioTrack: {
      title: 'Sunny Days Ahead',
      artist: 'Nova Spark',
      src: 'track-upbeat-pop',
      duration: 8.0,
      beats: [0.0, 2.0, 4.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 2.0, suggestedType: 'video', transition: 'blur-flash', effect: 'particles', textOverlay: 'HAPPY BIRTHDAY! 🎂' },
      { startTime: 2.0, duration: 2.0, suggestedType: 'video', transition: 'zoom-in', effect: 'light-leak', textOverlay: 'ANOTHER YEAR OLDER' },
      { startTime: 4.0, duration: 2.0, suggestedType: 'video', transition: 'spin', effect: 'particles', textOverlay: 'LIVING MY BEST LIFE' },
      { startTime: 6.0, duration: 2.0, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'THANK YOU ALL ❤️' }
    ]
  },
  {
    id: 'template-wedding-romantic',
    title: 'Romantic Golden Hour Wedding',
    category: 'Celebration',
    aspectRatio: '9:16',
    duration: 10.0,
    requiredMediaCount: 4,
    description: 'Soft romantic cross-dissolves with golden light leak flares and elegant serif typography.',
    coverGradient: 'from-rose-400 via-pink-600 to-rose-900',
    audioTrack: {
      title: 'Ascension of Titans',
      artist: 'Velo Cinematic',
      src: 'track-cinematic-trailer',
      duration: 10.0,
      beats: [0.0, 2.5, 5.0, 7.5]
    },
    slots: [
      { startTime: 0.0, duration: 2.5, suggestedType: 'video', transition: 'dissolve', effect: 'light-leak', textOverlay: 'FOREVER STARTS TODAY' },
      { startTime: 2.5, duration: 2.5, suggestedType: 'video', transition: 'dissolve', effect: 'particles', textOverlay: 'MR. & MRS.' },
      { startTime: 5.0, duration: 2.5, suggestedType: 'video', transition: 'dissolve', effect: 'light-leak', textOverlay: 'ENDLESS LOVE' },
      { startTime: 7.5, duration: 2.5, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'HAPPILY EVER AFTER' }
    ]
  },
  {
    id: 'template-mindset-motivation',
    title: 'Discipline & Mindset Reel',
    category: 'Business',
    aspectRatio: '9:16',
    duration: 9.0,
    requiredMediaCount: 3,
    description: 'High impact motivational speech styling with dark cinematic grading and punchy bold quotes.',
    coverGradient: 'from-zinc-800 via-neutral-900 to-black',
    audioTrack: {
      title: 'Ascension of Titans',
      artist: 'Velo Cinematic',
      src: 'track-cinematic-trailer',
      duration: 9.0,
      beats: [0.0, 3.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 3.0, suggestedType: 'video', transition: 'fade', effect: 'cinematic-bars', textOverlay: 'DON’T QUIT WHEN TIRED' },
      { startTime: 3.0, duration: 3.0, suggestedType: 'video', transition: 'dissolve', effect: 'cinematic-bars', textOverlay: 'QUIT WHEN YOU ARE DONE' },
      { startTime: 6.0, duration: 3.0, suggestedType: 'video', transition: 'fade', effect: 'cinematic-bars', textOverlay: 'DISCIPLINE OVER MOTIVATION' }
    ]
  },
  {
    id: 'template-product-showcase',
    title: 'Tech Gadget Unboxing 9:16',
    category: 'Business',
    aspectRatio: '9:16',
    duration: 8.0,
    requiredMediaCount: 4,
    description: 'Clean high-tech showcase with 3D cube flip transitions and sleek minimal feature callouts.',
    coverGradient: 'from-blue-700 via-sky-800 to-slate-950',
    audioTrack: {
      title: 'Neon Horizon 1984',
      artist: 'RetroVibe',
      src: 'track-synthwave-neon',
      duration: 8.0,
      beats: [0.0, 2.0, 4.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 2.0, suggestedType: 'video', transition: 'cube-flip', effect: 'none', textOverlay: 'MEET THE FUTURE' },
      { startTime: 2.0, duration: 2.0, suggestedType: 'video', transition: 'zoom-in', effect: 'none', textOverlay: 'AEROSPACE GRADE' },
      { startTime: 4.0, duration: 2.0, suggestedType: 'video', transition: 'swipe-left', effect: 'none', textOverlay: '10X PERFORMANCE' },
      { startTime: 6.0, duration: 2.0, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'LINK IN BIO 🔗' }
    ]
  },
  {
    id: 'template-year-recap-12',
    title: '12 Months in 12 Seconds',
    category: 'Recap',
    aspectRatio: '9:16',
    duration: 12.0,
    requiredMediaCount: 6,
    description: 'Rapid 12-shot compilation recapping your entire year in a high-speed viral beat flash format.',
    coverGradient: 'from-emerald-500 via-indigo-600 to-rose-700',
    audioTrack: {
      title: 'Sunny Days Ahead',
      artist: 'Nova Spark',
      src: 'track-upbeat-pop',
      duration: 12.0,
      beats: [0.0, 2.0, 4.0, 6.0, 8.0, 10.0]
    },
    slots: [
      { startTime: 0.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-in', effect: 'none', textOverlay: 'JAN - FEB' },
      { startTime: 2.0, duration: 2.0, suggestedType: 'image', transition: 'swipe-left', effect: 'none', textOverlay: 'MAR - APR' },
      { startTime: 4.0, duration: 2.0, suggestedType: 'image', transition: 'camera-whip', effect: 'none', textOverlay: 'MAY - JUN' },
      { startTime: 6.0, duration: 2.0, suggestedType: 'image', transition: 'spin', effect: 'none', textOverlay: 'JUL - AUG' },
      { startTime: 8.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-out', effect: 'none', textOverlay: 'SEP - OCT' },
      { startTime: 10.0, duration: 2.0, suggestedType: 'image', transition: 'fade', effect: 'none', textOverlay: 'NOV - DEC ❤️' }
    ]
  },
  {
    id: 'template-urdu-cinematic',
    title: 'Urdu Cinematic Poetry & Beat Drop',
    category: 'Urdu',
    aspectRatio: '9:16',
    duration: 12.0,
    requiredMediaCount: 4,
    description: 'Deep cinematic mood with authentic Urdu typography, warm film grain, and emotional bass swells.',
    coverGradient: 'from-amber-700 via-rose-900 to-slate-950',
    audioTrack: {
      title: 'Ascension of Titans',
      artist: 'Velo Cinematic',
      src: 'track-cinematic-trailer',
      duration: 12.0,
      beats: [0.0, 3.0, 6.0, 9.0]
    },
    slots: [
      { startTime: 0.0, duration: 3.0, suggestedType: 'video', transition: 'fade', effect: 'cinematic-bars', textOverlay: 'جہاں خواب حقیقت بنتے ہیں' },
      { startTime: 3.0, duration: 3.0, suggestedType: 'video', transition: 'camera-whip', effect: 'retro-film', textOverlay: 'خاموشی میں بھی ایک داستان ہے' },
      { startTime: 6.0, duration: 3.0, suggestedType: 'video', transition: 'blur-flash', effect: 'flash', textOverlay: 'منزل ابھی دور ہے' },
      { startTime: 9.0, duration: 3.0, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'صبر اور شکر' }
    ]
  },
  {
    id: 'template-arabic-epic',
    title: 'Arabic Royal Desert Odyssey',
    category: 'Arabic',
    aspectRatio: '9:16',
    duration: 10.0,
    requiredMediaCount: 4,
    description: 'Majestic golden hour dunes paired with graceful Arabic typography and epic velocity shifts.',
    coverGradient: 'from-amber-600 via-orange-800 to-stone-950',
    audioTrack: {
      title: 'Midnight Drift',
      artist: 'VeloWave',
      src: 'track-phonk-drift',
      duration: 10.0,
      beats: [0.0, 2.5, 5.0, 7.5]
    },
    slots: [
      { startTime: 0.0, duration: 2.5, suggestedType: 'video', transition: 'zoom-in', effect: 'flash', textOverlay: 'إبداع بلا حدود' },
      { startTime: 2.5, duration: 2.5, suggestedType: 'video', transition: 'camera-whip', effect: 'shake', textOverlay: 'رحلة نحو القمة' },
      { startTime: 5.0, duration: 2.5, suggestedType: 'video', transition: 'glitch', effect: 'neon-glow', textOverlay: 'قوة وعزيمة' },
      { startTime: 7.5, duration: 2.5, suggestedType: 'video', transition: 'fade', effect: 'none', textOverlay: 'النهاية البداية' }
    ]
  },
  {
    id: 'template-ai-style-match',
    title: 'AI Style Match & Parallax Fusion',
    category: 'AI Templates',
    aspectRatio: '9:16',
    duration: 8.0,
    requiredMediaCount: 4,
    description: 'Harnesses edge cutout alpha masks, reference color grading, and 3D kinetic parallax depth.',
    coverGradient: 'from-fuchsia-600 via-violet-800 to-cyan-900',
    audioTrack: {
      title: 'Neon Horizon 1984',
      artist: 'RetroVibe',
      src: 'track-synthwave-neon',
      duration: 8.0,
      beats: [0.0, 2.0, 4.0, 6.0]
    },
    slots: [
      { startTime: 0.0, duration: 2.0, suggestedType: 'image', transition: 'zoom-in', effect: 'rgb-split', textOverlay: 'AI STYLE MATCH' },
      { startTime: 2.0, duration: 2.0, suggestedType: 'image', transition: 'cube-flip', effect: 'neon-glow', textOverlay: 'ALPHA CUTOUT' },
      { startTime: 4.0, duration: 2.0, suggestedType: 'image', transition: 'blur-flash', effect: 'motion-blur', textOverlay: '3D DEPTH' },
      { startTime: 6.0, duration: 2.0, suggestedType: 'image', transition: 'fade', effect: 'none', textOverlay: 'CREATIVE POWER' }
    ]
  }
];

export const STICKERS_LIBRARY = [
  // Emojis
  { id: 'stk-fire', type: 'emoji', content: '🔥', label: 'Fire' },
  { id: 'stk-sparkles', type: 'emoji', content: '✨', label: 'Sparkles' },
  { id: 'stk-heart-eyes', type: 'emoji', content: '😍', label: 'Love' },
  { id: 'stk-mind-blown', type: 'emoji', content: '🤯', label: 'Mind Blown' },
  { id: 'stk-rocket', type: 'emoji', content: '🚀', label: 'Rocket' },
  { id: 'stk-laugh', type: 'emoji', content: '😂', label: 'Laugh' },
  { id: 'stk-eyes', type: 'emoji', content: '👀', label: 'Eyes' },
  { id: 'stk-100', type: 'emoji', content: '💯', label: '100' },

  // Arrows & Shapes
  { id: 'stk-arrow-curve', type: 'shape', content: 'arrow-curve', label: 'Curved Arrow' },
  { id: 'stk-arrow-down', type: 'shape', content: 'arrow-down', label: 'Pointer Down' },
  { id: 'stk-badge-circle', type: 'shape', content: 'badge-circle', label: 'Attention Circle' },
  { id: 'stk-speech-bubble', type: 'shape', content: 'speech-bubble', label: 'Quote Bubble' },

  // Social Badges
  { id: 'stk-sub-red', type: 'social', content: 'SUBSCRIBE', label: 'Subscribe Tag' },
  { id: 'stk-follow-btn', type: 'social', content: 'FOLLOW +', label: 'Follow Pill' },
  { id: 'stk-like-heart', type: 'social', content: 'LIKE & SHARE', label: 'Like & Share' },
  { id: 'stk-link-bio', type: 'social', content: 'LINK IN BIO 🔗', label: 'Link in Bio' },
  { id: 'stk-part-2', type: 'social', content: 'PART 2? 🎬', label: 'Part 2' }
];

export const DEFAULT_FONTS = [
  { name: 'Montserrat', family: "'Montserrat', sans-serif", weight: '900' },
  { name: 'Bebas Neue', family: "'Bebas Neue', cursive", weight: '400' },
  { name: 'Bangers (Comic)', family: "'Bangers', cursive", weight: '400' },
  { name: 'Orbitron (Cyber)', family: "'Orbitron', sans-serif", weight: '800' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", weight: '700' },
  { name: 'Dancing Script', family: "'Dancing Script', cursive", weight: '700' },
  { name: 'Syne Bold', family: "'Syne', sans-serif", weight: '800' },
  { name: 'Plus Jakarta', family: "'Plus Jakarta Sans', sans-serif", weight: '700' }
];
