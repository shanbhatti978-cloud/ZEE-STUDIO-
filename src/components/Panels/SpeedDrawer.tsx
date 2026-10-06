import React from 'react';
import { Gauge, RotateCcw, FastForward, Check } from 'lucide-react';
import { Clip } from '../../types/editor';

interface SpeedDrawerProps {
  selectedClip: Clip | null;
  onUpdateSpeed: (clipId: string, speed: number) => void;
  onToggleReverse: (clipId: string) => void;
  onClose: () => void;
}

export const SpeedDrawer: React.FC<SpeedDrawerProps> = ({
  selectedClip,
  onUpdateSpeed,
  onToggleReverse,
  onClose,
}) => {
  const currentSpeed = selectedClip?.speed || 1.0;

  const presets = [
    { label: '0.2x Ultra Slow', speed: 0.2 },
    { label: '0.5x Slow-Mo', speed: 0.5 },
    { label: '1.0x Normal', speed: 1.0 },
    { label: '1.5x Brisk', speed: 1.5 },
    { label: '2.0x Fast', speed: 2.0 },
    { label: '5.0x Hyper', speed: 5.0 },
    { label: '10x Timelapse', speed: 10.0 },
  ];

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {selectedClip ? `Speed: ${selectedClip.name}` : 'Clip Speed'}
          </h3>
        </div>

        {selectedClip && (
          <button
            onClick={() => onToggleReverse(selectedClip.id)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
              selectedClip.reversed
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <RotateCcw size={13} />
            <span>{selectedClip.reversed ? 'Reversed: ON' : 'Reverse Video'}</span>
          </button>
        )}
      </div>

      {!selectedClip ? (
        <div className="text-xs text-amber-400/90 italic">
          Select a video or audio clip on the timeline to modify speed and playback direction.
        </div>
      ) : (
        <>
          {/* Speed Slider */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
              <span>Playback Rate</span>
              <span className="font-mono text-amber-400 font-bold">{currentSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="10.0"
              step="0.1"
              value={currentSpeed}
              onChange={(e) => onUpdateSpeed(selectedClip.id, Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          {/* Quick Curve Presets */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {presets.map((p) => {
              const isSelected = Math.abs(currentSpeed - p.speed) < 0.05;
              return (
                <button
                  key={p.label}
                  onClick={() => onUpdateSpeed(selectedClip.id, p.speed)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
