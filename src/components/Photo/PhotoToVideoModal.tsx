import React, { useState } from 'react';
import {
  X,
  Camera,
  Play,
  Sparkles,
  Music,
  Check,
  RotateCw,
  Move,
  Maximize2
} from 'lucide-react';
import { AppTheme } from '../../types/theme';

interface PhotoToVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onGenerateVideoProject: (params: { motionPreset: string; duration: number; musicBeatSync: boolean }) => void;
  theme: AppTheme;
}

export const PhotoToVideoModal: React.FC<PhotoToVideoModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onGenerateVideoProject,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const [motionPreset, setMotionPreset] = useState<string>('3d-zoom');
  const [duration, setDuration] = useState<number>(5.0);
  const [musicBeatSync, setMusicBeatSync] = useState<boolean>(true);
  const [isRendering, setIsRendering] = useState(false);

  const presets = [
    { id: '3d-zoom', name: '3D Parallax Depth Zoom', desc: 'Separates foreground portrait from background for 3D kinetic depth' },
    { id: 'cinematic-push', name: 'Cinematic Push-in', desc: 'Smooth slow push towards subject with subtle camera roll' },
    { id: 'whip-pan', name: 'Action Whip Pan', desc: 'Fast kinetic horizontal swipe into next beat hit' },
    { id: 'orbital-orbit', name: 'Orbital Face Arc', desc: 'Gentle circular rotational movement around focal point' }
  ];

  const handleGenerate = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      onGenerateVideoProject({ motionPreset, duration, musicBeatSync });
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border animate-in fade-in zoom-in-95 duration-150"
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
            <Camera size={18} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
                Photo to Video Motion Studio
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Camera movement, 3D parallax depth & beat synchronization
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

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Animated Preview Canvas */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden border shadow-inner bg-black flex items-center justify-center" style={{ borderColor: p.borderSubtle }}>
            <img
              src={imageSrc}
              alt="Photo Motion Preview"
              className={`w-full h-full object-cover transition-transform duration-1000 ${
                motionPreset === '3d-zoom' ? 'scale-110 hover:scale-125' :
                motionPreset === 'cinematic-push' ? 'scale-105 hover:scale-115' :
                'scale-100 hover:rotate-1 hover:scale-110'
              }`}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
                <Play size={20} className="fill-white translate-x-0.5" />
              </div>
            </div>
            <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-md">
              Motion: {presets.find(p => p.id === motionPreset)?.name}
            </span>
          </div>

          {/* Presets List */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: p.textPrimary }}>
              Choose Motion Preset:
            </span>
            <div className="space-y-1.5">
              {presets.map((preset) => {
                const isSel = motionPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setMotionPreset(preset.id)}
                    className="w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all hover:scale-[1.01]"
                    style={{
                      backgroundColor: isSel ? p.bgElevated : 'transparent',
                      borderColor: isSel ? p.accent : p.borderSubtle
                    }}
                  >
                    <div>
                      <div className="text-xs font-bold" style={{ color: p.textPrimary }}>
                        {preset.name}
                      </div>
                      <div className="text-[10px]" style={{ color: p.textSecondary }}>
                        {preset.desc}
                      </div>
                    </div>
                    {isSel && <Check size={16} style={{ color: p.accent }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="font-semibold block" style={{ color: p.textSecondary }}>
                Duration ({duration}s)
              </span>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-current h-1.5 rounded cursor-pointer"
                style={{ accentColor: p.accent }}
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}>
              <span className="font-semibold" style={{ color: p.textPrimary }}>Beat Sync</span>
              <input
                type="checkbox"
                checked={musicBeatSync}
                onChange={(e) => setMusicBeatSync(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-current"
                style={{ accentColor: p.accent }}
              />
            </div>
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
            onClick={handleGenerate}
            disabled={isRendering}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            <Sparkles size={14} />
            <span>{isRendering ? 'Generating Motion Video...' : 'Send to Video Timeline'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
