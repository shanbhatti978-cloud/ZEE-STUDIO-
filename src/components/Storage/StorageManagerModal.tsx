/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  HardDrive,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Film,
  Music,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Search,
  X,
  Play,
  Square,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  Check,
  ChevronDown,
  Clock,
  Database,
  SlidersHorizontal,
  FolderGit2,
  Zap,
  Info,
  ExternalLink
} from 'lucide-react';
import {
  StorageManagerService,
  StorageAuditReport,
  AuditedAssetItem,
  AuditedAssetType,
  AssetSafetyStatus
} from '../../services/storageManager';
import { Project } from '../../types/editor';
import { AudioEngine } from '../../engine/AudioEngine';

interface StorageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject?: Project | null;
  onStorageCleaned?: () => void;
}

type TabMode = 'orphans' | 'categories' | 'projects' | 'templates' | 'cache';

export const StorageManagerModal: React.FC<StorageManagerModalProps> = ({
  isOpen,
  onClose,
  activeProject,
  onStorageCleaned,
}) => {
  const [report, setReport] = useState<StorageAuditReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('orphans');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | AuditedAssetType>('all');
  const [filterSafety, setFilterSafety] = useState<'all' | AssetSafetyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'size_desc' | 'size_asc' | 'date_desc' | 'name'>('size_desc');

  // Preview popover
  const [previewItem, setPreviewItem] = useState<AuditedAssetItem | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Clean confirmation modal
  const [showConfirmClean, setShowConfirmClean] = useState(false);
  const [cleanMode, setCleanMode] = useState<'selected' | 'all' | 'cache'>('selected');
  const [cleaningSuccessMsg, setCleaningSuccessMsg] = useState<string | null>(null);

  const runScan = async () => {
    setIsScanning(true);
    try {
      const newReport = await StorageManagerService.auditStorageAsync(activeProject);
      setReport(newReport);
      // Auto-select safe orphaned items
      setSelectedIds(new Set(newReport.orphanedAssets.filter((a) => a.safeToDelete).map((a) => a.id)));
    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runScan();
      setCleaningSuccessMsg(null);
    }
  }, [isOpen, activeProject]);

  // Filter & Sort
  const filteredAssets = useMemo(() => {
    if (!report) return [];
    return report.allAssets
      .filter((item) => {
        if (filterType !== 'all' && item.type !== filterType) return false;
        if (filterSafety !== 'all' && item.safetyStatus !== filterSafety) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.reason.toLowerCase().includes(q) ||
            item.sha256Hash.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'size_desc') return b.sizeBytes - a.sizeBytes;
        if (sortBy === 'size_asc') return a.sizeBytes - b.sizeBytes;
        if (sortBy === 'date_desc') return b.createdAt - a.createdAt;
        return a.name.localeCompare(b.name);
      });
  }, [report, filterType, filterSafety, searchQuery, sortBy]);

  const selectedBytes = useMemo(() => {
    if (!report) return 0;
    return report.allAssets
      .filter((a) => selectedIds.has(a.id))
      .reduce((sum, a) => sum + a.sizeBytes, 0);
  }, [report, selectedIds]);

  const toggleSelectAll = () => {
    const selectable = filteredAssets.filter((a) => a.safeToDelete);
    if (selectedIds.size === selectable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectable.map((a) => a.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExecuteDelete = () => {
    if (!report) return;

    if (cleanMode === 'cache') {
      const { clearedCount, reclaimedBytes } = StorageManagerService.clearAllCaches();
      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
      setCleaningSuccessMsg(`Cleared ${clearedCount} temporary cache entries and reclaimed ${StorageManagerService.formatBytes(reclaimedBytes)}.`);
    } else {
      let itemsToDelete: AuditedAssetItem[] = [];
      if (cleanMode === 'all') {
        itemsToDelete = report.orphanedAssets.filter((a) => a.safeToDelete);
      } else {
        itemsToDelete = report.allAssets.filter((a) => selectedIds.has(a.id) && a.safeToDelete);
      }

      const { deletedCount, reclaimedBytes } = StorageManagerService.bulkDeleteAuditedAssets(itemsToDelete);
      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
      setCleaningSuccessMsg(`Successfully removed ${deletedCount} unused assets and reclaimed ${StorageManagerService.formatBytes(reclaimedBytes)}!`);
    }

    setShowConfirmClean(false);
    runScan();
    if (onStorageCleaned) onStorageCleaned();
  };

  const playPreviewAudio = (url: string) => {
    if (isPlayingAudio) {
      AudioEngine.stopAllMedia();
      setIsPlayingAudio(false);
    } else {
      AudioEngine.previewTrack(url, 0.9);
      setIsPlayingAudio(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[900px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Storage & Asset Manager</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Active Projects Protected
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Audits original media, timeline clips, templates, AI assets, caches & orphaned files with safety verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runScan}
              disabled={isScanning}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Rescan Storage"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Rescan</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Storage Overview Bar */}
        {report && (
          <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-cyan-400" />
                Zee Studio Usage
              </div>
              <div className="text-base font-bold text-white mt-0.5">{report.formattedTotalUsage}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Trash2 className="w-3 h-3 text-rose-400" />
                Recoverable Orphans
              </div>
              <div className="text-base font-bold text-rose-400 mt-0.5">
                {StorageManagerService.formatBytes(report.categoryBreakdown.orphanedAssetsBytes)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Deduplication Savings
              </div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {StorageManagerService.formatBytes(report.dedupSavedBytes)}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400" />
                Device Quota
              </div>
              <div className="text-base font-bold text-slate-300 mt-0.5">
                {StorageManagerService.formatBytes(report.deviceQuotaBytes)}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          {[
            { id: 'orphans', label: 'Orphan & Unused Assets', badge: report?.orphanedAssets.length },
            { id: 'categories', label: 'Storage Breakdown', badge: '13 Types' },
            { id: 'projects', label: 'Projects', badge: report?.activeProjectsCount },
            { id: 'templates', label: 'Templates', badge: report?.activeTemplatesCount },
            { id: 'cache', label: 'Cache & Scratch Cleaner' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabMode)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700/80 text-slate-300">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Success Alert Banner */}
        {cleaningSuccessMsg && (
          <div className="mx-6 mt-3 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{cleaningSuccessMsg}</span>
            </div>
            <button onClick={() => setCleaningSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-300">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: Orphan & Unused Assets */}
          {activeTab === 'orphans' && (
            <div className="space-y-4">
              {/* Filters & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, hash, or orphan reason..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Media Types</option>
                    <option value="photo">Photos</option>
                    <option value="video">Videos</option>
                    <option value="audio">Audio</option>
                    <option value="ai_generated">AI Generated</option>
                    <option value="undo_history">Undo Histories</option>
                    <option value="temporary">Temporary Checkpoints</option>
                  </select>

                  <select
                    value={filterSafety}
                    onChange={(e) => setFilterSafety(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="all">All Safety States</option>
                    <option value="ORPHAN — SAFE TO DELETE">ORPHAN — Safe to Delete</option>
                    <option value="CACHE — SAFE TO CLEAR">CACHE — Safe to Clear</option>
                    <option value="TEMPORARY — SAFE TO CLEAR">TEMPORARY — Safe to Clear</option>
                    <option value="IN USE — DO NOT DELETE">IN USE — Do Not Delete</option>
                    <option value="REFERENCED — DO NOT DELETE">REFERENCED — Do Not Delete</option>
                  </select>

                  <button
                    onClick={toggleSelectAll}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {selectedIds.size === filteredAssets.filter((a) => a.safeToDelete).length ? 'Deselect All' : 'Select Safe'}
                  </button>

                  <button
                    disabled={selectedIds.size === 0}
                    onClick={() => {
                      setCleanMode('selected');
                      setShowConfirmClean(true);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      selectedIds.size > 0
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clean Selected ({StorageManagerService.formatBytes(selectedBytes)})
                  </button>
                </div>
              </div>

              {/* Assets Grid / List */}
              {filteredAssets.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
                  <h3 className="text-base font-bold text-white">Storage is Completely Optimized</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    No orphaned assets or unreferenced files detected. All media is actively tied to your projects.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedIds.has(asset.id);
                    const isSafe = asset.safeToDelete;

                    return (
                      <div
                        key={asset.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-rose-950/20 border-rose-500/50 shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              {isSafe && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectItem(asset.id)}
                                  className="w-4 h-4 rounded border-slate-700 text-rose-500 focus:ring-rose-400"
                                />
                              )}
                              <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
                                {asset.type === 'video' ? (
                                  <Film className="w-3.5 h-3.5" />
                                ) : asset.type === 'audio' ? (
                                  <Music className="w-3.5 h-3.5" />
                                ) : asset.type === 'photo' || asset.type === 'ai_generated' ? (
                                  <ImageIcon className="w-3.5 h-3.5" />
                                ) : (
                                  <FileCode className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="font-semibold text-xs text-white truncate max-w-[150px]" title={asset.name}>
                                {asset.name}
                              </div>
                            </div>

                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                asset.safetyStatus.includes('DO NOT DELETE')
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {asset.safetyStatus}
                            </span>
                          </div>

                          {/* Thumbnail / Preview Area */}
                          {asset.dataUrl && (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 mb-2">
                              {asset.type === 'photo' || asset.type === 'ai_generated' ? (
                                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                              ) : asset.type === 'video' ? (
                                <video src={asset.dataUrl} className="w-full h-full object-cover" preload="metadata" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => playPreviewAudio(asset.dataUrl)}
                                    className="p-2 rounded-full bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors"
                                  >
                                    {isPlayingAudio ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                  </button>
                                  <span className="text-[11px] text-slate-400">Audio Preview</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reason */}
                          <p className="text-[11px] text-slate-400 line-clamp-2 mb-2 leading-relaxed">
                            {asset.reason}
                          </p>
                        </div>

                        {/* Footer details */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold text-slate-300">{asset.formattedSize}</span>
                          <span className="font-mono text-[9px] text-slate-500">SHA: {asset.sha256Hash.substring(0, 8)}...</span>
                          <button
                            onClick={() => setPreviewItem(asset)}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Inspect Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Categories Breakdown */}
          {activeTab === 'categories' && report && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">All 13 Storage Domains Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { label: 'Original Photos', bytes: report.categoryBreakdown.originalPhotosBytes, icon: ImageIcon, color: 'text-sky-400' },
                    { label: 'Original Videos', bytes: report.categoryBreakdown.originalVideosBytes, icon: Film, color: 'text-indigo-400' },
                    { label: 'Audio Tracks & FX', bytes: report.categoryBreakdown.audioBytes, icon: Music, color: 'text-amber-400' },
                    { label: 'Project Files (JSON & Models)', bytes: report.categoryBreakdown.projectFilesBytes, icon: FolderGit2, color: 'text-cyan-400' },
                    { label: 'Template Packages & Assets', bytes: report.categoryBreakdown.templateAssetsBytes, icon: Layers, color: 'text-purple-400' },
                    { label: 'Imported Library Media', bytes: report.categoryBreakdown.importedAssetsBytes, icon: Database, color: 'text-blue-400' },
                    { label: 'AI Generated Assets', bytes: report.categoryBreakdown.generatedAiAssetsBytes, icon: Sparkles, color: 'text-rose-400' },
                    { label: 'Undo / Redo History', bytes: report.categoryBreakdown.undoRedoHistoryBytes, icon: Clock, color: 'text-emerald-400' },
                    { label: 'Preview & Proxy Buffers', bytes: report.categoryBreakdown.previewProxyFilesBytes, icon: SlidersHorizontal, color: 'text-orange-400' },
                    { label: 'Thumbnails & Waveforms', bytes: report.categoryBreakdown.thumbnailsBytes, icon: Eye, color: 'text-teal-400' },
                    { label: 'Render & Export Cache', bytes: report.categoryBreakdown.renderCacheBytes, icon: Zap, color: 'text-yellow-400' },
                    { label: 'Temporary Scratch Buffers', bytes: report.categoryBreakdown.temporaryFilesBytes, icon: FileCode, color: 'text-slate-400' },
                    { label: 'Orphaned & Unused Files', bytes: report.categoryBreakdown.orphanedAssetsBytes, icon: Trash2, color: 'text-red-400' },
                  ].map((cat, idx) => {
                    const IconComp = cat.icon;
                    return (
                      <div key={idx} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg bg-slate-800 ${cat.color}`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-white">{cat.label}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {((cat.bytes / Math.max(1, report.zeeStudioUsageBytes)) * 100).toFixed(1)}% of studio
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-xs text-slate-200">
                          {StorageManagerService.formatBytes(cat.bytes)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Projects Breakdown */}
          {activeTab === 'projects' && report && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                All saved timeline projects and their associated media footprints.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.projectDetails.map((proj) => (
                  <div key={proj.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {proj.thumbnail ? (
                        <img src={proj.thumbnail} className="w-12 h-12 rounded-lg object-cover bg-slate-900" alt={proj.name} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                          <Film className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-white">{proj.name}</h4>
                        <p className="text-[10px] text-slate-400">{proj.clipsCount} clips • ID: {proj.id.substring(0, 8)}</p>
                        <p className="text-[9px] text-slate-500">Updated: {new Date(proj.lastModified).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-cyan-400">{proj.formattedSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Templates Breakdown */}
          {activeTab === 'templates' && report && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 mb-2">
                Custom and imported templates with assigned photo/video slots.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.templateDetails.map((tmpl) => (
                  <div key={tmpl.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tmpl.thumbnail ? (
                        <img src={tmpl.thumbnail} className="w-12 h-12 rounded-lg object-cover bg-slate-900" alt={tmpl.title} />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400">
                          <Layers className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-xs text-white">{tmpl.title}</h4>
                        <p className="text-[10px] text-slate-400">{tmpl.category} • {tmpl.slotsCount} slots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-purple-400">{tmpl.formattedSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Cache Cleaner */}
          {activeTab === 'cache' && (
            <div className="space-y-4 max-w-xl mx-auto py-8">
              <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">One-Click Scratch & Cache Optimization</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Safely clears temporary render caches, audio waveform previews, and unrecovered auto-save checkpoints while leaving all projects, media clips, and templates 100% intact.
                </p>
                <button
                  onClick={() => {
                    setCleanMode('cache');
                    setShowConfirmClean(true);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2 mx-auto"
                >
                  <Zap className="w-4 h-4" />
                  Clear All Caches & Scratch Buffers
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmClean && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Confirm Storage Cleanup</h3>
                  <p className="text-xs text-slate-400">Destructive operation verification</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {cleanMode === 'cache'
                  ? 'Are you sure you want to clear temporary render caches and scratch buffers? This will not impact your saved projects or timelines.'
                  : `Are you sure you want to permanently delete the selected unreferenced files? You will recover ${StorageManagerService.formatBytes(selectedBytes)} of storage.`}
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowConfirmClean(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteDelete}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/20"
                >
                  Confirm & Clean
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Inspection Popover */}
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">{previewItem.name}</h3>
                <button onClick={() => setPreviewItem(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Safety Status:</span>
                  <span className="font-bold text-cyan-400">{previewItem.safetyStatus}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">File Size:</span>
                  <span className="font-mono">{previewItem.formattedSize}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Reference Count:</span>
                  <span className="font-mono">{previewItem.referenceCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">SHA-256 Hash:</span>
                  <span className="font-mono text-[10px] truncate max-w-[200px]">{previewItem.sha256Hash}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Last Modified:</span>
                  <span>{new Date(previewItem.lastModifiedAt).toLocaleString()}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-400 block mb-1">Reason:</span>
                  <p className="p-2.5 bg-slate-950 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                    {previewItem.reason}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
