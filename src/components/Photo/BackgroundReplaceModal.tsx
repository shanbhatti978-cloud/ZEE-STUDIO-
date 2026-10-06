import React, { useState, useEffect } from 'react';
import {
  X,
  Layers,
  Palette,
  Image as ImageIcon,
  Eye,
  Check,
  Download,
  Sparkles,
  Droplet
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { PhotoAiEngine } from '../../services/photoAiEngine';

interface BackgroundReplaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onApplyResult: (resultUrl: string) => void;
  theme: AppTheme;
}

export const BackgroundReplaceModal: React.FC<BackgroundReplaceModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onApplyResult,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const [bgCategory, setBgCategory] = useState<'solid' | 'gradient' | 'blur' | 'image' | 'transparent'>('gradient');
  const [selectedBgValue, setSelectedBgValue] = useState<string>('sunset');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Generate cutout and composite with chosen background
  useEffect(() => {
    let isCancelled = false;
    setIsProcessing(true);

    const process = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageSrc;
        await new Promise((res) => (img.onload = res));

        const cutoutRes = await PhotoAiEngine.generateEdgeCutout(img);
        const composite = await PhotoAiEngine.replaceBackground(
          cutoutRes.cutoutDataUrl,
          bgCategory,
          selectedBgValue,
          imageSrc
        );

        if (!isCancelled) {
          setResultUrl(composite);
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('BG replacement failed', err);
        if (!isCancelled) setIsProcessing(false);
      }
    };

    process();
    return () => {
      isCancelled = true;
    };
  }, [imageSrc, bgCategory, selectedBgValue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border animate-in fade-in zoom-in-95 duration-150"
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
            <Layers size={18} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
                AI Background Replacement
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Preserves foreground subject with edge lighting and perspective alignment
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

        {/* Preview Viewport */}
        <div className="flex-1 min-h-[300px] flex items-center justify-center p-4 relative overflow-hidden bg-black/40">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2 text-xs font-semibold" style={{ color: p.textSecondary }}>
              <Sparkles size={22} className="animate-spin" style={{ color: p.accent }} />
              <span>Blending Foreground and Background...</span>
            </div>
          ) : (
            resultUrl && (
              <img
                src={resultUrl}
                alt="Composited Result"
                className="max-w-full max-h-[44vh] object-contain rounded-xl shadow-lg border"
                style={{ borderColor: p.borderSubtle }}
              />
            )
          )}
        </div>

        {/* Background Options Drawer */}
        <div
          className="p-4 border-t space-y-3 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'gradient', label: 'Gradients' },
              { id: 'solid', label: 'Solid Color' },
              { id: 'blur', label: 'Blur Original' },
              { id: 'transparent', label: 'Transparent' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBgCategory(tab.id as any)}
                className="px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0"
                style={{
                  backgroundColor: bgCategory === tab.id ? p.accent : p.bgSurface,
                  color: bgCategory === tab.id ? p.accentText : p.textSecondary
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sub-options */}
          {bgCategory === 'gradient' && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { id: 'sunset', label: 'Golden Sunset', color: 'from-orange-500 to-pink-500' },
                { id: 'cyber', label: 'Cyber Blue', color: 'from-cyan-500 to-blue-600' },
                { id: 'studio', label: 'Dark Studio', color: 'from-slate-700 to-slate-900' },
                { id: 'neon', label: 'Neon Lilac', color: 'from-purple-600 to-pink-600' }
              ].map((grad) => (
                <button
                  key={grad.id}
                  onClick={() => setSelectedBgValue(grad.id)}
                  className="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 hover:scale-[1.02] transition-transform"
                  style={{
                    backgroundColor: p.bgSurface,
                    borderColor: selectedBgValue === grad.id ? p.accent : p.borderSubtle
                  }}
                >
                  <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${grad.color}`} />
                  <span style={{ color: p.textPrimary }}>{grad.label}</span>
                </button>
              ))}
            </div>
          )}

          {bgCategory === 'solid' && (
            <div className="flex items-center gap-2">
              {['#FFFFFF', '#0F172A', '#E11D48', '#2563EB', '#059669', '#F59E0B'].map((hex) => (
                <button
                  key={hex}
                  onClick={() => setSelectedBgValue(hex)}
                  className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: hex,
                    borderColor: selectedBgValue === hex ? p.accent : 'transparent'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end gap-2 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgSurface }}
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
            <span>Apply Background</span>
          </button>
        </div>
      </div>
    </div>
  );
};
