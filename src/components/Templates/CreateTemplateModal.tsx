import React, { useState } from 'react';
import { X, Sparkles, Check, Layers, Play } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { Project, TemplateDefinition, TemplateSlot } from '../../types/editor';
import { TemplateAnalyzerService } from '../../services/templateAnalyzer';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project;
  onSaveTemplate: (newTemplate: TemplateDefinition) => void;
  theme: AppTheme;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  onSaveTemplate,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const [title, setTitle] = useState(`${activeProject.name} Template`);
  const [category, setCategory] = useState<string>('Trending');
  const [description, setDescription] = useState('Custom creator template made from current project with preserved timing, transitions, and audio sync.');

  // Extract slots from video tracks in active project
  const videoTrack = activeProject.tracks.find(t => t.type === 'video');
  const clips = videoTrack ? videoTrack.clips : [];

  const handleSave = () => {
    const slots: TemplateSlot[] = clips.map((clip, idx) => ({
      id: `slot_${idx + 1}`,
      startTime: clip.start,
      duration: clip.duration,
      suggestedType: clip.type === 'video' ? 'video' : 'image',
      aspectRatio: activeProject.aspectRatio,
      cropMode: 'cover',
      transition: clip.transitionIn ? clip.transitionIn.type : 'none',
      effect: clip.effect ? clip.effect.type : 'none',
      textOverlay: `SCENE ${idx + 1}`
    }));

    const audioTrack = activeProject.tracks.find(t => t.type === 'audio');
    const firstAudio = audioTrack?.clips[0];

    const newTemplate: TemplateDefinition = {
      id: `user_tmpl_${Date.now()}`,
      title: title.trim() || 'My User Template',
      category: category as any,
      creator: 'You (Creator)',
      source: 'UserCreated',
      aspectRatio: activeProject.aspectRatio,
      duration: activeProject.duration,
      requiredMediaCount: Math.max(1, slots.length),
      description: description.trim(),
      coverGradient: 'from-fuchsia-600 via-purple-700 to-indigo-900',
      photoSlotsCount: slots.filter(s => s.suggestedType === 'image').length,
      videoSlotsCount: slots.filter(s => s.suggestedType === 'video').length,
      textLayersCount: activeProject.tracks.find(t => t.type === 'text')?.clips.length || 0,
      transitionsCount: Math.max(0, slots.length - 1),
      effectsCount: slots.length,
      audioCount: audioTrack?.clips.length || 1,
      aiElementsCount: 1,
      language: 'English',
      tags: ['user-created', 'custom', category.toLowerCase()],
      importDate: Date.now(),
      lastUsedDate: Date.now(),
      usedCount: 0,
      audioTrack: {
        title: firstAudio?.name || 'Timeline Audio',
        artist: 'Creator Audio',
        src: firstAudio?.src || 'track-phonk-drift',
        duration: activeProject.duration,
        beats: [0.0, 2.0, 4.0, 6.0, 8.0]
      },
      slots: slots.length > 0 ? slots : [
        {
          id: 'slot_1',
          startTime: 0,
          duration: activeProject.duration,
          suggestedType: 'video',
          transition: 'fade',
          effect: 'none'
        }
      ]
    };

    newTemplate.duplicateFingerprint = TemplateAnalyzerService.generateFingerprint(newTemplate);

    onSaveTemplate(newTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] border animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderStrong
        }}
      >
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: p.accent }} />
            <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
              Create Reusable Template
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:opacity-80" style={{ color: p.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
              Template Name:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none"
              style={{ backgroundColor: p.bgInput, borderColor: p.borderSubtle, color: p.textPrimary }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
              Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none"
              style={{ backgroundColor: p.bgInput, borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              {['Trending', 'Velocity', 'Cinematic', 'Beat Sync', 'Urdu', 'Arabic', 'Reels', 'TikTok', 'Travel', 'Portrait'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold" style={{ color: p.textSecondary }}>
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border text-xs outline-none resize-none"
              style={{ backgroundColor: p.bgInput, borderColor: p.borderSubtle, color: p.textPrimary }}
            />
          </div>

          <div
            className="p-3 rounded-xl border text-xs space-y-1"
            style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textSecondary }}
          >
            <div className="flex justify-between">
              <span>Replaceable Media Slots:</span>
              <span className="font-bold" style={{ color: p.textPrimary }}>{Math.max(1, clips.length)}</span>
            </div>
            <div className="flex justify-between">
              <span>Preserved Aspect Ratio:</span>
              <span className="font-bold" style={{ color: p.textPrimary }}>{activeProject.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span>Preserved Duration:</span>
              <span className="font-bold" style={{ color: p.textPrimary }}>{activeProject.duration.toFixed(1)}s</span>
            </div>
          </div>
        </div>

        <div
          className="p-3 border-t flex items-center justify-end gap-2 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-85" style={{ color: p.textSecondary }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            <Check size={14} />
            <span>Save as Template</span>
          </button>
        </div>
      </div>
    </div>
  );
};
