import React, { useState } from 'react';
import {
  X,
  Cpu,
  Check,
  ShieldCheck,
  Key,
  Globe,
  HardDrive,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { AIProviderManager, AIProvider } from '../../services/aiProvider';

interface AiProviderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
}

export const AiProviderSettingsModal: React.FC<AiProviderSettingsModalProps> = ({
  isOpen,
  onClose,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const providers = AIProviderManager.getProviders();
  const [activeId, setActiveId] = useState(AIProviderManager.getActiveProvider().id);

  const handleSelect = (id: string) => {
    AIProviderManager.setActiveProvider(id);
    setActiveId(id);
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
          <div className="flex items-center gap-2">
            <Cpu size={18} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase" style={{ color: p.textPrimary }}>
                AI Providers Architecture
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Local real-time algorithms + Cloud AI integration interface
              </p>
            </div>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <div className="space-y-2">
            {providers.map((prov) => {
              const isSel = activeId === prov.id;
              return (
                <div
                  key={prov.id}
                  onClick={() => handleSelect(prov.id)}
                  className="p-3.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: isSel ? p.bgElevated : 'transparent',
                    borderColor: isSel ? p.accent : p.borderSubtle
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {prov.id === 'local-engine' ? (
                        <HardDrive size={16} style={{ color: p.accent }} />
                      ) : (
                        <Globe size={16} style={{ color: p.accent }} />
                      )}
                      <h3 className="text-xs font-bold" style={{ color: p.textPrimary }}>
                        {prov.name}
                      </h3>
                    </div>

                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: prov.state === 'Available' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                        color: prov.state === 'Available' ? '#10B981' : '#EA580C'
                      }}
                    >
                      {prov.state}
                    </span>
                  </div>

                  <p className="text-[11px] mt-1.5" style={{ color: p.textSecondary }}>
                    {prov.id === 'local-engine'
                      ? 'Client-side Canvas & DSP computer vision. 100% private, works offline with zero API keys required.'
                      : 'Server-side neural intelligence for high-density diffusion and template comprehension.'}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t text-[10px]" style={{ borderColor: p.borderSubtle, color: p.textMuted }}>
                    <span>Methods: enhanceImage · removeBackground · replaceBackground · styleMatch · analyzeTemplate</span>
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
              Local-first guarantee: All photo editing, background cutout segmentation, video timeline rendering, and duplicate detection execute locally on your device without transmitting private media.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
