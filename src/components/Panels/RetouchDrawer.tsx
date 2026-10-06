/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wand2, Sparkles, X, Check, Eye, Sun, UserCheck, ShieldCheck } from 'lucide-react';
import { Clip, ColorAdjustments } from '../../types/editor';
import { AudioEngine } from '../../engine/AudioEngine';

interface RetouchDrawerProps {
  selectedClip: Clip | null;
  onUpdateAdjustments: (clipId: string, adjustments: Partial<ColorAdjustments>) => void;
  onClose: () => void;
}

export const RetouchDrawer: React.FC<RetouchDrawerProps> = ({
  selectedClip,
  onUpdateAdjustments,
  onClose
}) => {
  const [skinSmooth, setSkinSmooth] = useState(40);
  const [skinGlow, setSkinGlow] = useState(25);
  const [faceSlim, setFaceSlim] = useState(15);
  const [eyeBrighten, setEyeBrighten] = useState(30);
  const [teethWhiten, setTeethWhiten] = useState(25);
  const [activePreset, setActivePreset] = useState<string>('Natural Glow');

  const presets = [
    { name: 'Natural Glow', smooth: 35, glow: 20, eye: 25, teeth: 20, slim: 10 },
    { name: 'Studio Glamour', smooth: 60, glow: 45, eye: 40, teeth: 35, slim: 25 },
    { name: 'Clean Portrait', smooth: 45, glow: 30, eye: 30, teeth: 25, slim: 15 },
    { name: 'Gentle Soften', smooth: 25, glow: 10, eye: 15, teeth: 10, slim: 5 }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setActivePreset(p.name);
    setSkinSmooth(p.smooth);
    setSkinGlow(p.glow);
    setEyeBrighten(p.eye);
    setTeethWhiten(p.teeth);
    setFaceSlim(p.slim);
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.8);

    if (selectedClip) {
      // Map retouch properties to color adjustments & sharpen
      onUpdateAdjustments(selectedClip.id, {
        highlights: p.glow * 0.3,
        shadows: p.smooth * 0.25,
        sharpen: p.eye * 0.4,
        brightness: p.glow * 0.2
      });
    }
  };

  return (
    <div className="bg-[#101422] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none text-slate-200">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Wand2 size={16} className="text-rose-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Video Face & Beauty Retouch
          </h3>
          <span className="text-[9px] font-bold px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Real-Time
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Presets */}
      <div className="mb-4">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
          Beauty Presets
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presets.map((pr) => (
            <button
              key={pr.name}
              onClick={() => handleApplyPreset(pr)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activePreset === pr.name
                  ? 'bg-rose-500/20 border-rose-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs">{pr.name}</div>
              <span className="text-[9px] text-slate-500 block mt-0.5">Smooth {pr.smooth}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Skin Smoothing', val: skinSmooth, set: setSkinSmooth },
          { label: 'Skin Luster & Glow', val: skinGlow, set: setSkinGlow },
          { label: 'Eye Clarity & Brightening', val: eyeBrighten, set: setEyeBrighten },
          { label: 'Teeth Whitening', val: teethWhiten, set: setTeethWhiten },
          { label: 'Face Slim & Contour', val: faceSlim, set: setFaceSlim }
        ].map((s) => (
          <div key={s.label} className="space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{s.label}</span>
              <span className="font-mono text-white font-bold">{s.val}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={s.val}
              onChange={(e) => {
                const num = Number(e.target.value);
                s.set(num);
                if (selectedClip) {
                  onUpdateAdjustments(selectedClip.id, {
                    highlights: skinGlow * 0.3,
                    shadows: skinSmooth * 0.25,
                    sharpen: eyeBrighten * 0.4
                  });
                }
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-rose-400 cursor-pointer"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <ShieldCheck size={12} />
          <span>Natural face-safe processing (prevents over-smoothing)</span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 active:scale-95 transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
