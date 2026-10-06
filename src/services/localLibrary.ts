import { TemplateDefinition, Transition, EffectType, ColorAdjustments } from '../types/editor';
import { TEMPLATES } from '../data/sampleMedia';

const KEY_SAVED_TEMPLATES = 'velocut_library_templates_saved';
const KEY_DRAFT_TEMPLATES = 'velocut_library_templates_drafts';
const KEY_AI_GENERATED_TEMPLATES = 'velocut_library_templates_aigenerated';
const KEY_IMPORTED_TEMPLATES = 'velocut_library_templates_imported';
const KEY_FAVORITES_TEMPLATES = 'velocut_library_favorites';

const KEY_TRANSITIONS_AIGEN = 'velocut_library_transitions_aigen';
const KEY_EFFECTS_AIGEN = 'velocut_library_effects_aigen';
const KEY_PRESETS_COLOR = 'velocut_library_presets_color';
const KEY_ANALYSIS_HISTORY = 'velocut_library_analysis_history';

export interface AnalysisHistoryItem {
  id: string;
  sourceUrl?: string;
  filename?: string;
  date: number;
  result: {
    duration: number;
    slotsCount: number;
    detectedBeatsCount: number;
    dominantTransition: string;
    dominantEffect: string;
    styleLabel: string;
  };
  generatedTemplateId: string;
}

