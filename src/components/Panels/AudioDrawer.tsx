import React, { useState } from 'react';
import { Music, Mic, Volume2, Plus, Play, Square, Radio } from 'lucide-react';
import { Clip, BeatMarker } from '../../types/editor';
import { MUSIC_TRACKS, SOUND_EFFECTS, MusicTrackItem, SoundEffectItem } from '../../data/sampleMedia';
import { AudioEngine } from '../../engine/AudioEngine';

interface AudioDrawerProps {
  currentTime: number;
  onAddClip: (clip: Partial<Clip>, trackType: 'audio') => void;
  onUpdateBeats: (beats: BeatMarker[]) => void;
  onClose: () => void;
}

export const AudioDrawer: React.FC<AudioDrawerProps> = ({
  currentTime,
  onAddClip,
  onUpdateBeats,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'music' | 'sfx' | 'voiceover'>('music');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Play preview of music track
  const handlePreviewMusic = (track: MusicTrackItem) => {
    if (playingTrackId === track.id) {
      AudioEngine.stopTimelineAudio();
      setPlayingTrackId(null);
    } else {
      AudioEngine.startTimelineAudio(track.id, track.bpm);
      setPlayingTrackId(track.id);
    }
  };

  // Add music track to project
  const handleAddMusic = (track: MusicTrackItem) => {
    AudioEngine.stopTimelineAudio();
    onAddClip(
      {
        name: track.title,
        type: 'audio',
        duration: Math.min(15, track.duration),
        src: track.id,
        start: currentTime,
        volume: 1,
      },
      'audio'
    );
    // Apply beat markers
    onUpdateBeats(track.beats);
    onClose();
  };

  // Play SFX
  const handlePlaySFX = (sfx: SoundEffectItem) => {
    AudioEngine.playSoundEffect(sfx.id, 1);
  };

  // Add SFX
  const handleAddSFX = (sfx: SoundEffectItem) => {
    onAddClip(
      {
        name: sfx.name,
        type: 'audio',
        duration: sfx.duration,
        src: sfx.id,
        start: currentTime,
        volume: 1,
      },
      'audio'
    );
    onClose();
  };

  // Voice recording
  const handleToggleVoiceover = async () => {
    if (!isRecording) {
      const started = await AudioEngine.startVoiceRecording();
      if (started) {
        setIsRecording(true);
        setRecordingSeconds(0);
        const timer = setInterval(() => {
          setRecordingSeconds((prev) => prev + 1);
        }, 1000);
        (window as any).__voTimer = timer;
      }
    } else {
      clearInterval((window as any).__voTimer);
      const res = await AudioEngine.stopVoiceRecording();
      setIsRecording(false);
      if (res) {
        onAddClip(
          {
            name: 'Voiceover Recording',
            type: 'audio',
            duration: Math.max(1, recordingSeconds),
            src: res.url,
            start: currentTime,
            volume: 1.2,
          },
          'audio'
        );
        onClose();
      }
    }
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-72 overflow-y-auto select-none">
      {/* Sub Tabs: Music / SFX / Voiceover */}
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-rose-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audio Studio</h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('music')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              activeTab === 'music' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Music
          </button>
          <button
            onClick={() => setActiveTab('sfx')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              activeTab === 'sfx' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sound FX
          </button>
          <button
            onClick={() => setActiveTab('voiceover')}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
              activeTab === 'voiceover' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice-Over
          </button>
        </div>
      </div>

      {/* Tab 1: Music Tracks */}
      {activeTab === 'music' && (
        <div className="flex flex-col gap-2">
          {MUSIC_TRACKS.map((track) => (
            <div
              key={track.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handlePreviewMusic(track)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    playingTrackId === track.id ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title={playingTrackId === track.id ? 'Stop Preview' : 'Play Preview'}
                >
                  {playingTrackId === track.id ? <Square size={12} className="fill-white" /> : <Play size={12} className="ml-0.5 fill-slate-300" />}
                </button>
                <div>
                  <div className="text-xs font-semibold text-white">{track.title}</div>
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
                onClick={() => handleAddMusic(track)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
              >
                <Plus size={12} />
                <span>Use</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: SFX Soundboard */}
      {activeTab === 'sfx' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SOUND_EFFECTS.map((sfx) => (
            <div
              key={sfx.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between"
            >
              <div className="text-xs font-semibold text-slate-200 mb-1">{sfx.name}</div>
              <div className="text-[10px] text-slate-500 uppercase">{sfx.category}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <button
                  onClick={() => handlePlaySFX(sfx)}
                  className="flex-1 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[11px] font-medium flex items-center justify-center gap-1"
                >
                  <Volume2 size={12} />
                  <span>Hear</span>
                </button>
                <button
                  onClick={() => handleAddSFX(sfx)}
                  className="p-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded"
                  title="Add to timeline"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Voiceover Recording */}
      {activeTab === 'voiceover' && (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="text-xs font-medium text-slate-300 mb-4">
            Record crystal-clear commentary, narration, or reactions directly into your video timeline.
          </div>

          <button
            onClick={handleToggleVoiceover}
            className={`w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all active:scale-95 ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700'
            }`}
          >
            {isRecording ? <Square size={22} className="fill-white" /> : <Mic size={24} />}
          </button>

          <div className="mt-3 text-sm font-mono font-bold text-white">
            {isRecording ? `00:${recordingSeconds.toString().padStart(2, '0')}` : 'Tap to Record'}
          </div>
        </div>
      )}
    </div>
  );
};
