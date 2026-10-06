import React, { useState } from 'react';
import { Flame, Clock, Check } from 'lucide-react';
import { Clip, Transition } from '../../types/editor';

interface TransitionsDrawerProps {
  selectedClip: Clip | null;
  onApplyTransition: (clipId: string, transition: Transition) => void;
  onApplyToAllCuts: (transition: Transition) => void;
  onClose: () => void;
}

export const TransitionsDrawer: React.FC<TransitionsDrawerProps> = ({
  selectedClip,
  onApplyTransition,
  onApplyToAllCuts,
  onClose,
}) => {
  const currentTrans = selectedClip?.transitionIn || { id: 't-none', type: 'none', duration: 0.4 };
  const [selectedType, setSelectedType] = useState<Transition['type']>(
    currentTrans.type !== 'none' ? currentTrans.type : 'zoom-in'
  );
  const [duration, setDuration] = useState<number>(currentTrans.duration || 0.4);

  const transitionsList: { id: Transition['type']; name: string; category: string }[] = [
    { id: 'zoom-in', name: 'Zoom In Punch', category: 'Camera' },
    { id: 'zoom-out', name: 'Zoom Out Snap', category: 'Camera' },
    { id: 'spin', name: 'Spin Whip 180°', category: 'Motion' },
    { id: 'camera-whip', name: 'Camera Whip Pan', category: 'Motion' },
    { id: 'blur-flash', name: 'Blur Flash White', category: 'Lighting' },
    { id: 'glitch', name: 'Digital Glitch Jump', category: 'Distortion' },
    { id: 'cube-flip', name: '3D Cube Flip', category: '3D' },
    { id: 'swipe-left', name: 'Swipe Left', category: 'Slide' },
    { id: 'swipe-right', name: 'Swipe Right', category: 'Slide' },
    { id: 'swipe-up', name: 'Swipe Up', category: 'Slide' },
    { id: 'swipe-down', name: 'Swipe Down', category: 'Slide' },
    { id: 'fade', name: 'Cross Fade', category: 'Classic' },
    { id: 'dissolve', name: 'Dissolve', category: 'Classic' },
    { id: 'warp', name: 'Warp Wave Ripple', category: 'Distortion' },
    { id: 'mask', name: 'Radial Mask Reveal', category: 'Masking' },
  ];

  const handleApply = () => {
    const trans: Transition = {
      id: `trans_${Date.now()}`,
      type: selectedType,
      duration,
    };
    if (selectedClip) {
      onApplyTransition(selectedClip.id, trans);
    }
    onClose();
  };

  const handleApplyAll = () => {
    const trans: Transition = {
      id: `trans_${Date.now()}`,
      type: selectedType,
      duration,
    };
    onApplyToAllCuts(trans);
    onClose();
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            {selectedClip ? `Transition: ${selectedClip.name}` : 'Transitions'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyAll}
            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700"
          >
            Apply to All Cuts
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-orange-500/25 transition-all"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Duration slider */}
      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 mb-3">
        <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
          <span>Transition Duration</span>
          <span className="font-mono text-orange-400 font-bold">{duration.toFixed(2)}s</span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1.5"
          step="0.05"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-full accent-orange-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* Transitions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {transitionsList.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(t.id)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              selectedType === t.id
                ? 'bg-orange-500/15 border-orange-500 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="text-xs font-bold text-slate-200 mb-0.5">{t.name}</div>
            <span className="text-[9px] font-semibold text-orange-400 uppercase tracking-wider">
              {t.category}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
