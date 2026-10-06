import React from 'react';
import { ShieldCheck, Check, AlertCircle, X, Layers, ArrowRight } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { DuplicateDetectionResult, TemplateDefinition } from '../../types/editor';

interface DuplicateReportModalProps {
  isOpen: boolean;
  result: DuplicateDetectionResult | null;
  candidateTemplate: TemplateDefinition | null;
  onOpenExisting: (templateId: string) => void;
  onSaveVariant: () => void;
  onCancel: () => void;
  theme: AppTheme;
}

export const DuplicateReportModal: React.FC<DuplicateReportModalProps> = ({
  isOpen,
  result,
  candidateTemplate,
  onOpenExisting,
  onSaveVariant,
  onCancel,
  theme
}) => {
  if (!isOpen || !result || !candidateTemplate) return null;
  const p = theme.palette;

  const isExactDuplicate = result.similarityPercentage >= 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: isExactDuplicate ? '#EA580C' : p.borderStrong
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{
                backgroundColor: isExactDuplicate ? 'rgba(234, 88, 12, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isExactDuplicate ? '#EA580C' : '#F59E0B'
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
                {isExactDuplicate ? 'DUPLICATE TEMPLATE DETECTED' : 'VERY SIMILAR TEMPLATE DETECTED'}
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Structural fingerprint & cut sequence analysis
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:opacity-80" style={{ color: p.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs">
          {/* Comparison summary card */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between"
            style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: p.textMuted }}>
                Matches Local Master:
              </span>
              <h3 className="text-sm font-bold mt-0.5" style={{ color: p.textPrimary }}>
                "{result.existingTemplate?.title || 'Existing Template'}"
              </h3>
            </div>
            <div className="text-right">
              <span className="text-lg font-black" style={{ color: isExactDuplicate ? '#EA580C' : p.accent }}>
                {result.similarityPercentage}%
              </span>
              <span className="text-[10px] font-bold block uppercase" style={{ color: p.textMuted }}>
                Similarity
              </span>
            </div>
          </div>

          {/* Breakdown of Matches & Differences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Matches List */}
            <div
              className="p-3 rounded-xl border space-y-1.5"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Matches:
              </span>
              <ul className="space-y-1">
                {(result.matchReasons.length > 0 ? result.matchReasons : [
                  'Timeline & slot counts',
                  'Transitions sequence',
                  'Text layout & alignments',
                  'Color grade & effects'
                ]).map((m, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: p.textPrimary }}>
                    <Check size={12} className="text-emerald-500 shrink-0" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Differences List */}
            <div
              className="p-3 rounded-xl border space-y-1.5"
              style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                Differs:
              </span>
              <ul className="space-y-1">
                {(result.differenceReasons.length > 0 ? result.differenceReasons : [
                  'Text headline wording',
                  'Audio track & timing grid',
                  'Individual filter intensity'
                ]).map((d, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: p.textSecondary }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-[11px]" style={{ color: p.textMuted }}>
            Asset deduplication is enabled: saving as a variant will reuse shared fonts, overlays, and audio assets without consuming duplicate storage.
          </p>
        </div>

        {/* Footer Actions */}
        <div
          className="p-3 border-t flex flex-wrap items-center justify-end gap-2 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:opacity-80"
            style={{ color: p.textSecondary }}
          >
            CANCEL
          </button>

          <button
            onClick={onSaveVariant}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border hover:opacity-90"
            style={{
              backgroundColor: p.bgSurface,
              borderColor: p.borderStrong,
              color: p.textPrimary
            }}
          >
            SAVE AS VARIANT
          </button>

          {result.existingTemplate && (
            <button
              onClick={() => onOpenExisting(result.existingTemplate!.id)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
              style={{
                backgroundColor: p.accent,
                color: p.accentText
              }}
            >
              OPEN EXISTING
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
