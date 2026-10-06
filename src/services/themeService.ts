import { ThemeId, AppTheme } from '../types/theme';

export const APP_THEMES: Record<ThemeId, AppTheme> = {
  pearl: {
    id: 'pearl',
    name: 'Pearl (Default)',
    mode: 'light',
    description: 'Refined violet aesthetic with clean porcelain surfaces and vibrant pastel accents',
    palette: {
      bgApp: '#F6F7FB',
      bgSurface: '#FFFFFF',
      bgElevated: '#F0F2FA',
      bgInput: '#EAEFF8',
      borderSubtle: '#E2E6F2',
      borderStrong: '#CBD3E6',
      textPrimary: '#1F2340',
      textSecondary: '#5A6282',
      textMuted: '#8E96B8',
      accent: '#7C6CF2',
      accentHover: '#6957E6',
      accentLight: '#EDEAFE',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #7C6CF2 0%, #FF8FB1 100%)',
      dockBg: 'rgba(255, 255, 255, 0.94)',
      dockBorder: 'rgba(203, 211, 230, 0.65)',
      dockActiveBg: '#7C6CF2',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#5A6282',
      statusIndicator: '#7C6CF2'
    }
  },
  sky: {
    id: 'sky',
    name: 'Sky',
    mode: 'light',
    description: 'Fresh airy atmosphere with azure highlights and crisp cerulean surfaces',
    palette: {
      bgApp: '#F3F8FC',
      bgSurface: '#FFFFFF',
      bgElevated: '#E8F2FA',
      bgInput: '#DFECF7',
      borderSubtle: '#CFE2F2',
      borderStrong: '#A9CDE9',
      textPrimary: '#0C2340',
      textSecondary: '#406080',
      textMuted: '#789BBF',
      accent: '#0284C7',
      accentHover: '#0369A1',
      accentLight: '#E0F2FE',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(169, 205, 233, 0.6)',
      dockActiveBg: '#0284C7',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#406080',
      statusIndicator: '#0284C7'
    }
  },
  mint: {
    id: 'mint',
    name: 'Mint',
    mode: 'light',
    description: 'Crisp botanical greens with calming sage backgrounds and fresh vitality',
    palette: {
      bgApp: '#F2FAF6',
      bgSurface: '#FFFFFF',
      bgElevated: '#E6F4ED',
      bgInput: '#DBECE2',
      borderSubtle: '#C8E4D5',
      borderStrong: '#9DD0B5',
      textPrimary: '#0F3825',
      textSecondary: '#3F6E56',
      textMuted: '#739F87',
      accent: '#059669',
      accentHover: '#047857',
      accentLight: '#D1FAE5',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(157, 208, 181, 0.6)',
      dockActiveBg: '#059669',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#3F6E56',
      statusIndicator: '#059669'
    }
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    mode: 'light',
    description: 'Ethereal lilac and soft amethyst tones inspired by high-fashion aesthetics',
    palette: {
      bgApp: '#F8F6FD',
      bgSurface: '#FFFFFF',
      bgElevated: '#F0EBF9',
      bgInput: '#E7E0F4',
      borderSubtle: '#DDD3F0',
      borderStrong: '#C1B0E3',
      textPrimary: '#2B1A4A',
      textSecondary: '#634E8A',
      textMuted: '#9784BE',
      accent: '#7C3AED',
      accentHover: '#6D28D9',
      accentLight: '#EDE9FE',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(193, 176, 227, 0.6)',
      dockActiveBg: '#7C3AED',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#634E8A',
      statusIndicator: '#7C3AED'
    }
  },
  peach: {
    id: 'peach',
    name: 'Peach',
    mode: 'light',
    description: 'Warm apricot sunburst with cozy terracotta warmth and creative energy',
    palette: {
      bgApp: '#FDF6F0',
      bgSurface: '#FFFFFF',
      bgElevated: '#F9EBE0',
      bgInput: '#F4DFD0',
      borderSubtle: '#EED0BA',
      borderStrong: '#DFAC87',
      textPrimary: '#421C0E',
      textSecondary: '#854D35',
      textMuted: '#B7846E',
      accent: '#EA580C',
      accentHover: '#C2410C',
      accentLight: '#FFEDD5',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #EA580C 0%, #FB923C 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(223, 172, 135, 0.6)',
      dockActiveBg: '#EA580C',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#854D35',
      statusIndicator: '#EA580C'
    }
  },
  ice: {
    id: 'ice',
    name: 'Ice',
    mode: 'light',
    description: 'Ultra-clean crystalline glacier white with cool steel contrast and modern precision',
    palette: {
      bgApp: '#F5F7FA',
      bgSurface: '#FFFFFF',
      bgElevated: '#ECF0F5',
      bgInput: '#E1E7EE',
      borderSubtle: '#D4DCE6',
      borderStrong: '#B0C0D4',
      textPrimary: '#141E28',
      textSecondary: '#4A5B6D',
      textMuted: '#8295A8',
      accent: '#2563EB',
      accentHover: '#1D4ED8',
      accentLight: '#DBEAFE',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(176, 192, 212, 0.6)',
      dockActiveBg: '#2563EB',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#4A5B6D',
      statusIndicator: '#2563EB'
    }
  },
  sand: {
    id: 'sand',
    name: 'Sand',
    mode: 'light',
    description: 'Warm desert dunes and organic linen textures with golden hour serenity',
    palette: {
      bgApp: '#F8F6F1',
      bgSurface: '#FFFFFF',
      bgElevated: '#EFECE2',
      bgInput: '#E6E1D3',
      borderSubtle: '#DBD5C3',
      borderStrong: '#C4BBA3',
      textPrimary: '#2D2923',
      textSecondary: '#6E6555',
      textMuted: '#9F9583',
      accent: '#B45309',
      accentHover: '#92400E',
      accentLight: '#FEF3C7',
      accentText: '#FFFFFF',
      accentGradient: 'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)',
      dockBg: 'rgba(255, 255, 255, 0.92)',
      dockBorder: 'rgba(196, 187, 163, 0.6)',
      dockActiveBg: '#B45309',
      dockActiveText: '#FFFFFF',
      dockInactiveText: '#6E6555',
      statusIndicator: '#B45309'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark Studio',
    mode: 'dark',
    description: 'Professional cinematic OLED dark room with high-contrast neon highlights',
    palette: {
      bgApp: '#0B0D13',
      bgSurface: '#13161F',
      bgElevated: '#1C202C',
      bgInput: '#181C26',
      borderSubtle: '#262B3A',
      borderStrong: '#3B435A',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      accent: '#25F4EE',
      accentHover: '#1DE0DA',
      accentLight: 'rgba(37, 244, 238, 0.15)',
      accentText: '#000000',
      accentGradient: 'linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)',
      dockBg: 'rgba(19, 22, 31, 0.92)',
      dockBorder: 'rgba(38, 43, 58, 0.8)',
      dockActiveBg: '#25F4EE',
      dockActiveText: '#000000',
      dockInactiveText: '#94A3B8',
      statusIndicator: '#25F4EE'
    }
  },
  system: {
    id: 'system',
    name: 'System Default',
    mode: 'dark',
    description: 'Follows your operating system color scheme automatically',
    palette: {
      bgApp: '#0B0D13',
      bgSurface: '#13161F',
      bgElevated: '#1C202C',
      bgInput: '#181C26',
      borderSubtle: '#262B3A',
      borderStrong: '#3B435A',
      textPrimary: '#F8FAFC',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      accent: '#25F4EE',
      accentHover: '#1DE0DA',
      accentLight: 'rgba(37, 244, 238, 0.15)',
      accentText: '#000000',
      accentGradient: 'linear-gradient(135deg, #25F4EE 0%, #FE2C55 100%)',
      dockBg: 'rgba(19, 22, 31, 0.92)',
      dockBorder: 'rgba(38, 43, 58, 0.8)',
      dockActiveBg: '#25F4EE',
      dockActiveText: '#000000',
      dockInactiveText: '#94A3B8',
      statusIndicator: '#25F4EE'
    }
  }
};

const THEME_STORAGE_KEY = 'ai_creator_studio_theme_v2';

export class ThemeService {
  private static activeThemeId: ThemeId = 'dark';
  private static listeners: Set<(theme: AppTheme) => void> = new Set();

  public static init(): AppTheme {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && APP_THEMES[saved]) {
      this.activeThemeId = saved;
    } else {
      this.activeThemeId = 'dark';
    }
    this.applyThemeToDOM(this.getTheme());
    return this.getTheme();
  }

  public static getTheme(): AppTheme {
    return APP_THEMES[this.activeThemeId] || APP_THEMES.dark;
  }

  public static getActiveThemeId(): ThemeId {
    return this.activeThemeId;
  }

  public static setTheme(id: ThemeId) {
    if (APP_THEMES[id]) {
      this.activeThemeId = id;
      localStorage.setItem(THEME_STORAGE_KEY, id);
      const theme = this.getTheme();
      this.applyThemeToDOM(theme);
      this.listeners.forEach(fn => fn(theme));
    }
  }

  public static subscribe(listener: (theme: AppTheme) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public static applyThemeToDOM(theme: AppTheme) {
    const root = document.documentElement;
    const body = document.body;
    const p = theme.palette;

    // Apply CSS custom properties
    root.style.setProperty('--color-bg-app', p.bgApp);
    root.style.setProperty('--color-bg-surface', p.bgSurface);
    root.style.setProperty('--color-bg-elevated', p.bgElevated);
    root.style.setProperty('--color-bg-input', p.bgInput);
    root.style.setProperty('--color-border-subtle', p.borderSubtle);
    root.style.setProperty('--color-border-strong', p.borderStrong);
    root.style.setProperty('--color-text-primary', p.textPrimary);
    root.style.setProperty('--color-text-secondary', p.textSecondary);
    root.style.setProperty('--color-text-muted', p.textMuted);
    root.style.setProperty('--color-accent', p.accent);
    root.style.setProperty('--color-accent-hover', p.accentHover);
    root.style.setProperty('--color-accent-light', p.accentLight);
    root.style.setProperty('--color-accent-text', p.accentText);

    // Apply body style
    body.style.backgroundColor = p.bgApp;
    body.style.color = p.textPrimary;

    if (theme.mode === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    } else {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    }
  }
}
