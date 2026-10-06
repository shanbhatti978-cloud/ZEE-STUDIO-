import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Scissors,
  Check,
  Download,
  Brush,
  Eraser,
  RotateCcw,
  Sliders,
  Eye,
  Layers,
  Sparkles
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { PhotoAiEngine, CutoutMaskSettings } from '../../services/photoAiEngine';

interface EdgeCutoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyCutout: (cutoutUrl: string) => void;
  theme: AppTheme;
}

export const EdgeCutoutModal: React.FC<EdgeCutoutModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyCutout,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const [previewMode, setPreviewMode] = useState<'cutout' | 'mask' | 'original'>('cutout');
  const [activeTool, setActiveTool] = useState<'move' | 'brush' | 'erase' | 'restore'>('move');
  const [brushSize, setBrushSize] = useState(25);

  const [settings, setSettings] = useState<CutoutMaskSettings>({
    feather: 2,
    smooth: 3,
    expandContract: 0,
    decontamination: 40
  });

  const [cutoutUrl, setCutoutUrl] = useState<string>('');
  const [maskUrl, setMaskUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(true);

  // Compute edge-to-edge segmentation on mount and settings change
  useEffect(() => {
    let isCancelled = false;
    setIsProcessing(true);

    const runCutout = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        await new Promise((res) => (img.onload = res));

        const res = await PhotoAiEngine.generateEdgeCutout(img, settings);
        if (!isCancelled) {
          setCutoutUrl(res.cutoutDataUrl);
          setMaskUrl(res.maskDataUrl);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Cutout processing error', err);
        if (!isCancelled) setIsProcessing(false);
      }
    };

    runCutout();
    return () => {
      isCancelled = true;
    };
  }, [imageSrc, settings]);

  const handleDownloadTransparent = (format: 'png' | 'webp') => {
    if (!cutoutUrl) return;
    const a = document.createElement('a');
    a.download = `cutout_alpha_${Date.now()}.${format}`;
    a.href = cutoutUrl;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] border animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderStrong
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <div className="flex items-center gap-2">
            <Scissors size={18} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: p.textPrimary }}>
                EDGE-TO-EDGE CUTOUT & ALPHA MASK
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Full-resolution subject segmentation with hair, clothing, and edge refinement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ color: p.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview Selector & Mode Bar */}
        <div
          className="px-4 py-2 border-b flex items-center justify-between gap-2 shrink-0 text-xs"
          style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[11px]" style={{ color: p.textSecondary }}>
              PREVIEW:
            </span>
            {(['cutout', 'mask', 'original'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setPreviewMode(mode)}
                className="px-3 py-1 rounded-lg font-bold capitalize transition-all"
                style={{
                  backgroundColor: previewMode === mode ? p.accent : 'transparent',
                  color: previewMode === mode ? p.accentText : p.textSecondary
                }}
              >
                {mode === 'cutout' ? 'Transparent Cutout' : mode === 'mask' ? 'Alpha Mask' : 'Original Image'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTool(activeTool === 'brush' ? 'move' : 'brush')}
              title="Manual Mask Brush"
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: activeTool === 'brush' ? p.accentLight : 'transparent',
                borderColor: p.borderSubtle,
                color: activeTool === 'brush' ? p.accent : p.textSecondary
              }}
            >
              <Brush size={14} />
            </button>
            <button
              onClick={() => setActiveTool(activeTool === 'erase' ? 'move' : 'erase')}
              title="Manual Mask Eraser"
              className="p-1.5 rounded-lg border"
              style={{
                backgroundColor: activeTool === 'erase' ? p.accentLight : 'transparent',
                borderColor: p.borderSubtle,
                color: activeTool === 'erase' ? p.accent : p.textSecondary
              }}
            >
              <Eraser size={14} />
            </button>
          </div>
        </div>

        {/* Main Canvas Viewport */}
        <div className="flex-1 min-h-[320px] flex items-center justify-center p-4 relative overflow-hidden bg-checkered">
          {/* Checkered pattern background for transparent alpha clarity */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#888_1px,transparent_1px)] [background-size:16px_16px]" />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-xs font-semibold" style={{ color: p.textSecondary }}>
              <Sparkles size={24} className="animate-spin" style={{ color: p.accent }} />
              <span>Generating High-Precision Edge Alpha Mask...</span>
            </div>
          ) : (
            <div className="relative max-w-full max-h-[46vh] rounded-xl shadow-lg overflow-hidden border" style={{ borderColor: p.borderSubtle }}>
              {previewMode === 'cutout' && cutoutUrl && (
                <img src={cutoutUrl} alt="Transparent Cutout" className="max-w-full max-h-[44vh] object-contain block" />
              )}
              {previewMode === 'mask' && maskUrl && (
                <img src={maskUrl} alt="Alpha Mask" className="max-w-full max-h-[44vh] object-contain block" />
              )}
              {previewMode === 'original' && (
                <img src={imageSrc} alt="Original" className="max-w-full max-h-[44vh] object-contain block" />
              )}
            </div>
          )}
        </div>

        {/* Refinement Sliders Drawer */}
        <div
          className="p-4 border-t space-y-3 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textPrimary }}>
              Edge Refinement Controls
            </span>
            <span className="text-[11px]" style={{ color: p.textMuted }}>
              Hair & Clothing Boundary Smoothing
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]" style={{ color: p.textSecondary }}>
                <span>Feather</span>
                <span className="font-mono">{settings.feather}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={settings.feather}
                onChange={(e) => setSettings({ ...settings, feather: Number(e.target.value) })}
                className="w-full accent-current h-1.5 rounded cursor-pointer"
                style={{ accentColor: p.accent }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]" style={{ color: p.textSecondary }}>
                <span>Smooth Edge</span>
                <span className="font-mono">{settings.smooth}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={settings.smooth}
                onChange={(e) => setSettings({ ...settings, smooth: Number(e.target.value) })}
                className="w-full accent-current h-1.5 rounded cursor-pointer"
                style={{ accentColor: p.accent }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]" style={{ color: p.textSecondary }}>
                <span>Expand/Contract</span>
                <span className="font-mono">{settings.expandContract}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                value={settings.expandContract}
                onChange={(e) => setSettings({ ...settings, expandContract: Number(e.target.value) })}
                className="w-full accent-current h-1.5 rounded cursor-pointer"
                style={{ accentColor: p.accent }}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px]" style={{ color: p.textSecondary }}>
                <span>Decontaminate</span>
                <span className="font-mono">{settings.decontamination}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.decontamination}
                onChange={(e) => setSettings({ ...settings, decontamination: Number(e.target.value) })}
                className="w-full accent-current h-1.5 rounded cursor-pointer"
                style={{ accentColor: p.accent }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          className="p-3 border-t flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgSurface }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadTransparent('png')}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:opacity-85"
              style={{ borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Download size={13} />
              <span>PNG Transparent</span>
            </button>
            <button
              onClick={() => handleDownloadTransparent('webp')}
              className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 hover:opacity-85"
              style={{ borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Download size={13} />
              <span>WebP</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
              style={{ color: p.textSecondary }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (cutoutUrl) onApplyCutout(cutoutUrl);
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
              style={{ backgroundColor: p.accent, color: p.accentText }}
            >
              <Check size={14} />
              <span>Apply Cutout to Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
