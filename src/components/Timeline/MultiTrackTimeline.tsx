import React, { useRef, useState, useEffect } from 'react';
import {
  Scissors,
  Copy,
  Trash2,
  Gauge,
  Volume2,
  PlusCircle,
  RotateCcw,
  Snowflake,
  Magnet,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Music,
  Type,
  Smile,
  Layers,
  Sparkle
} from 'lucide-react';
import { Project, Clip, Track, Transition } from '../../types/editor';
import { AudioEngine } from '../../engine/AudioEngine';

interface MultiTrackTimelineProps {
  project: Project;
  currentTime: number;
  onSeek: (time: number) => void;
  selectedClip: Clip | null;
  onSelectClip: (clip: Clip | null) => void;
  onSplitClip: (clipId: string, splitTime: number) => void;
  onDuplicateClip: (clipId: string) => void;
  onDeleteClip: (clipId: string) => void;
  onTrimClip: (clipId: string, newStart: number, newDuration: number) => void;
  onToggleKeyframe: (clipId: string, time: number) => void;
  onOpenTransitionModal: (clipId: string) => void;
  onToggleReverse: (clipId: string) => void;
  onFreezeFrame: (clipId: string) => void;
}

export const MultiTrackTimeline: React.FC<MultiTrackTimelineProps> = ({
  project,
  currentTime,
  onSeek,
  selectedClip,
  onSelectClip,
  onSplitClip,
  onDuplicateClip,
  onDeleteClip,
  onTrimClip,
  onToggleKeyframe,
  onOpenTransitionModal,
  onToggleReverse,
  onFreezeFrame,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Zoom scale: pixels per second (default 65 px/s)
  const [pixelsPerSec, setPixelsPerSec] = useState(70);
  const [magneticSnap, setMagneticSnap] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isTrimming, setIsTrimming] = useState<'left' | 'right' | null>(null);
  const trimData = useRef<{ clipId: string; initialStart: number; initialDuration: number; startX: number }>({
    clipId: '',
    initialStart: 0,
    initialDuration: 0,
    startX: 0,
  });

  const totalWidth = Math.max(800, (project.duration + 2) * pixelsPerSec);

  // Auto-scroll timeline to keep playhead in view during playback
  useEffect(() => {
    if (!scrollAreaRef.current || isScrubbing) return;
    const playheadPx = currentTime * pixelsPerSec;
    const scrollLeft = scrollAreaRef.current.scrollLeft;
    const clientWidth = scrollAreaRef.current.clientWidth;

    if (playheadPx > scrollLeft + clientWidth - 60 || playheadPx < scrollLeft + 40) {
      scrollAreaRef.current.scrollLeft = playheadPx - clientWidth / 2;
    }
  }, [currentTime, pixelsPerSec, isScrubbing]);

  // Magnetic Snapping points
  const getSnapPoints = (): number[] => {
    const points = [0, project.duration];
    // Add beats
    if (project.beats) {
      project.beats.forEach((b) => points.push(b.time));
    }
    // Add clip start and end points
    project.tracks.forEach((t) => {
      t.clips.forEach((c) => {
        points.push(c.start);
        points.push(c.start + c.duration);
      });
    });
    return Array.from(new Set(points));
  };

  const applySnapping = (targetTime: number): number => {
    if (!magneticSnap) return targetTime;
    const snapPoints = getSnapPoints();
    const snapThresholdSec = 10 / pixelsPerSec; // 10px snap radius
    for (const pt of snapPoints) {
      if (Math.abs(targetTime - pt) <= snapThresholdSec) {
        return pt;
      }
    }
    return targetTime;
  };

  // Timeline Pointer down for scrubbing playhead
  const handleTimelinePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isTrimming) return;
    setIsScrubbing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    seekFromEvent(e);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isScrubbing) {
      seekFromEvent(e);
    }
  };

  const handleTimelinePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsScrubbing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  const seekFromEvent = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;
    const rect = scrollAreaRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + scrollAreaRef.current.scrollLeft;
    let targetTime = Math.max(0, Math.min(project.duration, clickX / pixelsPerSec));
    targetTime = applySnapping(targetTime);
    onSeek(targetTime);
  };

  const renderAudioWaveBars = (clip: Clip) => {
    const peaks = AudioEngine.getWaveformPeaks(clip.duration, 120);
    const visibleBarsCount = Math.max(8, Math.floor((clip.duration * pixelsPerSec) / 4)); // 1 bar every 4px
    const step = Math.max(1, Math.floor(peaks.length / visibleBarsCount));

    const renderedBars: React.ReactNode[] = [];
    for (let i = 0; i < visibleBarsCount; i++) {
      const peakIdx = i * step;
      if (peakIdx >= peaks.length) break;
      const peakHeight = Math.max(15, peaks[peakIdx] * 85); // percentage height
      renderedBars.push(
        <div
          key={i}
          className="bg-rose-400/50 w-[1.5px] rounded-t-sm shrink-0"
          style={{ height: `${peakHeight}%` }}
        />
      );
    }
    return renderedBars;
  };

  // Trim handle drag handlers
  const startTrim = (e: React.PointerEvent, clip: Clip, side: 'left' | 'right') => {
    e.stopPropagation();
    setIsTrimming(side);
    trimData.current = {
      clipId: clip.id,
      initialStart: clip.start,
      initialDuration: clip.duration,
      startX: e.clientX,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTrimPointerMove = (e: React.PointerEvent) => {
    if (!isTrimming) return;
    const dx = e.clientX - trimData.current.startX;
    const timeDelta = dx / pixelsPerSec;

    if (isTrimming === 'left') {
      const newStart = Math.max(0, trimData.current.initialStart + timeDelta);
      const newDur = Math.max(0.3, trimData.current.initialDuration - timeDelta);
      onTrimClip(trimData.current.clipId, newStart, newDur);
    } else {
      const newDur = Math.max(0.3, trimData.current.initialDuration + timeDelta);
      onTrimClip(trimData.current.clipId, trimData.current.initialStart, newDur);
    }
  };

  const onTrimPointerUp = (e: React.PointerEvent) => {
    setIsTrimming(null);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Find clip under playhead if none selected
  const activeClipUnderPlayhead = selectedClip || (() => {
    for (const track of project.tracks) {
      const found = track.clips.find((c) => currentTime >= c.start && currentTime < c.start + c.duration);
      if (found) return found;
    }
    return null;
  })();

  // Render second marks along ruler
  const renderRuler = () => {
    const marks = [];
    const step = pixelsPerSec < 50 ? 2 : 1;
    const totalSecs = Math.ceil(project.duration + 2);

    for (let s = 0; s <= totalSecs; s += step) {
      const left = s * pixelsPerSec;
      marks.push(
        <div key={`ruler-${s}`} className="absolute top-0 flex flex-col items-center" style={{ left: `${left}px` }}>
          <div className="h-2 w-px bg-slate-600" />
          <span className="text-[9px] font-mono text-slate-500 mt-0.5">{s}s</span>
        </div>
      );
    }
    return marks;
  };

  // Track Icon Helper
  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'video':
        return <Layers size={11} className="text-sky-400" />;
      case 'text':
        return <Type size={11} className="text-purple-400" />;
      case 'sticker':
        return <Smile size={11} className="text-amber-400" />;
      case 'effect':
        return <Sparkles size={11} className="text-emerald-400" />;
      case 'audio':
        return <Music size={11} className="text-rose-400" />;
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col bg-[#0e111a] border-t border-slate-800 select-none">
      {/* Timeline Controls Header */}
      <div className="h-9 px-3 bg-[#131722] border-b border-slate-800/80 flex items-center justify-between shrink-0">
        {/* Left Actions: Split, Duplicate, Delete, Keyframe */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (activeClipUnderPlayhead) {
                onSplitClip(activeClipUnderPlayhead.id, currentTime);
              }
            }}
            disabled={!activeClipUnderPlayhead}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 hover:text-sky-300 rounded text-[11px] font-medium transition-colors"
            title="Split clip at playhead"
          >
            <Scissors size={12} />
            <span className="hidden sm:inline">Split</span>
          </button>

          <button
            onClick={() => activeClipUnderPlayhead && onDuplicateClip(activeClipUnderPlayhead.id)}
            disabled={!activeClipUnderPlayhead}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            title="Duplicate clip"
          >
            <Copy size={13} />
          </button>

          <button
            onClick={() => activeClipUnderPlayhead && onDeleteClip(activeClipUnderPlayhead.id)}
            disabled={!activeClipUnderPlayhead}
            className="p-1.5 text-slate-400 hover:text-rose-400 disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
            title="Delete clip"
          >
            <Trash2 size={13} />
          </button>

          {activeClipUnderPlayhead && (
            <>
              <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
              {/* Keyframe toggle */}
              <button
                onClick={() => onToggleKeyframe(activeClipUnderPlayhead.id, currentTime - activeClipUnderPlayhead.start)}
                className="flex items-center gap-1 px-2 py-1 text-slate-300 hover:text-amber-400 rounded text-[11px] hover:bg-slate-800 transition-colors"
                title="Add/Remove Keyframe at Playhead"
              >
                <Sparkle size={12} />
                <span className="text-[10px]">Keyframe</span>
              </button>

              {/* Reverse */}
              <button
                onClick={() => onToggleReverse(activeClipUnderPlayhead.id)}
                className={`p-1.5 rounded transition-colors ${
                  activeClipUnderPlayhead.reversed ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:text-white'
                }`}
                title="Reverse Video"
              >
                <RotateCcw size={13} />
              </button>

              {/* Freeze frame */}
              <button
                onClick={() => onFreezeFrame(activeClipUnderPlayhead.id)}
                className="p-1.5 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition-colors"
                title="Freeze Frame"
              >
                <Snowflake size={13} />
              </button>
            </>
          )}
        </div>

        {/* Right Actions: Snapping, Zoom */}
        <div className="flex items-center gap-2">
          {/* Magnetic snap */}
          <button
            onClick={() => setMagneticSnap(!magneticSnap)}
            className={`p-1.5 rounded transition-colors ${
              magneticSnap ? 'text-sky-400 bg-sky-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={`Magnetic Snapping: ${magneticSnap ? 'ON' : 'OFF'}`}
          >
            <Magnet size={14} />
          </button>

          {/* Timeline Zoom Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700">
            <button
              onClick={() => setPixelsPerSec(Math.max(35, pixelsPerSec - 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut size={12} />
            </button>
            <span className="text-[9px] font-mono text-slate-300 px-1">
              {Math.round((pixelsPerSec / 70) * 100)}%
            </span>
            <button
              onClick={() => setPixelsPerSec(Math.min(220, pixelsPerSec + 15))}
              className="p-1 text-slate-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Scroll Area */}
      <div
        ref={scrollAreaRef}
        onPointerDown={handleTimelinePointerDown}
        onPointerMove={handleTimelinePointerMove}
        onPointerUp={handleTimelinePointerUp}
        onPointerCancel={handleTimelinePointerUp}
        className="relative h-44 overflow-x-auto overflow-y-hidden cursor-pointer touch-pan-x scrollbar-thin scrollbar-thumb-slate-700"
      >
        <div className="relative h-full" style={{ width: `${totalWidth}px` }}>
          {/* 1. Time Ruler Header */}
          <div className="h-6 w-full border-b border-slate-800/80 relative bg-[#0b0e16] pointer-events-none">
            {renderRuler()}

            {/* Beat Markers (yellow glowing dots) */}
            {project.beats?.map((beat, bIdx) => (
              <div
                key={`beat-${bIdx}`}
                className="absolute top-1 w-1.5 h-1.5 -ml-[3px] rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]"
                style={{ left: `${beat.time * pixelsPerSec}px` }}
                title={`Beat Hit at ${beat.time}s`}
              />
            ))}
          </div>

          {/* 2. Track Rows */}
          <div className="flex flex-col gap-1.5 pt-1.5 pb-2">
            {project.tracks.map((track) => {
              const isVideo = track.type === 'video';
              const isAudio = track.type === 'audio';
              const rowHeight = isVideo ? 'h-11' : isAudio ? 'h-8' : 'h-7';

              return (
                <div key={track.id} className={`relative ${rowHeight} bg-slate-900/40 rounded-lg mx-2 border border-slate-800/40`}>
                  {/* Track label indicator */}
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10 pointer-events-none opacity-40">
                    {getTrackIcon(track.type)}
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{track.name}</span>
                  </div>

                  {/* Clips on this track */}
                  {track.clips.map((clip, cIdx) => {
                    const left = clip.start * pixelsPerSec;
                    const width = Math.max(20, clip.duration * pixelsPerSec);
                    const isSelected = selectedClip?.id === clip.id;

                    // Color theme per clip type
                    let clipBg = 'bg-sky-950/80 border-sky-600/70 text-sky-200';
                    if (clip.type === 'text') clipBg = 'bg-purple-950/80 border-purple-600/70 text-purple-200';
                    else if (clip.type === 'sticker') clipBg = 'bg-amber-950/80 border-amber-600/70 text-amber-200';
                    else if (clip.type === 'effect') clipBg = 'bg-emerald-950/80 border-emerald-600/70 text-emerald-200';
                    else if (clip.type === 'audio') clipBg = 'bg-rose-950/80 border-rose-600/70 text-rose-200';

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip);
                        }}
                        style={{ left: `${left}px`, width: `${width}px` }}
                        className={`absolute top-0 bottom-0 rounded-md border flex items-center px-2 cursor-pointer transition-all select-none overflow-hidden ${clipBg} ${
                          isSelected ? 'ring-2 ring-sky-400 z-10 shadow-lg' : 'hover:brightness-110'
                        }`}
                      >
                        {/* Clip Transition badge at junction */}
                        {clip.transitionIn && clip.transitionIn.type !== 'none' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTransitionModal(clip.id);
                            }}
                            className="absolute left-0 top-0 bottom-0 w-4 bg-sky-500/80 text-slate-950 flex items-center justify-center text-[8px] font-bold z-20 hover:scale-110"
                            title={`Transition: ${clip.transitionIn.type}`}
                          >
                            ⧓
                          </button>
                        )}

                        {/* Audio Waveform visualization background */}
                        {clip.type === 'audio' && (
                          <div className="absolute inset-x-0 bottom-0.5 top-4 flex items-end gap-[1.5px] px-1 pointer-events-none opacity-45 z-0 overflow-hidden">
                            {renderAudioWaveBars(clip)}
                          </div>
                        )}

                        {/* Title and duration */}
                        <div className="truncate text-[10px] font-medium flex items-center gap-1.5 w-full z-10">
                          <span className="truncate">{clip.name}</span>
                          {clip.speed !== 1 && (
                            <span className="text-[9px] bg-black/40 px-1 rounded text-amber-300 font-mono">
                              {clip.speed}x
                            </span>
                          )}
                          {clip.reversed && (
                            <span className="text-[9px] bg-black/40 px-1 rounded text-rose-300">REV</span>
                          )}
                        </div>

                        {/* Keyframe diamonds on clip */}
                        {clip.keyframes?.map((kf) => (
                          <div
                            key={kf.id}
                            className="absolute top-1 w-2 h-2 rotate-45 bg-amber-400 border border-slate-950 shadow-sm"
                            style={{ left: `${kf.time * pixelsPerSec}px` }}
                            title={`Keyframe at +${kf.time.toFixed(2)}s`}
                          />
                        ))}

                        {/* Selected Trim Handles */}
                        {isSelected && (
                          <>
                            <div
                              onPointerDown={(e) => startTrim(e, clip, 'left')}
                              onPointerMove={onTrimPointerMove}
                              onPointerUp={onTrimPointerUp}
                              className="absolute left-0 top-0 bottom-0 w-3 bg-sky-400/90 hover:bg-sky-300 cursor-ew-resize flex items-center justify-center z-20"
                            >
                              <div className="w-0.5 h-3 bg-slate-950 rounded-full" />
                            </div>
                            <div
                              onPointerDown={(e) => startTrim(e, clip, 'right')}
                              onPointerMove={onTrimPointerMove}
                              onPointerUp={onTrimPointerUp}
                              className="absolute right-0 top-0 bottom-0 w-3 bg-sky-400/90 hover:bg-sky-300 cursor-ew-resize flex items-center justify-center z-20"
                            >
                              <div className="w-0.5 h-3 bg-slate-950 rounded-full" />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* 3. The Playhead Cursor */}
          <div
            className="absolute top-0 bottom-0 w-px bg-sky-400 pointer-events-none z-30"
            style={{ left: `${currentTime * pixelsPerSec}px` }}
          >
            {/* Playhead Handle Triangle */}
            <div className="absolute -top-1 -left-2 w-4 h-4 bg-sky-400 rotate-45 rounded-sm shadow-md" />
            <div className="absolute top-0 bottom-0 w-0.5 bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
          </div>
        </div>
      </div>
    </div>
  );
};
