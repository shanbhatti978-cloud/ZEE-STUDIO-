import React, { useState, useEffect } from 'react';
import {
  Type,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Sparkles,
  Palette,
  Maximize2
} from 'lucide-react';
import { Clip, TextConfig, TextAnimationType } from '../../types/editor';
import { DEFAULT_FONTS } from '../../data/sampleMedia';

interface TextDrawerProps {
  currentTime: number;
  selectedClip: Clip | null;
  onAddTextClip: (textConfig: TextConfig) => void;
  onUpdateTextConfig: (clipId: string, textConfig: Partial<TextConfig>) => void;
  onClose: () => void;
}

export const TextDrawer: React.FC<TextDrawerProps> = ({
  currentTime,
  selectedClip,
  onAddTextClip,
  onUpdateTextConfig,
  onClose,
}) => {
  const isEditing = selectedClip && selectedClip.type === 'text' && selectedClip.textConfig;

  const defaultTextConfig: TextConfig = {
    text: 'Viral Hook Headline',
    fontFamily: 'Montserrat',
    fontSize: 52,
    color: '#ffffff',
    bold: true,
    italic: false,
    letterSpacing: 1,
    lineSpacing: 1.2,
    align: 'center',
    gradient: { enabled: true, startColor: '#facc15', endColor: '#f97316', angle: 0 },
    stroke: { enabled: true, color: '#000000', width: 6 },
    shadow: { enabled: true, color: 'rgba(0,0,0,0.85)', blur: 10, offsetX: 2, offsetY: 2 },
    glow: { enabled: false, color: '#38bdf8', intensity: 40 },
    backgroundBox: { enabled: true, color: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 10 },
    animation: 'pop',
  };

  const [cfg, setCfg] = useState<TextConfig>(
    isEditing ? (selectedClip.textConfig as TextConfig) : defaultTextConfig
  );

  useEffect(() => {
    if (isEditing) {
      setCfg(selectedClip.textConfig as TextConfig);
    }
  }, [selectedClip]);

  const updateProp = <K extends keyof TextConfig>(key: K, value: TextConfig[K]) => {
    const updated = { ...cfg, [key]: value };
    setCfg(updated);
    if (isEditing) {
      onUpdateTextConfig(selectedClip.id, { [key]: value });
    }
  };

  const handleApply = () => {
    if (!isEditing) {
      onAddTextClip(cfg);
    }
    onClose();
  };

  const colorPresets = ['#ffffff', '#facc15', '#ef4444', '#38bdf8', '#4ade80', '#ec4899', '#a855f7', '#000000'];

  const animations: { id: TextAnimationType; label: string }[] = [
    { id: 'none', label: 'None' },
    { id: 'pop', label: 'Pop Bounce' },
    { id: 'typewriter', label: 'Typewriter' },
    { id: 'bounce', label: 'Float Bounce' },
    { id: 'slide', label: 'Slide Up' },
    { id: 'fade', label: 'Smooth Fade' },
    { id: 'karaoke', label: 'TikTok Karaoke' },
  ];

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Type size={16} className="text-purple-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {isEditing ? 'Edit Text Layer' : 'Add Text Layer'}
          </h3>
        </div>

        <button
          onClick={handleApply}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-purple-600/25"
        >
          {isEditing ? 'Done' : 'Insert Text'}
        </button>
      </div>

      {/* Text Input */}
      <div className="mb-3">
        <input
          type="text"
          value={cfg.text}
          onChange={(e) => updateProp('text', e.target.value)}
          placeholder="Enter text or headline..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-medium focus:border-purple-500 outline-none"
        />
      </div>

      {/* Font Family selector */}
      <div className="mb-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Font Style</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {DEFAULT_FONTS.map((font) => (
            <button
              key={font.name}
              onClick={() => updateProp('fontFamily', font.name)}
              className={`p-2 rounded-lg border text-xs text-left truncate transition-colors ${
                cfg.fontFamily === font.name
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
              style={{ fontFamily: font.family }}
            >
              {font.name}
            </button>
          ))}
        </div>
      </div>

      {/* Size, Bold, Italic, Alignment */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {/* Size Slider */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-center">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Size</span>
            <span className="font-mono text-purple-300">{cfg.fontSize}px</span>
          </div>
          <input
            type="range"
            min="24"
            max="110"
            value={cfg.fontSize}
            onChange={(e) => updateProp('fontSize', Number(e.target.value))}
            className="accent-purple-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Alignment */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-around">
          <button
            onClick={() => updateProp('align', 'left')}
            className={`p-1.5 rounded ${cfg.align === 'left' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => updateProp('align', 'center')}
            className={`p-1.5 rounded ${cfg.align === 'center' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => updateProp('align', 'right')}
            className={`p-1.5 rounded ${cfg.align === 'right' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
          >
            <AlignRight size={16} />
          </button>
        </div>

        {/* Bold & Italic */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-around">
          <button
            onClick={() => updateProp('bold', !cfg.bold)}
            className={`p-1.5 rounded font-bold ${cfg.bold ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
          >
            <Bold size={16} />
          </button>
          <button
            onClick={() => updateProp('italic', !cfg.italic)}
            className={`p-1.5 rounded italic ${cfg.italic ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400'}`}
          >
            <Italic size={16} />
          </button>
        </div>

        {/* Animation Picker */}
        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400 mb-1">Animation</div>
          <select
            value={cfg.animation}
            onChange={(e) => updateProp('animation', e.target.value as TextAnimationType)}
            className="w-full bg-slate-800 border border-slate-700 text-xs text-purple-300 rounded px-1.5 py-1 outline-none"
          >
            {animations.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Colors & Gradient */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          <span>Text Color</span>
          <button
            onClick={() =>
              updateProp('gradient', {
                ...cfg.gradient,
                enabled: !cfg.gradient.enabled,
              })
            }
            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
              cfg.gradient.enabled
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {cfg.gradient.enabled ? 'Gradient: ON' : 'Gradient: OFF'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {colorPresets.map((c) => (
            <button
              key={c}
              onClick={() => updateProp('color', c)}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border transition-transform ${
                cfg.color === c ? 'scale-115 ring-2 ring-purple-400 border-white' : 'border-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Effects: Stroke, Background Box, Glow */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() =>
            updateProp('stroke', {
              ...cfg.stroke,
              enabled: !cfg.stroke.enabled,
            })
          }
          className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-colors ${
            cfg.stroke?.enabled
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          Stroke Outline
        </button>

        <button
          onClick={() =>
            updateProp('backgroundBox', {
              ...cfg.backgroundBox,
              enabled: !cfg.backgroundBox.enabled,
            })
          }
          className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-colors ${
            cfg.backgroundBox?.enabled
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          Boxed Background
        </button>

        <button
          onClick={() =>
            updateProp('glow', {
              ...cfg.glow,
              enabled: !cfg.glow?.enabled,
            })
          }
          className={`py-1.5 px-2 rounded-lg border text-xs font-semibold transition-colors ${
            cfg.glow?.enabled
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          Neon Glow
        </button>
      </div>
    </div>
  );
};
