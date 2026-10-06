/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Eye, Film, Sparkles, CheckCircle2 } from 'lucide-react';
import { Project } from '../../types/editor';
import { ThumbnailGeneratorService } from '../../services/thumbnailGeneratorService';
import { TimelineThumbnail } from '../../services/timelinePreviewThumbnailService';

interface QuickPreviewProps {
  project: Project;
}

export const QuickPreview: React.FC<QuickPreviewProps> = ({ project }) => {
  const [thumbnails, setThumbnails] = useState<TimelineThumbnail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThumbnails();
  }, [project.id]);

  useEffect(() => {
    let timer: any = null;
    if (isPlaying && thumbnails.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % thumbnails.length;
          // Auto scroll scrub bar
          if (scrollContainerRef.current) {
            const thumbEl = scrollContainerRef.current.children[next] as HTMLElement;
            if (thumbEl) {
              thumbEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
          }
          return next;
        });
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, thumbnails.length]);

  const loadThumbnails = async () => {
    setIsLoading(true);
    setProgress(0);
    try {
      const thumbs = await ThumbnailGeneratorService.generateThumbnailSequence(
        project,
        { intervalSeconds: 0.5 },
        (p) => setProgress(p)
      );
      setThumbnails(thumbs);
      setCurrentIndex(0);
    } catch (err) {
      console.error('Failed to generate quick preview thumbnails', err);
    } finally {
      setIsLoading(false);
    }
  };

  const activeThumb = thumbnails[currentIndex];

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-bold text-sky-400">
          <Film size={14} />
          <span>Synchronized Quick-Preview Scrub-Bar</span>
        </div>
        {thumbnails.length > 0 && (
          <button
            onClick={loadThumbnails}
            disabled={isLoading}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
            <span>Regenerate Frames</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl border border-slate-800">
          <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
          <div className="text-xs font-semibold text-white mb-1">Rendering Low-Res Frame Sequence</div>
          <div className="text-[10px] font-mono text-sky-400">{progress}% complete</div>
        </div>
      ) : thumbnails.length > 0 ? (
        <div className="space-y-3">
          {/* Main Preview Frame Display */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-2xl">
            {activeThumb ? (
              <img
                src={activeThumb.dataUrl}
                alt={`Frame at ${activeThumb.timeSeconds}s`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="text-xs text-slate-500">No frames available</div>
            )}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-lg text-xs font-mono font-bold text-sky-400 border border-slate-700/60 shadow-lg flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeThumb?.timeSeconds.toFixed(1)}s / {project.duration.toFixed(1)}s</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause Sequence' : 'Play Sequence'}</span>
            </button>
          </div>

          {/* Synchronized Scrollable Scrub-Bar / Filmstrip */}
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Scrub Bar Timeline</span>
              <span className="text-sky-400 font-mono">{thumbnails.length} frames</span>
            </div>
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin scrollbar-thumb-slate-800 bg-slate-900/60 p-2 rounded-2xl border border-slate-800"
            >
              {thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-24 aspect-video rounded-xl overflow-hidden border-2 transition-all group ${
                    currentIndex === idx
                      ? 'border-sky-400 ring-4 ring-sky-500/30 scale-105 z-10 shadow-lg'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumb.dataUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent pt-3 pb-1 text-[9px] font-mono font-bold text-center text-slate-200">
                    {thumb.timeSeconds.toFixed(1)}s
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center bg-slate-900/80 rounded-2xl border border-slate-800">
          <button
            onClick={loadThumbnails}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Generate Quick-Preview Sequence
          </button>
        </div>
      )}
    </div>
  );
};
