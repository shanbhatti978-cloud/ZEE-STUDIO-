/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Image, LayoutTemplate, Film } from 'lucide-react';
import { AppTheme } from '../../types/theme';

export type CreatorMode = 'home' | 'photo' | 'templates' | 'video';

interface PillBottomDockProps {
  currentMode: CreatorMode;
  onModeChange: (mode: CreatorMode) => void;
  theme: AppTheme;
}

export const PillBottomDock: React.FC<PillBottomDockProps> = ({
  currentMode,
  onModeChange,
  theme
}) => {
  const p = theme.palette;

  const items: { id: CreatorMode; label: string; icon: React.FC<{ size: number; className?: string }> }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home
    },
    {
      id: 'photo',
      label: 'Photo Edit',
      icon: Image
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: LayoutTemplate
    },
    {
      id: 'video',
      label: 'Video Edit',
      icon: Film
    }
  ];

  return (
    <nav
      aria-label="Creator Areas"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl transition-all duration-300 backdrop-blur-xl"
      style={{
        backgroundColor: p.dockBg,
        border: `1px solid ${p.dockBorder}`,
        boxShadow: theme.mode === 'light' ? '0 12px 32px -4px rgba(0,0,0,0.12)' : '0 12px 36px -4px rgba(0,0,0,0.5)'
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentMode === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 select-none ${
              isActive
                ? 'shadow-md scale-[1.03]'
                : 'hover:opacity-85 active:scale-95'
            }`}
            style={{
              backgroundColor: isActive ? p.dockActiveBg : 'transparent',
              color: isActive ? p.dockActiveText : p.dockInactiveText
            }}
          >
            <Icon size={16} className={isActive ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
