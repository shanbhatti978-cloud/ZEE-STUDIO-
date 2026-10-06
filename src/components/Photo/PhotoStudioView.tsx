/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Sliders,
  Crop,
  RotateCw,
  Sparkles,
  Scissors,
  Layers,
  Palette,
  Camera,
  Download,
  Undo2,
  Eye,
  RefreshCw,
  Sun,
  Wand2,
  Check,
  Type,
  Smile,
  Brush,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  Plus,
  Trash2,
  Move,
  Film,
  HardDrive
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { PhotoAiEngine, RetouchSettings, EnhancePresetType } from '../../services/photoAiEngine';
import { AudioEngine } from '../../engine/AudioEngine';
import { SystemIntents } from '../../services/systemIntents';

interface TextOverlayItem {
  id: string;
  text: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  shadowBlur?: number;
  isUrdu?: boolean;
}

interface StickerOverlayItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

interface PhotoStudioViewProps {
  theme: AppTheme;
  initialImage?: string | null;
  onOpenEdgeCutout: (imgUrl: string) => void;
  onOpenBgReplace: (imgUrl: string) => void;
  onOpenStyleMatch: (imgUrl: string) => void;
  onOpenPhotoToVideo: (imgUrl: string) => void;
  onSendToVideoTimeline?: (imgUrl: string) => void;
  onOpenAiPhotoGen?: () => void;
  onOpenAiEdit?: (imgUrl: string) => void;
  onOpenAiPhotoshoot?: () => void;
  onOpenAiUpscale?: (imgUrl: string) => void;
  onOpenAiInpaint?: (imgUrl: string) => void;
}

