import React from 'react';
import { Menu, Search, Bell, Settings, Undo2, Redo2, Download, Sparkles, HardDrive } from 'lucide-react';
import { AppTheme } from '../../types/theme';

interface TopAppBarProps {
  theme: AppTheme;
  onOpenDrawer: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenSettings: () => void;
  onOpenStorage?: () => void;
  onOpenExport?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  isOnline?: boolean;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  theme,
  onOpenDrawer,
  onOpenSearch,
  onOpenNotifications,
  onOpenSettings,
  onOpenStorage,
  onOpenExport,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  isOnline = true
}) => {
  const p = theme.palette;

  return (
    <header
      className="h-14 px-3 flex items-center justify-between shrink-0 select-none z-30 transition-colors duration-200 border-b relative"
      style={{
        backgroundColor: p.bgSurface,
        borderColor: p.borderSubtle
      }}
    >
      {/* LEFT: Drawer Toggle & App Name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onOpenDrawer}
          title="Open Studio Navigation Drawer"
          className="p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95"
          style={{
            color: p.textPrimary,
            backgroundColor: p.bgElevated
          }}
        >
          <Menu size={19} />
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isOnline ? p.accent : '#EF4444' }}
            title={isOnline ? 'System Online & Ready' : 'Offline Mode'}
          />
          <span
            className="font-extrabold text-sm sm:text-base tracking-wider uppercase truncate"
            style={{ color: p.textPrimary }}
          >
            ZEE STUDIO
          </span>
        </div>
      </div>

      {/* RIGHT: Actions (Undo/Redo if applicable, Search, Notifications, Settings, Export) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
            style={{ color: p.textSecondary }}
          >
            <Undo2 size={17} />
          </button>
        )}

        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className="p-1.5 rounded-lg transition-opacity disabled:opacity-30"
            style={{ color: p.textSecondary }}
          >
            <Redo2 size={17} />
          </button>
        )}

        <button
          onClick={onOpenSearch}
          title="Global Search"
          className="p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95"
          style={{
            color: p.textSecondary,
            backgroundColor: p.bgElevated
          }}
        >
          <Search size={18} />
        </button>

        <button
          onClick={onOpenNotifications}
          title="Notifications & Status"
          className="p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95 relative"
          style={{
            color: p.textSecondary,
            backgroundColor: p.bgElevated
          }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2"
            style={{
              backgroundColor: p.accent,
              boxShadow: `0 0 6px ${p.accent}`
            }}
          />
        </button>

        {onOpenStorage && (
          <button
            onClick={onOpenStorage}
            title="Storage & Asset Manager"
            className="p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95"
            style={{
              color: p.textSecondary,
              backgroundColor: p.bgElevated
            }}
          >
            <HardDrive size={18} />
          </button>
        )}

        <button
          onClick={onOpenSettings}
          title="Settings & Themes"
          className="p-2 rounded-xl transition-colors hover:opacity-80 active:scale-95"
          style={{
            color: p.textSecondary,
            backgroundColor: p.bgElevated
          }}
        >
          <Settings size={18} />
        </button>

        {onOpenExport && (
          <button
            onClick={onOpenExport}
            title="Export Media"
            className="ml-1 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-sm"
            style={{
              backgroundColor: p.accent,
              color: p.accentText
            }}
          >
            <Download size={14} />
            <span className="hidden xs:inline">Export</span>
          </button>
        )}
      </div>
    </header>
  );
};
