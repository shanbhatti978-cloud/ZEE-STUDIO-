import React, { useState } from 'react';
import { Sparkles, Sliders, Plus, Zap } from 'lucide-react';
import { Clip, EffectType, EffectConfig } from '../../types/editor';

interface EffectsDrawerProps {
  currentTime: number;
  selectedClip: Clip | null;
  onApplyClipEffect: (clipId: string, effect: EffectConfig) => void;
  onAddEffectTrackClip: (effect: EffectConfig) => void;
  onClose: () => void;
}

export const EffectsDrawer: React.FC<EffectsDrawerProps> = ({
  currentTime,
  selectedClip,
  onApplyClipEffect,
  onAddEffectTrackClip,
  onClose,
}) => {
  const currentEffect = selectedClip?.effect || { type: 'none', intensity: 50, speed: 1 };
  const [selectedType, setSelectedType] = useState<EffectType>(currentEffect.type !== 'none' ? currentEffect.type : 'glitch');
  const [intensity, setIntensity] = useState<number>(currentEffect.intensity || 50);

  const effectsList: { id: EffectType; name: string; category: string; desc: string }[] = [
    { id: 'glitch', name: 'Digital Glitch', category: 'Distortion', desc: 'Scanline RGB slice shift' },
    { id: 'vhs', name: 'Retro VHS Tape', category: 'Retro', desc: 'CRT scanlines & tracking bar' },
    { id: 'rgb-split', name: 'RGB Chromatic', category: 'Distortion', desc: 'Red/cyan channel displacement' },
    { id: 'shake', name: 'Camera Shake', category: 'Motion', desc: 'Dynamic energetic bounce' },
    { id: 'flash', name: 'Strobe Flash', category: 'Lighting', desc: 'High energy luminance pulses' },
    { id: 'neon-glow', name: 'Cyber Neon Border', category: 'Futuristic', desc: 'Glowing electric border' },
    { id: 'cinematic-bars', name: 'Cinematic Letterbox', category: 'Cinematic', desc: 'Widescreen letterbox crop' },
    { id: 'light-leak', name: 'Warm Light Leak', category: 'Lighting', desc: 'Golden hour flare bokeh' },
    { id: 'vintage-grain', name: 'Film Grain 35mm', category: 'Retro', desc: 'Organic analog texture' },
    { id: 'ai-depth', name: 'AI Depth Blur', category: 'AI smart', desc: 'Isolates depth-of-field bokeh blurring' },
  ];

  const handleApply = () => {
    const config: EffectConfig = {
      type: selectedType,
      intensity,
      speed: 1,
    };

    if (selectedClip) {
      onApplyClipEffect(selectedClip.id, config);
    } else {
      onAddEffectTrackClip(config);
    }
    onClose();
  };

  const handleRemove = () => {
    if (selectedClip) {
      onApplyClipEffect(selectedClip.id, { type: 'none', intensity: 0, speed: 1 });
    }
    onClose();
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {selectedClip ? `Effects: ${selectedClip.name}` : 'Effects Track Layer'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {selectedClip && selectedClip.effect.type !== 'none' && (
            <button
              onClick={handleRemove}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded"
            >
              Remove
            </button>
          )}
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-md shadow-emerald-600/25 transition-all"
          >
            Apply Effect
          </button>
        </div>
      </div>

      {/* Intensity slider */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
          <span>Effect Intensity</span>
          <span className="font-mono text-emerald-400 font-bold">{intensity}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full accent-emerald-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {effectsList.map((eff) => (
          <button
            key={eff.id}
            onClick={() => setSelectedType(eff.id)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedType === eff.id
                ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 mb-0.5">{eff.name}</div>
            <div className="text-[10px] text-slate-500 mb-1">{eff.desc}</div>
            <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
              {eff.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
