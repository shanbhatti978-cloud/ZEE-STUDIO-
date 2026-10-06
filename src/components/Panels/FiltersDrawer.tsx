import React, { useState, useEffect } from 'react';
import { Palette, SlidersHorizontal, RotateCcw, Check, BookmarkPlus, Trash2, X, Save } from 'lucide-react';
import { Clip, ColorAdjustments } from '../../types/editor';
import { COLOR_PRESETS } from '../../data/sampleMedia';

interface FiltersDrawerProps {
  selectedClip: Clip | null;
  onUpdateAdjustments: (clipId: string, adjustments: Partial<ColorAdjustments>) => void;
  onClose: () => void;
}

interface CustomPreset {
  id: string;
  name: string;
  adjustments: Partial<ColorAdjustments>;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  selectedClip,
  onUpdateAdjustments,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'adjust'>('presets');
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [isNaming, setIsNaming] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const defaultAdjustments: ColorAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    temperature: 0,
    tint: 0,
    highlights: 0,
    shadows: 0,
    sharpen: 0,
    vignette: 0,
    fade: 0,
  };

  const currentAdj = selectedClip?.adjustments || defaultAdjustments;

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('velocut_custom_presets_v2');
      if (stored) {
        setCustomPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to parse custom presets from localStorage', e);
    }
  }, []);

  const updateProp = (key: keyof ColorAdjustments, value: number) => {
    if (!selectedClip) return;
    onUpdateAdjustments(selectedClip.id, { [key]: value });
  };

  const applyPreset = (preset: { name: string; adjustments: Partial<ColorAdjustments> }) => {
    if (!selectedClip) return;
    onUpdateAdjustments(selectedClip.id, {
      ...defaultAdjustments,
      ...preset.adjustments,
      presetName: preset.name,
    });
  };

  const handleReset = () => {
    if (!selectedClip) return;
    onUpdateAdjustments(selectedClip.id, defaultAdjustments);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClip) return;

    const nameToSave = newPresetName.trim() || `My Custom LUT ${customPresets.length + 1}`;
    const newPreset: CustomPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: nameToSave,
      adjustments: {
        brightness: currentAdj.brightness ?? 0,
        contrast: currentAdj.contrast ?? 0,
        saturation: currentAdj.saturation ?? 0,
        exposure: currentAdj.exposure ?? 0,
        temperature: currentAdj.temperature ?? 0,
        tint: currentAdj.tint ?? 0,
        highlights: currentAdj.highlights ?? 0,
        shadows: currentAdj.shadows ?? 0,
        sharpen: currentAdj.sharpen ?? 0,
        vignette: currentAdj.vignette ?? 0,
        fade: currentAdj.fade ?? 0,
      },
    };

    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem('velocut_custom_presets_v2', JSON.stringify(updatedPresets));
    
    // Apply immediately
    applyPreset(newPreset);

    // Reset input fields
    setIsNaming(false);
    setNewPresetName('');
  };

  const handleDeletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedPresets = customPresets.filter(p => p.id !== id);
    setCustomPresets(updatedPresets);
    localStorage.setItem('velocut_custom_presets_v2', JSON.stringify(updatedPresets));
  };

  const sliders: { key: keyof ColorAdjustments; label: string; min: number; max: number }[] = [
    { key: 'brightness', label: 'Brightness', min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
    { key: 'temperature', label: 'Warmth / Temp', min: -100, max: 100 },
    { key: 'tint', label: 'Tint (Green/Pink)', min: -100, max: 100 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
    { key: 'vignette', label: 'Vignette Border', min: 0, max: 100 },
    { key: 'sharpen', label: 'Sharpen', min: 0, max: 100 },
    { key: 'fade', label: 'Film Fade', min: 0, max: 100 },
  ];

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {selectedClip ? `Color Grading: ${selectedClip.name}` : 'Color Grading'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tabs: Presets vs Manual Adjust */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'presets' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('adjust')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'adjust' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual Adjust
            </button>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
            title="Reset Color Adjustments"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {!selectedClip && (
        <div className="text-xs text-amber-400/80 mb-2 italic">
          Select a video or image clip on the timeline to preview and adjust color grading in real-time.
        </div>
      )}

      {/* Tab 1: Color Grading LUT Presets */}
      {activeTab === 'presets' && (
        <div className="flex flex-col gap-4">
          {/* Built-in LUTs */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Cinematic Built-In LUTs</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COLOR_PRESETS.map((p) => {
                const isSelected = currentAdj.presetName === p.name;
                return (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{p.name}</div>
                    <div className="text-[9px] text-amber-400/90 font-medium">{p.category}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Saved Custom Presets / LUTs */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">My Saved Custom LUTs</h4>
            {customPresets.length === 0 ? (
              <div className="text-center py-4 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl">
                <p className="text-[10px] text-slate-500">No custom LUTs saved yet.</p>
                <p className="text-[9px] text-slate-600 mt-0.5">Adjust sliders under "Manual Adjust" and save your own color preset style!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {customPresets.map((cp) => {
                  const isSelected = currentAdj.presetName === cp.name;
                  return (
                    <div
                      key={cp.id}
                      onClick={() => applyPreset(cp)}
                      className={`group relative p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-16 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-sky-300 line-clamp-1 pr-4">{cp.name}</div>
                        <div className="text-[8px] text-slate-400 font-mono mt-0.5">
                          B: {cp.adjustments.brightness ?? 0} | C: {cp.adjustments.contrast ?? 0} | S: {cp.adjustments.saturation ?? 0}
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeletePreset(e, cp.id)}
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete custom preset"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Manual Precision Sliders */}
      {activeTab === 'adjust' && (
        <div className="flex flex-col gap-3">
          {/* Header Action: Save as Preset Name Input or Action Trigger */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Custom Look Designer</span>
            
            {isNaming ? (
              <form onSubmit={handleSaveCustom} className="flex items-center gap-1.5 w-2/3">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="LUT Name (e.g. Cyber Teal)"
                  autoFocus
                  required
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-white placeholder-slate-500 outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="p-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors"
                  title="Confirm Save"
                >
                  <Save size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsNaming(false);
                    setNewPresetName('');
                  }}
                  className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  if (selectedClip) {
                    setIsNaming(true);
                  }
                }}
                disabled={!selectedClip}
                className="flex items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 disabled:opacity-30 disabled:pointer-events-none px-3 py-1.5 bg-amber-500/10 rounded-xl border border-amber-500/20 active:scale-98 transition-all"
              >
                <BookmarkPlus size={13} />
                <span>Save LUT Preset</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {sliders.map((s) => {
              const val = (currentAdj[s.key] as number) || 0;
              return (
                <div key={s.key} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span>{s.label}</span>
                    <span className="font-mono text-amber-400 text-[11px]">{val > 0 ? `+${val}` : val}</span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    value={val}
                    onChange={(e) => updateProp(s.key, Number(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
