import React from 'react';
import { Tv, Palette, Check } from 'lucide-react';
import { AspectRatio, Project } from '../../types/editor';

interface CanvasDrawerProps {
  project: Project;
  onUpdateCanvas: (updates: { aspectRatio?: AspectRatio; background?: Project['canvasBackground'] }) => void;
  onClose: () => void;
}

export const CanvasDrawer: React.FC<CanvasDrawerProps> = ({
  project,
  onUpdateCanvas,
  onClose,
}) => {
  const ratios: { id: AspectRatio; label: string; desc: string }[] = [
    { id: '9:16', label: '9:16', desc: 'TikTok, Reels, Shorts' },
    { id: '1:1', label: '1:1', desc: 'Instagram Feed Square' },
    { id: '4:5', label: '4:5', desc: 'Instagram Portrait' },
    { id: '16:9', label: '16:9', desc: 'YouTube Landscape' },
    { id: '3:4', label: '3:4', desc: 'Standard Feed' },
  ];

  const colors = ['#000000', '#0f172a', '#1e1b4b', '#172554', '#064e3b', '#450a0a', '#3b0764', '#ffffff'];

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Tv size={16} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Canvas & Aspect Ratio</h3>
        </div>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="mb-4">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Format Presets
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {ratios.map((r) => {
            const isSelected = project.aspectRatio === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onUpdateCanvas({ aspectRatio: r.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-sky-500/15 border-sky-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-200">{r.label}</div>
                <div className="text-[9px] text-slate-500 line-clamp-1">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Canvas Background Color */}
      <div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Background Backdrop
        </div>
        <div className="flex items-center gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() =>
                onUpdateCanvas({
                  background: {
                    type: 'color',
                    color: c,
                    blurAmount: 0,
                  },
                })
              }
              style={{ backgroundColor: c }}
              className={`w-7 h-7 rounded-full border transition-transform ${
                project.canvasBackground.color === c
                  ? 'scale-115 ring-2 ring-sky-400 border-white'
                  : 'border-slate-700'
              }`}
            />
          ))}

          <button
            onClick={() =>
              onUpdateCanvas({
                background: {
                  type: 'pattern',
                  color: '#000000',
                  blurAmount: 0,
                },
              })
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ml-2 ${
              project.canvasBackground.type === 'pattern'
                ? 'bg-sky-500/20 text-sky-300 border-sky-500'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Dot Pattern
          </button>
        </div>
      </div>
    </div>
  );
};
