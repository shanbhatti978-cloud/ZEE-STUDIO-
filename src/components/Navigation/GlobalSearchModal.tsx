import React, { useState, useMemo } from 'react';
import { Search, X, LayoutTemplate, Film, Image, Sparkles, Wand2, Type, Music } from 'lucide-react';
import { AppTheme } from '../../types/theme';
import { TemplateDefinition, Project } from '../../types/editor';

interface SearchResultItem {
  id: string;
  type: 'template' | 'project' | 'effect' | 'transition' | 'tool' | 'font' | 'audio';
  title: string;
  subtitle: string;
  category: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  templates: TemplateDefinition[];
  projects: Project[];
  onSelectTemplate: (t: TemplateDefinition) => void;
  onSelectProject: (p: Project) => void;
  onSelectTool: (toolId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  theme,
  templates,
  projects,
  onSelectTemplate,
  onSelectProject,
  onSelectTool
}) => {
  const [query, setQuery] = useState('');
  if (!isOpen) return null;
  const p = theme.palette;

  const catalogItems: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    // Add templates
    templates.forEach(t => {
      list.push({
        id: t.id,
        type: 'template',
        title: t.title,
        subtitle: `${t.category} · ${t.duration}s · ${t.requiredMediaCount} slots`,
        category: 'Templates'
      });
    });

    // Add projects
    projects.forEach(pr => {
      list.push({
        id: pr.id,
        type: 'project',
        title: pr.name,
        subtitle: `Project · ${pr.aspectRatio} · ${pr.tracks.length} tracks`,
        category: 'Projects'
      });
    });

    // Add tools
    const toolItems: { id: string; title: string; subtitle: string }[] = [
      { id: 'ai_image_gen', title: 'AI Photo Generator', subtitle: 'Text-to-image photo studio with Gemini & Leonardo' },
      { id: 'ai_photoshoot', title: 'Virtual Photoshoot Studio', subtitle: '12 photoshoot styles with facial identity preservation' },
      { id: 'ai_img_to_img', title: 'AI Multi-Modal Photo Edit', subtitle: 'Replace objects, change backgrounds, relight portraits' },
      { id: 'ai_style_match', title: 'Style Match & Grading', subtitle: 'Transfer aesthetic, lighting, and color grading from reference' },
      { id: 'ai_inpaint_outpaint', title: 'Inpainting & Outpainting', subtitle: 'Brush generative fill and directional scene expansion' },
      { id: 'ai_upscale', title: 'AI 4K Super-Resolution Upscaler', subtitle: 'Micro-texture synthesis and sub-pixel photographic clarity' },
      { id: 'ai_enhance', title: 'Neural Portrait & Skin Retouch', subtitle: 'Ultra HD face and portrait enhancement' },
      { id: 'ai_bg_remove', title: 'Background Cutout & Matting', subtitle: 'Edge-to-edge alpha segmentation' },
      { id: 'ai_photo_to_video', title: 'Photo-to-Video Motion', subtitle: 'Camera zoom, parallax, and 3D depth' },
      { id: 'ai_history', title: 'AI Generation History', subtitle: 'Browse, copy prompts, and reload past neural creations' },
      { id: 'ai_usage', title: 'AI Usage & Quota Manager', subtitle: 'Request counts, cost estimates, and provider health checks' },
      { id: 'set_ai_providers', title: 'AI Provider & Routing Settings', subtitle: 'Select preferred provider and customize model settings' },
      { id: 'tmpl_import', title: 'Import Template from Link or Video', subtitle: 'Reconstruct editable timeline from media' },
      { id: 'tmpl_duplicate', title: 'Template Duplicate Detection', subtitle: 'Structural fingerprint and similarity check' },
      { id: 'set_storage', title: 'Storage & Asset Manager', subtitle: 'Identify orphaned assets and safely clear unused local memory' }
    ];
    toolItems.forEach(t => {
      list.push({
        id: t.id,
        type: 'tool',
        title: t.title,
        subtitle: t.subtitle,
        category: 'AI Tools'
      });
    });

    // Add built-in effects and transitions
    const effectItems = [
      { id: 'eff_rgb', title: 'RGB Split Glitch', subtitle: 'Chromatic aberration pulse', category: 'Effects' },
      { id: 'eff_neon', title: 'Neon Electric Glow', subtitle: 'Cyberpunk luminous outline', category: 'Effects' },
      { id: 'eff_flash', title: 'White Flash Beat Drop', subtitle: 'High energy transition strobe', category: 'Effects' },
      { id: 'trans_whip', title: 'Camera Whip Whoosh', subtitle: 'Fast motion blur camera swing', category: 'Transitions' },
      { id: 'trans_zoom', title: 'Kinetic Zoom In', subtitle: 'Smooth dynamic zoom transition', category: 'Transitions' }
    ];
    effectItems.forEach(e => {
      list.push({
        id: e.id,
        type: e.category === 'Effects' ? 'effect' : 'transition',
        title: e.title,
        subtitle: e.subtitle,
        category: e.category
      });
    });

    // Add multilingual fonts
    const fontItems = [
      { id: 'font_nastaliq', title: 'Jameel Noori Nastaleeq', subtitle: 'Elegant Urdu Nastaliq calligraphy', category: 'Fonts' },
      { id: 'font_amiri', title: 'Amiri Arabic Font', subtitle: 'Classical Arabic typography with RTL ligature', category: 'Fonts' },
      { id: 'font_montserrat', title: 'Montserrat Heavy', subtitle: 'Modern clean Sans-Serif font', category: 'Fonts' }
    ];
    fontItems.forEach(f => {
      list.push({
        id: f.id,
        type: 'font',
        title: f.title,
        subtitle: f.subtitle,
        category: 'Fonts'
      });
    });

    return list;
  }, [templates, projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalogItems.slice(0, 15);
    return catalogItems.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [catalogItems, query]);

  const handleSelect = (item: SearchResultItem) => {
    if (item.type === 'template') {
      const tmpl = templates.find(t => t.id === item.id);
      if (tmpl) onSelectTemplate(tmpl);
    } else if (item.type === 'project') {
      const prj = projects.find(p => p.id === item.id);
      if (prj) onSelectProject(prj);
    } else {
      onSelectTool(item.id);
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'template': return LayoutTemplate;
      case 'project': return Film;
      case 'tool': return Wand2;
      case 'effect': return Sparkles;
      case 'font': return Type;
      default: return Search;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-3 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] border animate-in fade-in zoom-in-95 duration-150"
        style={{
          backgroundColor: p.bgSurface,
          borderColor: p.borderSubtle
        }}
      >
        {/* Search Input Bar */}
        <div
          className="p-3 border-b flex items-center gap-3 shrink-0"
          style={{ borderColor: p.borderSubtle }}
        >
          <Search size={18} style={{ color: p.textSecondary }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search templates, projects, Urdu effects, tools..."
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium outline-none"
            style={{ color: p.textPrimary }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:opacity-75"
              style={{ color: p.textMuted }}
            >
              <X size={15} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-semibold rounded-lg hover:opacity-80"
            style={{ color: p.textSecondary, backgroundColor: p.bgElevated }}
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center" style={{ color: p.textMuted }}>
              <p className="text-sm font-semibold">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for "Urdu", "Velocity", "Cutout", or "Flash"</p>
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <button
                  key={`${item.type}_${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left flex items-center justify-between p-2.5 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = p.bgElevated)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="p-2 rounded-lg shrink-0"
                      style={{ backgroundColor: p.bgElevated, color: p.accent }}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold truncate" style={{ color: p.textPrimary }}>
                        {item.title}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: p.textSecondary }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider"
                    style={{
                      backgroundColor: p.bgElevated,
                      color: p.textMuted
                    }}
                  >
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
