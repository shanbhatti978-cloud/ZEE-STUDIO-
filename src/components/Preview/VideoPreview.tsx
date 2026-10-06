import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Scissors,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Magnet,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Project, Clip } from '../../types/editor';
import { VideoCompositor } from '../../engine/VideoCompositor';
import { AudioEngine } from '../../engine/AudioEngine';

interface VideoPreviewProps {
  project: Project;
  currentTime: number;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onSeek: (time: number) => void;
  onSplitAtPlayhead: () => void;
  selectedClip: Clip | null;
  onUpdateClipTransform?: (clipId: string, updates: Partial<Clip>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  project,
  currentTime,
  isPlaying,
  onPlayToggle,
  onSeek,
  onSplitAtPlayhead,
  selectedClip,
  onUpdateClipTransform,
  isMuted,
  onToggleMute,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingClip, setIsDraggingClip] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number; initialClipX: number; initialClipY: number }>({
    x: 0,
    y: 0,
    initialClipX: 0,
    initialClipY: 0,
  });

  // Aspect ratio css styles
  const getContainerAspectRatio = () => {
    switch (project.aspectRatio) {
      case '9:16':
        return 'aspect-[9/16]';
      case '1:1':
        return 'aspect-square';
      case '4:5':
        return 'aspect-[4/5]';
      case '16:9':
        return 'aspect-video';
      case '3:4':
        return 'aspect-[3/4]';
      default:
        return 'aspect-[9/16]';
    }
  };

  // Re-render canvas on frame change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = VideoCompositor.getDimensions(project.aspectRatio, 1080);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    VideoCompositor.render({
      canvas,
      ctx,
      time: currentTime,
      project,
      selectedClipId: selectedClip?.id || null,
      interactiveMode: true,
    });
  }, [currentTime, project, selectedClip]);

  // Step 1 frame (1/30 second)
  const stepFrame = (delta: number) => {
    const frameTime = 1 / project.fps;
    const newTime = Math.max(0, Math.min(project.duration, currentTime + delta * frameTime));
    onSeek(newTime);
  };

  // Touch / mouse dragging to move selected text or sticker
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!selectedClip || (selectedClip.type !== 'text' && selectedClip.type !== 'sticker')) return;
    setIsDraggingClip(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialClipX: selectedClip.x,
      initialClipY: selectedClip.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingClip || !selectedClip || !onUpdateClipTransform || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    // Convert pixels to percentage (-50 to +50)
    const pctX = (dx / rect.width) * 100;
    const pctY = (dy / rect.height) * 100;

    const newX = Math.round(dragStartPos.current.initialClipX + pctX);
    const newY = Math.round(dragStartPos.current.initialClipY + pctY);

    onUpdateClipTransform(selectedClip.id, { x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingClip(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Format timecode (MM:SS.FF)
  const formatTimecode = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const f = Math.floor((sec % 1) * 30);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${f.toString().padStart(2, '0')}`;
  };

  return (
    <section className="relative flex-1 min-h-[190px] max-h-[380px] bg-[#07090e] flex items-center justify-center p-2 select-none overflow-hidden">
      {/* Viewport Frame Box */}
      <div
        ref={containerRef}
        className={`relative h-full max-h-full ${getContainerAspectRatio()} rounded-xl overflow-hidden shadow-2xl bg-black border border-slate-800/80 flex items-center justify-center`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full object-contain cursor-crosshair touch-none"
        />

        {/* Selected Clip Direct Overlay Badge */}
        {selectedClip && (selectedClip.type === 'text' || selectedClip.type === 'sticker') && (
          <div className="absolute top-2 left-2 bg-sky-500/90 text-slate-950 font-bold text-[9px] px-2 py-0.5 rounded-full pointer-events-none shadow-md">
            Drag to Reposition
          </div>
        )}

        {/* Center Play Overlay when paused */}
        {!isPlaying && (
          <button
            onClick={onPlayToggle}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
            title="Play / Pause (Space)"
          >
            <Play size={20} className="ml-1 fill-white" />
          </button>
        )}
      </div>

      {/* Floating Bottom Quick Toolbar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#121624]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 shadow-xl z-20">
        {/* Play / Pause Toggle */}
        <button
          onClick={onPlayToggle}
          className="p-1.5 text-white hover:text-sky-400 active:scale-90 transition-all"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={16} className="fill-white" /> : <Play size={16} className="fill-white" />}
        </button>

        {/* Frame Step Back */}
        <button
          onClick={() => stepFrame(-1)}
          className="p-1.5 text-slate-300 hover:text-white active:scale-90 transition-all text-[11px] font-bold"
          title="Previous Frame (1/30s)"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Timecode */}
        <div className="text-[11px] font-mono font-semibold tracking-wider text-slate-200 px-1.5">
          <span className="text-sky-400">{formatTimecode(currentTime)}</span>
          <span className="text-slate-500 mx-1">/</span>
          <span className="text-slate-400">{formatTimecode(project.duration)}</span>
        </div>

        {/* Frame Step Forward */}
        <button
          onClick={() => stepFrame(1)}
          className="p-1.5 text-slate-300 hover:text-white active:scale-90 transition-all text-[11px] font-bold"
          title="Next Frame (1/30s)"
        >
          <ChevronRight size={16} />
        </button>

        {/* Quick Split button */}
        <div className="w-px h-4 bg-slate-700 mx-0.5" />
        <button
          onClick={onSplitAtPlayhead}
          className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-sky-300 rounded-md text-[10px] font-semibold transition-colors"
          title="Split clip at playhead"
        >
          <Scissors size={12} />
          <span>Split</span>
        </button>

        {/* Mute button */}
        <button
          onClick={onToggleMute}
          className="p-1.5 text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} />}
        </button>
      </div>
    </section>
  );
};
