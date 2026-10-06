/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Maximize2,
  X,
  Upload,
  RefreshCw,
  Download,
  Edit3,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';
import { UpscaleOptions, AIResult } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { CloudConsentModal } from './CloudConsentModal';

interface AiUpscalerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageDataUrl?: string;
  onOpenInEditor?: (imageUrl: string) => void;
}

export const AiUpscalerModal: React.FC<AiUpscalerModalProps> = ({
  isOpen,
  onClose,
  initialImageDataUrl,
  onOpenInEditor,
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initialImageDataUrl || null);
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [enhanceDetails, setEnhanceDetails] = useState<boolean>(true);
  const [facePreservation, setFacePreservation] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

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

  const executeUpscale = async () => {
    if (!imageDataUrl) {
      setErrorMsg('Please upload an image to upscale.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await AIProviderService.upscale({
        originalImageDataUrl: imageDataUrl,
        scaleFactor,
        enhanceDetails,
        facePreservation,
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'Upscaling failed.');
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
      executeUpscale();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Maximize2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Super-Resolution Upscaler</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  2K / 4K Neural Detail Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Enhance clarity, denoise compression artifacts, and reconstruct authentic skin pores and fine textures
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
            
            {/* Input Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Input Photo</label>
              {imageDataUrl ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={imageDataUrl} alt="Source" className="w-full h-full object-contain" />
                  <label className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-2">
                    <Upload className="w-4 h-4" />
                    Replace Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full h-36 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400">
                  <Upload className="w-6 h-6 mb-1 text-slate-500" />
                  <span className="text-xs font-semibold">Upload Photo to Upscale</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Scale Factor Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Scale Multiplier</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setScaleFactor(2)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    scaleFactor === 2
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base font-extrabold mb-0.5">2X Upscale</div>
                  <div className="text-[10px] text-slate-400">2K Ultra HD (~2048px)</div>
                </button>

                <button
                  onClick={() => setScaleFactor(4)}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    scaleFactor === 4
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-base font-extrabold mb-0.5">4X Upscale</div>
                  <div className="text-[10px] text-slate-400">4K Master Clarity (~4096px)</div>
                </button>
              </div>
            </div>

            {/* Neural Detail Options */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Neural Enhancement Toggles</label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enhanceDetails}
                  onChange={(e) => setEnhanceDetails(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    Micro-Texture Synthesis
                  </div>
                  <p className="text-[10px] text-slate-400">Reconstructs hair strands, fabric weaves, and pore sharpness</p>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={facePreservation}
                  onChange={(e) => setFacePreservation(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
                />
                <div className="text-xs">
                  <div className="font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Face-Aware Integrity
                  </div>
                  <p className="text-[10px] text-slate-400">Prevents artificial smoothing or facial distortion</p>
                </div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleStart}
              disabled={isProcessing || !imageDataUrl}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isProcessing || !imageDataUrl
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Super-Resolving Image ({scaleFactor}X)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Upscale Image ({scaleFactor}X)</span>
                </>
              )}
            </button>
          </div>

          {/* Result Canvas */}
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
                    <Maximize2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Synthesizing 4K Sub-Pixel Clarity</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Eliminating compression noise and restoring edge sharpness...
                  </p>
                </div>
              )}

              {!isProcessing && !errorMsg && !result && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <Maximize2 className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-slate-400">Ready to Upscale</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Upload a low-resolution or compressed photo to upscale to 2K/4K.
                  </p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[480px] flex items-center justify-center">
                    <img
                      src={showOriginal && imageDataUrl ? imageDataUrl : result.imageUrl}
                      alt="Upscaled Visual"
                      className="max-h-[480px] w-auto object-contain mx-auto"
                    />

                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-cyan-500/90 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md">
                      AI Enhanced / Upscaled {scaleFactor}X
                    </div>

                    {imageDataUrl && (
                      <button
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 select-none shadow-lg active:bg-cyan-500 active:text-slate-950"
                      >
                        {showOriginal ? 'Showing Low-Res Original' : 'Hold to Compare'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Target Resolution: {scaleFactor === 4 ? '4K Master' : '2K Ultra HD'}</span>
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
                  download={`ZeeStudio_Upscaled_${scaleFactor}X.png`}
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
        operationName={`AI Super-Resolution (${scaleFactor}X)`}
        onConfirm={() => {
          setShowConsentModal(false);
          executeUpscale();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
