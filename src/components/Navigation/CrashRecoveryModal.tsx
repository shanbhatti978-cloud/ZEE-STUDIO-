import React from 'react';
import { AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { Project } from '../../types/editor';

interface CrashRecoveryModalProps {
  isOpen: boolean;
  projectSnapshot: Project | null;
  onRecover: () => void;
  onDiscard: () => void;
  theme: AppTheme;
}

export const CrashRecoveryModal: React.FC<CrashRecoveryModalProps> = ({
  isOpen,
  projectSnapshot,
  onRecover,
  onDiscard,
  theme
}) => {
  if (!isOpen || !projectSnapshot) return null;
  const p = theme.palette;

  const dateStr = new Date(projectSnapshot.updatedAt || Date.now()).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl p-5 border space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderStrong
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: p.accentLight, color: p.accent }}
          >
            <AlertCircle size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: p.textPrimary }}>
              Recover Unsaved Work?
            </h3>
            <p className="text-xs mt-1" style={{ color: p.textSecondary }}>
              An unsaved editing session for <span className="font-semibold" style={{ color: p.textPrimary }}>"{projectSnapshot.name}"</span> was detected from {dateStr}.
            </p>
          </div>
        </div>

        <div
          className="p-3 rounded-xl border text-xs space-y-1"
          style={{
            backgroundColor: p.bgElevated,
            borderColor: p.borderSubtle
          }}
        >
          <div className="flex justify-between" style={{ color: p.textSecondary }}>
            <span>Tracks:</span>
            <span className="font-semibold" style={{ color: p.textPrimary }}>{projectSnapshot.tracks.length}</span>
          </div>
          <div className="flex justify-between" style={{ color: p.textSecondary }}>
            <span>Duration:</span>
            <span className="font-semibold" style={{ color: p.textPrimary }}>{projectSnapshot.duration.toFixed(1)}s</span>
          </div>
          <div className="flex justify-between" style={{ color: p.textSecondary }}>
            <span>Aspect Ratio:</span>
            <span className="font-semibold" style={{ color: p.textPrimary }}>{projectSnapshot.aspectRatio}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onDiscard}
            className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors hover:opacity-85"
            style={{
              backgroundColor: p.bgElevated,
              color: p.textSecondary
            }}
          >
            <Trash2 size={14} />
            <span>Discard</span>
          </button>

          <button
            onClick={onRecover}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            style={{
              backgroundColor: p.accent,
              color: p.accentText
            }}
          >
            <RotateCcw size={14} />
            <span>Recover Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
