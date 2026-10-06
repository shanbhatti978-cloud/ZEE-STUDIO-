/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Image as ImageIcon,
  Film,
  LayoutTemplate,
  Plus,
  Search,
  Settings,
  FolderOpen,
  Clock,
  ArrowRight,
  Upload,
  Link as LinkIcon,
  Wand2,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Camera,
  Play
} from 'lucide-react';
import { Project, TemplateDefinition } from '../../types/editor';
import { AppTheme } from '../../types/theme';

interface HomeViewProps {
  projects: Project[];
  templates: TemplateDefinition[];
  theme: AppTheme;
  onNavigateMode: (mode: 'home' | 'photo' | 'templates' | 'video') => void;
  onOpenProject: (project: Project) => void;
  onCreateProject: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenAiModal: (modalType: string) => void;
  onOpenPhotoStudio: () => void;
  onOpenTemplateStudio: () => void;
  onDeleteProject?: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  templates,
  theme,
  onNavigateMode,
  onOpenProject,
  onCreateProject,
  onOpenSearch,
  onOpenSettings,
  onOpenAiModal,
  onOpenPhotoStudio,
  onOpenTemplateStudio,
  onDeleteProject
}) => {
  const p = theme.palette;
  const recentProjects = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);
  const continueProject = recentProjects[0];
  const savedTemplates = templates.filter(t => t.category === 'Saved' || t.category === 'Imported');

  return (
    <div className="min-h-screen pb-32 pt-4 px-4 sm:px-6 max-w-4xl mx-auto select-none animate-fadeIn">
      {/* Top Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            ZEE STUDIO
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Professional Cloud AI Creative Suite</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSearch}
            className="p-2.5 rounded-2xl glossy-card hover:scale-105 active:scale-95 transition-all text-slate-300 hover:text-white"
            title="Global Search"
          >
            <Search size={18} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl glossy-card hover:scale-105 active:scale-95 transition-all text-slate-300 hover:text-white"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Creation Grid */}
      <section className="mb-6">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Create & Edit
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigateMode('photo')}
            className="glossy-card p-4 rounded-3xl text-left flex flex-col justify-between group hover:border-sky-500/40"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500/20 to-blue-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
              <ImageIcon size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white mb-0.5">Photo Edit</h3>
              <p className="text-[10px] text-slate-400">Retouch, AI & Adjust</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateMode('video')}
            className="glossy-card p-4 rounded-3xl text-left flex flex-col justify-between group hover:border-indigo-500/40"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 transition-transform">
              <Film size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white mb-0.5">Video Edit</h3>
              <p className="text-[10px] text-slate-400">Multi-track timeline</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateMode('templates')}
            className="glossy-card p-4 rounded-3xl text-left flex flex-col justify-between group hover:border-purple-500/40"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/25 to-pink-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white mb-0.5">Templates</h3>
              <p className="text-[10px] text-slate-400">AI photo & video</p>
            </div>
          </button>

          <button
            onClick={() => onOpenAiModal('photoshoot')}
            className="glossy-card p-4 rounded-3xl text-left flex flex-col justify-between group hover:border-emerald-500/40"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white mb-0.5">AI Tools</h3>
              <p className="text-[10px] text-slate-400">Cloud AI engine</p>
            </div>
          </button>
        </div>
      </section>

      {/* Quick Action Area */}
      <section className="mb-6">
        <div className="glass-panel p-4 rounded-3xl flex items-center justify-around gap-2">
          <button
            onClick={onCreateProject}
            className="flex-1 py-2.5 px-3 rounded-2xl glossy-button text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Plus size={15} />
            <span>New Project</span>
          </button>
          <button
            onClick={() => onOpenAiModal('photo-gen')}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Wand2 size={15} className="text-sky-400" />
            <span>AI Gen</span>
          </button>
          <button
            onClick={() => onNavigateMode('templates')}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <LinkIcon size={15} className="text-purple-400" />
            <span>Templates</span>
          </button>
        </div>
      </section>

      {/* Continue Editing Section */}
      {continueProject && (
        <section className="mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Continue Editing
          </div>
          <div
            onClick={() => onOpenProject(continueProject)}
            className="glossy-card p-4 rounded-3xl flex items-center gap-4 cursor-pointer group hover:border-sky-500/50"
          >
            <div className="w-20 aspect-video rounded-2xl bg-slate-800 overflow-hidden relative flex-shrink-0 border border-slate-700">
              {continueProject.thumbnail ? (
                <img src={continueProject.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Film size={18} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play size={20} className="text-white fill-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-400 text-[9px] font-mono font-bold border border-sky-500/30 uppercase">
                  {continueProject.aspectRatio}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(continueProject.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mb-1">{continueProject.name}</h4>
              <p className="text-[11px] text-slate-400">Duration: {continueProject.duration.toFixed(1)}s • {continueProject.tracks.length} tracks</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-all">
              <ArrowRight size={16} />
            </div>
          </div>
        </section>
      )}

      {/* Recent Projects Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recent Projects ({projects.length})
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {projects.slice(0, 6).map((proj) => (
              <div
                key={proj.id}
                onClick={() => onOpenProject(proj)}
                className="glossy-card p-3 rounded-2xl group cursor-pointer hover:border-sky-500/40 flex flex-col justify-between"
              >
                <div className="aspect-video rounded-xl bg-slate-800 overflow-hidden relative mb-2.5 border border-slate-700/60">
                  {proj.thumbnail ? (
                    <img src={proj.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <FolderOpen size={20} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono text-white">
                    {proj.duration.toFixed(1)}s
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate mb-0.5">{proj.name}</h4>
                  <p className="text-[10px] text-slate-400">{proj.aspectRatio}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glossy-card p-8 rounded-3xl text-center">
            <FolderOpen size={32} className="mx-auto text-slate-500 mb-2" />
            <div className="text-xs font-bold text-white mb-1">No projects yet</div>
            <p className="text-[11px] text-slate-400 mb-4">Create your first photo or video project to get started.</p>
            <button
              onClick={onCreateProject}
              className="px-4 py-2 glossy-button text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Create Project</span>
            </button>
          </div>
        )}
      </section>

      {/* My Templates Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            My Templates ({savedTemplates.length})
          </div>
          <button
            onClick={onOpenTemplateStudio}
            className="text-xs text-sky-400 hover:underline font-semibold flex items-center gap-1"
          >
            <span>Browse All</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {savedTemplates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {savedTemplates.slice(0, 3).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={onOpenTemplateStudio}
                className="glossy-card p-3 rounded-2xl group cursor-pointer hover:border-purple-500/40"
              >
                <div className="aspect-[3/4] rounded-xl bg-slate-800 overflow-hidden relative mb-2.5 border border-slate-700/60">
                  <img src={tmpl.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <h4 className="text-xs font-bold text-white truncate mb-0.5">{tmpl.title}</h4>
                <p className="text-[10px] text-purple-400 capitalize">{tmpl.category} Template</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glossy-card p-6 rounded-3xl text-center">
            <LayoutTemplate size={28} className="mx-auto text-slate-500 mb-2" />
            <div className="text-xs font-bold text-white mb-1">No saved templates</div>
            <p className="text-[11px] text-slate-400 mb-3">Save your favorite creations as templates for quick reuse.</p>
            <button
              onClick={onOpenTemplateStudio}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Explore Templates
            </button>
          </div>
        )}
      </section>

      {/* Compact AI Tools Section */}
      <section>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Advanced Cloud AI Tools
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onOpenAiModal('photoshoot')}
            className="glass-panel p-3 rounded-2xl text-left hover:border-sky-500/40 transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0">
              <Camera size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">AI Photoshoot</div>
              <div className="text-[9px] text-slate-400">Virtual studio</div>
            </div>
          </button>

          <button
            onClick={() => onOpenAiModal('ai-edit')}
            className="glass-panel p-3 rounded-2xl text-left hover:border-purple-500/40 transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <Wand2 size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">AI Edit & Inpaint</div>
              <div className="text-[9px] text-slate-400">Object removal</div>
            </div>
          </button>

          <button
            onClick={() => onOpenAiModal('style-match')}
            className="glass-panel p-3 rounded-2xl text-left hover:border-emerald-500/40 transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Style Match</div>
              <div className="text-[9px] text-slate-400">Transfer aesthetics</div>
            </div>
          </button>

          <button
            onClick={() => onOpenAiModal('upscale')}
            className="glass-panel p-3 rounded-2xl text-left hover:border-amber-500/40 transition-all flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Zap size={16} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">AI Upscale</div>
              <div className="text-[9px] text-slate-400">High resolution</div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
