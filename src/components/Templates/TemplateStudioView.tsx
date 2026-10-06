import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  DownloadCloud,
  Sparkles,
  Play,
  Heart,
  UserCheck,
  Share2,
  Clock,
  Layers,
  FileVideo,
  Filter,
  CheckCircle2,
  Copy,
  LayoutTemplate
} from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { TemplateDefinition, TemplateCategory } from '../../types/editor';

interface TemplateStudioViewProps {
  theme: AppTheme;
  templates: TemplateDefinition[];
  onSelectTemplate: (template: TemplateDefinition) => void;
  onUseTemplate: (template: TemplateDefinition) => void;
  onOpenImportModal: () => void;
  onOpenCreateTemplateModal: () => void;
  onViewTemplateProfile: (template: TemplateDefinition) => void;
  onToggleFavorite: (templateId: string) => void;
}

export const TemplateStudioView: React.FC<TemplateStudioViewProps> = ({
  theme,
  templates,
  onSelectTemplate,
  onUseTemplate,
  onOpenImportModal,
  onOpenCreateTemplateModal,
  onViewTemplateProfile,
  onToggleFavorite
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Trending');
  const [searchQuery, setSearchQuery] = useState('');
  const p = theme.palette;

  const categories: string[] = [
    'Trending',
    'Photo Templates',
    'Video Templates',
    'AI Templates',
    'Beat Sync',
    'Velocity',
    'Slow Motion',
    'Cinematic',
    'Urdu',
    'Arabic',
    'English',
    'Chinese',
    'Instagram',
    'TikTok',
    'YouTube Shorts',
    'Reels',
    'Travel',
    'Fashion',
    'Portrait',
    'Wedding',
    'Birthday',
    'Love',
    'Motivational',
    '3D',
    'Glitch',
    'Flash',
    'Zoom',
    'Transition',
    'Before/After',
    'Collage',
    'Slideshow'
  ];

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const matchCat =
        selectedCategory === 'Trending'
          ? true
          : tmpl.category.toLowerCase() === selectedCategory.toLowerCase() ||
            (tmpl.tags && tmpl.tags.some(t => t.toLowerCase() === selectedCategory.toLowerCase()));

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        tmpl.title.toLowerCase().includes(q) ||
        tmpl.description.toLowerCase().includes(q) ||
        (tmpl.language && tmpl.language.toLowerCase().includes(q)) ||
        (tmpl.tags && tmpl.tags.some(t => t.toLowerCase().includes(q)));

      return matchCat && matchQuery;
    });
  }, [templates, selectedCategory, searchQuery]);

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      style={{ backgroundColor: p.bgApp }}
    >
      {/* Top Studio Action Bar */}
      <div
        className="p-3 border-b flex flex-wrap items-center justify-between gap-2.5 shrink-0"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderSubtle
        }}
      >
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl border"
            style={{
              backgroundColor: p.bgInput,
              borderColor: p.borderSubtle
            }}
          >
            <Search size={15} style={{ color: p.textSecondary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 35+ categories (Urdu, Velocity, Reels)..."
              className="bg-transparent text-xs font-medium outline-none w-full"
              style={{ color: p.textPrimary }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border shadow-sm transition-transform active:scale-95"
            style={{
              backgroundColor: p.bgElevated,
              borderColor: p.borderSubtle,
              color: p.textPrimary
            }}
          >
            <DownloadCloud size={14} style={{ color: p.accent }} />
            <span>Import</span>
          </button>

          <button
            onClick={onOpenCreateTemplateModal}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            style={{
              backgroundColor: p.accent,
              color: p.accentText
            }}
          >
            <Plus size={14} />
            <span>Create Template</span>
          </button>
        </div>
      </div>

      {/* Categories Filter Strip */}
      <div
        className="px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderSubtle
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all select-none shrink-0"
              style={{
                backgroundColor: isSelected ? p.accent : p.bgElevated,
                color: isSelected ? p.accentText : p.textSecondary,
                boxShadow: isSelected ? `0 2px 8px ${p.accent}30` : 'none'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Templates Grid Catalog */}
      <div className="flex-1 overflow-y-auto p-3.5 pb-24">
        {filteredTemplates.length === 0 ? (
          <div className="py-20 text-center" style={{ color: p.textMuted }}>
            <LayoutTemplate size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No templates found in {selectedCategory}</p>
            <p className="text-xs mt-1">Try switching categories or importing a public template URL.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTemplates.map((template) => {
              const slotsCount = template.slots ? template.slots.length : template.requiredMediaCount;
              return (
                <div
                  key={template.id}
                  className="group relative rounded-2xl border overflow-hidden flex flex-col transition-all hover:scale-[1.01] hover:shadow-lg"
                  style={{
                    backgroundColor: p.bgSurface,
                    borderColor: p.borderSubtle
                  }}
                >
                  {/* Card Visual / Thumbnail */}
                  <div
                    className="relative aspect-[9/14] w-full overflow-hidden flex flex-col justify-between p-2.5 cursor-pointer"
                    onClick={() => onSelectTemplate(template)}
                  >
                    {/* Background Gradient / Thumbnail */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${template.coverGradient || 'from-indigo-600 to-purple-900'} opacity-90 transition-transform group-hover:scale-105 duration-300`}
                    />
                    <div className="absolute inset-0 bg-black/25" />

                    {/* Top Row: Category tag and Favorite */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-md">
                        {template.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(template.id);
                        }}
                        className="p-1 rounded-full bg-black/40 text-white hover:text-rose-400 transition-colors"
                      >
                        <Heart
                          size={14}
                          className={template.isFavorite ? 'fill-rose-500 text-rose-500' : ''}
                        />
                      </button>
                    </div>

                    {/* Center: Play / Use Button */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={18} className="fill-white translate-x-0.5" />
                      </div>
                    </div>

                    {/* Bottom Metadata Badges */}
                    <div className="relative z-10 text-white space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] opacity-90 font-medium">
                        <Clock size={11} />
                        <span>{template.duration.toFixed(1)}s</span>
                        <span>·</span>
                        <Layers size={11} />
                        <span>{slotsCount} Slots</span>
                      </div>
                      <h4 className="text-xs font-bold line-clamp-1 leading-tight text-white drop-shadow-sm">
                        {template.title}
                      </h4>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div
                    className="p-2 border-t flex items-center justify-between gap-1.5 shrink-0"
                    style={{
                      borderColor: p.borderSubtle,
                      backgroundColor: p.bgElevated
                    }}
                  >
                    <button
                      onClick={() => onViewTemplateProfile(template)}
                      title="View Template Profile & Details"
                      className="p-1.5 rounded-lg hover:opacity-80 active:scale-95"
                      style={{ color: p.textSecondary }}
                    >
                      <UserCheck size={15} />
                    </button>

                    <button
                      onClick={() => onUseTemplate(template)}
                      className="flex-1 py-1.5 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-transform active:scale-95"
                      style={{
                        backgroundColor: p.accent,
                        color: p.accentText
                      }}
                    >
                      <Sparkles size={12} />
                      <span>Use Template</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
