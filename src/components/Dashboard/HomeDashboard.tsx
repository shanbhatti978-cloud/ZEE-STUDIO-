import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Camera,
  FolderOpen,
  Film,
  Image as ImageIcon,
  Scissors,
  Wand2,
  Eraser,
  Smile,
  FileText,
  Subtitles,
  Focus,
  Zap,
  Play,
  Pause,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  HardDrive,
  Copy,
  Trash2,
  Code,
  Music,
  Heart,
  MessageCircle,
  Share2,
  Disc,
  Check
} from 'lucide-react';
import { ZStudioLogo, ZStudioLogoCodeModal } from '../Branding/ZStudioLogo';
import { SystemIntents, SystemPermissionStatus } from '../../services/systemIntents';
import { Project } from '../../types/editor';

interface HomeDashboardProps {
  onNavigateTab: (tab: 'dashboard' | 'tools' | 'photo' | 'video' | 'export_settings') => void;
  onOpenLiveCamera: () => void;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: () => void;
  projects: Project[];
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onNavigateTab,
  onOpenLiveCamera,
  onSelectProject,
  onCreateNewProject,
  projects,
  onDuplicateProject,
  onDeleteProject,
}) => {
  const [permissions, setPermissions] = useState<SystemPermissionStatus>(SystemIntents.getPermissions());
  const [showLogoModal, setShowLogoModal] = useState(false);

  // TikTok Feed Player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(148200);
  const [activeFeedTab, setActiveFeedTab] = useState<'feed' | 'studio'>('feed');

  // Video feed sample
  const videoRef = useRef<HTMLVideoElement>(null);
  const feedVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  useEffect(() => {
    const unsub = SystemIntents.subscribe((p) => setPermissions(p));
    return unsub;
  }, []);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleToggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShareFeed = async () => {
    await SystemIntents.dispatchExportAndShareIntent({
      title: 'Z-Studio AI Media Engine',
      text: 'Next-Gen Mobile & Web AI Creator with TikTok Design Language!',
      targetPlatform: 'tiktok',
    });
  };

  const handleImportMedia = async () => {
    const files = await SystemIntents.dispatchFilePickerIntent('all', false);
    if (files.length > 0) {
      if (files[0].type === 'photo' || files[0].type === 'raw') {
        onNavigateTab('photo');
      } else {
        onNavigateTab('video');
      }
    }
  };

  return (
    <div className="flex-1 bg-[#000000] text-white overflow-y-auto select-none flex flex-col">
      {/* Feed View vs. AI Studio Sub-Bar */}
      <div className="bg-[#000000] border-b border-[#1E1E1E] px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveFeedTab('feed')}
            className={`text-xs font-extrabold tracking-wide uppercase transition-colors ${
              activeFeedTab === 'feed'
                ? 'text-white border-b-2 border-[#25F4EE] pb-0.5'
                : 'text-[#8A8B91] hover:text-white'
            }`}
          >
            For You Feed
          </button>
          <button
            onClick={() => setActiveFeedTab('studio')}
            className={`text-xs font-extrabold tracking-wide uppercase transition-colors ${
              activeFeedTab === 'studio'
                ? 'text-white border-b-2 border-[#FE2C55] pb-0.5'
                : 'text-[#8A8B91] hover:text-white'
            }`}
          >
            AI Studio Tools
          </button>
        </div>

        {/* Flutter Theme & Logo Code System Button */}
        <button
          onClick={() => setShowLogoModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] text-[10px] font-bold text-white transition-all shadow-sm"
        >
          <Code size={12} className="text-[#25F4EE]" />
          <span>Flutter Theme & 'Z' Code</span>
        </button>
      </div>

      {/* 1. TIKTOK REPLICATED FEED VIEW WITH RIGHT-SIDE FLOATING ACTION OVERLAY */}
      {activeFeedTab === 'feed' ? (
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[500px] overflow-hidden">
          {/* Main Video Frame */}
          <div
            onClick={handleTogglePlay}
            className="relative w-full max-w-sm h-full max-h-[80vh] aspect-[9/16] bg-black flex items-center justify-center cursor-pointer overflow-hidden rounded-2xl shadow-2xl border border-[#1E1E1E]"
          >
            <video
              ref={videoRef}
              src={feedVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Play/Pause Center Indicator */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center">
                  <Play size={28} className="ml-1 fill-white" />
                </div>
              </div>
            )}

            {/* Bottom Feed Metadata Overlay */}
            <div className="absolute bottom-4 left-3 right-16 z-20 space-y-1.5 text-left pointer-events-none">
              {/* Creator Handle */}
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white drop-shadow-md">
                  @zstudio.official
                </span>
                <span className="w-3.5 h-3.5 rounded-full bg-[#25F4EE] text-black text-[9px] font-black flex items-center justify-center">
                  ✓
                </span>
              </div>

              {/* Caption Description */}
              <p className="text-xs text-white/95 line-clamp-2 drop-shadow-md font-medium leading-relaxed">
                Next-Gen AI Editor with 1-click neural cutout, smart bokeh, & auto captions! ⚡️ #ZStudio #CreativeAI #TikTok
              </p>

              {/* Sound Ticker with Rotating Music Icon */}
              <div className="flex items-center gap-2 pt-0.5">
                <Music size={13} className="text-white shrink-0 animate-bounce" />
                <div className="overflow-hidden w-44">
                  <div className="animate-marquee text-[11px] font-semibold text-white/90">
                    ♫ Z-Studio Neural Sound Engine - Original Audio ♫ &nbsp;&nbsp;&nbsp; ♫ Z-Studio Neural Sound Engine - Original Audio ♫
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT-SIDE FLOATING ACTION OVERLAY (TIKTOK STYLE ACTION COLUMN) */}
            <div className="absolute right-2 bottom-4 z-20 flex flex-col items-center gap-3.5 pointer-events-auto">
              {/* Creator Avatar with Follow Red (+) */}
              <div className="relative mb-1">
                <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-[#121212] flex items-center justify-center">
                  <ZStudioLogo size={28} />
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#FE2C55] text-white flex items-center justify-center text-[11px] font-black shadow-md shadow-[#FE2C55]/50">
                  +
                </div>
              </div>

              {/* 1. Quick Background Remove Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('photo');
                }}
                title="1-Click Background Remove"
                className="group flex flex-col items-center gap-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-[#25F4EE] text-[#25F4EE] flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                  <Scissors size={18} />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow">Cutout</span>
              </button>

              {/* 2. Smart AI Enhancer Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('photo');
                }}
                title="Smart AI Enhancer"
                className="group flex flex-col items-center gap-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-[#FE2C55] text-[#FE2C55] flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                  <Wand2 size={18} />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow">Enhance</span>
              </button>

              {/* 3. Auto-Subtitles Action */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('video');
                }}
                title="Auto Subtitles"
                className="group flex flex-col items-center gap-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/40 text-white flex items-center justify-center shadow-lg group-hover:scale-110 active:scale-95 transition-all">
                  <Subtitles size={18} />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow">Captions</span>
              </button>

              {/* 4. Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLike();
                }}
                className="flex flex-col items-center gap-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform active:scale-125">
                  <Heart
                    size={20}
                    className={isLiked ? 'text-[#FE2C55] fill-[#FE2C55]' : 'text-white'}
                  />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow">
                  {(likeCount / 1000).toFixed(1)}k
                </span>
              </button>

              {/* 5. Share Intent Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleShareFeed();
                }}
                className="flex flex-col items-center gap-0.5"
              >
                <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white flex items-center justify-center active:scale-95 transition-transform">
                  <Share2 size={18} />
                </div>
                <span className="text-[9px] font-bold text-white drop-shadow">Share</span>
              </button>

              {/* Spinning Sound Record Vinyl */}
              <div className="w-10 h-10 rounded-full bg-[#121212] border-2 border-black flex items-center justify-center animate-spin-slow shadow-lg shadow-[#25F4EE]/20 mt-1">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-black" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. AI STUDIO TOOLS VIEW & RECENT PROJECTS (DARK MODE UI TOOL CARDS - Deliverable 4) */}
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full">
        {/* Quick Launch Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#121212] via-[#0d0d0d] to-[#161616] border border-[#1E1E1E] p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ZStudioLogo size={42} animated />
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>Z-Studio AI Studio Architecture</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/30 font-bold uppercase">
                  Free Client AI
                </span>
              </h2>
              <p className="text-xs text-[#8A8B91]">
                Zero-lag client-side photo & video neural models designed with TikTok aesthetics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onOpenLiveCamera}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#FE2C55] hover:bg-[#e0254b] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#FE2C55]/30 active:scale-95 transition-all"
            >
              <Camera size={15} />
              <span>Camera Studio</span>
            </button>
            <button
              onClick={handleImportMedia}
              className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#1E1E1E] hover:bg-[#282828] text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-700 active:scale-95 transition-all"
            >
              <FolderOpen size={15} />
              <span>Import File</span>
            </button>
          </div>
        </div>

        {/* PHOTO AI TOOL CARDS (DARK MODE CARDS - Deliverable 4) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#25F4EE] shadow-[0_0_8px_#25F4EE]" />
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Photo AI Feature Architecture
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('photo')}
              className="text-xs text-[#25F4EE] hover:underline font-bold flex items-center gap-1"
            >
              Open Photo AI <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Card 1: Cutout */}
            <div
              onClick={() => onNavigateTab('photo')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25F4EE]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Scissors size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Background Cutout</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  1-Click transparent background removal & dynamic backdrop swap
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#25F4EE] mt-3 uppercase tracking-wider">
                1-Click Free
              </span>
            </div>

            {/* Card 2: Smart Enhancer */}
            <div
              onClick={() => onNavigateTab('photo')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#FE2C55] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FE2C55]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Wand2 size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Smart AI Enhancer</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Color boost, 4K micro-sharpness & low-light noise reduction
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FE2C55] mt-3 uppercase tracking-wider">
                Neural Filter
              </span>
            </div>

            {/* Card 3: Magic Eraser */}
            <div
              onClick={() => onNavigateTab('photo')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25F4EE]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Eraser size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Magic Eraser</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Inpaint & remove unwanted photobombers and objects
                </p>
              </div>
              <span className="text-[9px] font-bold text-white mt-3 uppercase tracking-wider">
                Brush Inpainting
              </span>
            </div>

            {/* Card 4: Portrait Touchup */}
            <div
              onClick={() => onNavigateTab('photo')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#FE2C55] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FE2C55]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Smile size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Portrait Lighting</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Natural skin smoothing & directional 3D virtual spotlight
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FE2C55] mt-3 uppercase tracking-wider">
                Studio Light
              </span>
            </div>

            {/* Card 5: Document OCR */}
            <div
              onClick={() => onNavigateTab('photo')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25F4EE]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <FileText size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Document OCR</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Extract selectable text directly from high-res photo capture
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#25F4EE] mt-3 uppercase tracking-wider">
                Text Scanner
              </span>
            </div>
          </div>
        </div>

        {/* VIDEO AI TOOL CARDS (DARK MODE CARDS - Deliverable 4) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FE2C55] shadow-[0_0_8px_#FE2C55]" />
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Video AI Feature Architecture
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('video')}
              className="text-xs text-[#FE2C55] hover:underline font-bold flex items-center gap-1"
            >
              Open Video AI <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Card 1: Auto Subtitles */}
            <div
              onClick={() => onNavigateTab('video')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#FE2C55] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FE2C55]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Subtitles size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Auto Subtitles</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Speech-to-text frame captioning with timestamp alignment
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FE2C55] mt-3 uppercase tracking-wider">
                Speech-to-Text
              </span>
            </div>

            {/* Card 2: Neural Bokeh */}
            <div
              onClick={() => onNavigateTab('video')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25F4EE]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Focus size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">AI Bokeh Blur</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Real-time depth-of-field effect on subjects with aperture control
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#25F4EE] mt-3 uppercase tracking-wider">
                Depth of Field
              </span>
            </div>

            {/* Card 3: Frame Extractor */}
            <div
              onClick={() => onNavigateTab('video')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-white cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white border border-white/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Camera size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Frame Extractor</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  AI-guided best-frame selection & motion freeze frame
                </p>
              </div>
              <span className="text-[9px] font-bold text-white mt-3 uppercase tracking-wider">
                Best Moments
              </span>
            </div>

            {/* Card 4: AI Style Transfer */}
            <div
              onClick={() => onNavigateTab('video')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#25F4EE]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#25F4EE]/10 text-[#25F4EE] border border-[#25F4EE]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Film size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">AI Style LUTs</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Cinematic color lookups: Cyberpunk, 35mm Vintage, Matrix & Noir
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#25F4EE] mt-3 uppercase tracking-wider">
                Color Grading
              </span>
            </div>

            {/* Card 5: Audio Denoise */}
            <div
              onClick={() => onNavigateTab('video')}
              className="group p-4 rounded-2xl bg-[#121212] border border-[#1E1E1E] hover:border-[#FE2C55] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#FE2C55]/10 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/20 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                  <Zap size={18} />
                </div>
                <h4 className="text-xs font-bold text-white mb-1">Noise Reduction</h4>
                <p className="text-[10px] text-[#8A8B91] leading-relaxed">
                  Audio clearing noise gate & video temporal grain removal
                </p>
              </div>
              <span className="text-[9px] font-bold text-[#FE2C55] mt-3 uppercase tracking-wider">
                Clean Signal
              </span>
            </div>
          </div>
        </div>

        {/* 3. RECENT PROJECTS CAROUSEL (TIKTOK STYLE 9:16 VERTICAL CARDS) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-[#25F4EE]" />
              <h3 className="text-sm font-extrabold text-white tracking-wide uppercase">
                Recent Drafts & Projects ({projects.length})
              </h3>
            </div>
            <button
              onClick={onCreateNewProject}
              className="px-3 py-1.5 rounded-xl bg-[#FE2C55] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-[#FE2C55]/30 active:scale-95 transition-all"
            >
              <Plus size={14} /> New Draft
            </button>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-none">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group relative w-48 shrink-0 rounded-2xl overflow-hidden bg-[#121212] border border-[#1E1E1E] hover:border-[#25F4EE] transition-all duration-200 shadow-xl flex flex-col"
              >
                {/* 9:16 Vertical Thumbnail Card */}
                <div
                  onClick={() => onSelectProject(proj)}
                  className="relative h-60 bg-black flex items-center justify-center cursor-pointer overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />
                  <ZStudioLogo size={36} className="opacity-30 group-hover:opacity-75 transition-opacity" />

                  {/* Aspect Ratio Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] font-bold text-[#25F4EE] border border-[#25F4EE]/40">
                    {proj.aspectRatio}
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-[9px] font-mono text-white">
                    {proj.duration.toFixed(1)}s
                  </div>

                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                      <Play size={20} className="ml-1 fill-black" />
                    </div>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-3 bg-[#121212] flex flex-col justify-between flex-1">
                  <div
                    onClick={() => onSelectProject(proj)}
                    className="cursor-pointer"
                  >
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-[#25F4EE] transition-colors">
                      {proj.name}
                    </h4>
                    <p className="text-[10px] text-[#8A8B91] mt-0.5">
                      {new Date(proj.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1E1E1E]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onDuplicateProject(proj.id)}
                        title="Duplicate"
                        className="p-1 rounded text-[#8A8B91] hover:text-white hover:bg-black transition-colors"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj.id)}
                        title="Delete"
                        className="p-1 rounded text-[#8A8B91] hover:text-[#FE2C55] hover:bg-black transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectProject(proj)}
                      className="text-[10px] font-bold text-white group-hover:text-[#25F4EE] flex items-center gap-1"
                    >
                      Edit <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flutter Theme Code & SVG/Canvas Modal (Deliverables 1 & 3) */}
      <ZStudioLogoCodeModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
      />
    </div>
  );
};
