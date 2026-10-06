import React, { useState } from 'react';
import { X, Image, Film, Sparkles, Check, Upload, Play, Shuffle } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { TemplateDefinition, Project } from '../../types/editor';
import { SAMPLE_VIDEOS } from '../../data/sampleMedia';
import { ProjectStorageService } from '../../services/projectStorage';

interface UseTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDefinition | null;
  onApplySuccess: (newProject: Project) => void;
  theme: AppTheme;
}

export const UseTemplateModal: React.FC<UseTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onApplySuccess,
  theme
}) => {
  if (!isOpen || !template) return null;
  const p = theme.palette;

  const slotsCount = template.slots ? template.slots.length : template.requiredMediaCount;
  // Initialize slot media array with samples or user choices
  const [slotMedia, setSlotMedia] = useState<{ [slotIndex: number]: string }>(() => {
    const map: { [idx: number]: string } = {};
    for (let i = 0; i < slotsCount; i++) {
      const sample = SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length];
      map[i] = sample.thumbnail;
    }
    return map;
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handleShuffleSamples = () => {
    const map: { [idx: number]: string } = {};
    for (let i = 0; i < slotsCount; i++) {
      const randomSample = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
      map[i] = randomSample.thumbnail;
    }
    setSlotMedia(map);
  };

  const handleApply = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // Use ProjectStorageService to generate a fresh, uncoupled project copy
      const newProject = ProjectStorageService.createProjectFromTemplate(template);
      newProject.name = `${template.title} (My Edit)`;
      
      // Update clips in first track with assigned slot media
      const mainTrack = newProject.tracks.find(t => t.id === 'track-v1');
      if (mainTrack) {
        mainTrack.clips.forEach((clip, idx) => {
          if (slotMedia[idx]) {
            clip.src = slotMedia[idx];
          }
        });
      }

      ProjectStorageService.saveProject(newProject);
      setIsProcessing(false);
      onApplySuccess(newProject);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
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
          <div>
            <h2 className="text-sm font-bold tracking-wide" style={{ color: p.textPrimary }}>
              APPLY TEMPLATE: {template.title}
            </h2>
            <p className="text-[11px]" style={{ color: p.textSecondary }}>
              Select media for all {slotsCount} slots. Compositions, cuts & music are preserved.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-80"
            style={{ color: p.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Slot Grid Selection */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textPrimary }}>
              Template Media Slots ({slotsCount} Required)
            </span>
            <button
              onClick={handleShuffleSamples}
              className="text-xs font-semibold flex items-center gap-1 hover:opacity-80"
              style={{ color: p.accent }}
            >
              <Shuffle size={13} />
              <span>Shuffle Media</span>
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: slotsCount }).map((_, idx) => {
              const currentSlot = template.slots ? template.slots[idx] : null;
              const isVideo = currentSlot ? currentSlot.suggestedType === 'video' : idx % 2 === 0;
              const assignedUrl = slotMedia[idx];

              return (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl border overflow-hidden group cursor-pointer"
                  style={{
                    backgroundColor: p.bgElevated,
                    borderColor: p.borderSubtle
                  }}
                  onClick={() => {
                    // Cycle to next sample
                    const next = SAMPLE_VIDEOS[(idx + 1) % SAMPLE_VIDEOS.length];
                    setSlotMedia(prev => ({ ...prev, [idx]: next.thumbnail }));
                  }}
                >
                  {assignedUrl && (
                    <img
                      src={assignedUrl}
                      alt={`Slot ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/25 flex flex-col justify-between p-1.5">
                    <span className="text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded self-start">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center justify-between text-white text-[10px]">
                      {isVideo ? <Film size={12} /> : <Image size={12} />}
                      <Check size={12} className="text-emerald-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="p-3 rounded-xl border text-xs"
            style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textSecondary }}
          >
            <p>
              Auto-aligns keyframes, transitions, and audio beat drops. Master template remains safe and unchanged.
            </p>
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
            onClick={handleApply}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            <Sparkles size={14} />
            <span>{isProcessing ? 'Generating Project Copy...' : 'Generate Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
