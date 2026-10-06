import React, { useRef } from 'react';
import { Smile, Upload, Plus } from 'lucide-react';
import { Clip, StickerConfig } from '../../types/editor';
import { STICKERS_LIBRARY } from '../../data/sampleMedia';

interface StickersDrawerProps {
  currentTime: number;
  onAddStickerClip: (stickerConfig: StickerConfig) => void;
  onClose: () => void;
}

export const StickersDrawer: React.FC<StickersDrawerProps> = ({
  currentTime,
  onAddStickerClip,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectSticker = (item: (typeof STICKERS_LIBRARY)[0]) => {
    onAddStickerClip({
      type: item.type as any,
      content: item.content,
      width: item.type === 'emoji' ? 100 : item.type === 'social' ? 140 : 110,
      height: 100,
    });
    onClose();
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onAddStickerClip({
        type: 'custom',
        content: dataUrl,
        width: 130,
        height: 130,
      });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-80 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Smile size={16} className="text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Stickers & Elements</h3>
        </div>

        {/* Custom PNG upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/webp"
          onChange={handleCustomUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg border border-slate-700 transition-colors"
        >
          <Upload size={12} />
          <span>Upload PNG</span>
        </button>
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {STICKERS_LIBRARY.map((item) => (
          <button
            key={item.id}
            onClick={() => handleSelectSticker(item)}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/80 hover:bg-slate-800/80 flex flex-col items-center justify-center transition-all group aspect-square"
          >
            {item.type === 'emoji' ? (
              <span className="text-3xl group-hover:scale-120 transition-transform">{item.content}</span>
            ) : item.type === 'social' ? (
              <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full text-center leading-tight">
                {item.content}
              </span>
            ) : (
              <span className="text-2xl text-amber-400">⤷</span>
            )}
            <span className="text-[9px] text-slate-400 truncate mt-1 max-w-full">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
