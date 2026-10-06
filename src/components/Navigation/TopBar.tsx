import React, { useState } from 'react';
import {
  Undo2,
  Redo2,
  Share2,
  ChevronDown,
  ArrowLeft,
  History,
  Plus,
  Trash2,
  Settings,
  Camera,
  HardDrive
} from 'lucide-react';
import { Project, AspectRatio } from '../../types/editor';
import { ZStudioLogo } from '../Branding/ZStudioLogo';

interface TopBarProps {
  project: Project;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExportClick: () => void;
  onProClick: () => void;
  isPro: boolean;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onRenameProject: (name: string) => void;
  onBackToProjects: () => void;
  projectVersions: (Project & { versionName: string })[];
  onSaveVersionSnapshot: (name?: string) => void;
  onRestoreSnapshot: (snapshotId: string) => void;
  onDeleteSnapshot: (snapshotId: string) => void;
  networkStatus: string;
  onSettingsClick: () => void;
  onStorageClick?: () => void;
  activeMode?: 'photo' | 'video';
  onModeChange?: (mode: 'photo' | 'video') => void;
  onOpenLiveCamera?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  project,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExportClick,
  onProClick,
  isPro,
  onAspectRatioChange,
  onRenameProject,
  onBackToProjects,
  projectVersions,
  onSaveVersionSnapshot,
  onRestoreSnapshot,
  onDeleteSnapshot,
  networkStatus,
  onSettingsClick,
  onStorageClick,
  activeMode = 'video',
  onModeChange,
  onOpenLiveCamera,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(project.name);
  const [showRatioMenu, setShowRatioMenu] = useState(false);
  const [showVersionsMenu, setShowVersionsMenu] = useState(false);
  const [snapshotNameInput, setSnapshotNameInput] = useState('');

  const ratios: { label: string; ratio: AspectRatio; desc: string }[] = [
    { label: '9:16', ratio: '9:16', desc: 'TikTok / Reels / Shorts' },
    { label: '1:1', ratio: '1:1', desc: 'Square Post' },
    { label: '4:5', ratio: '4:5', desc: 'Instagram Portrait' },
    { label: '16:9', ratio: '16:9', desc: 'YouTube Landscape' },
    { label: '3:4', ratio: '3:4', desc: 'Standard Feed' },
  ];

  const handleNameSubmit = () => {
    setIsEditingName(false);
    if (nameInput.trim()) {
      onRenameProject(nameInput.trim());
    }
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveVersionSnapshot(snapshotNameInput.trim() || undefined);
    setSnapshotNameInput('');
  };

