export type ThemeId =
  | 'pearl'
  | 'sky'
  | 'mint'
  | 'lavender'
  | 'peach'
  | 'ice'
  | 'sand'
  | 'dark'
  | 'system';

export interface AppTheme {
  id: ThemeId;
  name: string;
  mode: 'light' | 'dark';
  description: string;
  palette: {
    bgApp: string;
    bgSurface: string;
    bgElevated: string;
    bgInput: string;
    borderSubtle: string;
    borderStrong: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    accentHover: string;
    accentLight: string;
    accentText: string;
    accentGradient: string;
    dockBg: string;
    dockBorder: string;
    dockActiveBg: string;
    dockActiveText: string;
    dockInactiveText: string;
    statusIndicator: string;
  };
}
