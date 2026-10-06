/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Share2, Download, Film, Sparkles, Check, Crown, AlertCircle, Eye } from 'lucide-react';
import { Project } from '../../types/editor';
import { VideoCompositor } from '../../engine/VideoCompositor';
import { QuickPreview } from './QuickPreview';

interface ExportModalProps {
  project: Project;
  isPro: boolean;
  onOpenPro: () => void;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isPro,
  onOpenPro,
  onClose,
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p' | '2k' | '4k'>('1080p');
  const [fps, setFps] = useState<24 | 30 | 60>(30);
  const [quality, setQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedUrl, setExportedUrl] = useState<string | null>(null);

  // Quick Preview tab state
  const [activeTab, setActiveTab] = useState<'export' | 'quick-preview'>('export');

  // Calculate estimated file size in MB
  const calculateEstimatedMB = () => {
    let bitrateMbps = 8;
    if (resolution === '720p') bitrateMbps = 5;
    else if (resolution === '1080p') bitrateMbps = quality === 'ultra' ? 12 : 8;
    else if (resolution === '2k') bitrateMbps = 16;
    else if (resolution === '4k') bitrateMbps = 28;

    if (fps === 60) bitrateMbps *= 1.35;
    const sizeBytes = (bitrateMbps * 1000000 * project.duration) / 8;
    return (sizeBytes / (1024 * 1024)).toFixed(1);
  };

  const handleStartExport = async () => {
    if ((resolution === '4k' || fps === 60) && !isPro) {
      onOpenPro();
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const blob = await VideoCompositor.exportVideo(project, resolution, fps, (p) => {
        setExportProgress(p);
      });

      const url = URL.createObjectURL(blob);
      setExportedUrl(url);

      // Auto trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_${resolution}_${fps}fps.webm`;
      a.click();
    } catch (err) {
      console.error('Export failed', err);
      alert('Video export could not be completed on this browser.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#121624] border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-sky-400" />
            <h3 className="text-base font-extrabold text-white">Export & Quick Preview</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-900 p-1 rounded-xl mb-4 border border-slate-800">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Download size={14} />
            <span>Export Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('quick-preview')}
            className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'quick-preview'
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Quick-Preview Verify</span>
          </button>
        </div>

        {activeTab === 'export' ? (
          <>
            {/* Resolution Options */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Resolution
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['720p', '1080p', '2k', '4k'] as const).map((res) => {
                  const requiresPro = (res === '4k' || res === '2k') && !isPro;
                  return (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`py-2 px-1 rounded-xl border text-center transition-all relative ${
                        resolution === res
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs">{res.toUpperCase()}</div>
                      {requiresPro && (
                        <Crown size={10} className="absolute top-1 right-1 text-amber-400 fill-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frame Rate (FPS) */}
            <div className="mb-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Frame Rate (FPS)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([24, 30, 60] as const).map((rate) => {
                  const requiresPro = rate === 60 && !isPro;
                  return (
                    <button
                      key={rate}
                      onClick={() => setFps(rate)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all relative ${
                        fps === rate
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs">{rate} FPS</div>
                      <div className="text-[9px] text-slate-500">
                        {rate === 24 ? 'Film' : rate === 30 ? 'Social' : 'Smooth'}
                      </div>
                      {requiresPro && (
                        <Crown size={10} className="absolute top-1 right-1 text-amber-400 fill-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary Details */}
            <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400">Duration</div>
                <div className="text-xs font-mono font-bold text-white">{project.duration.toFixed(1)}s</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Aspect Ratio</div>
                <div className="text-xs font-mono font-bold text-sky-400">{project.aspectRatio}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Est. File Size</div>
                <div className="text-xs font-mono font-bold text-amber-400">~{calculateEstimatedMB()} MB</div>
              </div>
            </div>

            {/* Progress Bar during export */}
            {isExporting && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>Rendering Video Frames...</span>
                  <span className="font-mono text-sky-400 font-bold">{exportProgress}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-150"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            {exportedUrl ? (
              <div className="flex flex-col gap-2">
                <a
                  href={exportedUrl}
                  download={`${project.name.toLowerCase().replace(/\s+/g, '_')}.webm`}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all text-center"
                >
                  <Download size={14} />
                  <span>Download Video Again</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
                >
                  Back to Editor
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="w-full py-3 bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98 transition-all"
              >
                <Download size={15} />
                <span>{isExporting ? 'Exporting in Progress...' : 'Render & Save Video'}</span>
              </button>
            )}
          </>
        ) : (
          <QuickPreview project={project} />
        )}
      </div>
    </div>
  );
};
