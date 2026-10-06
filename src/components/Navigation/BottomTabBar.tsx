import React, { useState } from 'react';
import {
  Home,
  Sparkles,
  Plus,
  FolderGit2,
  User,
  Camera,
  FolderOpen,
  Film,
  X
} from 'lucide-react';

export type MainTab =
  | 'dashboard'
  | 'tools'
  | 'photo'
  | 'video'
  | 'export_settings'
  | 'editor'
  | 'capcut'
  | 'templates'
  | 'projects'
  | 'assets'
  | 'pro';

interface BottomTabBarProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onOpenLiveCamera?: () => void;
  onImportMedia?: () => void;
}

/**
 * Deliverable 2: Custom Bottom Navigation Bar with the signature TikTok center (+) button design
 * 5-Tab TikTok Replicated Navigation:
 * 1. Home (Feed view with floating action icons)
 * 2. Tools / AI Studio (Grid view of all AI tools)
 * 3. Center (+) Action Button (Quick Upload / Camera Launch with Cyan/Red Neon Ring)
 * 4. Projects (Recent drafts and exported videos/photos)
 * 5. Profile / Settings
 */
export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  onOpenLiveCamera,
  onImportMedia,
}) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const tabs = [
    {
      id: 'dashboard' as MainTab,
      label: 'Home',
      icon: Home,
      isActive: activeTab === 'dashboard',
    },
    {
      id: 'tools' as MainTab,
      label: 'AI Studio',
      icon: Sparkles,
      isActive: activeTab === 'tools' || activeTab === 'photo',
    },
    // Center is handled separately with signature TikTok button
    {
      id: 'projects' as MainTab,
      label: 'Projects',
      icon: FolderGit2,
      isActive: activeTab === 'projects' || activeTab === 'editor' || activeTab === 'video',
    },
    {
      id: 'export_settings' as MainTab,
      label: 'Profile',
      icon: User,
      isActive: activeTab === 'export_settings',
    },
  ];

  return (
    <>
      {/* Quick Action Sheet triggered by Center (+) Button */}
      {showPlusMenu && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-fadeIn">
          <div
            className="flex-1"
            onClick={() => setShowPlusMenu(false)}
          />
          <div className="bg-[#121212] border-t border-[#1E1E1E] rounded-t-3xl p-5 pb-8 space-y-4 max-w-lg mx-auto w-full shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#25F4EE] shadow-[0_0_8px_#25F4EE]" />
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Quick Create & Hardware Intents
                </h3>
              </div>
              <button
                onClick={() => setShowPlusMenu(false)}
                className="p-1 rounded-full text-[#8A8B91] hover:text-white hover:bg-[#1E1E1E]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* 1. Camera Studio Intent */}
              <button
                onClick={() => {
                  setShowPlusMenu(false);
                  if (onOpenLiveCamera) onOpenLiveCamera();
                }}
                className="p-3.5 rounded-2xl bg-black border border-[#1E1E1E] hover:border-[#25F4EE] flex flex-col items-center justify-center gap-1.5 text-center group transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(37,244,238,0.25)]">
                  <Camera size={20} />
                </div>
                <span className="text-xs font-bold text-white">Camera Studio</span>
                <span className="text-[9px] text-[#8A8B91]">Photo & HD Video</span>
              </button>

              {/* 2. Upload / File Picker Intent */}
              <button
                onClick={() => {
                  setShowPlusMenu(false);
                  if (onImportMedia) onImportMedia();
                }}
                className="p-3.5 rounded-2xl bg-black border border-[#1E1E1E] hover:border-[#FE2C55] flex flex-col items-center justify-center gap-1.5 text-center group transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(254,44,85,0.25)]">
                  <FolderOpen size={20} />
                </div>
                <span className="text-xs font-bold text-white">Import File</span>
                <span className="text-[9px] text-[#8A8B91]">4K, RAW & Audio</span>
              </button>

              {/* 3. New Video Timeline Project */}
              <button
                onClick={() => {
                  setShowPlusMenu(false);
                  onTabChange('editor');
                }}
                className="p-3.5 rounded-2xl bg-black border border-[#1E1E1E] hover:border-white flex flex-col items-center justify-center gap-1.5 text-center group transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-white/10 text-white border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Film size={20} />
                </div>
                <span className="text-xs font-bold text-white">Timeline Editor</span>
                <span className="text-[9px] text-[#8A8B91]">Multi-Track Dark</span>
              </button>

              {/* 4. CapCut Studio Mode */}
              <button
                onClick={() => {
                  setShowPlusMenu(false);
                  onTabChange('capcut');
                }}
                className="p-3.5 rounded-2xl bg-black border border-[#1E1E1E] hover:border-blue-400 flex flex-col items-center justify-center gap-1.5 text-center group transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <span className="text-xs font-bold text-white">CapCut Studio</span>
                <span className="text-[9px] text-[#8A8B91]">Light Theme & Flutter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature 5-Tab TikTok Bottom Navigation Bar */}
      <nav className="h-13 bg-[#000000] border-t border-[#1E1E1E] px-3 flex items-center justify-between shrink-0 z-30 select-none">
        {/* Tab 1: Home */}
        <button
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active:scale-95 ${
            tabs[0].isActive ? 'text-white font-bold' : 'text-[#8A8B91] hover:text-white'
          }`}
        >
          <Home size={20} className={tabs[0].isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </button>

        {/* Tab 2: AI Studio / Tools */}
        <button
          onClick={() => onTabChange('tools')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active:scale-95 ${
            tabs[1].isActive ? 'text-white font-bold' : 'text-[#8A8B91] hover:text-white'
          }`}
        >
          <Sparkles size={20} className={tabs[1].isActive ? 'stroke-[2.5] text-[#25F4EE]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">AI Studio</span>
        </button>

        {/* Tab 3: SIGNATURE TIKTOK CENTER (+) ACTION BUTTON */}
        <div className="flex items-center justify-center px-2">
          <button
            onClick={() => setShowPlusMenu(true)}
            title="Create / Capture Media"
            className="group relative flex items-center justify-center w-11 h-7.5 transition-transform duration-150 active:scale-90"
          >
            {/* Left Cyan Accent Pill */}
            <div className="absolute left-0 w-8 h-7.5 bg-[#25F4EE] rounded-lg shadow-[0_0_8px_rgba(37,244,238,0.6)]" />

            {/* Right Red Accent Pill */}
            <div className="absolute right-0 w-8 h-7.5 bg-[#FE2C55] rounded-lg shadow-[0_0_8px_rgba(254,44,85,0.6)]" />

            {/* Center Pure White Foreplate with Black Plus */}
            <div className="relative z-10 w-9 h-7 bg-white rounded-md flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={18} className="text-black stroke-[3.2]" />
            </div>
          </button>
        </div>

        {/* Tab 4: Projects (Drafts & Timeline) */}
        <button
          onClick={() => onTabChange('projects')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active:scale-95 ${
            tabs[2].isActive ? 'text-white font-bold' : 'text-[#8A8B91] hover:text-white'
          }`}
        >
          <FolderGit2 size={20} className={tabs[2].isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Projects</span>
        </button>

        {/* Tab 5: Profile & Settings */}
        <button
          onClick={() => onTabChange('export_settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors active:scale-95 ${
            tabs[3].isActive ? 'text-white font-bold' : 'text-[#8A8B91] hover:text-white'
          }`}
        >
          <User size={20} className={tabs[3].isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
          <span className="text-[10px] tracking-tight mt-0.5">Profile</span>
        </button>
      </nav>
    </>
  );
};
