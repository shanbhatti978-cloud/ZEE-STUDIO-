/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Project,
  Clip,
  Track,
  AspectRatio,
  Transition,
  Keyframe,
  TextConfig,
  StickerConfig,
  ColorAdjustments,
  EffectConfig,
  BeatMarker,
  TemplateDefinition
} from './types/editor';
import { ProjectStorageService } from './services/projectStorage';
import { LocalLibraryService } from './services/localLibrary';
import { AudioEngine } from './engine/AudioEngine';

// Modern Material 3 Theme & Navigation
import { ThemeService } from './services/themeService';
import { AppTheme, ThemeId } from './types/theme';
import { PillBottomDock, CreatorMode } from './components/Navigation/PillBottomDock';
import { TopAppBar } from './components/Navigation/TopAppBar';
import { NavigationDrawer, DrawerAction } from './components/Navigation/NavigationDrawer';
import { HomeView } from './components/Home/HomeView';
import { GlobalSearchModal } from './components/Navigation/GlobalSearchModal';
import { CrashRecoveryModal } from './components/Navigation/CrashRecoveryModal';
import { AppearanceThemeModal } from './components/Settings/AppearanceThemeModal';
import { AiProviderSettingsModal } from './components/Settings/AiProviderSettingsModal';
import { StorageManagerModal } from './components/Storage/StorageManagerModal';
import { AiPhotoGeneratorModal } from './components/AI/AiPhotoGeneratorModal';
import { AiEditModal } from './components/AI/AiEditModal';
import { AiPhotoshootModal } from './components/AI/AiPhotoshootModal';
import { AiStyleMatchModal } from './components/AI/AiStyleMatchModal';
import { AiInpaintingModal } from './components/AI/AiInpaintingModal';
import { AiUpscalerModal } from './components/AI/AiUpscalerModal';
import { AiHistoryModal } from './components/AI/AiHistoryModal';
import { AiUsageModal } from './components/AI/AiUsageModal';
import { AiProviderConfigModal } from './components/AI/AiProviderConfigModal';

// Templates Studio
import { TemplateStudioView } from './components/Templates/TemplateStudioView';
import { ImportTemplateModal } from './components/Templates/ImportTemplateModal';
import { TemplateProfileModal } from './components/Templates/TemplateProfileModal';
import { UseTemplateModal } from './components/Templates/UseTemplateModal';
import { CreateTemplateModal } from './components/Templates/CreateTemplateModal';
import { TEMPLATES } from './data/sampleMedia';

// Photo Studio & AI Tools
import { PhotoStudioView } from './components/Photo/PhotoStudioView';
import { EdgeCutoutModal } from './components/Photo/EdgeCutoutModal';
import { BackgroundReplaceModal } from './components/Photo/BackgroundReplaceModal';
import { StyleMatchModal } from './components/Photo/StyleMatchModal';
import { PhotoToVideoModal } from './components/Photo/PhotoToVideoModal';

// Video Studio & Timeline
import { VideoPreview } from './components/Preview/VideoPreview';
import { MultiTrackTimeline } from './components/Timeline/MultiTrackTimeline';
import { BottomToolBar, ActiveDrawer } from './components/Panels/BottomToolBar';

// Editing Drawers
import { MediaDrawer } from './components/Panels/MediaDrawer';
import { AudioDrawer } from './components/Panels/AudioDrawer';
import { TextDrawer } from './components/Panels/TextDrawer';
import { CaptionsDrawer } from './components/Panels/CaptionsDrawer';
import { StickersDrawer } from './components/Panels/StickersDrawer';
import { EffectsDrawer } from './components/Panels/EffectsDrawer';
import { FiltersDrawer } from './components/Panels/FiltersDrawer';
import { TransitionsDrawer } from './components/Panels/TransitionsDrawer';
import { RetouchDrawer } from './components/Panels/RetouchDrawer';
import { AiToolsDrawer } from './components/Panels/AiToolsDrawer';
import { CanvasDrawer } from './components/Panels/CanvasDrawer';
import { SpeedDrawer } from './components/Panels/SpeedDrawer';
import { ExportModal } from './components/Export/ExportModal';
import { ProModal } from './components/Pro/ProModal';

// Security & Network
import { SecurityService } from './services/securityService';
import { NetworkService, NetworkState } from './services/networkService';
import { PinLockScreen } from './components/Navigation/PinLockScreen';
import { CameraCaptureModal } from './components/Intents/CameraCaptureModal';
import { IntentMediaFile } from './services/systemIntents';