  return (
    <header className="h-13 bg-[#000000] border-b border-[#1E1E1E] px-3 flex items-center justify-between shrink-0 select-none z-30 relative">
      {/* ZONE 1: BRAND LOGO & BACK BUTTON */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBackToProjects}
          title="Back to Home Feed"
          className="p-1.5 text-[#8A8B91] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div
          onClick={onBackToProjects}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <ZStudioLogo size={26} animated />
          <span className="font-black text-sm tracking-tight text-white font-mono hidden sm:inline">
            ZEE<span className="text-sky-400"> STUDIO</span>
          </span>
        </div>

        {/* Project Name & Aspect Ratio Picker */}
        <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-2 border-l border-[#1E1E1E]">
          {isEditingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
              className="bg-[#121212] border border-[#25F4EE] text-xs px-2 py-0.5 rounded text-white outline-none w-24 text-center"
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xs font-semibold text-[#8A8B91] hover:text-white truncate max-w-[90px] px-1 py-0.5 rounded hover:bg-[#1E1E1E]"
              title="Click to rename"
            >
              {project.name}
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowRatioMenu(!showRatioMenu)}
              className="flex items-center gap-1 text-[10px] font-bold bg-[#121212] text-white px-1.5 py-0.5 rounded border border-[#1E1E1E]"
            >
              <span>{project.aspectRatio}</span>
              <ChevronDown size={10} />
            </button>

            {showRatioMenu && (
              <div className="absolute top-full mt-1 left-0 bg-[#121212] border border-[#1E1E1E] rounded-xl shadow-2xl py-1 w-40 z-50">
                {ratios.map((item) => (
                  <button
                    key={item.ratio}
                    onClick={() => {
                      onAspectRatioChange(item.ratio);
                      setShowRatioMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 text-xs flex items-center justify-between hover:bg-[#1E1E1E] ${
                      project.aspectRatio === item.ratio ? 'text-[#25F4EE] font-bold' : 'text-[#8A8B91]'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-[9px] text-[#8A8B91]">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ZONE 2: TIKTOK "FOLLOWING / FOR YOU" STYLE MODE SWITCHER (Photo AI | Video AI) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-5 pointer-events-auto">
        {/* Photo AI Mode */}
        <button
          onClick={() => onModeChange && onModeChange('photo')}
          className={`flex flex-col items-center justify-center relative py-1 text-sm font-extrabold tracking-wide transition-all ${
            activeMode === 'photo'
              ? 'text-white scale-105'
              : 'text-[#8A8B91] hover:text-white opacity-70'
          }`}
        >
          <span>Photo AI</span>
          {activeMode === 'photo' && (
            <span className="absolute -bottom-1 w-6 h-0.75 bg-white rounded-full shadow-[0_0_8px_#25F4EE]" />
          )}
        </button>

        <span className="text-[#8A8B91] opacity-30 text-xs">|</span>

        {/* Video AI Mode */}
        <button
          onClick={() => onModeChange && onModeChange('video')}
          className={`flex flex-col items-center justify-center relative py-1 text-sm font-extrabold tracking-wide transition-all ${
            activeMode === 'video'
              ? 'text-white scale-105'
              : 'text-[#8A8B91] hover:text-white opacity-70'
          }`}
        >
          <span>Video AI</span>
          {activeMode === 'video' && (
            <span className="absolute -bottom-1 w-6 h-0.75 bg-white rounded-full shadow-[0_0_8px_#FE2C55]" />
          )}
        </button>
      </div>

      {/* ZONE 3: ACTIONS & EXPORT */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Camera Intent Quick Trigger */}
        {onOpenLiveCamera && (
          <button
            onClick={onOpenLiveCamera}
            title="Open Camera Studio"
            className="p-1.5 text-white hover:text-[#25F4EE] rounded-lg hover:bg-[#1E1E1E] transition-colors"
          >
            <Camera size={18} />
          </button>
        )}

        {/* Undo/Redo (Timeline Mode) */}
        <div className="hidden sm:flex items-center gap-0.5 bg-[#121212] p-0.5 rounded-lg border border-[#1E1E1E]">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
            className={`p-1 rounded ${
              canUndo ? 'text-white hover:bg-[#1E1E1E]' : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
            className={`p-1 rounded ${
              canRedo ? 'text-white hover:bg-[#1E1E1E]' : 'text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Storage Manager Button */}
        {onStorageClick && (
          <button
            onClick={onStorageClick}
            title="Storage & Asset Manager"
            className="p-1.5 text-[#8A8B91] hover:text-[#25F4EE] rounded-lg hover:bg-[#1E1E1E] transition-colors"
          >
            <HardDrive size={16} />
          </button>
        )}

        {/* Snapshots / Versions */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowVersionsMenu(!showVersionsMenu)}
            className="p-1.5 text-[#8A8B91] hover:text-white rounded-lg hover:bg-[#1E1E1E] transition-colors"
            title="Project Checkpoints"
          >
            <History size={16} />
          </button>

          {showVersionsMenu && (
            <div className="absolute top-full right-0 mt-1.5 bg-[#121212] border border-[#1E1E1E] rounded-xl shadow-2xl p-3 w-60 z-50">
              <span className="text-[10px] font-extrabold text-[#8A8B91] uppercase tracking-widest block mb-2">
                Checkpoints ({projectVersions.length})
              </span>
              <form onSubmit={handleCreateSnapshot} className="flex items-center gap-1.5 mb-2 border-b border-[#1E1E1E] pb-2">
                <input
                  type="text"
                  value={snapshotNameInput}
                  onChange={(e) => setSnapshotNameInput(e.target.value)}
                  placeholder="Snapshot name..."
                  className="flex-1 bg-black border border-[#1E1E1E] rounded-lg px-2 py-1 text-[11px] text-white outline-none focus:border-[#25F4EE]"
                />
                <button
                  type="submit"
                  className="p-1 bg-[#25F4EE] text-black rounded-lg font-bold"
                >
                  <Plus size={13} />
                </button>
              </form>

              <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                {projectVersions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-1.5 rounded-lg bg-black text-[10px]">
                    <button
                      onClick={() => {
                        onRestoreSnapshot(v.id);
                        setShowVersionsMenu(false);
                      }}
                      className="text-left truncate flex-1 text-white hover:text-[#25F4EE]"
                    >
                      {v.versionName}
                    </button>
                    <button
                      onClick={() => onDeleteSnapshot(v.id)}
                      className="text-zinc-500 hover:text-[#FE2C55] p-0.5 ml-1"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Network Status Pill */}
        <div
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
            networkStatus === 'ONLINE'
              ? 'bg-[#25F4EE]/10 text-[#25F4EE] border-[#25F4EE]/30'
              : 'bg-[#FE2C55]/10 text-[#FE2C55] border-[#FE2C55]/30'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              networkStatus === 'ONLINE' ? 'bg-[#25F4EE]' : 'bg-[#FE2C55]'
            }`}
          />
          <span className="hidden sm:inline">{networkStatus}</span>
        </div>

        {/* Export Action */}
        <button
          onClick={onExportClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#FE2C55] hover:bg-[#e0254b] text-white text-xs font-bold shadow-lg shadow-[#FE2C55]/30 active:scale-95 transition-all"
        >
          <Share2 size={13} />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
