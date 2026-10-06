import { Project, Track, Clip, TemplateDefinition } from '../types/editor';
import { SAMPLE_VIDEOS, MUSIC_TRACKS, TEMPLATES } from '../data/sampleMedia';

const STORAGE_KEY = 'velocut_projects_v1';
const PRO_STATUS_KEY = 'velocut_pro_unlocked';

export class ProjectStorageService {
  // Check if Pro subscription is unlocked
  public static isPro(): boolean {
    return localStorage.getItem(PRO_STATUS_KEY) === 'true';
  }

  public static setPro(unlocked: boolean) {
    localStorage.setItem(PRO_STATUS_KEY, unlocked ? 'true' : 'false');
  }

  // Cleanly clone/sanitize an object, stripping circular references, DOM nodes, or functions
  public static sanitizeProject<T>(input: T): T {
    try {
      const seen = new WeakSet();
      const stringified = JSON.stringify(input, (_key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return undefined; // prevent circular references from blowing the call stack
          }
          seen.add(value);
          if (value instanceof Node || (typeof Window !== 'undefined' && value instanceof Window) || typeof value === 'function') {
            return undefined;
          }
        }
        return value;
      });
      return JSON.parse(stringified);
    } catch (e) {
      console.warn('Project serialization fallback applied', e);
      try {
        return JSON.parse(JSON.stringify(input));
      } catch {
        return input;
      }
    }
  }

  // Raw helper to fetch existing projects directly from localStorage without triggering starter creation
  private static getStoredProjectsRaw(): Project[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse projects from storage', e);
    }
    return [];
  }

  // Load all projects
  public static getAllProjects(): Project[] {
    const stored = this.getStoredProjectsRaw();
    if (stored.length > 0) {
      return stored;
    }

    // If no projects exist in storage, create default starter project and persist directly
    const defaultProj = this.createDefaultStarterProject();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultProj]));
    } catch (e) {
      console.error('Failed to save default starter project', e);
    }
    return [defaultProj];
  }

  // Save or update a project
  public static saveProject(project: Project) {
    try {
      const sanitized = this.sanitizeProject(project);
      const existing = this.getStoredProjectsRaw().filter(p => p.id !== sanitized.id);
      const updated = [{ ...sanitized, updatedAt: Date.now() }, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save project', e);
    }
  }

  // Load versions for a project
  public static getProjectVersions(projectId: string): (Project & { versionName: string })[] {
    try {
      const data = localStorage.getItem(`velocut_versions_v1_${projectId}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  // Save new version checkpoint
  public static saveProjectVersion(projectId: string, project: Project, versionName?: string): (Project & { versionName: string })[] {
    try {
      const versions = this.getProjectVersions(projectId);
      const newVerNum = versions.length + 1;
      const finalName = versionName || `Version ${newVerNum} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
      
      const cleanProject = this.sanitizeProject(project);
      const newVersionSnapshot: Project & { versionName: string } = {
        ...cleanProject,
        id: `${projectId}_v_${Date.now()}`,
        versionName: finalName,
        updatedAt: Date.now()
      };

      const updated = [newVersionSnapshot, ...versions];
      localStorage.setItem(`velocut_versions_v1_${projectId}`, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save project version', e);
      return [];
    }
  }

  // Restore project to selected version snapshot
  public static restoreProjectVersion(projectId: string, snapshotId: string): Project | null {
    try {
      const versions = this.getProjectVersions(projectId);
      const found = versions.find(v => v.id === snapshotId);
      if (!found) return null;

      const restored: Project = {
        ...this.sanitizeProject(found),
        id: projectId,
        updatedAt: Date.now()
      };
      
      this.saveProject(restored);
      return restored;
    } catch (e) {
      console.error('Failed to restore project version', e);
      return null;
    }
  }

  // Delete version snapshot
  public static deleteProjectVersion(projectId: string, snapshotId: string) {
    try {
      const versions = this.getProjectVersions(projectId);
      const filtered = versions.filter(v => v.id !== snapshotId);
      localStorage.setItem(`velocut_versions_v1_${projectId}`, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete version', e);
    }
  }

  // Delete project
  public static deleteProject(id: string) {
    try {
      const existing = this.getStoredProjectsRaw().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error('Failed to delete project', e);
    }
  }

  // Duplicate project
  public static duplicateProject(id: string): Project | null {
    const all = this.getAllProjects();
    const original = all.find(p => p.id === id);
    if (!original) return null;

    const dup: Project = {
      ...this.sanitizeProject(original),
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: `${original.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.saveProject(dup);
    return dup;
  }

  // Create empty new project
  public static createNewProject(name = 'New Project', aspectRatio = '9:16'): Project {
    const id = `proj_${Date.now()}`;
    const newProj: Project = {
      id,
      name,
      aspectRatio: aspectRatio as any,
      duration: 10.0,
      fps: 30,
      tracks: [
        { id: 'track-v1', name: 'Main Video', type: 'video', clips: [] },
        { id: 'track-v2', name: 'Overlay', type: 'video', clips: [] },
        { id: 'track-t1', name: 'Text & Captions', type: 'text', clips: [] },
        { id: 'track-s1', name: 'Stickers', type: 'sticker', clips: [] },
        { id: 'track-e1', name: 'Effects', type: 'effect', clips: [] },
        { id: 'track-a1', name: 'Audio Music', type: 'audio', clips: [] }
      ],
      beats: [],
      canvasBackground: {
        type: 'color',
        color: '#000000',
        blurAmount: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.saveProject(newProj);
    return newProj;
  }

  // Create Project from Template
  public static createProjectFromTemplate(template: TemplateDefinition): Project {
    const id = `proj_${Date.now()}`;
    const videoClips: Clip[] = [];
    const textClips: Clip[] = [];
    const effectClips: Clip[] = [];

    // Map template slots into real timeline clips
    template.slots.forEach((slot, idx) => {
      const sample = SAMPLE_VIDEOS[idx % SAMPLE_VIDEOS.length];
      const clipId = `clip-v-${idx}`;
      videoClips.push({
        id: clipId,
        trackId: 'track-v1',
        type: slot.suggestedType,
        name: `${template.title} #${idx + 1}`,
        start: slot.startTime,
        duration: slot.duration,
        sourceStart: 0,
        sourceDuration: slot.duration,
        src: sample.url,
        x: 0,
        y: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        speed: 1,
        reversed: false,
        volume: 1,
        fadeIn: 0,
        fadeOut: 0,
        adjustments: {
          brightness: 0,
          contrast: 10,
          saturation: 15,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
          sharpen: 0,
          vignette: 15,
          fade: 0
        },
        effect: {
          type: slot.effect || 'none',
          intensity: 40,
          speed: 1
        },
        transitionIn: {
          id: `trans-${idx}`,
          type: slot.transition || 'none',
          duration: 0.35
        },
        keyframes: []
      });

      if (slot.textOverlay) {
        textClips.push({
          id: `clip-t-${idx}`,
          trackId: 'track-t1',
          type: 'text',
          name: slot.textOverlay,
          start: slot.startTime + 0.1,
          duration: Math.max(1, slot.duration - 0.2),
          sourceStart: 0,
          sourceDuration: slot.duration,
          x: 0,
          y: 30, // bottom thirds for mobile
          scale: 1,
          rotation: 0,
          opacity: 1,
          speed: 1,
          reversed: false,
          volume: 0,
          fadeIn: 0,
          fadeOut: 0,
          adjustments: {} as any,
          effect: { type: 'none', intensity: 0, speed: 1 },
          textConfig: {
            text: slot.textOverlay,
            fontFamily: 'Montserrat',
            fontSize: 48,
            color: '#ffffff',
            bold: true,
            italic: false,
            letterSpacing: 1,
            lineSpacing: 1.2,
            align: 'center',
            gradient: { enabled: true, startColor: '#facc15', endColor: '#f97316', angle: 0 },
            stroke: { enabled: true, color: '#000000', width: 6 },
            shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 2, offsetY: 2 },
            glow: { enabled: false, color: '#38bdf8', intensity: 30 },
            backgroundBox: { enabled: true, color: 'rgba(0,0,0,0.6)', padding: 14, borderRadius: 10 },
            animation: 'pop'
          },
          keyframes: []
        });
      }
    });

    const music = MUSIC_TRACKS.find(m => m.id === template.audioTrack.src) || MUSIC_TRACKS[0];

    const project: Project = {
      id,
      name: `${template.title} Reel`,
      aspectRatio: template.aspectRatio,
      duration: template.duration,
      fps: 30,
      tracks: [
        { id: 'track-v1', name: 'Main Video', type: 'video', clips: videoClips },
        { id: 'track-v2', name: 'Overlay', type: 'video', clips: [] },
        { id: 'track-t1', name: 'Text & Captions', type: 'text', clips: textClips },
        { id: 'track-s1', name: 'Stickers', type: 'sticker', clips: [] },
        { id: 'track-e1', name: 'Effects', type: 'effect', clips: effectClips },
        {
          id: 'track-a1',
          name: 'Audio Track',
          type: 'audio',
          clips: [
            {
              id: 'audio-main',
              trackId: 'track-a1',
              type: 'audio',
              name: template.audioTrack.title,
              start: 0,
              duration: template.duration,
              sourceStart: 0,
              sourceDuration: template.duration,
              src: template.audioTrack.src,
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 1,
              fadeIn: 0.2,
              fadeOut: 0.5,
              adjustments: {} as any,
              effect: { type: 'none', intensity: 0, speed: 1 },
              keyframes: []
            }
          ]
        }
      ],
      beats: music.beats,
      canvasBackground: {
        type: 'color',
        color: '#000000',
        blurAmount: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.saveProject(project);
    return project;
  }

  // Create default starter project with rich multi-track content
  private static createDefaultStarterProject(): Project {
    const id = 'starter-project-01';
    const proj: Project = {
      id,
      name: 'Viral TikTok Demo',
      aspectRatio: '9:16',
      duration: 10.0,
      fps: 30,
      tracks: [
        {
          id: 'track-v1',
          name: 'Main Video',
          type: 'video',
          clips: [
            {
              id: 'clip-v1',
              trackId: 'track-v1',
              type: 'video',
              name: 'Tokyo Cyber Night',
              start: 0,
              duration: 5.0,
              sourceStart: 0,
              sourceDuration: 5.0,
              src: 'sample-video-cyber',
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 1,
              fadeIn: 0,
              fadeOut: 0,
              adjustments: {
                brightness: 5,
                contrast: 20,
                saturation: 30,
                temperature: -10,
                tint: 15,
                highlights: 0,
                shadows: 0,
                sharpen: 10,
                vignette: 20,
                fade: 0
              },
              effect: { type: 'none', intensity: 0, speed: 1 },
              transitionIn: { id: 't1', type: 'none', duration: 0.4 },
              keyframes: []
            },
            {
              id: 'clip-v2',
              trackId: 'track-v1',
              type: 'video',
              name: 'Golden Sunset Surf',
              start: 5.0,
              duration: 5.0,
              sourceStart: 0,
              sourceDuration: 5.0,
              src: 'sample-video-sunset',
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 1,
              fadeIn: 0,
              fadeOut: 0,
              adjustments: {
                brightness: 4,
                contrast: 15,
                saturation: 25,
                temperature: 20,
                tint: -5,
                highlights: 0,
                shadows: 0,
                sharpen: 0,
                vignette: 15,
                fade: 0
              },
              effect: { type: 'none', intensity: 0, speed: 1 },
              transitionIn: { id: 't2', type: 'glitch', duration: 0.4 },
              keyframes: []
            }
          ]
        },
        {
          id: 'track-t1',
          name: 'Text & Captions',
          type: 'text',
          clips: [
            {
              id: 'clip-t1',
              trackId: 'track-t1',
              type: 'text',
              name: 'Hook Title',
              start: 0.2,
              duration: 4.5,
              sourceStart: 0,
              sourceDuration: 4.5,
              x: 0,
              y: -25,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 0,
              fadeIn: 0,
              fadeOut: 0,
              adjustments: {} as any,
              effect: { type: 'none', intensity: 0, speed: 1 },
              textConfig: {
                text: 'LEVEL UP YOUR SHORTS 🔥',
                fontFamily: 'Montserrat',
                fontSize: 52,
                color: '#ffffff',
                bold: true,
                italic: false,
                letterSpacing: 2,
                lineSpacing: 1.2,
                align: 'center',
                gradient: { enabled: true, startColor: '#38bdf8', endColor: '#ec4899', angle: 0 },
                stroke: { enabled: true, color: '#000000', width: 7 },
                shadow: { enabled: true, color: 'rgba(0,0,0,0.9)', blur: 12, offsetX: 3, offsetY: 3 },
                glow: { enabled: true, color: '#38bdf8', intensity: 40 },
                backgroundBox: { enabled: true, color: 'rgba(15, 23, 42, 0.75)', padding: 14, borderRadius: 12 },
                animation: 'pop'
              },
              keyframes: []
            },
            {
              id: 'clip-t2',
              trackId: 'track-t1',
              type: 'text',
              name: 'Dynamic Subtitle',
              start: 5.2,
              duration: 4.5,
              sourceStart: 0,
              sourceDuration: 4.5,
              x: 0,
              y: 28,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 0,
              fadeIn: 0,
              fadeOut: 0,
              adjustments: {} as any,
              effect: { type: 'none', intensity: 0, speed: 1 },
              textConfig: {
                text: 'Fast · Magnetic · Pro',
                fontFamily: 'Montserrat',
                fontSize: 44,
                color: '#facc15',
                bold: true,
                italic: false,
                letterSpacing: 1,
                lineSpacing: 1.2,
                align: 'center',
                gradient: { enabled: false, startColor: '', endColor: '', angle: 0 },
                stroke: { enabled: true, color: '#000000', width: 6 },
                shadow: { enabled: true, color: 'rgba(0,0,0,0.8)', blur: 8, offsetX: 2, offsetY: 2 },
                glow: { enabled: false, color: '', intensity: 0 },
                backgroundBox: { enabled: true, color: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
                animation: 'slide'
              },
              keyframes: []
            }
          ]
        },
        {
          id: 'track-s1',
          name: 'Stickers',
          type: 'sticker',
          clips: [
            {
              id: 'clip-s1',
              trackId: 'track-s1',
              type: 'sticker',
              name: 'Fire Badge',
              start: 0.5,
              duration: 4.0,
              sourceStart: 0,
              sourceDuration: 4.0,
              x: 32,
              y: -25,
              scale: 1,
              rotation: -10,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 0,
              fadeIn: 0,
              fadeOut: 0,
              adjustments: {} as any,
              effect: { type: 'none', intensity: 0, speed: 1 },
              stickerConfig: {
                type: 'emoji',
                content: '🔥',
                width: 90,
                height: 90
              },
              keyframes: []
            }
          ]
        },
        {
          id: 'track-a1',
          name: 'Audio Music',
          type: 'audio',
          clips: [
            {
              id: 'clip-a1',
              trackId: 'track-a1',
              type: 'audio',
              name: 'Midnight Drift',
              start: 0,
              duration: 10.0,
              sourceStart: 0,
              sourceDuration: 10.0,
              src: 'track-phonk-drift',
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              speed: 1,
              reversed: false,
              volume: 1,
              fadeIn: 0.1,
              fadeOut: 0.5,
              adjustments: {} as any,
              effect: { type: 'none', intensity: 0, speed: 1 },
              keyframes: []
            }
          ]
        }
      ],
      beats: MUSIC_TRACKS[0].beats,
      canvasBackground: {
        type: 'color',
        color: '#000000',
        blurAmount: 0
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return proj;
  }
}
