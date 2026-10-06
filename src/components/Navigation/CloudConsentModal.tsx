import React, { useState } from 'react';
import { ShieldCheck, Cloud, AlertCircle, X, Check, Lock } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { CloudConsentRequest } from '../../services/privacyConsentService';
import { I18nService } from '../../services/i18nService';

interface CloudConsentModalProps {
  isOpen: boolean;
  request: CloudConsentRequest | null;
  onConfirm: (remember: boolean) => void;
  onCancel: () => void;
  theme: AppTheme;
}

export const CloudConsentModal: React.FC<CloudConsentModalProps> = ({
  isOpen,
  request,
  onConfirm,
  onCancel,
  theme
}) => {
  const [remember, setRemember] = useState(true);
  if (!isOpen || !request) return null;
  const p = theme.palette;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden border animate-in fade-in zoom-in-95 duration-150"
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl" style={{ backgroundColor: p.accentLight, color: p.accent }}>
              <Cloud size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: p.textPrimary }}>
                {I18nService.t('cloudConsentTitle')}
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Local-First & Explicit Privacy Protection
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:opacity-80" style={{ color: p.textSecondary }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs">
          <p style={{ color: p.textPrimary }} className="leading-relaxed">
            To use <span className="font-bold" style={{ color: p.accent }}>{request.featureName}</span>, your selected media will be sent to{' '}
            <span className="font-bold" style={{ color: p.textPrimary }}>{request.providerName}</span> for remote AI computation.
          </p>

          <div
            className="p-3.5 rounded-xl border space-y-2"
            style={{ backgroundColor: p.bgElevated, borderColor: p.borderSubtle }}
          >
            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: p.textMuted }}>
                Data Being Transmitted:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {request.dataSummary}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: p.textMuted }}>
                Purpose:
              </span>
              <span className="font-semibold" style={{ color: p.textPrimary }}>
                {request.purpose}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase block" style={{ color: p.textMuted }}>
                Storage & Retention:
              </span>
              <span className="font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Lock size={12} />
                <span>{request.dataRetentionPolicy}</span>
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-current"
              style={{ accentColor: p.accent }}
            />
            <span className="text-[11px] font-medium" style={{ color: p.textSecondary }}>
              {I18nService.t('rememberChoice')}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex items-center justify-end gap-2 shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-85"
            style={{ color: p.textSecondary }}
          >
            {I18nService.t('cancel')}
          </button>
          <button
            onClick={() => onConfirm(remember)}
            className="px-5 py-2 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
            style={{ backgroundColor: p.accent, color: p.accentText }}
          >
            <Check size={14} />
            <span>{I18nService.t('continueBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
