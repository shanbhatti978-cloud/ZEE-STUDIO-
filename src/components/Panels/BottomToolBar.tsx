import React from 'react';
import {
  PlusSquare,
  Music,
  Type,
  Smile,
  Sparkles,
  SlidersHorizontal,
  Flame,
  Wand2,
  Tv,
  Gauge,
  Layers,
  Palette,
  Captions
} from 'lucide-react';

export type ActiveDrawer =
  | null
  | 'media'
  | 'audio'
  | 'text'
  | 'captions'
  | 'stickers'
  | 'effects'
  | 'filters'
  | 'retouch'
  | 'transitions'
  | 'ai'
  | 'canvas'
  | 'adjust'
  | 'speed';

interface BottomToolBarProps {
  activeDrawer: ActiveDrawer;
  onSelectDrawer: (drawer: ActiveDrawer) => void;
}

export const BottomToolBar: React.FC<BottomToolBarProps> = ({
  activeDrawer,
  onSelectDrawer,
}) => {
  const tools = [
    { id: 'media' as ActiveDrawer, label: 'Media', icon: PlusSquare },
    { id: 'audio' as ActiveDrawer, label: 'Audio', icon: Music },
    { id: 'text' as ActiveDrawer, label: 'Text & Urdu', icon: Type },
    { id: 'captions' as ActiveDrawer, label: 'Auto Captions', icon: Captions, badge: 'AI' },
    { id: 'retouch' as ActiveDrawer, label: 'Retouch', icon: Wand2, badge: 'AI' },
    { id: 'stickers' as ActiveDrawer, label: 'Stickers', icon: Smile },
    { id: 'effects' as ActiveDrawer, label: 'Effects', icon: Sparkles },
    { id: 'filters' as ActiveDrawer, label: 'Filters', icon: Palette },
    { id: 'transitions' as ActiveDrawer, label: 'Transitions', icon: Flame },
    { id: 'ai' as ActiveDrawer, label: 'AI Tools', icon: Wand2, badge: 'PRO' },
    { id: 'adjust' as ActiveDrawer, label: 'Adjust', icon: SlidersHorizontal },
    { id: 'canvas' as ActiveDrawer, label: 'Canvas', icon: Tv },
    { id: 'speed' as ActiveDrawer, label: 'Speed', icon: Gauge },
  ];

  return (
    <div className="h-16 bg-[#0f121b] border-t border-slate-800/80 px-2 flex items-center overflow-x-auto scrollbar-none gap-2 shrink-0 select-none z-10">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeDrawer === tool.id;

        return (
          <button
            key={tool.id}
            onClick={() => onSelectDrawer(isActive ? null : tool.id)}
            className={`flex flex-col items-center justify-center min-w-[56px] py-1 px-1.5 rounded-xl transition-all relative shrink-0 ${
              isActive
                ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {tool.badge && (
              <span className="absolute -top-1 right-1 text-[8px] font-extrabold px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950">
                {tool.badge}
              </span>
            )}
            <Icon size={18} className={isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'} />
            <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">{tool.label}</span>
          </button>
        );
      })}
    </div>
  );
};
