/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Palette,
  X,
  Upload,
  RefreshCw,
  Download,
  Edit3,
  AlertTriangle,
  Sparkles,
  Sliders,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { StyleMatchOptions, AIResult } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { CloudConsentModal } from './CloudConsentModal';

interface AiStyleMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor?: (imageUrl: string) => void;
}

export const AiStyleMatchModal: React.FC<AiStyleMatchModalProps> = ({
  isOpen,
  onClose,
  onOpenInEditor,
}) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [styleStrength, setStyleStrength] = useState<number>(75);
  const [preserveIdentity, setPreserveIdentity] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  if (!isOpen) return null;

  const handleUploadUser = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUserImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUploadStyle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setStyleImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const executeStyleMatch = async () => {
    if (!userImage || !styleImage) {
      setErrorMsg('Please upload both your photo and a style reference image.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await AIProviderService.styleMatch({
        userImageDataUrl: userImage,
        referenceStyleDataUrl: styleImage,
        styleStrength,
        preserveIdentity,
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'Style match failed.');
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
      executeStyleMatch();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-pink-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Style Match & Grading</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Aesthetic Transfer
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Transfer lighting, color harmony, atmosphere, and camera look from any reference photo
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
            
            {/* User Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">1. Your Photo</label>
              {userImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={userImage} alt="User" className="w-full h-full object-contain" />
                  <label className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-2">
                    <Upload className="w-4 h-4" />
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleUploadUser} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full h-28 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">Upload Your Photo</span>
                  <input type="file" accept="image/*" onChange={handleUploadUser} className="hidden" />
                </label>
              )}
            </div>

            {/* Style Reference Photo */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">2. Reference Style Photo</label>
              {styleImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img src={styleImage} alt="Style" className="w-full h-full object-contain" />
                  <label className="absolute inset-0 bg-slate-950/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold gap-2">
                    <Upload className="w-4 h-4" />
                    Change Style Ref
                    <input type="file" accept="image/*" onChange={handleUploadStyle} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="w-full h-28 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-xs font-semibold">Upload Reference Look</span>
                  <input type="file" accept="image/*" onChange={handleUploadStyle} className="hidden" />
                </label>
              )}
            </div>

            {/* Style Strength Slider */}
            <div className="space-y-2 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Style Strength</span>
                <span className="font-mono text-cyan-400 font-bold">{styleStrength}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={styleStrength}
                onChange={(e) => setStyleStrength(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Subtle Tonal Tint</span>
                <span>Complete Aesthetic Overhaul</span>
              </div>
            </div>

            {/* Preserve Identity Toggle */}
            <label className="flex items-center gap-2.5 p-3 bg-slate-950/80 border border-slate-800 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={preserveIdentity}
                onChange={(e) => setPreserveIdentity(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Strict Facial Identity Preservation
                </div>
                <p className="text-[10px] text-slate-400">Maintains exact eyes, facial structure, and bone geometry</p>
              </div>
            </label>

            {/* Action Button */}
            <button
              onClick={handleStart}
              disabled={isProcessing || !userImage || !styleImage}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isProcessing || !userImage || !styleImage
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-pink-600 hover:from-cyan-400 hover:to-pink-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Transferring Aesthetic & Lighting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Match Style & Render</span>
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
                    <Palette className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Extracting & Harmonizing Palette</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Translating camera color profiles and atmosphere to your photo...
                  </p>
                </div>
              )}

              {!isProcessing && !errorMsg && !result && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <Palette className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-slate-400">Ready to Match Style</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Upload your photo and a reference look to transfer grading and atmosphere.
                  </p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[500px] flex items-center justify-center">
                    <img
                      src={result.imageUrl}
                      alt="Style Match Result"
                      className="max-h-[500px] w-auto object-contain mx-auto"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Style Transfer Applied ({styleStrength}%)</span>
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
                  download="ZeeStudio_Style_Match.png"
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
        operationName="AI Style Match"
        onConfirm={() => {
          setShowConsentModal(false);
          executeStyleMatch();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
