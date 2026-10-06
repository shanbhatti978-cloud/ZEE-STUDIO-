import React, { useRef, useState } from 'react';
import { Upload, Film, Camera, Music, Plus, Check } from 'lucide-react';
import { Clip } from '../../types/editor';
import { SAMPLE_VIDEOS, SampleMediaItem } from '../../data/sampleMedia';
import { VideoCompositor } from '../../engine/VideoCompositor';

interface MediaDrawerProps {
  currentTime: number;
  onAddClip: (clip: Partial<Clip>, trackType: 'video' | 'audio') => void;
  onClose: () => void;
}

export const MediaDrawer: React.FC<MediaDrawerProps> = ({
  currentTime,
  onAddClip,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleMediaItem | null>(null);
  const [isRecordingCamera, setIsRecordingCamera] = useState(false);
  const [isOverlay, setIsOverlay] = useState(false);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const isVideo = file.type.startsWith('video');
    const isImage = file.type.startsWith('image');
    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (isImage) {
        VideoCompositor.preloadImage(dataUrl);
      }

      onAddClip(
        {
          name: file.name.slice(0, 20),
          type: isVideo ? 'video' : 'image',
          duration: isVideo ? 6.0 : 4.0,
          src: dataUrl,
          start: currentTime,
          scale: isOverlay ? 0.6 : 1,
          x: isOverlay ? 20 : 0,
          y: isOverlay ? 20 : 0,
        },
        'video'
      );
      onClose();
    };

    reader.readAsDataURL(file);
  };

  // Add sample footage
  const handleAddSample = (sample: SampleMediaItem) => {
    onAddClip(
      {
        name: sample.title,
        type: sample.type,
        duration: 5.0,
        src: sample.url,
        start: currentTime,
        scale: isOverlay ? 0.6 : 1,
        x: isOverlay ? 15 : 0,
        y: isOverlay ? 15 : 0,
      },
      'video'
    );
    onClose();
  };

  // Record camera video directly
  const handleCameraCapture = async () => {
    try {
      setIsRecordingCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        stream.getTracks().forEach((t) => t.stop());
        setIsRecordingCamera(false);

        onAddClip(
          {
            name: 'Camera Recording',
            type: 'video',
            duration: 5.0,
            src: url,
            start: currentTime,
          },
          'video'
        );
        onClose();
      };

      mediaRecorder.start();
      // Record 5s clip automatically for demo
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 4000);
    } catch (err) {
      console.warn('Camera access denied or unavailable', err);
      setIsRecordingCamera(false);
      alert('Camera access was not granted or not supported on this device.');
    }
  };

  return (
    <div className="bg-[#121520] border-t border-slate-800 p-4 max-h-72 overflow-y-auto select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Film size={16} className="text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Add Media</h3>
        </div>

        {/* Toggle overlay vs main track */}
        <button
          onClick={() => setIsOverlay(!isOverlay)}
          className={`text-[10px] font-semibold px-2 py-1 rounded-md border transition-colors ${
            isOverlay
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {isOverlay ? 'Mode: Overlay (PIP)' : 'Mode: Main Track'}
        </button>
      </div>

      {/* Top Action Buttons: Upload & Camera */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800/90 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold text-white transition-all active:scale-98"
        >
          <Upload size={14} className="text-sky-400" />
          <span>Upload Video / Photo</span>
        </button>

        <button
          onClick={handleCameraCapture}
          disabled={isRecordingCamera}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 border rounded-xl text-xs font-semibold text-white transition-all active:scale-98 ${
            isRecordingCamera
              ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700'
          }`}
        >
          <Camera size={14} className={isRecordingCamera ? 'text-rose-400' : 'text-emerald-400'} />
          <span>{isRecordingCamera ? 'Recording (4s)...' : 'Record Camera'}</span>
        </button>
      </div>

      {/* Royalty Free Sample Footage Library */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-2">Royalty-Free Stock Footage</div>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {SAMPLE_VIDEOS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleAddSample(sample)}
              className="group relative rounded-lg overflow-hidden bg-slate-900 border border-slate-800 hover:border-sky-500 cursor-pointer transition-all aspect-[9/16] flex flex-col justify-end p-1.5"
            >
              <img
                src={sample.thumbnail}
                alt={sample.title}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="relative z-10">
                <span className="text-[10px] font-semibold text-white line-clamp-1">{sample.title}</span>
                <span className="text-[9px] text-sky-400 font-mono">{sample.duration}s</span>
              </div>
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-sky-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
