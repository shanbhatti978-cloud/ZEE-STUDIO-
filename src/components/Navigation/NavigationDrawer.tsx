import React from 'react';
import {
  X,
  Image,
  Film,
  LayoutTemplate,
  Sparkles,
  Clock,
  Heart,
  DownloadCloud,
  FileVideo,
  Link,
  ShieldCheck,
  UserCheck,
  FolderArchive,
  Wand2,
  Scissors,
  Layers,
  Palette,
  Camera,
  Music,
  Volume2,
  Type,
  Sticker,
  Eye,
  Sliders,
  Database,
  Cpu,
  Lock,
  Archive,
  Info,
  ChevronRight
} from 'lucide-react';
import { AppTheme } from '../../types/theme';

export type DrawerAction =
  // Home
  | 'nav_photo'
  | 'nav_video'
  | 'nav_templates'
  | 'nav_ai_tools'
  // Projects
  | 'proj_recent'
  | 'proj_photo'
  | 'proj_video'
  | 'proj_saved_templates'
  | 'proj_favorites'
  | 'proj_imported'
  // Template Tools
  | 'tmpl_import'
  | 'tmpl_analyze_video'
  | 'tmpl_analyze_link'
  | 'tmpl_duplicate_detect'
  | 'tmpl_profile'
  | 'tmpl_assets'
  // AI Tools
  | 'ai_enhance'
  | 'ai_restore'
  | 'ai_bg_remove'
  | 'ai_bg_replace'
  | 'ai_image_gen'
  | 'ai_photoshoot'
  | 'ai_img_to_img'
  | 'ai_style_match'
  | 'ai_inpaint_outpaint'
  | 'ai_upscale'
  | 'ai_face_enhance'
  | 'ai_photo_to_video'
  | 'ai_video_tools'
  | 'ai_history'
  | 'ai_usage'
  // Library
  | 'lib_media'
  | 'lib_gen_images'
  | 'lib_gen_videos'
  | 'lib_fonts'
  | 'lib_music'
  | 'lib_sounds'
  | 'lib_effects'
  | 'lib_stickers'
  | 'lib_overlays'
  // Settings
  | 'set_appearance'
  | 'set_storage'
  | 'set_ai_providers'
  | 'set_export'
  | 'set_privacy'
  | 'set_backup'
  | 'set_about';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: DrawerAction) => void;
  theme: AppTheme;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onAction,
  theme
}) => {
  if (!isOpen) return null;
  const p = theme.palette;

  const sections = [
    {
      title: 'HOME',
      items: [
        { id: 'nav_photo' as DrawerAction, label: 'Photo Edit', icon: Image },
        { id: 'nav_video' as DrawerAction, label: 'Video Edit', icon: Film },
        { id: 'nav_templates' as DrawerAction, label: 'Templates', icon: LayoutTemplate },
        { id: 'nav_ai_tools' as DrawerAction, label: 'AI Tools', icon: Sparkles }
      ]
    },
    {
      title: 'PROJECTS',
      items: [
        { id: 'proj_recent' as DrawerAction, label: 'Recent Projects', icon: Clock },
        { id: 'proj_photo' as DrawerAction, label: 'Photo Projects', icon: Image },
        { id: 'proj_video' as DrawerAction, label: 'Video Projects', icon: Film },
        { id: 'proj_saved_templates' as DrawerAction, label: 'Saved Templates', icon: LayoutTemplate },
        { id: 'proj_favorites' as DrawerAction, label: 'Favorite Templates', icon: Heart },
        { id: 'proj_imported' as DrawerAction, label: 'Imported Templates', icon: DownloadCloud }
      ]
    },
    {
      title: 'TEMPLATE TOOLS',
      items: [
        { id: 'tmpl_import' as DrawerAction, label: 'Import Template', icon: DownloadCloud },
        { id: 'tmpl_analyze_video' as DrawerAction, label: 'Analyze Video', icon: FileVideo },
        { id: 'tmpl_analyze_link' as DrawerAction, label: 'Analyze Link', icon: Link },
        { id: 'tmpl_duplicate_detect' as DrawerAction, label: 'Duplicate Detection', icon: ShieldCheck },
        { id: 'tmpl_profile' as DrawerAction, label: 'Template Profile', icon: UserCheck },
        { id: 'tmpl_assets' as DrawerAction, label: 'Template Assets', icon: FolderArchive }
      ]
    },
    {
      title: 'AI STUDIO & CLOUD ENGINES',
      items: [
        { id: 'ai_image_gen' as DrawerAction, label: 'AI Photo Generator (Gemini/Nano Banana)', icon: Palette },
        { id: 'ai_photoshoot' as DrawerAction, label: 'Virtual Photoshoot (Identity Preserved)', icon: Camera },
        { id: 'ai_img_to_img' as DrawerAction, label: 'AI Multi-Modal Photo Edit', icon: Wand2 },
        { id: 'ai_style_match' as DrawerAction, label: 'Style Match & Aesthetic Transfer', icon: Sparkles },
        { id: 'ai_inpaint_outpaint' as DrawerAction, label: 'Inpainting & Outpainting (Fill & Expand)', icon: Layers },
        { id: 'ai_upscale' as DrawerAction, label: 'AI 4K Super-Resolution Upscaler', icon: Eye },
        { id: 'ai_bg_remove' as DrawerAction, label: 'Background Cutout & Matting', icon: Scissors },
        { id: 'ai_bg_replace' as DrawerAction, label: 'Background Replacement', icon: Layers },
        { id: 'ai_enhance' as DrawerAction, label: 'Neural Portrait & Skin Retouch', icon: Wand2 },
        { id: 'ai_photo_to_video' as DrawerAction, label: 'Photo-to-Video Motion', icon: Film },
        { id: 'ai_history' as DrawerAction, label: 'AI Generation History', icon: Clock },
        { id: 'ai_usage' as DrawerAction, label: 'AI Usage & Cost Manager', icon: Sliders }
      ]
    },
    {
      title: 'LIBRARY',
      items: [
        { id: 'lib_media' as DrawerAction, label: 'Local Media', icon: FolderArchive },
        { id: 'lib_gen_images' as DrawerAction, label: 'Generated Images', icon: Image },
        { id: 'lib_gen_videos' as DrawerAction, label: 'Generated Videos', icon: Film },
        { id: 'lib_fonts' as DrawerAction, label: 'Fonts (English, Urdu, Arabic)', icon: Type },
        { id: 'lib_music' as DrawerAction, label: 'Music Library', icon: Music },
        { id: 'lib_sounds' as DrawerAction, label: 'Sound Effects', icon: Volume2 },
        { id: 'lib_effects' as DrawerAction, label: 'Video Effects', icon: Eye },
        { id: 'lib_stickers' as DrawerAction, label: 'Stickers & Badges', icon: Sticker },
        { id: 'lib_overlays' as DrawerAction, label: 'Cinematic Overlays', icon: Layers }
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { id: 'set_appearance' as DrawerAction, label: 'Appearance (7 Themes)', icon: Sliders },
        { id: 'set_storage' as DrawerAction, label: 'Storage & Cache', icon: Database },
        { id: 'set_ai_providers' as DrawerAction, label: 'AI Providers', icon: Cpu },
        { id: 'set_export' as DrawerAction, label: 'Export Preferences', icon: DownloadCloud },
        { id: 'set_privacy' as DrawerAction, label: 'Privacy & Security', icon: Lock },
        { id: 'set_backup' as DrawerAction, label: 'Backup & Restore', icon: Archive },
        { id: 'set_about' as DrawerAction, label: 'About AI Creator Studio', icon: Info }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <aside
        className="relative w-80 max-w-[85vw] h-full flex flex-col shadow-2xl z-10 transition-transform select-none"
        style={{
          backgroundColor: p.bgSurface,
          borderRight: `1px solid ${p.borderSubtle}`
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <div>
            <h2 className="text-base font-extrabold tracking-wide" style={{ color: p.textPrimary }}>
              AI CREATOR STUDIO
            </h2>
            <p className="text-xs" style={{ color: p.textSecondary }}>
              Professional Creator Workspace
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:opacity-80 active:scale-95"
            style={{ color: p.textSecondary }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {sections.map((sec) => (
            <div key={sec.title}>
              <div
                className="text-[10px] font-bold tracking-wider px-2 py-1 uppercase"
                style={{ color: p.textMuted }}
              >
                {sec.title}
              </div>
              <div className="mt-1 space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onAction(item.id);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
                      style={{
                        color: p.textPrimary,
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = p.bgElevated)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} style={{ color: p.accent }} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} style={{ color: p.textMuted }} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="p-3 border-t text-[11px] flex items-center justify-between shrink-0"
          style={{
            borderColor: p.borderSubtle,
            backgroundColor: p.bgElevated,
            color: p.textSecondary
          }}
        >
          <span>Theme: {theme.name}</span>
          <span className="font-mono">v2.5 Local-First</span>
        </div>
      </aside>
    </div>
  );
};
