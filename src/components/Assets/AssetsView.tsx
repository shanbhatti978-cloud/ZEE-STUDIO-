import React, { useState } from 'react';
import { Sparkles, Music, Volume2, Smile, Palette, Play, Square, Plus } from 'lucide-react';
import { MUSIC_TRACKS, SOUND_EFFECTS, STICKERS_LIBRARY, COLOR_PRESETS, MusicTrackItem, SoundEffectItem } from '../../data/sampleMedia';
import { AudioEngine } from '../../engine/AudioEngine';

interface AssetsViewProps {
  onUseMusic: (track: MusicTrackItem) => void;
  onUseSFX: (sfx: SoundEffectItem) => void;
  onUseSticker: (sticker: (typeof STICKERS_LIBRARY)[0]) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  onUseMusic,
  onUseSFX,
  onUseSticker,
}) => {
  const [activeTab, setActiveTab] = useState<'music' | 'sfx' | 'stickers' | 'presets'>('music');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const handlePreviewMusic = (track: MusicTrackItem) => {
    if (playingTrackId === track.id) {
      AudioEngine.stopTimelineAudio();
      setPlayingTrackId(null);
    } else {
      AudioEngine.startTimelineAudio(track.id, track.bpm);
      setPlayingTrackId(track.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0e16] p-4 select-none pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-sky-400" />
            <span>Creative Assets Library</span>
          </h2>
          <p className="text-xs text-slate-400">
            Royalty-free music, synthesized SFX soundboard, stickers, and color presets
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4">
        {[
          { id: 'music' as const, label: 'Music Beats', icon: Music },
          { id: 'sfx' as const, label: 'Sound FX', icon: Volume2 },
          { id: 'stickers' as const, label: 'Stickers & Badges', icon: Smile },
          { id: 'presets' as const, label: 'Color Presets', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Music */}
      {activeTab === 'music' && (
        <div className="flex flex-col gap-2">
          {MUSIC_TRACKS.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePreviewMusic(track)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    playingTrackId === track.id
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {playingTrackId === track.id ? (
                    <Square size={13} className="fill-white" />
                  ) : (
                    <Play size={13} className="ml-0.5 fill-slate-300" />
                  )}
                </button>
                <div>
                  <div className="text-xs font-bold text-white">{track.title}</div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>{track.artist}</span>
                    <span>·</span>
                    <span className="text-rose-400 font-mono font-medium">{track.bpm} BPM</span>
                    <span>·</span>
                    <span>{track.genre}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onUseMusic(track)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-slate-950 font-bold text-xs transition-all"
              >
                <Plus size={13} />
                <span>Send to Editor</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: SFX */}
      {activeTab === 'sfx' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SOUND_EFFECTS.map((sfx) => (
            <div
              key={sfx.id}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-slate-200 mb-0.5">{sfx.name}</div>
                <span className="text-[9px] font-semibold text-rose-400 uppercase tracking-wider">
                  {sfx.category} · {sfx.duration}s
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-3">
                <button
                  onClick={() => AudioEngine.playSoundEffect(sfx.id, 1)}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Volume2 size={12} />
                  <span>Play</span>
                </button>
                <button
                  onClick={() => onUseSFX(sfx)}
                  className="p-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500 hover:text-slate-950 rounded-lg"
                  title="Add to project"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Stickers */}
      {activeTab === 'stickers' && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {STICKERS_LIBRARY.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-between text-center"
            >
              <div className="my-2">
                {item.type === 'emoji' ? (
                  <span className="text-3xl">{item.content}</span>
                ) : item.type === 'social' ? (
                  <span className="text-[10px] font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    {item.content}
                  </span>
                ) : (
                  <span className="text-2xl text-amber-400">⤷</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mb-2">{item.label}</span>
              <button
                onClick={() => onUseSticker(item)}
                className="w-full py-1 bg-sky-500/15 text-sky-300 hover:bg-sky-500 hover:text-slate-950 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Plus size={11} />
                <span>Use</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: Presets */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_PRESETS.map((p) => (
            <div
              key={p.name}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold text-white mb-0.5">{p.name}</div>
                <span className="text-[10px] font-semibold text-amber-400">{p.category}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Cont: {p.adjustments.contrast}% · Sat: {p.adjustments.saturation}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
