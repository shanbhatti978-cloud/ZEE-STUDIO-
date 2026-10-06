import React, { useState } from 'react';
import { FolderGit2, Plus, Copy, Trash2, Edit3, Clock, Check, Film, ArrowRight, HardDrive } from 'lucide-react';
import { Project, AspectRatio } from '../../types/editor';

interface ProjectsViewProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (project: Project) => void;
  onCreateNewProject: (name: string, aspectRatio: AspectRatio) => void;
  onDuplicateProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onOpenStorageManager?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onRenameProject,
  onOpenStorageManager,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('Untitled Reel');
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('9:16');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameVal, setEditNameVal] = useState('');

  const ratios: { id: AspectRatio; label: string; desc: string }[] = [
    { id: '9:16', label: '9:16 Vertical', desc: 'TikTok, Reels, Shorts' },
    { id: '1:1', label: '1:1 Square', desc: 'Instagram Feed' },
    { id: '4:5', label: '4:5 Portrait', desc: 'Instagram Post' },
    { id: '16:9', label: '16:9 Landscape', desc: 'YouTube' },
    { id: '3:4', label: '3:4 Feed', desc: 'Standard' },
  ];

  const handleCreate = () => {
    onCreateNewProject(newProjectName.trim() || 'Untitled Reel', selectedRatio);
    setShowNewModal(false);
    setNewProjectName('Untitled Reel');
  };

  const handleSaveRename = (id: string) => {
    if (editNameVal.trim()) {
      onRenameProject(id, editNameVal.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0e16] p-4 select-none pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 size={20} className="text-sky-400" />
            <span>My Projects & Drafts</span>
          </h2>
          <p className="text-xs text-slate-400">
            Offline local storage with automatic draft recovery and instant cloning
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenStorageManager && (
            <button
              onClick={onOpenStorageManager}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-sm"
              title="Clean unused assets & manage disk space"
            >
              <HardDrive size={14} className="text-sky-400" />
              <span>Storage Manager</span>
            </button>
          )}

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-500/25 active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const totalClips = proj.tracks.reduce((sum, t) => sum + t.clips.length, 0);

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className={`rounded-2xl p-4 bg-slate-900/80 border transition-all cursor-pointer flex flex-col justify-between group ${
                isActive
                  ? 'border-sky-500 ring-1 ring-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700">
                    {proj.aspectRatio} · {proj.fps} FPS
                  </span>

                  {isActive && (
                    <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">
                      CURRENT
                    </span>
                  )}
                </div>

                {editingId === proj.id ? (
                  <div
                    className="flex items-center gap-1 my-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editNameVal}
                      onChange={(e) => setEditNameVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(proj.id)}
                      autoFocus
                      className="bg-slate-800 border border-sky-500 rounded px-2 py-1 text-xs text-white outline-none w-full"
                    />
                    <button
                      onClick={() => handleSaveRename(proj.id)}
                      className="p-1 bg-sky-500 text-slate-950 rounded"
                    >
                      <Check size={13} />
                    </button>
                  </div>
                ) : (
                  <h3 className="text-sm font-extrabold text-white group-hover:text-sky-300 transition-colors truncate">
                    {proj.name}
                  </h3>
                )}

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" />
                    <span>{proj.duration.toFixed(1)}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Film size={12} className="text-indigo-400" />
                    <span>{totalClips} Layer Clips</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingId(proj.id);
                      setEditNameVal(proj.name);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="Rename"
                  >
                    <Edit3 size={13} />
                  </button>

                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    className="p-1.5 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 transition-colors"
                    title="Duplicate project"
                  >
                    <Copy size={13} />
                  </button>

                  {projects.length > 1 && (
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => onSelectProject(proj)}
                  className="flex items-center gap-1 text-xs font-bold text-sky-400 hover:text-sky-300"
                >
                  <span>Open</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-slate-700 rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-sm font-extrabold text-white mb-3">Create New Project</h3>

            <div className="mb-3">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Video Project"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-sky-500 outline-none"
              />
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Target Platform & Ratio
              </label>
              <div className="flex flex-col gap-1.5">
                {ratios.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`p-2 rounded-xl border text-left flex items-center justify-between transition-colors ${
                      selectedRatio === r.id
                        ? 'bg-sky-500/15 border-sky-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs">{r.label}</span>
                    <span className="text-[10px] text-slate-500">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowNewModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
