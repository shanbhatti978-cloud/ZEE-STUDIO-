/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Brush,
  X,
  Upload,
  RefreshCw,
  Download,
  Edit3,
  AlertTriangle,
  Sparkles,
  Maximize2,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { InpaintOutpaintOptions, AIResult, ImageAspectRatio } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { CloudConsentModal } from './CloudConsentModal';

interface AiInpaintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageDataUrl?: string;
  onOpenInEditor?: (imageUrl: string) => void;
}

export const AiInpaintingModal: React.FC<AiInpaintingModalProps> = ({
  isOpen,
  onClose,
  initialImageDataUrl,
  onOpenInEditor,
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initialImageDataUrl || null);
  const [mode, setMode] = useState<'inpaint' | 'outpaint'>('inpaint');
  const [outpaintDirection, setOutpaintDirection] = useState<'left' | 'right' | 'top' | 'bottom' | 'all'>('all');
  const [prompt, setPrompt] = useState('');
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (imageDataUrl && canvasRef.current && maskCanvasRef.current) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = canvasRef.current;
        const maskCanvas = maskCanvasRef.current;
        if (!canvas || !maskCanvas) return;

        canvas.width = img.width;
        canvas.height = img.height;
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;

        const ctx = canvas.getContext('2d');
        const maskCtx = maskCanvas.getContext('2d');
        if (ctx && maskCtx) {
          ctx.drawImage(img, 0, 0);
          maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
      };
      img.src = imageDataUrl;
    }
  }, [imageDataUrl, mode]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageDataUrl(reader.result as string);
      setResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'inpaint') return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'inpaint') return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.7)'; // visible red mask in UI
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    }
  };

  const executeInpaintOutpaint = async () => {
    if (!imageDataUrl) {
      setErrorMsg('Please upload an image first.');
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg('Please describe what to generate in the region or extended boundary.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    let maskDataUrl: string | undefined = undefined;
    if (mode === 'inpaint' && maskCanvasRef.current) {
      // Create high-contrast black/white mask for AI model
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = maskCanvasRef.current.width;
      tempCanvas.height = maskCanvasRef.current.height;
      const tCtx = tempCanvas.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = '#000000';
        tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tCtx.drawImage(maskCanvasRef.current, 0, 0);
        maskDataUrl = tempCanvas.toDataURL('image/png');
      }
    }

    try {
      const res = await AIProviderService.inpaintOutpaint({
        originalImageDataUrl: imageDataUrl,
        maskDataUrl,
        mode,
        outpaintDirection: mode === 'outpaint' ? outpaintDirection : undefined,
        prompt: prompt.trim(),
        aspectRatio: mode === 'outpaint' ? '16:9' : '1:1',
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'Operation failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStart = () => {
    if (!AIProviderService.hasUserAcceptedCloudConsent()) {
      setShowConsentModal(true);
    } else {
      executeInpaintOutpaint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Brush className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Inpainting & Outpainting</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Generative Fill & Expand
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paint area to replace content seamlessly, or extend image boundaries in any direction
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2-Column Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Controls Panel */}
          <div className="lg:col-span-5 p-6 overflow-y-auto space-y-5 border-r border-slate-800/80">
            
            {/* Mode Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setMode('inpaint')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'inpaint'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Brush className="w-3.5 h-3.5" />
                Inpainting (Brush Fill)
              </button>
              <button
                onClick={() => setMode('outpaint')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'outpaint'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Outpainting (Expand)
              </button>
            </div>

            {/* Inpainting Brush Controls */}
            {mode === 'inpaint' && (
              <div className="space-y-3 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300">Brush Size</span>
                  <span className="font-mono text-cyan-400">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <button
                  onClick={clearMask}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Brush Selection
                </button>
              </div>
            )}

            {/* Outpainting Direction Controls */}
            {mode === 'outpaint' && (
              <div className="space-y-2 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <label className="text-xs font-bold text-slate-300">Expand Direction</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'left', name: 'Left', icon: ArrowLeft },
                    { id: 'all', name: 'All Sides', icon: Maximize2 },
                    { id: 'right', name: 'Right', icon: ArrowRight },
                    { id: 'top', name: 'Top', icon: ArrowUp },
                    { id: 'bottom', name: 'Bottom', icon: ArrowDown },
                  ].map((dir) => {
                    const Icon = dir.icon;
                    const isSelected = outpaintDirection === dir.id;
                    return (
                      <button
                        key={dir.id}
                        onClick={() => setOutpaintDirection(dir.id as any)}
                        className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {dir.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generative Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                {mode === 'inpaint' ? 'Generative Fill Description' : 'Extended Background Description'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === 'inpaint'
                    ? 'e.g. A vintage turquoise velvet armchair matching room lighting...'
                    : 'e.g. Lush tropical botanical garden with sunlight filtering through palms...'
                }
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleStart}
              disabled={isProcessing || !imageDataUrl || !prompt.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isProcessing || !imageDataUrl || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Generating Neural Infill...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate Fill & Expand</span>
                </>
              )}
            </button>
          </div>

          {/* Interactive Canvas & Result Preview */}
          <div className="lg:col-span-7 p-6 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs max-w-md w-full text-center space-y-2">
                  <AlertTriangle className="w-6 h-6 mx-auto" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              {isProcessing && (
                <div className="text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
                    <Brush className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Synthesizing Seamless Infill</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Matching texture frequency, grain, and lighting perspective...
                  </p>
                </div>
              )}

              {!isProcessing && !errorMsg && !result && imageDataUrl && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[480px] flex items-center justify-center">
                  <canvas ref={canvasRef} className="max-h-[480px] w-auto object-contain" />
                  <canvas
                    ref={maskCanvasRef}
                    onMouseDown={startDraw}
                    onMouseUp={stopDraw}
                    onMouseMove={draw}
                    onTouchStart={startDraw}
                    onTouchEnd={stopDraw}
                    onTouchMove={draw}
                    className="absolute inset-0 max-h-[480px] w-auto object-contain cursor-crosshair"
                  />
                  {mode === 'inpaint' && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-lg text-[10px] text-cyan-300 font-semibold">
                      Paint over the area you want to replace
                    </div>
                  )}
                </div>
              )}

              {!isProcessing && !errorMsg && !result && !imageDataUrl && (
                <label className="w-full max-w-md h-64 rounded-2xl border-2 border-dashed border-slate-700 hover:border-cyan-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Upload Image to Inpaint / Outpaint</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[480px] flex items-center justify-center">
                    <img
                      src={result.imageUrl}
                      alt="Inpainting Result"
                      className="max-h-[480px] w-auto object-contain mx-auto"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Mode: {mode.toUpperCase()}</span>
                    <span>Render: {(result.executionTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {result && result.imageUrl && (
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
                <a
                  href={result.imageUrl}
                  download="ZeeStudio_Inpaint.png"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>

                {onOpenInEditor && (
                  <button
                    onClick={() => {
                      if (result.imageUrl) {
                        onOpenInEditor(result.imageUrl);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Open in Photo Editor
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CloudConsentModal
        isOpen={showConsentModal}
        providerName="Google Gemini Cloud AI"
        operationName={`AI ${mode.toUpperCase()}`}
        onConfirm={() => {
          setShowConsentModal(false);
          executeInpaintOutpaint();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
