import React, { useState, useRef, useEffect } from 'react';
import { Camera, Video, FlipHorizontal, Square, Check, RefreshCw, X, AlertCircle } from 'lucide-react';
import { SystemIntents, IntentMediaFile } from '../../services/systemIntents';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaCaptured: (media: IntentMediaFile, destination: 'photo' | 'video') => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onMediaCaptured,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedMedia, setCapturedMedia] = useState<{
    url: string;
    type: 'photo' | 'video';
    blob: Blob;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setCapturedMedia(null);
      setIsRecording(false);
      setRecordDuration(0);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setErrorMessage(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Camera access is not supported by your browser environment.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: true,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera stream error', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in your browser settings.'
          : 'Unable to start camera stream. Ensure no other application is using it.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // High-Res Photo Capture Intent
  const handleTakePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setCapturedMedia({
          url,
          type: 'photo',
          blob,
        });
      },
      'image/jpeg',
      0.95
    );
  };

  // Real-time Video Recording Intent
  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9'
          : 'video/webm',
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(fullBlob);
        setCapturedMedia({
          url: videoUrl,
          type: 'video',
          blob: fullBlob,
        });
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error('MediaRecorder error', e);
      setErrorMessage('Could not initialize video recording format.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleConfirmMedia = (destination: 'photo' | 'video') => {
    if (!capturedMedia) return;

    const intentMedia: IntentMediaFile = {
      id: `capture-${Date.now()}`,
      name: `${capturedMedia.type === 'photo' ? 'Photo_Capture' : 'Video_Recording'}_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${capturedMedia.type === 'photo' ? 'jpg' : 'webm'}`,
      type: capturedMedia.type,
      mimeType: capturedMedia.type === 'photo' ? 'image/jpeg' : 'video/webm',
      size: capturedMedia.blob.size,
      url: capturedMedia.url,
      dateAdded: Date.now(),
    };

    SystemIntents.addToGallery(intentMedia);
    onMediaCaptured(intentMedia, destination);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div className="bg-[#0b0f19] border border-cyan-500/40 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Camera size={18} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Camera Studio & Real-Time Intent
              </h3>
              <p className="text-[10px] text-slate-400">
                Direct camera hardware stream & high-definition capture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {errorMessage ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle size={36} className="text-rose-400 mx-auto mb-2" />
              <p className="text-xs text-rose-300 mb-3">{errorMessage}</p>
              <button
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 mx-auto"
              >
                <RefreshCw size={14} /> Try Again
              </button>
            </div>
          ) : capturedMedia ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {capturedMedia.type === 'photo' ? (
                <img
                  src={capturedMedia.url}
                  alt="Captured"
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              ) : (
                <video
                  src={capturedMedia.url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg"
                />
              )}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 backdrop-blur border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                ✓ Capture Preview
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`max-h-[380px] w-auto object-contain rounded-lg ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Viewfinder Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-20">
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-r border-b border-white" />
                <div className="border-b border-white" />
                <div className="border-r border-white" />
                <div className="border-r border-white" />
                <div />
              </div>

              {/* Recording Timer Badge */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  REC {Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}
                </div>
              )}

              {/* Flip camera button */}
              <button
                onClick={handleFlipCamera}
                title="Flip Camera"
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 transition-transform active:rotate-180"
              >
                <FlipHorizontal size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3">
          {capturedMedia ? (
            /* Review & Destination Selector */
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCapturedMedia(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw size={14} /> Retake
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleConfirmMedia('photo')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check size={14} /> Open in Photo AI
                </button>
                <button
                  onClick={() => handleConfirmMedia('video')}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
                >
                  <Check size={14} /> Open in Video AI
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera Trigger Controls */
            <div className="flex items-center justify-between">
              {/* Mode switch */}
              <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                <button
                  onClick={() => setMode('photo')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    mode === 'photo'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera size={14} /> Photo
                </button>
                <button
                  onClick={() => setMode('video')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    mode === 'video'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video size={14} /> Video
                </button>
              </div>

              {/* Shutter / Record Button */}
              <div className="flex items-center justify-center">
                {mode === 'photo' ? (
                  <button
                    onClick={handleTakePhoto}
                    className="w-14 h-14 rounded-full border-4 border-cyan-400 bg-white/20 hover:bg-white/40 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-cyan-500/30"
                  >
                    <div className="w-10 h-10 rounded-full bg-cyan-400" />
                  </button>
                ) : (
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`w-14 h-14 rounded-full border-4 ${
                      isRecording ? 'border-rose-400 bg-rose-500/20 animate-pulse' : 'border-rose-500 bg-white/20'
                    } active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-rose-500/30`}
                  >
                    {isRecording ? (
                      <Square size={20} className="text-rose-400 fill-rose-400" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-rose-500" />
                    )}
                  </button>
                )}
              </div>

              {/* Quick info */}
              <div className="text-[10px] text-slate-500 text-right">
                {mode === 'photo' ? 'Single Shot' : isRecording ? 'Recording...' : 'Max 60 FPS'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
