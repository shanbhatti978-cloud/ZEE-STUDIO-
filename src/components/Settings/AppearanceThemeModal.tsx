import React from 'react';
import { X, Check, Sun, Moon, Laptop, Palette } from 'lucide-react';
import { AppTheme, ThemeId } from '../../types/theme';
import { APP_THEMES } from '../../services/themeService';

interface AppearanceThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  theme: AppTheme;
}

export const AppearanceThemeModal: React.FC<AppearanceThemeModalProps> = ({
  isOpen,
  onClose,
  activeThemeId,
  onSelectTheme,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const lightThemes: ThemeId[] = ['pearl', 'sky', 'mint', 'lavender', 'peach', 'ice', 'sand'];
  const darkThemes: ThemeId[] = ['dark', 'system'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] border animate-in fade-in zoom-in-95 duration-150"
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
            <Palette size={19} style={{ color: p.accent }} />
            <div>
              <h2 className="text-sm font-bold tracking-wide" style={{ color: p.textPrimary }}>
                Appearance & 7 Light Themes
              </h2>
              <p className="text-[11px]" style={{ color: p.textSecondary }}>
                Material 3 Expressive theme system with dynamic surface adaptation
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
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Light Themes Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sun size={15} style={{ color: p.accent }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textPrimary }}>
                Light Themes (7 Expressive Styles)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {lightThemes.map((id) => {
                const t = APP_THEMES[id];
                const isSelected = activeThemeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectTheme(id)}
                    className="p-3 rounded-xl border text-left transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: t.palette.bgApp,
                      borderColor: isSelected ? t.palette.accent : t.palette.borderSubtle,
                      borderWidth: isSelected ? '2px' : '1px',
                      boxShadow: isSelected ? `0 4px 12px ${t.palette.accent}25` : 'none'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold" style={{ color: t.palette.textPrimary }}>
                        {t.name}
                      </span>
                      {isSelected ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: t.palette.accent, color: t.palette.accentText }}
                        >
                          <Check size={12} />
                        </div>
                      ) : (
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ borderColor: t.palette.borderStrong }}
                        />
                      )}
                    </div>

                    <p className="text-[10px] line-clamp-2" style={{ color: t.palette.textSecondary }}>
                      {t.description}
                    </p>

                    {/* Color Swatch Preview */}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t" style={{ borderColor: t.palette.borderSubtle }}>
                      <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: t.palette.bgSurface, borderColor: t.palette.borderStrong }} />
                      <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: t.palette.bgElevated, borderColor: t.palette.borderStrong }} />
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.palette.accent }} />
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.palette.textPrimary }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dark & System Section */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Moon size={15} style={{ color: p.accent }} />
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: p.textPrimary }}>
                Dark & System
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {darkThemes.map((id) => {
                const t = APP_THEMES[id];
                const isSelected = activeThemeId === id;
                return (
                  <button
                    key={id}
                    onClick={() => onSelectTheme(id)}
                    className="p-3 rounded-xl border text-left transition-all relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: t.palette.bgApp,
                      borderColor: isSelected ? t.palette.accent : t.palette.borderSubtle,
                      borderWidth: isSelected ? '2px' : '1px'
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold" style={{ color: t.palette.textPrimary }}>
                        {t.name}
                      </span>
                      {isSelected && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: t.palette.accent, color: t.palette.accentText }}
                        >
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px]" style={{ color: t.palette.textSecondary }}>
                      {t.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t" style={{ borderColor: t.palette.borderSubtle }}>
                      <span className="w-3.5 h-3.5 rounded-full border" style={{ backgroundColor: t.palette.bgSurface, borderColor: t.palette.borderStrong }} />
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.palette.accent }} />
                      <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.palette.textPrimary }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t flex justify-end shrink-0"
          style={{ borderColor: p.borderSubtle, backgroundColor: p.bgElevated }}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 active:scale-95"
            style={{
              backgroundColor: p.accent,
              color: p.accentText
            }}
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
