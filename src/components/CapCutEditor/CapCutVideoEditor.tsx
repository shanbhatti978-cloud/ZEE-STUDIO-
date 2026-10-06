import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Gauge,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Palette,
  Type,
  Music,
  Maximize2,
  Trash2,
  Plus,
  FolderOpen,
  ChevronDown,
  Check,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Code,
  Smartphone,
  Layers,
  X,
  Sparkle
} from 'lucide-react';
import { CapCutColors } from './CapCutThemeData';
import { FlutterCodeViewerModal } from './FlutterCodeViewerModal';

// Sample clip data for out-of-the-box instant editing
interface TimelineClip {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text';
  start: number; // in seconds
  duration: number; // in seconds
  url?: string;
  volume?: number;
  speed?: number;
  filter?: string;
  brightness?: number;
  contrast?: number;
  saturation?: number;
  text?: string;
}

const DEFAULT_SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
const SECONDARY_SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const CapCutVideoEditor: React.FC = () => {
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(15.0);
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0); // 1.0 = standard
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1' | '4:5'>('9:16');

  // Resolution & FPS state
  const [resolution, setResolution] = useState<string>('1080P');
  const [fps, setFps] = useState<number>(60);
  const [showResolutionMenu, setShowResolutionMenu] = useState<boolean>(false);

  // Active Tool & Drawer State
  const [activeTool, setActiveTool] = useState<string>('split');
  const [activeDrawer, setActiveDrawer] = useState<string | null>(null);

  // Selected Clip state
  const [selectedClipId, setSelectedClipId] = useState<string>('video-1');

  // Modals state
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  // Undo / Redo history
  const [historyStack, setHistoryStack] = useState<TimelineClip[][]>([]);
  const [redoStack, setRedoStack] = useState<TimelineClip[][]>([]);

  // Timeline Clips (Multi-track)
  const [videoClips, setVideoClips] = useState<TimelineClip[]>([
    {
      id: 'video-1',
      name: 'Main Clip 01.mp4',
      type: 'video',
      start: 0,
      duration: 8.5,
      url: DEFAULT_SAMPLE_VIDEO,
      speed: 1.0,
      volume: 100,
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
    },
    {
      id: 'video-2',
      name: 'B-Roll Drone.mp4',
      type: 'video',
      start: 8.5,
      duration: 6.5,
      url: SECONDARY_SAMPLE_VIDEO,
      speed: 1.0,
      volume: 100,
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
    },
  ]);

  const [audioClips, setAudioClips] = useState<TimelineClip[]>([
    {
      id: 'audio-1',
      name: 'Cinematic BGM (128 BPM)',
      type: 'audio',
      start: 0,
      duration: 15.0,
      volume: 85,
    },
  ]);

  const [textOverlays, setTextOverlays] = useState<TimelineClip[]>([
    {
      id: 'text-1',
      name: 'Title Text',
      type: 'text',
      start: 1.0,
      duration: 4.0,
      text: 'CapCut Video Studio',
    },
  ]);

  // Total project duration is max of video clips
  const projectDuration = Math.max(
    ...videoClips.map((c) => c.start + c.duration),
    15.0
  );

  // Sync video element time
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 15.0);
    }
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    const clamped = Math.max(0, Math.min(newTime, projectDuration));
    setCurrentTime(clamped);
    if (videoRef.current) {
      videoRef.current.currentTime = clamped;
    }
  };

  // Helper: Format timecode mm:ss.s
  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')}`;
  };

  // Push history snapshot before mutating
  const pushHistory = () => {
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(videoClips))]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (historyStack.length === 0) return;
    const last = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, JSON.parse(JSON.stringify(videoClips))]);
    setHistoryStack((prev) => prev.slice(0, -1));
    setVideoClips(last);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, JSON.parse(JSON.stringify(videoClips))]);
    setRedoStack((prev) => prev.slice(0, -1));
    setVideoClips(next);
  };

  // 1. Tool Actions
  const handleToolClick = (toolId: string) => {
    setActiveTool(toolId);

    if (toolId === 'split') {
      handleSplitClip();
    } else if (toolId === 'delete') {
      handleDeleteClip();
    } else if (['speed', 'volume', 'filters', 'adjust', 'text', 'canvas', 'animation'].includes(toolId)) {
      setActiveDrawer((prev) => (prev === toolId ? null : toolId));
    }
  };

  // Split selected clip at playhead position
  const handleSplitClip = () => {
    const targetIndex = videoClips.findIndex(
      (c) => currentTime > c.start && currentTime < c.start + c.duration
    );
    if (targetIndex === -1) return;

    pushHistory();
    const clip = videoClips[targetIndex];
    const firstDuration = currentTime - clip.start;
    const secondDuration = clip.duration - firstDuration;

    const clip1: TimelineClip = {
      ...clip,
      duration: firstDuration,
    };
    const clip2: TimelineClip = {
      ...clip,
      id: `video-${Date.now()}`,
      name: `${clip.name} (Part 2)`,
      start: currentTime,
      duration: secondDuration,
    };

    const newClips = [...videoClips];
    newClips.splice(targetIndex, 1, clip1, clip2);
    setVideoClips(newClips);
    setSelectedClipId(clip2.id);
  };

  // Delete selected clip
  const handleDeleteClip = () => {
    if (videoClips.length <= 1) return; // Keep at least one clip
    pushHistory();
    const remaining = videoClips.filter((c) => c.id !== selectedClipId);
    setVideoClips(remaining);
    setSelectedClipId(remaining[0]?.id || '');
  };

  // Import local video file
  const handleImportLocalVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    pushHistory();
    const newClip: TimelineClip = {
      id: `video-${Date.now()}`,
      name: file.name,
      type: 'video',
      start: projectDuration,
      duration: 10.0,
      url: localUrl,
      speed: 1.0,
      volume: 100,
      filter: 'none',
      brightness: 100,
      contrast: 100,
      saturation: 100,
    };
    setVideoClips((prev) => [...prev, newClip]);
    setSelectedClipId(newClip.id);
  };

  // Selected clip object
  const selectedClip = videoClips.find((c) => c.id === selectedClipId) || videoClips[0];

  // Update properties of selected clip
  const updateSelectedClip = (updates: Partial<TimelineClip>) => {
    setVideoClips((prev) =>
      prev.map((c) => (c.id === selectedClip.id ? { ...c, ...updates } : c))
    );
  };

  // Start Export Simulation
  const handleStartExport = () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    const interval = setInterval(() => {
      setExportProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setExportComplete(true);
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

  // Get active video clip for current timestamp
  const activePlayingClip =
    videoClips.find(
      (c) => currentTime >= c.start && currentTime <= c.start + c.duration
    ) || videoClips[0];

  // CSS Filter string based on clip adjustments
  const getFilterStyle = (clip?: TimelineClip) => {
    if (!clip) return {};
    let filterString = `brightness(${clip.brightness ?? 100}%) contrast(${clip.contrast ?? 100}%) saturate(${clip.saturation ?? 100}%)`;

    if (clip.filter === 'warm') filterString += ' sepia(25%) saturate(120%)';
    else if (clip.filter === 'cold') filterString += ' hue-rotate(180deg) saturate(90%)';
    else if (clip.filter === 'vintage') filterString += ' sepia(50%) contrast(110%)';
    else if (clip.filter === 'cyber') filterString += ' hue-rotate(90deg) contrast(130%)';
    else if (clip.filter === 'cinema') filterString += ' contrast(115%) saturate(85%)';

    return { filter: filterString };
  };

  // Active aspect ratio container classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-w-[280px]'
      : aspectRatio === '16:9'
      ? 'aspect-[16/9] max-w-[500px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-w-[340px]'
      : 'aspect-[4/5] max-w-[300px]';

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8F9FA] text-[#1E293B] select-none overflow-hidden font-sans">
      {/* ------------------------------------------------------------------------ */}
      {/* 1. TOP HEADER BAR (CapCut Style: Back, Resolution Pill, Export Action)   */}
      {/* ------------------------------------------------------------------------ */}
      <header className="h-14 bg-white border-b border-[#E2E8F0] px-4 flex items-center justify-between shrink-0 z-30 shadow-xs">
        {/* Left: Back button & Undo/Redo */}
        <div className="flex items-center gap-2">
          <label
            title="Import Video File"
            className="p-2 rounded-xl text-[#1E293B] hover:bg-[#F8F9FA] border border-[#E2E8F0] cursor-pointer flex items-center gap-1.5 transition-colors text-xs font-semibold"
          >
            <FolderOpen size={16} className="text-[#2563EB]" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleImportLocalVideo}
            />
          </label>

          <div className="h-5 w-px bg-[#E2E8F0] mx-1 hidden sm:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyStack.length === 0}
              className={`p-1.5 rounded-lg transition-colors ${
                historyStack.length > 0
                  ? 'text-[#1E293B] hover:bg-slate-100'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="Undo"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-1.5 rounded-lg transition-colors ${
                redoStack.length > 0
                  ? 'text-[#1E293B] hover:bg-slate-100'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
              title="Redo"
            >
              <Redo2 size={16} />
            </button>
          </div>
        </div>

        {/* Center: CapCut Resolution & FPS Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setShowResolutionMenu(!showResolutionMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8F9FA] border border-[#E2E8F0] hover:border-[#2563EB]/40 text-xs font-bold text-[#1E293B] shadow-2xs transition-all active:scale-95"
          >
            <span>
              {resolution} • {fps} FPS
            </span>
            <ChevronDown size={14} className="text-[#64748B]" />
          </button>

          {showResolutionMenu && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl p-3 z-50 animate-fadeIn">
              <div className="text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                Resolution
              </div>
              <div className="grid grid-cols-3 gap-1 mb-3">
                {['720P', '1080P', '4K'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setResolution(r)}
                    className={`py-1 rounded-lg text-xs font-semibold transition-colors ${
                      resolution === r
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 text-[#1E293B] hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-bold text-[#64748B] mb-2 uppercase tracking-wider">
                Frame Rate
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[24, 30, 60].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`py-1 rounded-lg text-xs font-semibold transition-colors ${
                      fps === f
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-slate-100 text-[#1E293B] hover:bg-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Code Inspector & Royal Blue Export Action */}
        <div className="flex items-center gap-2">
          {/* Flutter Code Modal trigger */}
          <button
            onClick={() => setShowCodeModal(true)}
            className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-[#2563EB] text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Inspect & Copy Flutter Code"
          >
            <Code size={15} />
            <span className="hidden md:inline">Flutter Code</span>
          </button>

          {/* Prominent Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------------------ */}
      {/* 2. CENTER VIDEO PREVIEW AREA (CapCut Rounded Player & Overlay Controls)  */}
      {/* ------------------------------------------------------------------------ */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 min-h-0 relative">
        {/* Aspect Ratio & Playback Quality Toolbar */}
        <div className="absolute top-2 left-4 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-[#E2E8F0] px-2 py-1 rounded-lg shadow-2xs text-[11px] font-bold text-[#64748B]">
          {(['9:16', '16:9', '1:1', '4:5'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setAspectRatio(r)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                aspectRatio === r
                  ? 'bg-[#2563EB] text-white'
                  : 'hover:text-[#1E293B] hover:bg-slate-100'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Video Canvas Container */}
        <div
          onClick={handleTogglePlay}
          className={`relative w-full ${aspectClass} h-full max-h-[46vh] bg-black rounded-2xl border border-[#E2E8F0] shadow-md overflow-hidden cursor-pointer flex items-center justify-center transition-all`}
        >
          <video
            ref={videoRef}
            src={activePlayingClip.url || DEFAULT_SAMPLE_VIDEO}
            className="w-full h-full object-cover"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            muted={isMuted}
            playsInline
            style={getFilterStyle(activePlayingClip)}
          />

          {/* Text Overlay Layer */}
          {textOverlays
            .filter((t) => currentTime >= t.start && currentTime <= t.start + t.duration)
            .map((t) => (
              <div
                key={t.id}
                className="absolute top-1/4 px-4 py-1.5 bg-black/60 backdrop-blur-xs text-white font-extrabold text-sm sm:text-base rounded-lg border border-white/20 shadow-lg tracking-wide animate-fadeIn"
              >
                {t.text}
              </div>
            ))}

          {/* Center Play/Pause Overlay Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-2xs transition-opacity">
              <div className="w-14 h-14 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-[#2563EB] hover:scale-105 active:scale-95 transition-transform">
                <Play size={26} className="ml-1 fill-[#2563EB]" />
              </div>
            </div>
          )}

          {/* Bottom-Left Timecode Indicator Overlay */}
          <div className="absolute left-3 bottom-3 z-20 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono font-semibold tracking-wider border border-white/10">
            {formatTimecode(currentTime)} / {formatTimecode(projectDuration)}
          </div>

          {/* Bottom-Right Mute Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMuted(!isMuted);
            }}
            className="absolute right-3 bottom-3 z-20 p-1.5 rounded-md bg-black/75 backdrop-blur-xs text-white hover:text-[#2563EB] transition-colors"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* 3. CAPCUT MULTI-TRACK TIMELINE (With Center Red Scrubber & Frame Strip)  */}
      {/* ------------------------------------------------------------------------ */}
      <div className="h-44 sm:h-52 bg-white border-t border-[#E2E8F0] flex flex-col shrink-0 relative select-none">
        {/* Timeline Control Bar: Play button, Scrub duration, Zoom controls */}
        <div className="h-8 px-4 border-b border-[#E2E8F0] bg-[#F8F9FA] flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePlay}
              className="p-1 rounded-md text-[#1E293B] hover:text-[#2563EB] hover:bg-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-[#1E293B]" />}
            </button>
            <span className="font-mono text-[11px] font-bold text-[#1E293B]">
              {formatTimecode(currentTime)}
            </span>
          </div>

          {/* Zoom In / Out timeline */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-1 rounded hover:bg-white text-[#64748B] hover:text-[#1E293B]"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[10px] font-semibold w-8 text-center">
              {Math.round(timelineZoom * 100)}%
            </span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1 rounded hover:bg-white text-[#64748B] hover:text-[#1E293B]"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Tracks Canvas with Center Red Scrubber Line */}
        <div
          ref={timelineContainerRef}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left + e.currentTarget.scrollLeft;
            const pxPerSec = 40 * timelineZoom;
            const newT = clickX / pxPerSec;
            handleSeek(newT);
          }}
          className="flex-1 overflow-x-auto overflow-y-hidden relative bg-white"
        >
          {/* Timeline Ruler Timecode Ticks */}
          <div
            className="h-5 border-b border-[#E2E8F0] relative"
            style={{ width: `${projectDuration * 40 * timelineZoom + 400}px` }}
          >
            {Array.from({ length: Math.ceil(projectDuration) + 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 flex flex-col items-start"
                style={{ left: `${i * 40 * timelineZoom}px` }}
              >
                <div className="h-2 w-px bg-slate-300" />
                <span className="text-[9px] text-[#64748B] font-mono mt-0.5 ml-1">
                  00:{i.toString().padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* Tracks Area */}
          <div
            className="p-2 space-y-2 relative"
            style={{ width: `${projectDuration * 40 * timelineZoom + 400}px` }}
          >
            {/* TRACK 1: Video Track Layer with Filmstrip Placeholders */}
            <div className="h-14 relative flex items-center">
              {videoClips.map((clip) => {
                const isSelected = selectedClipId === clip.id;
                const widthPx = clip.duration * 40 * timelineZoom;
                const leftPx = clip.start * 40 * timelineZoom;

                return (
                  <div
                    key={clip.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedClipId(clip.id);
                    }}
                    style={{
                      left: `${leftPx}px`,
                      width: `${widthPx}px`,
                    }}
                    className={`absolute top-0 h-14 rounded-lg bg-[#F1F5F9] border-2 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs transition-all ${
                      isSelected
                        ? 'border-[#2563EB] ring-2 ring-[#2563EB]/20 z-10'
                        : 'border-[#CBD5E1] hover:border-slate-400'
                    }`}
                  >
                    {/* Clip Title & Duration */}
                    <div className="px-2 py-0.5 bg-white/90 border-b border-slate-200 text-[10px] font-bold text-[#1E293B] truncate flex items-center justify-between">
                      <span className="truncate">{clip.name}</span>
                      <span className="text-[9px] text-[#64748B] ml-1">
                        {clip.duration.toFixed(1)}s
                      </span>
                    </div>

                    {/* Frame Placeholders Strip */}
                    <div className="flex-1 flex items-center gap-1 px-1 bg-slate-200/50 overflow-hidden">
                      {Array.from({ length: Math.max(3, Math.floor(clip.duration)) }).map(
                        (_, idx) => (
                          <div
                            key={idx}
                            className="flex-1 h-6 rounded bg-white border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 shrink-0 min-w-5"
                          >
                            f{idx + 1}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRACK 2: Audio Track Layer beneath Video Track */}
            <div className="h-9 relative flex items-center">
              {audioClips.map((clip) => {
                const widthPx = clip.duration * 40 * timelineZoom;
                const leftPx = clip.start * 40 * timelineZoom;

                return (
                  <div
                    key={clip.id}
                    style={{
                      left: `${leftPx}px`,
                      width: `${widthPx}px`,
                    }}
                    className="absolute top-0 h-9 rounded-md bg-[#EFF6FF] border border-[#BFDBFE] px-2 flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center gap-1.5 shrink-0 text-[#2563EB]">
                      <Music size={12} />
                      <span className="text-[10px] font-bold truncate max-w-32">
                        {clip.name}
                      </span>
                    </div>

                    {/* Audio Waveform Bars */}
                    <div className="flex items-center gap-0.5 overflow-hidden">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div
                          key={i}
                          style={{ height: `${6 + (i % 6) * 3}px` }}
                          className="w-0.75 bg-[#3B82F6] rounded-full shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRACK 3: Text / Effect Track */}
            <div className="h-7 relative flex items-center">
              {textOverlays.map((clip) => {
                const widthPx = clip.duration * 40 * timelineZoom;
                const leftPx = clip.start * 40 * timelineZoom;

                return (
                  <div
                    key={clip.id}
                    style={{
                      left: `${leftPx}px`,
                      width: `${widthPx}px`,
                    }}
                    className="absolute top-0 h-7 rounded bg-amber-50 border border-amber-300 px-2 flex items-center gap-1.5 text-amber-700 text-[10px] font-bold"
                  >
                    <Type size={11} />
                    <span className="truncate">{clip.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CAPCUT SIGNATURE CENTER RED SCRUBBER (PLAYHEAD) */}
          <div
            style={{ left: `${currentTime * 40 * timelineZoom}px` }}
            className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center -ml-2"
          >
            {/* Diamond/Pin Playhead Handle at Top */}
            <div className="w-4 h-4 bg-[#EF4444] rounded-full shadow-md flex items-center justify-center text-white text-[8px] font-bold">
              ▼
            </div>
            {/* Vertical Red Scrubber Line */}
            <div className="flex-1 w-0.5 bg-[#EF4444] shadow-sm" />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------------ */}
      {/* 4. ACTIVE TOOL DRAWER (For Speed, Volume, Filters, Adjust, Text)         */}
      {/* ------------------------------------------------------------------------ */}
      {activeDrawer && (
        <div className="bg-white border-t border-[#E2E8F0] p-3 px-4 shadow-inner flex items-center justify-between gap-4 text-xs animate-fadeIn shrink-0">
          <div className="flex items-center gap-2 font-bold text-[#1E293B]">
            <span className="capitalize">{activeDrawer}:</span>
          </div>

          {/* Drawer 1: Speed Controls */}
          {activeDrawer === 'speed' && (
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={selectedClip.speed ?? 1.0}
                onChange={(e) => updateSelectedClip({ speed: parseFloat(e.target.value) })}
                className="flex-1 accent-[#2563EB]"
              />
              <span className="font-bold text-[#2563EB] w-12 text-center">
                {(selectedClip.speed ?? 1.0).toFixed(1)}x
              </span>
              <div className="flex items-center gap-1">
                {[0.5, 1.0, 2.0].map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSelectedClip({ speed: s })}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold"
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Drawer 2: Volume Controls */}
          {activeDrawer === 'volume' && (
            <div className="flex-1 flex items-center gap-3">
              <Volume2 size={16} className="text-[#2563EB]" />
              <input
                type="range"
                min="0"
                max="200"
                value={selectedClip.volume ?? 100}
                onChange={(e) => updateSelectedClip({ volume: parseInt(e.target.value) })}
                className="flex-1 accent-[#2563EB]"
              />
              <span className="font-bold text-[#2563EB] w-12 text-center">
                {selectedClip.volume ?? 100}%
              </span>
            </div>
          )}

          {/* Drawer 3: Filters Controls */}
          {activeDrawer === 'filters' && (
            <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
              {['none', 'natural', 'cinema', 'warm', 'cold', 'vintage', 'cyber'].map((f) => (
                <button
                  key={f}
                  onClick={() => updateSelectedClip({ filter: f })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                    (selectedClip.filter ?? 'none') === f
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-[#1E293B]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Drawer 4: Adjust Controls */}
          {activeDrawer === 'adjust' && (
            <div className="flex-1 flex items-center gap-4">
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[10px] text-[#64748B]">Brightness</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={selectedClip.brightness ?? 100}
                  onChange={(e) => updateSelectedClip({ brightness: parseInt(e.target.value) })}
                  className="flex-1 accent-[#2563EB]"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-1">
                <span className="text-[10px] text-[#64748B]">Contrast</span>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={selectedClip.contrast ?? 100}
                  onChange={(e) => updateSelectedClip({ contrast: parseInt(e.target.value) })}
                  className="flex-1 accent-[#2563EB]"
                />
              </div>
            </div>
          )}

          {/* Drawer 5: Text Overlay */}
          {activeDrawer === 'text' && (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter text overlay..."
                className="flex-1 px-3 py-1 rounded-lg border border-slate-200 text-xs text-[#1E293B] outline-none focus:border-[#2563EB]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setTextOverlays((prev) => [
                      ...prev,
                      {
                        id: `text-${Date.now()}`,
                        name: 'Text Overlay',
                        type: 'text',
                        start: currentTime,
                        duration: 3.5,
                        text: e.currentTarget.value.trim(),
                      },
                    ]);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <span className="text-[10px] text-[#64748B]">Press Enter to add</span>
            </div>
          )}

          <button
            onClick={() => setActiveDrawer(null)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* 5. BOTTOM EDITING TOOLBAR DOCK (CapCut 10 Tools with Active Highlighting) */}
      {/* ------------------------------------------------------------------------ */}
      <nav className="h-16 bg-white border-t border-[#E2E8F0] px-3 flex items-center justify-between shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full scrollbar-none py-1">
          {[
            { id: 'split', name: 'Split', icon: Scissors },
            { id: 'speed', name: 'Speed', icon: Gauge },
            { id: 'volume', name: 'Volume', icon: Volume2 },
            { id: 'animation', name: 'Animation', icon: Sparkles },
            { id: 'adjust', name: 'Adjust', icon: Sliders },
            { id: 'filters', name: 'Filters', icon: Palette },
            { id: 'text', name: 'Text', icon: Type },
            { id: 'audio', name: 'Audio', icon: Music },
            { id: 'canvas', name: 'Canvas', icon: Maximize2 },
            { id: 'delete', name: 'Delete', icon: Trash2 },
          ].map((tool) => {
            const Icon = tool.icon;
            const isSelected = activeTool === tool.id || activeDrawer === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id)}
                className={`flex flex-col items-center justify-center shrink-0 w-14 h-13 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-blue-50 text-[#2563EB] border border-blue-200/80 font-bold shadow-2xs'
                    : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
                }`}
              >
                <Icon size={18} className={isSelected ? 'text-[#2563EB]' : 'text-[#1E293B]'} />
                <span className="text-[10px] mt-1 tracking-tight">{tool.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ------------------------------------------------------------------------ */}
      {/* 6. EXPORT PROGRESS MODAL                                                */}
      {/* ------------------------------------------------------------------------ */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
              <Download size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1E293B]">Exporting Video</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Resolution: {resolution} • {fps} FPS
              </p>
            </div>

            {isExporting ? (
              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#2563EB]">
                  {exportProgress}%
                </span>
              </div>
            ) : exportComplete ? (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
                <Check size={16} /> Video ready to save to gallery!
              </div>
            ) : (
              <p className="text-xs text-[#64748B]">
                Fast rendering with frame-accurate hardware acceleration
              </p>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#1E293B] hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {!exportComplete && !isExporting && (
                <button
                  onClick={handleStartExport}
                  className="flex-1 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Start Export
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------ */}
      {/* 7. FLUTTER SOURCE CODE VIEWER MODAL                                     */}
      {/* ------------------------------------------------------------------------ */}
      <FlutterCodeViewerModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
      />
    </div>
  );
};
