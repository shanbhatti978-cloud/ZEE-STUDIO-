import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Subtitles,
  Focus,
  Camera,
  Film,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SplitSquareVertical,
  Sliders,
  Download,
  Share2,
  FolderOpen,
  Check,
  RotateCcw,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ZStudioLogo } from '../Branding/ZStudioLogo';
import { SystemIntents, IntentMediaFile } from '../../services/systemIntents';

export type VideoAiToolId =
  | 'subtitles'
  | 'bokeh'
  | 'frame-extractor'
  | 'style-transfer'
  | 'noise-reduction';

interface VideoAiWorkspaceProps {
  onOpenFullTimeline?: (videoUrl: string) => void;
  onOpenLiveCamera?: () => void;
  initialVideo?: string;
}

export const VideoAiWorkspace: React.FC<VideoAiWorkspaceProps> = ({
  onOpenFullTimeline,
  onOpenLiveCamera,
  initialVideo,
}) => {
  // Video source
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>(
    initialVideo ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  );

  // Video playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [isMuted, setIsMuted] = useState(true);

  // Split-screen Before vs After preview slider (0 to 100 percentage)
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Active Tool selection
  const [activeTool, setActiveTool] = useState<VideoAiToolId>('bokeh');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 1. Auto Subtitles
  const [generatedCaptions, setGeneratedCaptions] = useState<
    { id: string; start: number; end: number; text: string }[]
  >([
    { id: '1', start: 0.5, end: 2.5, text: 'Welcome to Z-Studio AI Engine.' },
    { id: '2', start: 2.8, end: 5.2, text: 'Real-time neural depth and cinematic bokeh.' },
    { id: '3', start: 5.5, end: 8.5, text: 'Next-generation mobile & web video creator.' },
  ]);

  // 2. AI Background Blur / Bokeh
  const [bokehBlurRadius, setBokehBlurRadius] = useState<number>(18);
  const [bokehAperture, setBokehAperture] = useState<number>(75);

  // 3. Frame Extractor & Motion Freeze
  const [extractedFrames, setExtractedFrames] = useState<
    { id: string; time: number; score: number; url: string }[]
  >([]);
  const [freezeDuration, setFreezeDuration] = useState<number>(2.5);

  // 4. AI Style Transfer & Filters
  const [activeStyle, setActiveStyle] = useState<
    'cyberpunk' | 'vintage' | 'anime' | 'matrix' | 'noir' | 'none'
  >('cyberpunk');
  const [styleIntensity, setStyleIntensity] = useState<number>(85);

  // 5. Video Noise Reduction
  const [grainSuppression, setGrainSuppression] = useState<number>(70);
  const [audioNoiseGate, setAudioNoiseGate] = useState<boolean>(true);

  // Video element references
  const videoBeforeRef = useRef<HTMLVideoElement>(null);
  const videoAfterRef = useRef<HTMLVideoElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize playback between Before and After video elements
  const handleTogglePlay = () => {
    if (!videoBeforeRef.current || !videoAfterRef.current) return;
    if (isPlaying) {
      videoBeforeRef.current.pause();
      videoAfterRef.current.pause();
      setIsPlaying(false);
    } else {
      videoBeforeRef.current.play();
      videoAfterRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoBeforeRef.current) {
      setCurrentTime(videoBeforeRef.current.currentTime);
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoBeforeRef.current) videoBeforeRef.current.currentTime = newTime;
    if (videoAfterRef.current) videoAfterRef.current.currentTime = newTime;
  };

  // Handle Split Slider Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingSplit || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const pos = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.min(95, Math.max(5, pos)));
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    if (isDraggingSplit) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit]);

  // Import video file intent
  const handlePickVideo = async () => {
    const files = await SystemIntents.dispatchFilePickerIntent('video', false);
    if (files.length > 0) {
      setCurrentVideoUrl(files[0].url);
      setCurrentTime(0);
      setIsPlaying(false);
      setStatusMessage(`Loaded video: ${files[0].name}`);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // 1. Generate Subtitles Intent
  const handleGenerateSubtitles = () => {
    setIsProcessing(true);
    setStatusMessage('Transcribing audio waveform and aligning frame-accurate captions...');

    setTimeout(() => {
      setGeneratedCaptions([
        { id: '1', start: 0.2, end: 2.2, text: 'Z-Studio is revolutionizing digital media.' },
        { id: '2', start: 2.5, end: 4.8, text: 'Zero latency split-screen AI preview.' },
        { id: '3', start: 5.0, end: 7.6, text: 'Neural bokeh and cinematic color LUTs.' },
        { id: '4', start: 8.0, end: 11.2, text: 'Export to TikTok and Reels in full 4K.' },
      ]);
      setIsProcessing(false);
      setStatusMessage('Subtitles generated successfully! Synchronized to timeline.');
    }, 1000);
  };

  // 3. Extract Best Frames Intent
  const handleExtractBestFrames = () => {
    setIsProcessing(true);
    setStatusMessage('Analyzing video motion vectors and selecting sharpest keyframes...');

    setTimeout(() => {
      // Mock best extracted frames
      setExtractedFrames([
        {
          id: 'kf-1',
          time: 2.4,
          score: 98.7,
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'kf-2',
          time: 5.8,
          score: 97.4,
          url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        {
          id: 'kf-3',
          time: 9.1,
          score: 95.2,
          url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        },
      ]);
      setIsProcessing(false);
      setStatusMessage('Extracted 3 optimal high-definition freeze frames.');
    }, 900);
  };

  // Compute CSS filter styling based on active style & noise reduction
  const getProcessedVideoFilterStyle = (): React.CSSProperties => {
    let filter = '';

    // Style Transfer
    if (activeStyle === 'cyberpunk') {
      filter += `hue-rotate(185deg) saturate(${100 + styleIntensity * 0.8}%) contrast(${
        100 + styleIntensity * 0.3
      }%) `;
    } else if (activeStyle === 'vintage') {
      filter += `sepia(${styleIntensity * 0.7}%) contrast(110%) brightness(95%) `;
    } else if (activeStyle === 'anime') {
      filter += `saturate(${120 + styleIntensity * 0.6}%) contrast(125%) brightness(105%) `;
    } else if (activeStyle === 'matrix') {
      filter += `hue-rotate(80deg) saturate(160%) contrast(130%) `;
    } else if (activeStyle === 'noir') {
      filter += `grayscale(100%) contrast(${120 + styleIntensity * 0.4}%) `;
    }

    // Noise reduction smoothing
    if (activeTool === 'noise-reduction' && grainSuppression > 0) {
      filter += `contrast(102%) brightness(101%) `;
    }

    // Bokeh simulation
    if (activeTool === 'bokeh') {
      filter += `drop-shadow(0 0 ${bokehBlurRadius * 0.5}px rgba(0, 240, 255, 0.2)) `;
    }

    return { filter: filter.trim() || undefined };
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#000000] text-white overflow-hidden select-none">
      {/* LEFT: Video Preview & Split-Screen View */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-[#1E1E1E]">
        {/* Sub-Header */}
        <div className="h-12 bg-[#000000] border-b border-[#1E1E1E] px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#FE2C55]/10 text-[#FE2C55] border border-[#FE2C55]/30">
              <SplitSquareVertical size={16} />
            </span>
            <span className="text-xs font-bold text-white tracking-wide">
              Video AI Split Preview (Original vs. Neural AI)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePickVideo}
              title="Import Video File"
              className="px-2.5 py-1 rounded-lg bg-[#121212] hover:bg-[#1E1E1E] text-white text-xs font-semibold flex items-center gap-1.5 border border-[#1E1E1E] transition-colors"
            >
              <FolderOpen size={13} />
              <span className="hidden sm:inline">Import Video</span>
            </button>

            {onOpenLiveCamera && (
              <button
                onClick={onOpenLiveCamera}
                title="Record with Live Camera"
                className="px-2.5 py-1 rounded-lg bg-[#FE2C55]/15 hover:bg-[#FE2C55]/25 text-[#FE2C55] border border-[#FE2C55]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Camera size={13} />
                <span className="hidden sm:inline">Record</span>
              </button>
            )}

            {onOpenFullTimeline && (
              <button
                onClick={() => onOpenFullTimeline(currentVideoUrl)}
                className="px-3 py-1 rounded-lg bg-[#FE2C55] hover:bg-[#e0254b] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-[#FE2C55]/20 active:scale-95 transition-all"
              >
                <span>Timeline Editor</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Video Viewport with Split-Screen Slider */}
        <div
          ref={splitContainerRef}
          className="relative flex-1 bg-[#05070c] flex items-center justify-center overflow-hidden p-3 select-none"
        >
          <div className="relative max-h-[70vh] w-full max-w-3xl aspect-video rounded-xl overflow-hidden border border-slate-800/80 bg-black shadow-2xl flex items-center justify-center">
            {/* AFTER Layer (Processed AI Video) */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <video
                ref={videoAfterRef}
                src={currentVideoUrl}
                playsInline
                muted={isMuted}
                loop
                style={getProcessedVideoFilterStyle()}
                className="w-full h-full object-contain pointer-events-none"
              />

              {/* Bokeh Subject Glow / Depth Mask simulation */}
              {activeTool === 'bokeh' && (
                <div
                  className="absolute inset-0 pointer-events-none transition-all"
                  style={{
                    backdropFilter: `blur(${bokehBlurRadius}px)`,
                    maskImage: `radial-gradient(circle at 50% 50%, transparent ${
                      100 - bokehAperture
                    }%, black 90%)`,
                    WebkitMaskImage: `radial-gradient(circle at 50% 50%, transparent ${
                      100 - bokehAperture
                    }%, black 90%)`,
                  }}
                />
              )}
            </div>

            {/* BEFORE Layer (Original Raw Video, Clipped by Split Percentage) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none z-10"
              style={{
                width: `${splitPos}%`,
                borderRight: '2px solid #00F0FF',
              }}
            >
              <video
                ref={videoBeforeRef}
                src={currentVideoUrl}
                playsInline
                muted={isMuted}
                loop
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 15)}
                className="absolute inset-0 w-full h-full object-contain"
                style={{
                  minWidth: splitContainerRef.current
                    ? `${splitContainerRef.current.clientWidth}px`
                    : '100%',
                }}
              />

              {/* Before Badge */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/80 backdrop-blur border border-slate-700 text-slate-300 text-[10px] font-bold tracking-wider uppercase">
                Original (Before)
              </div>
            </div>

            {/* After Badge */}
            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur border border-cyan-500/50 text-cyan-300 text-[10px] font-bold tracking-wider uppercase z-20">
              AI Processed (After)
            </div>

            {/* Split Handle Knob */}
            <div
              onMouseDown={() => setIsDraggingSplit(true)}
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/50 cursor-ew-resize pointer-events-auto border-2 border-white z-30"
              style={{ left: `calc(${splitPos}% - 16px)` }}
            >
              <SplitSquareVertical size={16} />
            </div>

            {/* Live Subtitle Overlay */}
            {activeTool === 'subtitles' && (
              <div className="absolute bottom-6 inset-x-4 text-center z-20 pointer-events-none">
                {generatedCaptions
                  .filter((c) => currentTime >= c.start && currentTime <= c.end)
                  .map((caption) => (
                    <span
                      key={caption.id}
                      className="inline-block px-3 py-1.5 rounded-lg bg-black/80 text-white font-bold text-sm tracking-wide border border-cyan-500/40 shadow-lg"
                    >
                      <span className="text-cyan-400">“</span>
                      {caption.text}
                      <span className="text-cyan-400">”</span>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Processing Banner */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-40">
              <ZStudioLogo size={48} animated />
              <div className="text-cyan-300 text-xs font-bold mt-3 animate-pulse">
                {statusMessage || 'Processing Video Stream...'}
              </div>
            </div>
          )}
        </div>

        {/* Video Playback Scrubber & Transport Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors shadow-md shadow-cyan-500/20"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          <span className="text-[11px] font-mono text-slate-400 w-12 text-center">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>

          <input
            type="range"
            min="0"
            max={duration || 15}
            step="0.05"
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg ${
              isMuted ? 'text-slate-500 bg-slate-900' : 'text-cyan-400 bg-cyan-500/10'
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* Toast status message */}
        {statusMessage && !isProcessing && (
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 text-xs text-emerald-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1.5">
              <Check size={14} /> {statusMessage}
            </span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* RIGHT: Video AI Tools Control Panel */}
      <div className="w-full md:w-80 lg:w-96 bg-[#121212] border-t md:border-t-0 md:border-l border-[#1E1E1E] flex flex-col shrink-0">
        {/* Panel Header */}
        <div className="p-4 border-b border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#FE2C55]" />
            <div>
              <h2 className="text-sm font-bold text-white">Free Video AI Suite</h2>
              <p className="text-[10px] text-[#8A8B91]">Neural speech, depth & style engine</p>
            </div>
          </div>
        </div>

        {/* 5 Video AI Tool Tabs Selector */}
        <div className="grid grid-cols-5 p-2 gap-1 border-b border-[#1E1E1E] bg-black">
          {[
            { id: 'subtitles' as VideoAiToolId, label: 'Subtitles', icon: Subtitles },
            { id: 'bokeh' as VideoAiToolId, label: 'Bokeh', icon: Focus },
            { id: 'frame-extractor' as VideoAiToolId, label: 'Frames', icon: Camera },
            { id: 'style-transfer' as VideoAiToolId, label: 'Styles', icon: Film },
            { id: 'noise-reduction' as VideoAiToolId, label: 'Denoise', icon: Zap },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/50 shadow-sm'
                    : 'text-[#8A8B91] hover:text-white hover:bg-[#1E1E1E]'
                }`}
              >
                <Icon size={16} />
                <span className="text-[9px] font-bold tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tool Settings Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* 1. Auto Video Subtitles & Transcriptions */}
          {activeTool === 'subtitles' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Subtitles size={14} className="text-cyan-400" />
                  Auto Video Subtitles & Transcriptions
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Automatic speech-to-text frame captioning with timestamp alignment and karaoke highlights.
                </p>

                <button
                  onClick={handleGenerateSubtitles}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all mb-3"
                >
                  <Subtitles size={14} /> Transcribe Video Audio
                </button>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-400">
                    Captions ({generatedCaptions.length} Segments)
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {generatedCaptions.map((cap, i) => (
                      <div
                        key={cap.id}
                        className={`p-2 rounded-lg border text-[11px] flex items-start gap-2 transition-colors ${
                          currentTime >= cap.start && currentTime <= cap.end
                            ? 'border-cyan-500/60 bg-cyan-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300'
                        }`}
                      >
                        <span className="font-mono text-[9px] text-cyan-400 shrink-0 mt-0.5">
                          {cap.start}s - {cap.end}s
                        </span>
                        <input
                          type="text"
                          value={cap.text}
                          onChange={(e) => {
                            const updated = [...generatedCaptions];
                            updated[i].text = e.target.value;
                            setGeneratedCaptions(updated);
                          }}
                          className="bg-transparent flex-1 focus:outline-none focus:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. AI Background Blur / Bokeh */}
          {activeTool === 'bokeh' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Focus size={14} className="text-cyan-400" />
                  AI Background Blur / Neural Bokeh
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Real-time optical depth-of-field effect separating human foreground subjects from background scenes.
                </p>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Background Blur Radius</span>
                      <span className="text-cyan-400 font-bold">{bokehBlurRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={bokehBlurRadius}
                      onChange={(e) => setBokehBlurRadius(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Focal Subject Aperture</span>
                      <span className="text-cyan-400 font-bold">{bokehAperture}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="95"
                      value={bokehAperture}
                      onChange={(e) => setBokehAperture(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                  ✓ Real-time preview updated on video viewport with Split Before vs. After comparison!
                </div>
              </div>
            </div>
          )}

          {/* 3. Frame Extractor & Motion Freeze */}
          {activeTool === 'frame-extractor' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Camera size={14} className="text-cyan-400" />
                  Frame Extractor & Motion Freeze
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  AI-guided best-frame selection from moving video and freeze-frame generation.
                </p>

                <button
                  onClick={handleExtractBestFrames}
                  disabled={isProcessing}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-98 transition-all mb-3"
                >
                  <Camera size={14} /> Detect & Extract Best Frames
                </button>

                {extractedFrames.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Best AI Keyframes Detected
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {extractedFrames.map((f) => (
                        <div
                          key={f.id}
                          className="group relative rounded-lg overflow-hidden border border-slate-700 bg-black cursor-pointer hover:border-cyan-400 transition-all"
                        >
                          <img
                            src={f.url}
                            alt="Keyframe"
                            className="w-full h-16 object-cover"
                          />
                          <div className="p-1 bg-slate-950/80 text-[9px] flex items-center justify-between text-slate-300 font-mono">
                            <span>{f.time}s</span>
                            <span className="text-emerald-400 font-bold">{f.score}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. AI Style Transfer & Filters */}
          {activeTool === 'style-transfer' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Film size={14} className="text-cyan-400" />
                  AI Style Transfer & Color Lookups
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Cinematic grade neural style transfer and artistic color grading presets.
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { id: 'cyberpunk', label: 'Cyberpunk Neon' },
                    { id: 'vintage', label: '35mm Film' },
                    { id: 'anime', label: 'Anime Glow' },
                    { id: 'matrix', label: 'Emerald Matrix' },
                    { id: 'noir', label: 'High Noir' },
                    { id: 'none', label: 'Original' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setActiveStyle(style.id as any)}
                      className={`p-2 rounded-lg border text-center font-semibold text-[10px] transition-all ${
                        activeStyle === style.id
                          ? 'border-cyan-400 bg-cyan-500/10 text-white font-bold'
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                    <span>Style Transfer Intensity</span>
                    <span className="text-cyan-400 font-bold">{styleIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={styleIntensity}
                    onChange={(e) => setStyleIntensity(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 5. Video Noise Reduction */}
          {activeTool === 'noise-reduction' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                <h4 className="font-bold text-white text-xs mb-1 flex items-center gap-1.5">
                  <Zap size={14} className="text-cyan-400" />
                  Video Noise Reduction & Audio Clearing
                </h4>
                <p className="text-[11px] text-slate-400 mb-3">
                  Temporal noise removal for low-light camera grain and spectral audio noise gate.
                </p>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-300 font-semibold mb-1">
                      <span>Video Grain Suppression</span>
                      <span className="text-cyan-400 font-bold">{grainSuppression}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grainSuppression}
                      onChange={(e) => setGrainSuppression(Number(e.target.value))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800 cursor-pointer">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Audio Spectral Noise Gate
                    </span>
                    <input
                      type="checkbox"
                      checked={audioNoiseGate}
                      onChange={(e) => setAudioNoiseGate(e.target.checked)}
                      className="accent-cyan-400"
                    />
                  </label>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300">
                  ✓ Noise reduction filter active on preview stream.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
