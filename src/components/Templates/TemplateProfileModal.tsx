import React from 'react';
import {
  X,
  Play,
  Heart,
  Copy,
  Download,
  Trash2,
  Edit3,
  Layers,
  Clock,
  Sparkles,
  Music,
  Share2,
  Calendar,
  Globe,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { TemplateDefinition } from '../../types/editor';

interface TemplateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: TemplateDefinition | null;
  onUseTemplate: (template: TemplateDefinition) => void;
  onEditTemplate: (template: TemplateDefinition) => void;
  onDuplicateTemplate: (template: TemplateDefinition) => void;
  onExportTemplate: (template: TemplateDefinition) => void;
  onToggleFavorite: (templateId: string) => void;
  onDeleteTemplate: (templateId: string) => void;
  theme: AppTheme;
}

export const TemplateProfileModal: React.FC<TemplateProfileModalProps> = ({
  isOpen,
  onClose,
  template,
  onUseTemplate,
  onEditTemplate,
  onDuplicateTemplate,
  onExportTemplate,
  onToggleFavorite,
  onDeleteTemplate,
  theme
}) => {
  if (!isOpen || !template) return null;
  const p = theme.palette;

  const slotsCount = template.slots ? template.slots.length : template.requiredMediaCount;
  const createdDate = template.importDate
    ? new Date(template.importDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : '05 Oct 2026';

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
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: p.accent }} />
            <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
              Template Profile
            </h2>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Card Hero Preview */}
          <div
            className={`w-full h-36 rounded-xl bg-gradient-to-r ${template.coverGradient || 'from-indigo-600 to-purple-800'} relative p-4 flex flex-col justify-end text-white shadow-md overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm uppercase">
                {template.category}
              </span>
              <h3 className="text-lg font-extrabold mt-1 drop-shadow-sm">{template.title}</h3>
              <p className="text-xs opacity-90">{template.description}</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl border text-xs"
            style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
          >
            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Source:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.source || 'Built-in Master'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Duration:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.duration.toFixed(1)}s
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Aspect Ratio:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.aspectRatio}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Media Slots:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {slotsCount} Slots
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Text Layers:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.textLayersCount || slotsCount}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Transitions:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.transitionsCount || slotsCount - 1}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Visual Effects:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.effectsCount || slotsCount}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Language:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.language || 'Multilingual'}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold block" style={{ color: p.textMuted }}>
                Times Used:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {template.usedCount || 0} times
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onUseTemplate(template);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: p.accent,
              color: p.accentText
            }}
          >
            <Play size={16} className="fill-current" />
            <span>Use Template (One-Tap Application)</span>
          </button>

          {/* Secondary Action Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => {
                onEditTemplate(template);
                onClose();
              }}
              className="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-85"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>

            <button
              onClick={() => {
                onDuplicateTemplate(template);
                onClose();
              }}
              className="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-85"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Copy size={13} />
              <span>Duplicate</span>
            </button>

            <button
              onClick={() => {
                onExportTemplate(template);
                onClose();
              }}
              className="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-85"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Download size={13} />
              <span>Export</span>
            </button>

            <button
              onClick={() => onToggleFavorite(template.id)}
              className="py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 hover:opacity-85"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle, color: p.textPrimary }}
            >
              <Heart size={13} className={template.isFavorite ? 'fill-rose-500 text-rose-500' : ''} />
              <span>Favorite</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={() => {
              onDeleteTemplate(template.id);
              onClose();
            }}
            className="text-xs text-rose-500 font-semibold hover:opacity-80 flex items-center gap-1"
          >
            <Trash2 size={13} />
            <span>Delete Template</span>
          </button>
          <span className="text-[11px]" style={{ color: p.textMuted }}>
            Fingerprint: {template.duplicateFingerprint ? template.duplicateFingerprint.slice(0, 18) : 'fp_synced'}...
          </span>
        </div>
      </div>
    </div>
  );
};