export class LocalLibraryService {
  // Load templates from a category
  public static getTemplates(category: 'Saved' | 'Drafts' | 'AIGenerated' | 'Imported' | 'Favorites' | 'BuiltIn'): TemplateDefinition[] {
    if (category === 'BuiltIn') {
      return TEMPLATES;
    }

    let key = '';
    switch (category) {
      case 'Saved':
        key = KEY_SAVED_TEMPLATES;
        break;
      case 'Drafts':
        key = KEY_DRAFT_TEMPLATES;
        break;
      case 'AIGenerated':
        key = KEY_AI_GENERATED_TEMPLATES;
        break;
      case 'Imported':
        key = KEY_IMPORTED_TEMPLATES;
        break;
      case 'Favorites':
        key = KEY_FAVORITES_TEMPLATES;
        break;
    }

    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn(`Failed to parse templates from category ${category}`, e);
      return [];
    }
  }

  // Save template into a category (e.g. Saved, Drafts, AIGenerated, Imported)
  public static saveTemplate(template: TemplateDefinition, category: 'Saved' | 'Drafts' | 'AIGenerated' | 'Imported') {
    let key = '';
    switch (category) {
      case 'Saved':
        key = KEY_SAVED_TEMPLATES;
        break;
      case 'Drafts':
        key = KEY_DRAFT_TEMPLATES;
        break;
      case 'AIGenerated':
        key = KEY_AI_GENERATED_TEMPLATES;
        break;
      case 'Imported':
        key = KEY_IMPORTED_TEMPLATES;
        break;
    }

    try {
      const list = this.getTemplates(category).filter(t => t.id !== template.id);
      const updated = [template, ...list];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error(`Failed to save template to category ${category}`, e);
    }
  }

  // Delete template
  public static deleteTemplate(id: string, category: 'Saved' | 'Drafts' | 'AIGenerated' | 'Imported') {
    let key = '';
    switch (category) {
      case 'Saved':
        key = KEY_SAVED_TEMPLATES;
        break;
      case 'Drafts':
        key = KEY_DRAFT_TEMPLATES;
        break;
      case 'AIGenerated':
        key = KEY_AI_GENERATED_TEMPLATES;
        break;
      case 'Imported':
        key = KEY_IMPORTED_TEMPLATES;
        break;
    }

    try {
      const list = this.getTemplates(category).filter(t => t.id !== id);
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      console.error(`Failed to delete template ${id} in ${category}`, e);
    }
  }

  // Duplicate a template
  public static duplicateTemplate(template: TemplateDefinition, category: 'Saved' | 'Drafts' | 'AIGenerated' | 'Imported'): TemplateDefinition {
    const duplicated: TemplateDefinition = {
      ...JSON.parse(JSON.stringify(template)),
      id: `template_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${template.title} (Copy)`,
    };
    this.saveTemplate(duplicated, category);
    return duplicated;
  }

  // Favorites template
  public static toggleFavorite(id: string) {
    const favorites = this.getTemplates('Favorites');
    const isFav = favorites.some(t => t.id === id);

    let updated: TemplateDefinition[] = [];
    if (isFav) {
      updated = favorites.filter(t => t.id !== id);
    } else {
      // Find the template across categories
      let template: TemplateDefinition | undefined = TEMPLATES.find(t => t.id === id);
      if (!template) template = this.getTemplates('Saved').find(t => t.id === id);
      if (!template) template = this.getTemplates('AIGenerated').find(t => t.id === id);
      if (!template) template = this.getTemplates('Imported').find(t => t.id === id);

      if (template) {
        updated = [template, ...favorites];
      } else {
        updated = favorites;
      }
    }
    localStorage.setItem(KEY_FAVORITES_TEMPLATES, JSON.stringify(updated));
  }

  public static isFavorite(id: string): boolean {
    return this.getTemplates('Favorites').some(t => t.id === id);
  }

  // Transitions: Built-In + AI Generated
  public static getTransitions(category: 'BuiltIn' | 'AIGenerated'): string[] {
    if (category === 'BuiltIn') {
      return ['none', 'fade', 'dissolve', 'zoom-in', 'zoom-out', 'spin', 'swipe-left', 'swipe-right', 'blur-flash', 'glitch', 'camera-whip', 'cube-flip'];
    }
    try {
      const data = localStorage.getItem(KEY_TRANSITIONS_AIGEN);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static saveAIGeneratedTransition(name: string) {
    try {
      const list = this.getTransitions('AIGenerated');
      if (!list.includes(name)) {
        localStorage.setItem(KEY_TRANSITIONS_AIGEN, JSON.stringify([name, ...list]));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Effects: Built-In + AI Generated
  public static getEffects(category: 'BuiltIn' | 'AIGenerated'): EffectType[] {
    if (category === 'BuiltIn') {
      return ['none', 'blur', 'motion-blur', 'glitch', 'vhs', 'rgb-split', 'shake', 'flash', 'neon-glow', 'cinematic-bars', 'retro-film', 'light-leak', 'particles', 'distortion', 'cyberpunk', 'vintage-grain'];
    }
    try {
      const data = localStorage.getItem(KEY_EFFECTS_AIGEN);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static saveAIGeneratedEffect(name: EffectType) {
    try {
      const list = this.getEffects('AIGenerated');
      if (!list.includes(name)) {
        localStorage.setItem(KEY_EFFECTS_AIGEN, JSON.stringify([name, ...list]));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Custom LUT/Presets
  public static getColorPresets(): { name: string; adjustments: Partial<ColorAdjustments> }[] {
    try {
      const data = localStorage.getItem(KEY_PRESETS_COLOR);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static saveColorPreset(name: string, adjustments: Partial<ColorAdjustments>) {
    try {
      const list = this.getColorPresets().filter(p => p.name !== name);
      const updated = [{ name, adjustments }, ...list];
      localStorage.setItem(KEY_PRESETS_COLOR, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  }

  // Reference Video Analysis History
  public static getAnalysisHistory(): AnalysisHistoryItem[] {
    try {
      const data = localStorage.getItem(KEY_ANALYSIS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  public static addAnalysisHistory(item: Omit<AnalysisHistoryItem, 'id' | 'date'>) {
    try {
      const list = this.getAnalysisHistory();
      const newItem: AnalysisHistoryItem = {
        ...item,
        id: `history_${Date.now()}`,
        date: Date.now()
      };
      localStorage.setItem(KEY_ANALYSIS_HISTORY, JSON.stringify([newItem, ...list]));
    } catch (e) {
      console.error(e);
    }
  }

  public static clearAnalysisHistory() {
    localStorage.removeItem(KEY_ANALYSIS_HISTORY);
  }
}