export const PhotoStudioView: React.FC<PhotoStudioViewProps> = ({
  theme,
  initialImage,
  onOpenEdgeCutout,
  onOpenBgReplace,
  onOpenStyleMatch,
  onOpenPhotoToVideo,
  onSendToVideoTimeline,
  onOpenAiPhotoGen,
  onOpenAiEdit,
  onOpenAiPhotoshoot,
  onOpenAiUpscale,
  onOpenAiInpaint,
}) => {
  const p = theme.palette;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Default portrait placeholder
  const defaultSampleImg =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800" viewBox="0 0 640 800"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23f43f5e"/><stop offset="50%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><rect width="640" height="800" fill="url(%23sky)"/><circle cx="320" cy="340" r="150" fill="%23fde047" opacity="0.9"/><path d="M190 540 C 190 430, 450 430, 450 540 L 480 800 L 160 800 Z" fill="%231e293b"/><circle cx="320" cy="400" r="95" fill="%23fbcfe8"/><text x="320" y="740" text-anchor="middle" fill="white" font-size="26" font-weight="bold" font-family="sans-serif">ZEE STUDIO PORTRAIT</text></svg>';

  const [currentImage, setCurrentImage] = useState<string>(initialImage || defaultSampleImg);
  const [history, setHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'adjust' | 'enhance' | 'retouch' | 'text' | 'filters' | 'crop' | 'stickers' | 'draw' | 'ai'>('adjust');

  // 1. Adjustment Sliders
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [vibrance, setVibrance] = useState(0);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [highlights, setHighlights] = useState(0);
  const [shadows, setShadows] = useState(0);
  const [sharpness, setSharpness] = useState(0);
  const [vignette, setVignette] = useState(0);
  const [grain, setGrain] = useState(0);

  // 2. Retouch Settings
  const [retouch, setRetouch] = useState<RetouchSettings>({
    skinSmooth: 0,
    skinGlow: 0,
    eyeBrighten: 0,
    teethWhiten: 0,
    faceSlim: 0,
    blemishConceal: 0
  });

  // 3. Text Overlays
  const [textOverlays, setTextOverlays] = useState<TextOverlayItem[]>([
    {
      id: 'txt-1',
      text: 'ZEE STUDIO',
      x: 50,
      y: 88,
      fontFamily: 'sans-serif',
      fontSize: 28,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      strokeColor: '#000000',
      strokeWidth: 1,
      shadowBlur: 8,
      isUrdu: false
    }
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>('txt-1');
  const [newTextInput, setNewTextInput] = useState('');
  const [selectedFont, setSelectedFont] = useState('Noto Nastaliq Urdu');

  // 4. Stickers
  const [stickers, setStickers] = useState<StickerOverlayItem[]>([]);

  // 5. Crop / Aspect Ratio & Rotation
  const [rotationAngle, setRotationAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [selectedCropRatio, setSelectedCropRatio] = useState<string>('free');

  // 6. Filters
  const [activeFilter, setActiveFilter] = useState<string>('Normal');
  const [filterIntensity, setFilterIntensity] = useState<number>(100);

  // 7. Enhance
  const [enhanceIntensity, setEnhanceIntensity] = useState<number>(80);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showCompareOriginal, setShowCompareOriginal] = useState(false);

  // Re-sync when initial image changes
  useEffect(() => {
    if (initialImage) {
      setCurrentImage(initialImage);
    }
  }, [initialImage]);

  // Render canvas composite
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = currentImage;
    img.onload = () => {
      canvas.width = img.width || 640;
      canvas.height = img.height || 800;

      ctx.save();

      // Geometry Transform: Rotate & Flip
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotationAngle * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      if (showCompareOriginal) {
        ctx.filter = 'none';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        return;
      }

      // Build CSS Filter string
      const bVal = 100 + brightness;
      const cVal = 100 + contrast;
      const sVal = 100 + saturation + vibrance * 0.5;
      const hVal = temperature * 0.5;

      let filterStr = `brightness(${bVal}%) contrast(${cVal}%) saturate(${sVal}%) hue-rotate(${hVal}deg)`;

      // Preset filter enhancements
      if (activeFilter === 'Teal & Orange') {
        filterStr += ` sepia(${25 * (filterIntensity / 100)}%) hue-rotate(${-15 * (filterIntensity / 100)}deg)`;
      } else if (activeFilter === 'Vintage Film') {
        filterStr += ` sepia(${40 * (filterIntensity / 100)}%) contrast(${85 + 15 * (filterIntensity / 100)}%)`;
      } else if (activeFilter === 'Noir B&W') {
        filterStr += ` grayscale(${100 * (filterIntensity / 100)}%) contrast(${125 * (filterIntensity / 100)}%)`;
      } else if (activeFilter === 'Golden Hour') {
        filterStr += ` sepia(${30 * (filterIntensity / 100)}%) saturate(${130 * (filterIntensity / 100)}%)`;
      } else if (activeFilter === 'Cyber Neon') {
        filterStr += ` saturate(${160 * (filterIntensity / 100)}%) hue-rotate(${35 * (filterIntensity / 100)}deg)`;
      } else if (activeFilter === 'Pastel Glow') {
        filterStr += ` brightness(${110 * (filterIntensity / 100)}%) saturate(${85 * (filterIntensity / 100)}%)`;
      }

      ctx.filter = filterStr;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.filter = 'none';

      // Vignette effect
      if (vignette > 0) {
        const radGrad = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.25,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.75
        );
        radGrad.addColorStop(0, 'rgba(0,0,0,0)');
        radGrad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.8})`);
        ctx.fillStyle = radGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Film Grain simulation
      if (grain > 0) {
        const grainCount = (canvas.width * canvas.height * grain) / 4000;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        for (let i = 0; i < grainCount; i++) {
          const gx = Math.random() * canvas.width;
          const gy = Math.random() * canvas.height;
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      // Render Text Overlays
      textOverlays.forEach((t) => {
        ctx.save();
        const tx = (t.x / 100) * canvas.width;
        const ty = (t.y / 100) * canvas.height;

        ctx.font = `bold ${t.fontSize * (canvas.width / 500)}px ${t.fontFamily}, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background badge
        if (t.backgroundColor) {
          const metrics = ctx.measureText(t.text);
          const padX = 14;
          const padY = 8;
          ctx.fillStyle = t.backgroundColor;
          ctx.fillRect(
            tx - metrics.width / 2 - padX,
            ty - t.fontSize / 2 - padY,
            metrics.width + padX * 2,
            t.fontSize + padY * 2
          );
        }

        // Shadow & Stroke
        if (t.shadowBlur) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = t.shadowBlur;
        }

        if (t.strokeColor && t.strokeWidth) {
          ctx.strokeStyle = t.strokeColor;
          ctx.lineWidth = t.strokeWidth * 2;
          ctx.strokeText(t.text, tx, ty);
        }

        ctx.fillStyle = t.color;
        ctx.fillText(t.text, tx, ty);
        ctx.restore();
      });

      // Render Stickers
      stickers.forEach((s) => {
        ctx.save();
        const sx = (s.x / 100) * canvas.width;
        const sy = (s.y / 100) * canvas.height;
        ctx.font = `${40 * s.scale}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.emoji, sx, sy);
        ctx.restore();
      });

      ctx.restore();
    };
  };

  useEffect(() => {
    renderCanvas();
  }, [
    currentImage,
    brightness,
    contrast,
    saturation,
    vibrance,
    temperature,
    tint,
    highlights,
    shadows,
    sharpness,
    vignette,
    grain,
    activeFilter,
    filterIntensity,
    rotationAngle,
    flipH,
    flipV,
    textOverlays,
    stickers,
    showCompareOriginal
  ]);

  // Execute AI Retouch
  const handleApplyRetouch = async () => {
    setIsAiProcessing(true);
    setStatusFeedback('Applying AI Facial Retouch...');
    try {
      const result = await PhotoAiEngine.applyRetouch(currentImage, retouch);
      setHistory((prev) => [...prev, currentImage]);
      setCurrentImage(result);
      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
      setStatusFeedback('Retouch applied successfully!');
    } catch (e) {
      console.error(e);
      setStatusFeedback('Failed to process retouch');
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  // Execute AI Enhancement
  const handleApplyEnhancement = async (type: EnhancePresetType, label: string) => {
    setIsAiProcessing(true);
    setStatusFeedback(`Applying AI ${label}...`);
    try {
      const result = await PhotoAiEngine.applyAiEnhancement(currentImage, type, enhanceIntensity);
      setHistory((prev) => [...prev, currentImage]);
      setCurrentImage(result);
      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
      setStatusFeedback(`${label} Applied!`);
    } catch (e) {
      console.error(e);
      setStatusFeedback('Failed to enhance photo');
    } finally {
      setIsAiProcessing(false);
      setTimeout(() => setStatusFeedback(null), 3000);
    }
  };

  // Add Text
  const handleAddText = () => {
    if (!newTextInput.trim()) return;
    const isUrduText = /[\u0600-\u06FF]/.test(newTextInput);
    const newT: TextOverlayItem = {
      id: `txt-${Date.now()}`,
      text: newTextInput.trim(),
      x: 50,
      y: 50,
      fontFamily: isUrduText ? 'Noto Nastaliq Urdu' : selectedFont,
      fontSize: 26,
      color: '#FFFFFF',
      backgroundColor: 'rgba(0,0,0,0.5)',
      strokeColor: '#000000',
      strokeWidth: 1,
      shadowBlur: 6,
      isUrdu: isUrduText
    };
    setTextOverlays((prev) => [...prev, newT]);
    setSelectedTextId(newT.id);
    setNewTextInput('');
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.8);
  };

  // Add Sticker
  const handleAddSticker = (emoji: string) => {
    const newS: StickerOverlayItem = {
      id: `stk-${Date.now()}`,
      emoji,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setStickers((prev) => [...prev, newS]);
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.8);
  };

  // Upload Local Photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const res = ev.target.result as string;
          setHistory((prev) => [...prev, currentImage]);
          setCurrentImage(res);
          SystemIntents.addToGallery({
            id: `gal-${Date.now()}`,
            name: file.name,
            type: 'photo',
            mimeType: file.type,
            size: file.size,
            url: res,
            dateAdded: Date.now()
          });
          AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save / Export High-Res Canvas
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `ZeeStudio_Photo_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
    setStatusFeedback('Photo exported in Ultra HD!');
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden select-none bg-[#090c15]">
      {/* Hidden file input for Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* LEFT / TOP: LIVE PHOTO CANVAS VIEWPORT */}
      <div className="flex-1 flex flex-col relative items-center justify-center p-3 sm:p-5 bg-gradient-to-b from-[#080b12] to-[#0d1220] overflow-hidden">
        {/* Status Toast */}
        {statusFeedback && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-sky-500/90 text-slate-950 font-bold text-xs shadow-xl animate-in slide-in-from-top-2 flex items-center gap-2">
            <Sparkles size={14} />
            <span>{statusFeedback}</span>
          </div>
        )}

        {/* Canvas Surface with Checkerboard Transparency Backdrop */}
        <div className="relative max-w-full max-h-[62vh] md:max-h-[80vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[60vh] md:max-h-[78vh] object-contain cursor-crosshair rounded-xl transition-transform"
          />

          {isAiProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-sky-400 gap-3">
              <RefreshCw size={28} className="animate-spin" />
              <span className="text-xs font-bold text-white tracking-wide">Processing AI Neural Model...</span>
            </div>
          )}
        </div>

        {/* Canvas Floating Quick Actions */}
        <div className="flex items-center gap-2 mt-3 z-20">
          <button
            onMouseDown={() => setShowCompareOriginal(true)}
            onMouseUp={() => setShowCompareOriginal(false)}
            onTouchStart={() => setShowCompareOriginal(true)}
            onTouchEnd={() => setShowCompareOriginal(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            title="Hold to see original unedited photo"
          >
            <Eye size={13} className="text-sky-400" />
            <span>Hold to Compare</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Camera size={13} className="text-emerald-400" />
            <span>Upload Photo</span>
          </button>

          {history.length > 0 && (
            <button
              onClick={() => {
                const prev = history[history.length - 1];
                setHistory((h) => h.slice(0, -1));
                setCurrentImage(prev);
              }}
              className="p-2 rounded-xl bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white"
              title="Undo last photo change"
            >
              <Undo2 size={14} />
            </button>
          )}

          <button
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            <Download size={13} />
            <span>Save HD</span>
          </button>
        </div>
      </div>

      {/* RIGHT / BOTTOM: PROFESSIONAL TOOL SUITE CONTROL PANEL */}
      <div className="w-full md:w-96 bg-[#0f1422] border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 h-[48vh] md:h-full overflow-hidden">
        {/* TOOL NAVIGATION TABS */}
        <div className="flex items-center gap-1 p-2 overflow-x-auto border-b border-slate-800/80 bg-slate-950/60 scrollbar-none shrink-0">
          {[
            { id: 'adjust' as const, label: 'Adjust', icon: Sliders },
            { id: 'enhance' as const, label: 'Enhance', icon: Sparkles, badge: 'AI' },
            { id: 'retouch' as const, label: 'Retouch', icon: Wand2, badge: 'PRO' },
            { id: 'text' as const, label: 'Text & Urdu', icon: Type },
            { id: 'filters' as const, label: 'Filters', icon: Palette },
            { id: 'crop' as const, label: 'Crop & Rotate', icon: Crop },
            { id: 'stickers' as const, label: 'Stickers', icon: Smile },
            { id: 'ai' as const, label: 'AI Studio', icon: Scissors, badge: 'NEW' }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  AudioEngine.playSoundEffect('sfx-pop-bubble', 0.6);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative shrink-0 ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[8px] font-black px-1 py-0.2 rounded-full bg-rose-500 text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs text-slate-200 pb-20">
          {/* 1. ADJUSTMENTS */}
          {activeTab === 'adjust' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Pro Tone Adjustments</span>
                <button
                  onClick={() => {
                    setBrightness(0);
                    setContrast(0);
                    setSaturation(0);
                    setVibrance(0);
                    setTemperature(0);
                    setVignette(0);
                    setGrain(0);
                  }}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Reset All
                </button>
              </div>

              {[
                { label: 'Brightness / Exposure', value: brightness, setter: setBrightness, min: -100, max: 100 },
                { label: 'Contrast', value: contrast, setter: setContrast, min: -100, max: 100 },
                { label: 'Saturation', value: saturation, setter: setSaturation, min: -100, max: 100 },
                { label: 'Vibrance', value: vibrance, setter: setVibrance, min: -100, max: 100 },
                { label: 'Warmth / Temperature', value: temperature, setter: setTemperature, min: -100, max: 100 },
                { label: 'Vignette Depth', value: vignette, setter: setVignette, min: 0, max: 100 },
                { label: 'Film Grain', value: grain, setter: setGrain, min: 0, max: 100 }
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>{item.label}</span>
                    <span className="font-mono text-white font-bold">{item.value > 0 ? `+${item.value}` : item.value}</span>
                  </div>
                  <input
                    type="range"
                    min={item.min}
                    max={item.max}
                    value={item.value}
                    onChange={(e) => item.setter(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 2. ENHANCE SUITE */}
          {activeTab === 'enhance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">One-Tap AI Enhancements</span>
                <span className="text-[10px] text-sky-400 font-bold">Neural Engine</span>
              </div>

              {/* Intensity Slider */}
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold">AI Neural Strength</span>
                  <span className="font-bold text-sky-400 font-mono">{enhanceIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={enhanceIntensity}
                  onChange={(e) => setEnhanceIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Enhancement Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'auto_tone' as EnhancePresetType, title: 'Auto Magic Tone', desc: 'Optimal exposure & balance' },
                  { id: 'hd_upscale' as EnhancePresetType, title: 'HD 4K Upscale', desc: 'Super-resolution sharpness' },
                  { id: 'face_enhance' as EnhancePresetType, title: 'Face Clarity', desc: 'Micro-contrast & skin detail' },
                  { id: 'portrait_lighting' as EnhancePresetType, title: 'Studio Lighting', desc: 'Key & rim-light luster' },
                  { id: 'hdr_pop' as EnhancePresetType, title: 'HDR Pop', desc: 'Dynamic range expansion' },
                  { id: 'low_light_boost' as EnhancePresetType, title: 'Low-Light Boost', desc: 'Night mode brightening' },
                  { id: 'denoise' as EnhancePresetType, title: 'AI Denoise', desc: 'Removes grain & digital noise' },
                  { id: 'color_pop' as EnhancePresetType, title: 'Vibrant Color', desc: 'Rich atmosphere pop' }
                ].map((p) => (
                  <button
                    key={p.id}
                    disabled={isAiProcessing}
                    onClick={() => handleApplyEnhancement(p.id, p.title)}
                    className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-850 text-left transition-all active:scale-95 disabled:opacity-50 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white text-xs group-hover:text-sky-300">{p.title}</span>
                      <Sparkles size={12} className="text-sky-400" />
                    </div>
                    <span className="text-[10px] text-slate-400 block leading-tight">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. RETOUCH SUITE */}
          {activeTab === 'retouch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Facial & Beauty Retouch</span>
                <button
                  onClick={() =>
                    setRetouch({
                      skinSmooth: 0,
                      skinGlow: 0,
                      eyeBrighten: 0,
                      teethWhiten: 0,
                      faceSlim: 0,
                      blemishConceal: 0
                    })
                  }
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Reset
                </button>
              </div>

              {[
                { label: 'Skin Smoothing', key: 'skinSmooth' as keyof RetouchSettings },
                { label: 'Skin Luster & Glow', key: 'skinGlow' as keyof RetouchSettings },
                { label: 'Blemish Conceal', key: 'blemishConceal' as keyof RetouchSettings },
                { label: 'Eye Brightening', key: 'eyeBrighten' as keyof RetouchSettings },
                { label: 'Teeth Whitening', key: 'teethWhiten' as keyof RetouchSettings }
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>{item.label}</span>
                    <span className="font-mono text-white font-bold">{retouch[item.key]}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={retouch[item.key]}
                    onChange={(e) =>
                      setRetouch((prev) => ({ ...prev, [item.key]: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
                  />
                </div>
              ))}

              <button
                onClick={handleApplyRetouch}
                disabled={isAiProcessing}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Wand2 size={14} />
                <span>Apply Retouch Changes</span>
              </button>
            </div>
          )}

          {/* 4. TEXT & URDU TYPOGRAPHY */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Urdu & Multilingual Typography</span>
                <span className="text-[10px] text-sky-400 font-mono">Nastaliq / Naskh</span>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTextInput}
                    onChange={(e) => setNewTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                    placeholder="Type text (Urdu, English, Arabic)..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 outline-none"
                    dir="auto"
                  />
                  <button
                    onClick={handleAddText}
                    className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl active:scale-95 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>

                {/* Quick Urdu Sample Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['شاندار', 'بہترین ویڈیو', 'محبت', 'خوبصورت', 'ZEE STUDIO'].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => setNewTextInput(sample)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] text-slate-300 font-serif"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Overlays Manager */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Text Layers</span>
                {textOverlays.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs truncate max-w-[180px]">{t.text}</span>
                      <button
                        onClick={() => setTextOverlays((prev) => prev.filter((item) => item.id !== t.id))}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Font Family</label>
                        <select
                          value={t.fontFamily}
                          onChange={(e) => {
                            const font = e.target.value;
                            setTextOverlays((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, fontFamily: font } : item))
                            );
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg text-[10px] px-2 py-1 text-slate-200 outline-none"
                        >
                          <option value="Noto Nastaliq Urdu">Noto Nastaliq Urdu</option>
                          <option value="Noto Naskh Arabic">Noto Naskh Arabic</option>
                          <option value="Amiri">Amiri Calligraphy</option>
                          <option value="sans-serif">Modern Sans</option>
                          <option value="serif">Classic Serif</option>
                          <option value="monospace">Monospace</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] text-slate-400 block mb-1">Font Size ({t.fontSize}px)</label>
                        <input
                          type="range"
                          min={14}
                          max={72}
                          value={t.fontSize}
                          onChange={(e) => {
                            const sz = Number(e.target.value);
                            setTextOverlays((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, fontSize: sz } : item))
                            );
                          }}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400"
                        />
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-slate-400 mr-1">Color:</span>
                      {['#FFFFFF', '#FE2C55', '#25F4EE', '#FDE047', '#A855F7', '#000000'].map((c) => (
                        <button
                          key={c}
                          onClick={() =>
                            setTextOverlays((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, color: c } : item))
                            )
                          }
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border ${
                            t.color === c ? 'border-sky-400 ring-2 ring-sky-400/40' : 'border-slate-700'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Position XY */}
                    <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                      <div>
                        <span>X Pos ({t.x}%)</span>
                        <input
                          type="range"
                          min={5}
                          max={95}
                          value={t.x}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTextOverlays((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, x: val } : item))
                            );
                          }}
                          className="w-full h-1 bg-slate-800 rounded-lg accent-sky-400"
                        />
                      </div>
                      <div>
                        <span>Y Pos ({t.y}%)</span>
                        <input
                          type="range"
                          min={5}
                          max={95}
                          value={t.y}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTextOverlays((prev) =>
                              prev.map((item) => (item.id === t.id ? { ...item, y: val } : item))
                            );
                          }}
                          className="w-full h-1 bg-slate-800 rounded-lg accent-sky-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. FILTERS */}
          {activeTab === 'filters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Cinematic Color LUTs</span>
                <span className="text-[10px] text-sky-400 font-bold">{activeFilter}</span>
              </div>

              {/* Filter Intensity */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Filter Intensity</span>
                  <span className="font-bold text-white font-mono">{filterIntensity}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Filter Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Normal',
                  'Teal & Orange',
                  'Vintage Film',
                  'Noir B&W',
                  'Golden Hour',
                  'Cyber Neon',
                  'Pastel Glow'
                ].map((flt) => (
                  <button
                    key={flt}
                    onClick={() => {
                      setActiveFilter(flt);
                      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.7);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      activeFilter === flt
                        ? 'bg-sky-500/20 border-sky-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs">{flt}</div>
                    <span className="text-[9px] text-slate-500 block mt-0.5">Preset LUT</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. CROP & TRANSFORM */}
          {activeTab === 'crop' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Geometry & Orientation</span>
                <button
                  onClick={() => {
                    setRotationAngle(0);
                    setFlipH(false);
                    setFlipV(false);
                  }}
                  className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold"
                >
                  Reset
                </button>
              </div>

              {/* Rotate & Flip Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setRotationAngle((prev) => (prev + 90) % 360)}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex flex-col items-center gap-1 active:scale-95"
                >
                  <RotateCw size={16} className="text-sky-400" />
                  <span>Rotate 90°</span>
                </button>

                <button
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-colors ${
                    flipH ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <FlipHorizontal size={16} className="text-indigo-400" />
                  <span>Flip Horiz</span>
                </button>

                <button
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 active:scale-95 transition-colors ${
                    flipV ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-200'
                  }`}
                >
                  <FlipVertical size={16} className="text-rose-400" />
                  <span>Flip Vert</span>
                </button>
              </div>
            </div>
          )}

          {/* 7. STICKERS */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Badges & Stickers</span>
                <span className="text-[10px] text-slate-400">Tap to place</span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['✨', '🔥', '💖', '⭐', '🎬', '👑', '💯', '🌸', '⚡', '🎉', '🚀', '📸', '💎', '💫', '🎨'].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddSticker(emoji)}
                      className="h-12 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all"
                    >
                      {emoji}
                    </button>
                  )
                )}
              </div>

              {stickers.length > 0 && (
                <button
                  onClick={() => setStickers([])}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 font-semibold text-xs rounded-xl border border-slate-800"
                >
                  Clear All Stickers
                </button>
              )}
            </div>
          )}

          {/* 8. AI STUDIO SUITE */}
          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="font-bold text-white uppercase tracking-wider text-[11px]">Cloud AI & Neural Studio</span>
                <span className="text-[10px] text-cyan-400 font-black">FLAGSHIP AI</span>
              </div>

              {onOpenAiPhotoGen && (
                <button
                  onClick={onOpenAiPhotoGen}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-xs group-hover:text-cyan-300 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-cyan-400" />
                      <span>AI Photo Generator (Text-to-Image)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      Gemini / Nano Banana 2
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Generate portraits, luxury aesthetics, bridal fashion, and cinematic frames from prompts & presets.
                  </p>
                </button>
              )}

              {onOpenAiPhotoshoot && (
                <button
                  onClick={onOpenAiPhotoshoot}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-xs group-hover:text-indigo-300 flex items-center gap-1.5">
                      <Camera size={14} className="text-indigo-400" />
                      <span>Virtual Photoshoot (Identity Preserved)</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      12 Themes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Editorial studio, Pakistani / Desi bridal, corporate boardroom, and luxury lifestyle shoots.
                  </p>
                </button>
              )}

              {onOpenAiEdit && (
                <button
                  onClick={() => onOpenAiEdit(currentImage)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 to-rose-500/15 border border-pink-500/40 hover:border-pink-400 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-xs group-hover:text-pink-300 flex items-center gap-1.5">
                      <Wand2 size={14} className="text-pink-400" />
                      <span>AI Multi-Modal Photo Edit</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Replace objects, change backgrounds, relight scene, swap clothing, or restore old photos.
                  </p>
                </button>
              )}

              {onOpenAiUpscale && (
                <button
                  onClick={() => onOpenAiUpscale(currentImage)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/40 hover:border-teal-400 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-xs group-hover:text-teal-300 flex items-center gap-1.5">
                      <Maximize2 size={14} className="text-teal-400" />
                      <span>AI 4K Super-Resolution Upscaler</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Neural 2X/4X super-resolution with skin pore and micro-texture reconstruction.
                  </p>
                </button>
              )}

              {onOpenAiInpaint && (
                <button
                  onClick={() => onOpenAiInpaint(currentImage)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-white text-xs group-hover:text-amber-300 flex items-center gap-1.5">
                      <Brush size={14} className="text-amber-400" />
                      <span>Inpainting & Outpainting (Fill & Expand)</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Brush to replace unwanted items or extend canvas boundaries in all directions.
                  </p>
                </button>
              )}

              <button
                onClick={() => onOpenEdgeCutout(currentImage)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/15 to-indigo-500/15 border border-sky-500/40 hover:border-sky-400 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs group-hover:text-sky-300 flex items-center gap-1.5">
                    <Scissors size={14} className="text-sky-400" />
                    <span>AI Background Cutout (Alpha Mask)</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Precise edge segmentation following hair, fingers, clothes, and fine silhouettes with feathering.
                </p>
              </button>

              <button
                onClick={() => onOpenBgReplace(currentImage)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-500/15 to-pink-500/15 border border-purple-500/40 hover:border-purple-400 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs group-hover:text-purple-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-purple-400" />
                    <span>Background Replacement Studio</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Swap background with AI landscapes, studio gradients, solid colors, or depth-of-field blur.
                </p>
              </button>

              <button
                onClick={() => onOpenStyleMatch(currentImage)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 to-rose-500/15 border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs group-hover:text-amber-300 flex items-center gap-1.5">
                    <Palette size={14} className="text-amber-400" />
                    <span>Style Match ("Make It Like This")</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Transfer lighting, color harmony, and cinematic aesthetic from any reference image.
                </p>
              </button>

              <button
                onClick={() => onOpenPhotoToVideo(currentImage)}
                className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all active:scale-[0.98] group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-white text-xs group-hover:text-emerald-300 flex items-center gap-1.5">
                    <Film size={14} className="text-emerald-400" />
                    <span>Photo-to-Video Motion Animator</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Generate 3D parallax depth, zoom-in punch, pan motion, and export directly to timeline.
                </p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