export default function App() {
  // Theme System (7 Light Themes + Dark/System)
  const [theme, setTheme] = useState<AppTheme>(() => ThemeService.init());
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(() => ThemeService.getActiveThemeId());

  useEffect(() => {
    return ThemeService.subscribe((newTheme) => {
      setTheme(newTheme);
      setActiveThemeId(newTheme.id);
    });
  }, []);

  // Primary Creator Areas
  const [creatorMode, setCreatorMode] = useState<CreatorMode>('home');

  // Stored Projects & Templates
  const [projects, setProjects] = useState<Project[]>(() => ProjectStorageService.getAllProjects());
  const [activeProject, setActiveProject] = useState<Project>(() => projects[0] || ProjectStorageService.getAllProjects()[0]);
  const [templates, setTemplates] = useState<TemplateDefinition[]>(() => {
    const builtIn = LocalLibraryService.getTemplates('BuiltIn');
    const saved = LocalLibraryService.getTemplates('Saved');
    const imported = LocalLibraryService.getTemplates('Imported');
    return [...saved, ...imported, ...builtIn];
  });

  // Undo / Redo Stack (50 states)
  const [historyStack, setHistoryStack] = useState<Project[]>([]);
  const [redoStack, setRedoStack] = useState<Project[]>([]);

  // Navigation Drawer & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [isPro, setIsPro] = useState<boolean>(() => ProjectStorageService.isPro());

  // Template Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [profileTemplate, setProfileTemplate] = useState<TemplateDefinition | null>(null);
  const [useTemplateCandidate, setUseTemplateCandidate] = useState<TemplateDefinition | null>(null);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);

  // Photo Studio & Cloud AI Modals
  const [photoStudioImage, setPhotoStudioImage] = useState<string | null>(null);
  const [cutoutSourceImg, setCutoutSourceImg] = useState<string | null>(null);
  const [bgReplaceSourceImg, setBgReplaceSourceImg] = useState<string | null>(null);
  const [styleMatchSourceImg, setStyleMatchSourceImg] = useState<string | null>(null);
  const [photoToVideoSourceImg, setPhotoToVideoSourceImg] = useState<string | null>(null);

  // Cloud AI Engine Modals
  const [showAiPhotoGenModal, setShowAiPhotoGenModal] = useState(false);
  const [showAiEditModal, setShowAiEditModal] = useState(false);
  const [showAiPhotoshootModal, setShowAiPhotoshootModal] = useState(false);
  const [showAiStyleMatchModal, setShowAiStyleMatchModal] = useState(false);
  const [showAiInpaintModal, setShowAiInpaintModal] = useState(false);
  const [showAiUpscaleModal, setShowAiUpscaleModal] = useState(false);
  const [showAiHistoryModal, setShowAiHistoryModal] = useState(false);
  const [showAiUsageModal, setShowAiUsageModal] = useState(false);
  const [showAiProviderConfigModal, setShowAiProviderConfigModal] = useState(false);

  // Crash Recovery
  const [crashProject, setCrashProject] = useState<Project | null>(null);
  const [showCrashModal, setShowCrashModal] = useState(false);

  // Video Playback & Timeline Drawer State
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const playbackRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Hardware Camera & Security
  const [showLiveCamera, setShowLiveCamera] = useState(false);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => SecurityService.isPinEnabled());
  const [networkStatus, setNetworkStatus] = useState<NetworkState>(() => NetworkService.getNetworkState());

  // Project version snapshotting
  const [projectVersions, setProjectVersions] = useState<(Project & { versionName: string })[]>([]);

  useEffect(() => {
    if (activeProject?.id) {
      setProjectVersions(ProjectStorageService.getProjectVersions(activeProject.id));
    }
  }, [activeProject]);

  // Network listener
  useEffect(() => {
    const handleStateChange = (state: NetworkState) => setNetworkStatus(state);
    NetworkService.registerListener(handleStateChange);
    NetworkService.verifyRealConnection();
    return () => NetworkService.unregisterListener(handleStateChange);
  }, []);

  // Crash recovery check on mount
  useEffect(() => {
    if (activeProject?.id) {
      const backup = localStorage.getItem(`velocut_checkpoint_v1_${activeProject.id}`);
      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          if (parsed && parsed.id === activeProject.id && parsed.updatedAt > (activeProject.updatedAt || 0) + 2000) {
            setCrashProject(parsed);
            setShowCrashModal(true);
          }
        } catch (e) {
          console.warn('Crash recovery check error', e);
        }
      }
    }
  }, []);

  // Periodic autosave checkpoint writing
  useEffect(() => {
    if (activeProject?.id) {
      const timer = setTimeout(() => {
        try {
          const sanitized = ProjectStorageService.sanitizeProject(activeProject);
          localStorage.setItem(`velocut_checkpoint_v1_${activeProject.id}`, JSON.stringify(sanitized));
        } catch (e) {
          console.warn('Failed to save autosave checkpoint', e);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeProject]);

  // History Grouping for sequential property update
  const historyGroupTimeoutRef = useRef<any>(null);
  const activeHistoryGroupRef = useRef<{ key: string; lastUpdated: number } | null>(null);

  const commitActiveHistoryGroup = useCallback(() => {
    if (historyGroupTimeoutRef.current) {
      clearTimeout(historyGroupTimeoutRef.current);
      historyGroupTimeoutRef.current = null;
    }
    activeHistoryGroupRef.current = null;
  }, []);

  const updateProject = useCallback(
    (newProject: Project, recordHistory = true, groupingKey?: string) => {
      if (recordHistory) {
        const now = Date.now();
        const activeGroup = activeHistoryGroupRef.current;
        const isGroupingCandidate =
          groupingKey && activeGroup && activeGroup.key === groupingKey && now - activeGroup.lastUpdated < 750;

        if (isGroupingCandidate) {
          activeGroup.lastUpdated = now;
          if (historyGroupTimeoutRef.current) clearTimeout(historyGroupTimeoutRef.current);
          historyGroupTimeoutRef.current = setTimeout(() => {
            activeHistoryGroupRef.current = null;
            historyGroupTimeoutRef.current = null;
          }, 750);
        } else {
          commitActiveHistoryGroup();
          // Support 50 undo states as specified
          setHistoryStack((prev) => [...prev.slice(-50), ProjectStorageService.sanitizeProject(activeProject)]);
          setRedoStack([]);

          if (groupingKey) {
            activeHistoryGroupRef.current = { key: groupingKey, lastUpdated: now };
            historyGroupTimeoutRef.current = setTimeout(() => {
              activeHistoryGroupRef.current = null;
              historyGroupTimeoutRef.current = null;
            }, 750);
          }
        }
      }

      setActiveProject(newProject);
      setProjects((prev) => prev.map((p) => (p.id === newProject.id ? newProject : p)));
      ProjectStorageService.saveProject(newProject);
    },
    [activeProject, commitActiveHistoryGroup]
  );

  const handleUndo = useCallback(() => {
    commitActiveHistoryGroup();
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setRedoStack((prev) => [...prev, ProjectStorageService.sanitizeProject(activeProject)]);
    setHistoryStack((prev) => prev.slice(0, -1));
    setActiveProject(previous);
    setProjects((prev) => prev.map((p) => (p.id === previous.id ? previous : p)));
    ProjectStorageService.saveProject(previous);
  }, [historyStack, activeProject, commitActiveHistoryGroup]);

  const handleRedo = useCallback(() => {
    commitActiveHistoryGroup();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setHistoryStack((prev) => [...prev, ProjectStorageService.sanitizeProject(activeProject)]);
    setRedoStack((prev) => prev.slice(0, -1));
    setActiveProject(next);
    setProjects((prev) => prev.map((p) => (p.id === next.id ? next : p)));
    ProjectStorageService.saveProject(next);
  }, [redoStack, activeProject, commitActiveHistoryGroup]);

  // Video Playback Loop
  useEffect(() => {
    if (isPlaying) {
      AudioEngine.init();
      const audioTrack = activeProject.tracks.find((t) => t.type === 'audio');
      if (audioTrack && audioTrack.clips.length > 0) {
        AudioEngine.startTimelineAudio('audio-main', 128);
      }

      lastTimeRef.current = performance.now();
      const loop = (now: number) => {
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= activeProject.duration) {
            setIsPlaying(false);
            AudioEngine.stopTimelineAudio();
            return 0;
          }
          return next;
        });
        playbackRef.current = requestAnimationFrame(loop);
      };
      playbackRef.current = requestAnimationFrame(loop);
    } else {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
      AudioEngine.stopTimelineAudio();
    }

    return () => {
      if (playbackRef.current) cancelAnimationFrame(playbackRef.current);
      AudioEngine.stopTimelineAudio();
    };
  }, [isPlaying, activeProject.duration, activeProject.tracks]);

  // Clip manipulation handlers
  const selectedClip = (() => {
    if (!selectedClipId) return null;
    for (const track of activeProject.tracks) {
      const found = track.clips.find((c) => c.id === selectedClipId);
      if (found) return found;
    }
    return null;
  })();

  const handleUpdateClip = (clipId: string, updates: Partial<Clip>, groupingKey?: string) => {
    const newTracks = activeProject.tracks.map((track) => {
      const clipIndex = track.clips.findIndex((c) => c.id === clipId);
      if (clipIndex === -1) return track;
      const updatedClips = [...track.clips];
      updatedClips[clipIndex] = { ...updatedClips[clipIndex], ...updates };
      return { ...track, clips: updatedClips };
    });
    updateProject({ ...activeProject, tracks: newTracks }, true, groupingKey);
  };

  const handleAddClip = (clipData: Partial<Clip>, trackType: Track['type'] = 'video') => {
    let targetTrack = activeProject.tracks.find((t) => t.type === trackType);
    if (!targetTrack) {
      targetTrack = {
        id: `track-${trackType}-${Date.now()}`,
        name: `${trackType.toUpperCase()} Track`,
        type: trackType,
        clips: []
      };
      activeProject.tracks.push(targetTrack);
    }

    const newClip: Clip = {
      id: `clip-${Date.now()}`,
      trackId: targetTrack.id,
      type: trackType === 'audio' ? 'audio' : trackType === 'text' ? 'text' : trackType === 'sticker' ? 'sticker' : 'video',
      name: clipData.name || `New ${trackType}`,
      start: clipData.start !== undefined ? clipData.start : currentTime,
      duration: clipData.duration || 3.0,
      sourceStart: 0,
      sourceDuration: clipData.duration || 3.0,
      src: clipData.src || '',
      x: clipData.x || 0,
      y: clipData.y || 0,
      scale: clipData.scale || 1,
      rotation: clipData.rotation || 0,
      opacity: clipData.opacity !== undefined ? clipData.opacity : 1,
      speed: 1,
      reversed: false,
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      adjustments: clipData.adjustments || {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        sharpen: 0,
        vignette: 0,
        fade: 0
      },
      effect: clipData.effect || { type: 'none', intensity: 0, speed: 1 },
      transitionIn: clipData.transitionIn || { id: 'trans-in', type: 'none', duration: 0.5 },
      keyframes: [],
      textConfig: clipData.textConfig,
      stickerConfig: clipData.stickerConfig
    };

    const newTracks = activeProject.tracks.map((t) =>
      t.id === targetTrack!.id ? { ...t, clips: [...t.clips, newClip] } : t
    );

    const maxEnd = Math.max(activeProject.duration, newClip.start + newClip.duration);
    updateProject({ ...activeProject, tracks: newTracks, duration: maxEnd });
    setSelectedClipId(newClip.id);
  };

  const handleSplitClip = (clipId: string) => {
    let splitDone = false;
    const newTracks = activeProject.tracks.map((track) => {
      const clip = track.clips.find((c) => c.id === clipId);
      if (!clip) return track;

      const clipEnd = clip.start + clip.duration;
      if (currentTime <= clip.start || currentTime >= clipEnd) return track;

      const firstDur = currentTime - clip.start;
      const secondDur = clip.duration - firstDur;

      const firstClip: Clip = { ...clip, duration: firstDur, sourceDuration: firstDur };
      const secondClip: Clip = {
        ...clip,
        id: `clip-${Date.now()}`,
        start: currentTime,
        duration: secondDur,
        sourceStart: clip.sourceStart + firstDur,
        sourceDuration: secondDur
      };

      splitDone = true;
      const filtered = track.clips.filter((c) => c.id !== clipId);
      return { ...track, clips: [...filtered, firstClip, secondClip] };
    });

    if (splitDone) {
      updateProject({ ...activeProject, tracks: newTracks });
    }
  };

  const handleDeleteClip = (clipId: string) => {
    const newTracks = activeProject.tracks.map((t) => ({
      ...t,
      clips: t.clips.filter((c) => c.id !== clipId)
    }));
    updateProject({ ...activeProject, tracks: newTracks });
    if (selectedClipId === clipId) setSelectedClipId(null);
  };

  // Drawer action dispatcher
  const handleDrawerAction = (action: DrawerAction) => {
    switch (action) {
      case 'nav_photo':
        setCreatorMode('photo');
        break;
      case 'nav_video':
        setCreatorMode('video');
        break;
      case 'nav_templates':
        setCreatorMode('templates');
        break;
      case 'tmpl_import':
      case 'tmpl_analyze_video':
      case 'tmpl_analyze_link':
        setShowImportModal(true);
        break;
      case 'tmpl_profile':
        if (templates.length > 0) setProfileTemplate(templates[0]);
        break;
      case 'ai_image_gen':
        setShowAiPhotoGenModal(true);
        break;
      case 'ai_photoshoot':
        setShowAiPhotoshootModal(true);
        break;
      case 'ai_img_to_img':
        setShowAiEditModal(true);
        break;
      case 'ai_style_match':
        setShowAiStyleMatchModal(true);
        break;
      case 'ai_inpaint_outpaint':
        setShowAiInpaintModal(true);
        break;
      case 'ai_upscale':
        setShowAiUpscaleModal(true);
        break;
      case 'ai_history':
        setShowAiHistoryModal(true);
        break;
      case 'ai_usage':
        setShowAiUsageModal(true);
        break;
      case 'ai_bg_remove':
        setCutoutSourceImg(photoStudioImage || activeProject.thumbnail || 'sample-photo');
        break;
      case 'ai_bg_replace':
        setBgReplaceSourceImg(photoStudioImage || activeProject.thumbnail || 'sample-photo');
        break;
      case 'ai_photo_to_video':
        setPhotoToVideoSourceImg(photoStudioImage || activeProject.thumbnail || 'sample-photo');
        break;
      case 'set_appearance':
        setIsThemeModalOpen(true);
        break;
      case 'set_storage':
      case 'tmpl_assets':
        setIsStorageModalOpen(true);
        break;
      case 'set_ai_providers':
        setShowAiProviderConfigModal(true);
        break;
      case 'set_export':
        setShowExportModal(true);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden select-none relative font-sans"
      style={{
        backgroundColor: theme.palette.bgApp,
        color: theme.palette.textPrimary
      }}
    >
      {/* 1. TOP APP BAR ("AI CREATOR STUDIO") */}
      <TopAppBar
        theme={theme}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => setIsDrawerOpen(true)}
        onOpenSettings={() => setIsThemeModalOpen(true)}
        onOpenStorage={() => setIsStorageModalOpen(true)}
        onOpenExport={() => setShowExportModal(true)}
        canUndo={historyStack.length > 0}
        canRedo={redoStack.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        isOnline={networkStatus === 'ONLINE'}
      />

      {/* 2. CREATOR AREA VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-hidden relative overflow-y-auto">
        {/* AREA 0: HOME SCREEN */}
        {creatorMode === 'home' && (
          <HomeView
            projects={projects}
            templates={templates}
            theme={theme}
            onNavigateMode={(mode) => setCreatorMode(mode)}
            onOpenProject={(proj) => {
              setActiveProject(proj);
              setCreatorMode('video');
            }}
            onCreateProject={() => {
              const p = ProjectStorageService.createNewProject('New Project', '16:9');
              setProjects(ProjectStorageService.getAllProjects());
              setActiveProject(p);
              setCreatorMode('video');
            }}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenSettings={() => setIsThemeModalOpen(true)}
            onOpenAiModal={(type) => {
              if (type === 'photoshoot') setShowAiPhotoshootModal(true);
              else if (type === 'photo-gen') setShowAiPhotoGenModal(true);
              else if (type === 'ai-edit') setShowAiEditModal(true);
              else if (type === 'style-match') setShowAiStyleMatchModal(true);
              else if (type === 'upscale') setShowAiUpscaleModal(true);
            }}
            onOpenPhotoStudio={() => setCreatorMode('photo')}
            onOpenTemplateStudio={() => setCreatorMode('templates')}
          />
        )}

        {/* AREA 1: PHOTO EDIT */}
        {creatorMode === 'photo' && (
          <PhotoStudioView
            theme={theme}
            initialImage={photoStudioImage}
            onOpenEdgeCutout={(img) => setCutoutSourceImg(img)}
            onOpenBgReplace={(img) => setBgReplaceSourceImg(img)}
            onOpenStyleMatch={(img) => setStyleMatchSourceImg(img)}
            onOpenPhotoToVideo={(img) => setPhotoToVideoSourceImg(img)}
            onOpenAiPhotoGen={() => setShowAiPhotoGenModal(true)}
            onOpenAiEdit={(img) => {
              setPhotoStudioImage(img);
              setShowAiEditModal(true);
            }}
            onOpenAiPhotoshoot={() => setShowAiPhotoshootModal(true)}
            onOpenAiUpscale={(img) => {
              setPhotoStudioImage(img);
              setShowAiUpscaleModal(true);
            }}
            onOpenAiInpaint={(img) => {
              setPhotoStudioImage(img);
              setShowAiInpaintModal(true);
            }}
          />
        )}

        {/* AREA 2: TEMPLATES STUDIO */}
        {creatorMode === 'templates' && (
          <TemplateStudioView
            theme={theme}
            templates={templates}
            onSelectTemplate={(tmpl) => setProfileTemplate(tmpl)}
            onUseTemplate={(tmpl) => setUseTemplateCandidate(tmpl)}
            onOpenImportModal={() => setShowImportModal(true)}
            onOpenCreateTemplateModal={() => setShowCreateTemplateModal(true)}
            onViewTemplateProfile={(tmpl) => setProfileTemplate(tmpl)}
            onToggleFavorite={(id) => {
              setTemplates((prev) =>
                prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
              );
            }}
          />
        )}

        {/* AREA 3: MULTI-TRACK VIDEO EDIT */}
        {creatorMode === 'video' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Top Video Preview */}
            <div className="h-[40vh] min-h-[220px] max-h-[380px] shrink-0 border-b flex flex-col" style={{ borderColor: theme.palette.borderSubtle }}>
              <VideoPreview
                project={activeProject}
                currentTime={currentTime}
                isPlaying={isPlaying}
                onPlayToggle={() => setIsPlaying(!isPlaying)}
                onSeek={(time) => setCurrentTime(time)}
                onSplitAtPlayhead={() => selectedClipId && handleSplitClip(selectedClipId)}
                selectedClip={selectedClip}
                onUpdateClipTransform={(clipId, updates) => handleUpdateClip(clipId, updates)}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
              />
            </div>

            {/* Multi-Track Timeline */}
            <div className="flex-1 flex flex-col min-h-0 relative">
              <MultiTrackTimeline
                project={activeProject}
                currentTime={currentTime}
                onSeek={(time) => setCurrentTime(time)}
                selectedClip={selectedClip}
                onSelectClip={(clip) => setSelectedClipId(clip ? clip.id : null)}
                onSplitClip={(clipId) => handleSplitClip(clipId)}
                onDuplicateClip={(clipId) => {
                  const track = activeProject.tracks.find((t) => t.clips.some((c) => c.id === clipId));
                  const clip = track?.clips.find((c) => c.id === clipId);
                  if (clip) {
                    handleAddClip({ ...clip, start: clip.start + clip.duration }, track?.type);
                  }
                }}
                onDeleteClip={handleDeleteClip}
                onTrimClip={(clipId, newStart, newDuration) => {
                  handleUpdateClip(clipId, { start: newStart, duration: newDuration });
                }}
                onToggleKeyframe={() => {}}
                onOpenTransitionModal={(clipId) => {
                  setSelectedClipId(clipId);
                  setActiveDrawer('transitions');
                }}
                onToggleReverse={(clipId) => {
                  if (selectedClip) handleUpdateClip(clipId, { reversed: !selectedClip.reversed });
                }}
                onFreezeFrame={() => {}}
              />
            </div>

            {/* Bottom Editing Tool Drawer (when an editing panel is active) */}
            {activeDrawer === 'media' && (
              <MediaDrawer
                currentTime={currentTime}
                onAddClip={(clip, trackType) => handleAddClip(clip, trackType)}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'audio' && (
              <AudioDrawer
                currentTime={currentTime}
                onAddClip={(clip, trackType) => handleAddClip(clip, trackType)}
                onUpdateBeats={(beats) => updateProject({ ...activeProject, beats })}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'text' && (
              <TextDrawer
                currentTime={currentTime}
                selectedClip={selectedClip}
                onAddTextClip={(config) => handleAddClip({ name: config.text, textConfig: config, duration: 4.0 }, 'text')}
                onUpdateTextConfig={(clipId, config) => handleUpdateClip(clipId, { textConfig: { ...(selectedClip?.textConfig as any), ...config } })}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'captions' && (
              <CaptionsDrawer
                currentTime={currentTime}
                projectDuration={activeProject.duration}
                onAddCaptionClips={(clips) => {
                  clips.forEach((c) => handleAddClip(c, 'text'));
                }}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'stickers' && (
              <StickersDrawer
                currentTime={currentTime}
                onAddStickerClip={(stickerConfig) => handleAddClip({ name: stickerConfig.content, stickerConfig, duration: 4.0 }, 'sticker')}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'effects' && (
              <EffectsDrawer
                currentTime={currentTime}
                selectedClip={selectedClip}
                onApplyClipEffect={(clipId, effect) => handleUpdateClip(clipId, { effect })}
                onAddEffectTrackClip={(effect) => handleAddClip({ effect, duration: 4.0 }, 'effect')}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'filters' && (
              <FiltersDrawer
                selectedClip={selectedClip}
                onUpdateAdjustments={(clipId, adjustments) => selectedClip && handleUpdateClip(clipId, { adjustments: { ...selectedClip.adjustments, ...adjustments } })}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'retouch' && (
              <RetouchDrawer
                selectedClip={selectedClip}
                onUpdateAdjustments={(clipId, adjustments) => selectedClip && handleUpdateClip(clipId, { adjustments: { ...selectedClip.adjustments, ...adjustments } })}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'transitions' && (
              <TransitionsDrawer
                selectedClip={selectedClip}
                onApplyTransition={(clipId, transition) => handleUpdateClip(clipId, { transitionIn: transition })}
                onApplyToAllCuts={(transition) => {
                  const newTracks = activeProject.tracks.map((t) => ({
                    ...t,
                    clips: t.clips.map((c) => ({ ...c, transitionIn: transition }))
                  }));
                  updateProject({ ...activeProject, tracks: newTracks });
                }}
                onClose={() => setActiveDrawer(null)}
              />
            )}
            {activeDrawer === 'speed' && (
              <SpeedDrawer
                selectedClip={selectedClip}
                onUpdateSpeed={(clipId, speed) => handleUpdateClip(clipId, { speed })}
                onToggleReverse={(clipId) => selectedClip && handleUpdateClip(clipId, { reversed: !selectedClip.reversed })}
                onClose={() => setActiveDrawer(null)}
              />
            )}

            {/* Horizontal Video Tool Selector Bar */}
            <div className="pb-16">
              <BottomToolBar activeDrawer={activeDrawer} onSelectDrawer={(drawer) => setActiveDrawer(drawer)} />
            </div>
          </div>
        )}
      </main>

      {/* 3. FLOATING PILL-SHAPED BOTTOM NAVIGATION DOCK */}
      <PillBottomDock
        currentMode={creatorMode}
        onModeChange={(mode) => {
          setCreatorMode(mode);
          setIsPlaying(false);
        }}
        theme={theme}
      />

      {/* 4. MODALS & DRAWERS */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAction={handleDrawerAction}
        theme={theme}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        theme={theme}
        templates={templates}
        projects={projects}
        onSelectTemplate={(t) => {
          setProfileTemplate(t);
          setCreatorMode('templates');
        }}
        onSelectProject={(p) => {
          setActiveProject(p);
          setCreatorMode('video');
        }}
        onSelectTool={(id) => handleDrawerAction(id as DrawerAction)}
      />

      <AppearanceThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        activeThemeId={activeThemeId}
        onSelectTheme={(id) => ThemeService.setTheme(id)}
        theme={theme}
      />

      <AiProviderSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        theme={theme}
      />

      <CrashRecoveryModal
        isOpen={showCrashModal}
        projectSnapshot={crashProject}
        onRecover={() => {
          if (crashProject) {
            setActiveProject(crashProject);
            setCreatorMode('video');
          }
          setShowCrashModal(false);
        }}
        onDiscard={() => {
          if (activeProject?.id) {
            localStorage.removeItem(`velocut_checkpoint_v1_${activeProject.id}`);
          }
          setShowCrashModal(false);
        }}
        theme={theme}
      />

      <ImportTemplateModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        existingTemplates={templates}
        onSaveTemplate={(newTmpl) => {
          LocalLibraryService.saveTemplate(newTmpl, 'Imported');
          setTemplates((prev) => [newTmpl, ...prev]);
          setCreatorMode('templates');
        }}
        onOpenExistingTemplate={(id) => {
          const found = templates.find((t) => t.id === id);
          if (found) setProfileTemplate(found);
        }}
        theme={theme}
      />

      <TemplateProfileModal
        isOpen={!!profileTemplate}
        onClose={() => setProfileTemplate(null)}
        template={profileTemplate}
        onUseTemplate={(t) => setUseTemplateCandidate(t)}
        onEditTemplate={(t) => {
          const prj = ProjectStorageService.createProjectFromTemplate(t);
          setActiveProject(prj);
          setCreatorMode('video');
        }}
        onDuplicateTemplate={(t) => {
          const dup: TemplateDefinition = {
            ...t,
            id: `tmpl_dup_${Date.now()}`,
            title: `${t.title} (Copy)`,
            importDate: Date.now()
          };
          LocalLibraryService.saveTemplate(dup, 'Saved');
          setTemplates((prev) => [dup, ...prev]);
        }}
        onExportTemplate={(t) => {
          const blob = new Blob([JSON.stringify(t, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${t.title.replace(/\s+/g, '_')}_template.json`;
          a.click();
        }}
        onToggleFavorite={(id) => {
          setTemplates((prev) =>
            prev.map((t) => (t.id === id ? { ...t, isFavorite: !t.isFavorite } : t))
          );
        }}
        onDeleteTemplate={(id) => {
          LocalLibraryService.deleteTemplate(id, 'Saved');
          LocalLibraryService.deleteTemplate(id, 'Imported');
          setTemplates((prev) => prev.filter((t) => t.id !== id));
        }}
        theme={theme}
      />

      <UseTemplateModal
        isOpen={!!useTemplateCandidate}
        onClose={() => setUseTemplateCandidate(null)}
        template={useTemplateCandidate}
        onApplySuccess={(newProj) => {
          setActiveProject(newProj);
          setCreatorMode('video');
        }}
        theme={theme}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        activeProject={activeProject}
        onSaveTemplate={(newTmpl) => {
          LocalLibraryService.saveTemplate(newTmpl, 'Saved');
          setTemplates((prev) => [newTmpl, ...prev]);
          setCreatorMode('templates');
        }}
        theme={theme}
      />

      {/* Photo AI Sub-modals */}
      {cutoutSourceImg && (
        <EdgeCutoutModal
          isOpen={!!cutoutSourceImg}
          onClose={() => setCutoutSourceImg(null)}
          imageSrc={cutoutSourceImg}
          onApplyCutout={(cutoutUrl) => {
            setPhotoStudioImage(cutoutUrl);
            setCutoutSourceImg(null);
          }}
          theme={theme}
        />
      )}

      {bgReplaceSourceImg && (
        <BackgroundReplaceModal
          isOpen={!!bgReplaceSourceImg}
          onClose={() => setBgReplaceSourceImg(null)}
          imageSrc={bgReplaceSourceImg}
          onApplyResult={(resUrl) => {
            setPhotoStudioImage(resUrl);
            setBgReplaceSourceImg(null);
          }}
          theme={theme}
        />
      )}

      {styleMatchSourceImg && (
        <StyleMatchModal
          isOpen={!!styleMatchSourceImg}
          onClose={() => setStyleMatchSourceImg(null)}
          userImageSrc={styleMatchSourceImg}
          onApplyResult={(resUrl) => {
            setPhotoStudioImage(resUrl);
            setStyleMatchSourceImg(null);
          }}
          theme={theme}
        />
      )}

      {photoToVideoSourceImg && (
        <PhotoToVideoModal
          isOpen={!!photoToVideoSourceImg}
          onClose={() => setPhotoToVideoSourceImg(null)}
          imageSrc={photoToVideoSourceImg}
          onGenerateVideoProject={({ motionPreset, duration }) => {
            handleAddClip({ name: `Motion ${motionPreset}`, src: photoToVideoSourceImg, duration }, 'video');
            setCreatorMode('video');
            setPhotoToVideoSourceImg(null);
          }}
          theme={theme}
        />
      )}

      {showExportModal && (
        <ExportModal
          project={activeProject}
          isPro={isPro}
          onOpenPro={() => setShowProModal(true)}
          onClose={() => setShowExportModal(false)}
        />
      )}

      <StorageManagerModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        activeProject={activeProject}
        onStorageCleaned={() => {
          setProjects(ProjectStorageService.getAllProjects());
        }}
      />

      {/* Cloud AI Studio Modals */}
      <AiPhotoGeneratorModal
        isOpen={showAiPhotoGenModal}
        onClose={() => setShowAiPhotoGenModal(false)}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiEditModal
        isOpen={showAiEditModal}
        onClose={() => setShowAiEditModal(false)}
        initialImageDataUrl={photoStudioImage || undefined}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiPhotoshootModal
        isOpen={showAiPhotoshootModal}
        onClose={() => setShowAiPhotoshootModal(false)}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiStyleMatchModal
        isOpen={showAiStyleMatchModal}
        onClose={() => setShowAiStyleMatchModal(false)}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiInpaintingModal
        isOpen={showAiInpaintModal}
        onClose={() => setShowAiInpaintModal(false)}
        initialImageDataUrl={photoStudioImage || undefined}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiUpscalerModal
        isOpen={showAiUpscaleModal}
        onClose={() => setShowAiUpscaleModal(false)}
        initialImageDataUrl={photoStudioImage || undefined}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiHistoryModal
        isOpen={showAiHistoryModal}
        onClose={() => setShowAiHistoryModal(false)}
        onOpenInEditor={(img) => {
          setPhotoStudioImage(img);
          setCreatorMode('photo');
        }}
      />

      <AiUsageModal
        isOpen={showAiUsageModal}
        onClose={() => setShowAiUsageModal(false)}
      />

      <AiProviderConfigModal
        isOpen={showAiProviderConfigModal}
        onClose={() => setShowAiProviderConfigModal(false)}
      />

      {showProModal && (
        <ProModal
          isPro={isPro}
          onTogglePro={() => {
            const next = !isPro;
            setIsPro(next);
            ProjectStorageService.setPro(next);
            setShowProModal(false);
          }}
          onClose={() => setShowProModal(false)}
        />
      )}

      {isAppLocked && (
        <PinLockScreen
          onUnlock={() => setIsAppLocked(false)}
          forceSetup={false}
        />
      )}

      <CameraCaptureModal
        isOpen={showLiveCamera}
        onClose={() => setShowLiveCamera(false)}
        onMediaCaptured={(media, destination) => {
          if (destination === 'photo') {
            setPhotoStudioImage(media.url);
            setCreatorMode('photo');
          } else {
            handleAddClip({ name: media.name, type: 'video', duration: 10, src: media.url, start: currentTime }, 'video');
            setCreatorMode('video');
          }
        }}
      />
    </div>
  );
}
