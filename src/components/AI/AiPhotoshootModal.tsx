/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Camera,
  X,
  Upload,
  RefreshCw,
  Download,
  Edit3,
  AlertTriangle,
  Sparkles,
  User,
  ShieldCheck,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { PhotoshootOptions, AIResult } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { CloudConsentModal } from './CloudConsentModal';

interface AiPhotoshootModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor?: (imageUrl: string) => void;
}

const THEMES = [
  { id: 'Portrait', name: 'Studio Portrait', icon: '👤', desc: '85mm f/1.4 soft studio key light with clean backdrop' },
  { id: 'Fashion', name: 'High Fashion Editorial', icon: '👗', desc: 'Vogue magazine style with avant-garde styling & dynamic poses' },
  { id: 'Pakistani / Desi', name: 'Pakistani / Desi Festive', icon: '✨', desc: 'Regal South Asian bridal / formal attire with intricate embroidery' },
  { id: 'Corporate', name: 'Executive Corporate', icon: '💼', desc: 'Modern boardroom headshot with confident leadership posture' },
  { id: 'Luxury', name: 'Luxury Penthouse', icon: '💎', desc: 'Golden hour luxury lifestyle with rooftop skyline' },
  { id: 'Cinematic', name: 'Cinematic Film Look', icon: '🎬', desc: 'Anamorphic movie still with moody teal & orange grade' },
  { id: 'Wedding', name: 'Romantic Bridal', icon: '💍', desc: 'Dreamy wedding photography with soft bokeh and floral accents' },
  { id: 'Outdoor', name: 'Golden Hour Nature', icon: '🌅', desc: 'Sun-drenched outdoor portrait in meadow with lens flare' },
  { id: 'Full body', name: 'Full Body Model', icon: '🧍', desc: 'Full length runway fashion pose with balanced head-to-toe styling' },
  { id: 'Half body', name: 'Editorial Half Body', icon: '📸', desc: 'Waist-up fashion pose with expressive hand placement' },
  { id: 'Travel', name: 'Wanderlust Explorer', icon: '✈️', desc: 'Exotic travel destination with scenic panoramic background' },
  { id: 'Studio', name: 'Minimalist Studio', icon: '🏛️', desc: 'Clean architectural shadows on neutral textured background' },
];

export const AiPhotoshootModal: React.FC<AiPhotoshootModalProps> = ({
  isOpen,
  onClose,
  onOpenInEditor,
}) => {
  const [referencePhotos, setReferencePhotos] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>('Portrait');
  const [location, setLocation] = useState('High-End Studio with Textured Backdrop');
  const [pose, setPose] = useState('Confident relaxed portrait pose');
  const [lighting, setLighting] = useState('Softbox key light with warm rim highlight');
  const [cameraStyle, setCameraStyle] = useState('85mm f/1.4 prime lens, shallow depth of field');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  if (!isOpen) return null;

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setReferencePhotos((prev) => [...prev, reader.result as string].slice(0, 3));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setReferencePhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const executePhotoshoot = async () => {
    if (referencePhotos.length === 0) {
      setErrorMsg('Please upload at least 1 reference portrait photo of yourself.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await AIProviderService.photoshoot({
        referencePhotos,
        theme: selectedTheme as any,
        location,
        pose,
        lighting,
        cameraStyle,
        aspectRatio: '9:16',
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'Photoshoot generation failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartPhotoshoot = () => {
    if (!AIProviderService.hasUserAcceptedCloudConsent()) {
      setShowConsentModal(true);
    } else {
      executePhotoshoot();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Virtual Photoshoot</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Facial Identity Preserved
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate professional editorial photoshoots across 12 themes while keeping your exact facial identity
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
            
            {/* Reference Photos Uploader */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Your Portrait Photos</label>
                <span className="text-[10px] text-slate-500">{referencePhotos.length}/3 photos</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {referencePhotos.map((photo, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 group">
                    <img src={photo} alt="Portrait" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {referencePhotos.length < 3 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400 flex-shrink-0">
                    <Plus className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5">Add Selfie</span>
                    <input type="file" accept="image/*" onChange={handleAddPhoto} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Themes Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Photoshoot Theme</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {THEMES.map((th) => {
                  const isSelected = selectedTheme === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        setSelectedTheme(th.id);
                        if (th.id === 'Pakistani / Desi') {
                          setLocation('Mughal Palace Courtyard at Sunset');
                          setLighting('Warm royal lantern glow and golden hour backlight');
                        } else if (th.id === 'Corporate') {
                          setLocation('Modern High-Floor Executive Office');
                          setLighting('Crisp natural window light with soft rim fill');
                        }
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span>{th.icon}</span>
                        <span className="text-xs font-bold truncate">{th.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{th.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Directives */}
            <div className="space-y-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Pose & Expression</label>
                <input
                  type="text"
                  value={pose}
                  onChange={(e) => setPose(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Location & Setting</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Lighting & Camera Lens</label>
                <input
                  type="text"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Start Photoshoot Button */}
            <button
              onClick={handleStartPhotoshoot}
              disabled={isProcessing || referencePhotos.length === 0}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isProcessing || referencePhotos.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Directing Virtual Photoshoot...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate Virtual Photoshoot</span>
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
                    <Camera className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Rendering Studio Photoshoot</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Matching facial contours, eye reflections, and studio lighting...
                  </p>
                </div>
              )}

              {!isProcessing && !errorMsg && !result && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <User className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-slate-400">Ready for Photoshoot</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Upload your portrait and pick a theme to generate studio shots.
                  </p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[500px] flex items-center justify-center">
                    <img
                      src={result.imageUrl}
                      alt="Photoshoot Result"
                      className="max-h-[500px] w-auto object-contain mx-auto"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Theme: {selectedTheme}</span>
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
                  download="ZeeStudio_Photoshoot.png"
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
        operationName="AI Virtual Photoshoot"
        onConfirm={() => {
          setShowConsentModal(false);
          executePhotoshoot();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
