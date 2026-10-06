import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  Check,
  Download,
  Image as ImageIcon,
  ArrowRight,
  Shuffle
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { PhotoAiEngine, StyleMatchSettings } from '../../services/photoAiEngine';

interface StyleMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  userImageSrc: string;
  onApplyResult: (resultUrl: string) => void;
  theme: AppTheme;
}

export const StyleMatchModal: React.FC<StyleMatchModalProps> = ({
  isOpen,
  onClose,
  userImageSrc,
  onApplyResult,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  // Preset reference samples (cinematic, moody vintage, golden sunset, cyberpunk)
  const sampleRefs = [
    {
      id: 'cyber',
      label: 'Cyberpunk Neon',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="50%" stop-color="%236366f1"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><rect width="300" height="300" fill="url(%23c)"/><text x="150" y="160" text-anchor="middle" fill="white" font-weight="bold" font-size="20">NEON VIBE</text></svg>'
    },
    {
      id: 'vintage',
      label: '35mm Film Noir',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23292524"/><stop offset="50%" stop-color="%2378350f"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="300" height="300" fill="url(%23v)"/><text x="150" y="160" text-anchor="middle" fill="%23fef08a" font-weight="bold" font-size="20">35MM FILM</text></svg>'
    },
    {
      id: 'golden',
      label: 'Golden Hour Desert',
      url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%23f97316"/><stop offset="100%" stop-color="%23fbbf24"/></linearGradient></defs><rect width="300" height="300" fill="url(%23g)"/><text x="150" y="160" text-anchor="middle" fill="%23431407" font-weight="bold" font-size="20">GOLDEN HOUR</text></svg>'
    }
  ];

  const [selectedRefUrl, setSelectedRefUrl] = useState<string>(sampleRefs[0].url);
  const [strength, setStrength] = useState<number>(75);
  const [preserveSkin, setPreserveSkin] = useState<boolean>(true);
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setIsProcessing(true);

    const runStyleMatch = async () => {
      try {
        const uImg = new Image();
        uImg.crossOrigin = 'anonymous';
        uImg.src = userImageSrc;

        const rImg = new Image();
        rImg.crossOrigin = 'anonymous';
        rImg.src = selectedRefUrl;

        await Promise.all([
          new Promise((res) => (uImg.onload = res)),
          new Promise((res) => (rImg.onload = res))
        ]);

        const settings: StyleMatchSettings = {
          strength,
          transferLighting: true,
          transferColorGrading: true,
          transferAtmosphere: true,
          preserveSkinTones: preserveSkin
        };

        const res = await PhotoAiEngine.applyStyleMatch(uImg, rImg, settings);
        if (!isCancelled) {
          setResultUrl(res);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Style match failed', err);
        if (!isCancelled) setIsProcessing(false);
      }
    };

    runStyleMatch();
    return () => {
      isCancelled = true;
    };
  }, [userImageSrc, selectedRefUrl, strength, preserveSkin]);

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
            <Sparkles size={18} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
                STYLE MATCH ("Make It Like This")
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Transfers color grading, lighting & atmosphere from a reference image onto your photo
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

        {/* 3-Way Image Comparison: Reference, Original, Result */}
        <div
          className="p-4 border-b grid grid-cols-3 gap-2 text-center shrink-0"
          style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
        >
          <div>
            <span className="text-[10px] font-bold block mb-1 uppercase" style={{ color: p.textMuted }}>
              1. Reference Style
            </span>
            <div className="aspect-square rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: p.borderSubtle }}>
              <img src={selectedRefUrl} alt="Reference" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold block mb-1 uppercase" style={{ color: p.textMuted }}>
              2. Your Original
            </span>
            <div className="aspect-square rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: p.borderSubtle }}>
              <img src={userImageSrc} alt="Original" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold block mb-1 uppercase" style={{ color: p.accent }}>
              3. Matched Result
            </span>
            <div className="aspect-square rounded-xl overflow-hidden border-2 shadow-md relative" style={{ borderColor: p.accent }}>
              {isProcessing ? (
                <div className="w-full h-full flex items-center justify-center bg-black/40">
                  <Sparkles size={18} className="animate-spin" style={{ color: p.accent }} />
                </div>
              ) : (
                resultUrl && <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />
              )}
            </div>
          </div>
        </div>

        {/* Reference Image Picker & Strength Slider */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: p.textPrimary }}>
              Choose Reference Visual Palette:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {sampleRefs.map((ref) => {
                const isSel = selectedRefUrl === ref.url;
                return (
                  <button
                    key={ref.id}
                    onClick={() => setSelectedRefUrl(ref.url)}
                    className="p-2 rounded-xl border text-left flex items-center gap-2 transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: isSel ? p.bgElevated : 'transparent',
                      borderColor: isSel ? p.accent : p.borderSubtle
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                      <img src={ref.url} alt={ref.label} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-semibold line-clamp-1" style={{ color: p.textPrimary }}>
                      {ref.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold" style={{ color: p.textPrimary }}>
                Style Transfer Intensity:
              </span>
              <span className="font-mono font-bold" style={{ color: p.accent }}>
                {strength}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="w-full accent-current h-2 rounded cursor-pointer"
              style={{ accentColor: p.accent }}
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border" style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}>
            <span className="text-xs font-medium" style={{ color: p.textPrimary }}>
              Preserve Natural Skin Tones
            </span>
            <input
              type="checkbox"
              checked={preserveSkin}
              onChange={(e) => setPreserveSkin(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-current"
              style={{ accentColor: p.accent }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end gap-2 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-85"
            style={{ color: p.textSecondary }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (resultUrl) onApplyResult(resultUrl);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            <Check size={14} />
            <span>Apply Style to Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
