/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Image as ImageIcon,
  Sliders,
  RefreshCw,
  Download,
  Edit3,
  Layers,
  AlertTriangle,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Zap,
  Camera,
  Coins
} from 'lucide-react';
import {
  AIProviderId,
  ImageAspectRatio,
  ImageResolution,
  AIResult,
  AIImageReference,
} from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { ModelCapabilityRegistry } from '../../services/modelCapabilityRegistry';
import { CloudConsentModal } from './CloudConsentModal';

interface AiPhotoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor?: (imageUrl: string) => void;
}

const STYLE_PRESETS = [
  { id: 'portrait_pro', name: 'Professional Portrait', icon: '👤', prompt: '85mm portrait photography, soft studio lighting, ultra-realistic skin texture, 8k resolution' },
  { id: 'fashion', name: 'High Fashion Editorial', icon: '👗', prompt: 'Vogue editorial fashion photography, avant-garde styling, dynamic pose, dramatic high-key lighting' },
  { id: 'cinematic', name: 'Cinematic Movie Frame', icon: '🎬', prompt: 'Cinematic 35mm anamorphic film still, moody color grading, volumetric haze, depth of field' },
  { id: 'luxury', name: 'Luxury Lifestyle', icon: '💎', prompt: 'Luxury aesthetic, golden hour glow, penthouse background, clean elegant composition' },
  { id: 'wedding', name: 'Wedding & Bridal', icon: '💍', prompt: 'Ethereal wedding photography, soft pastel palette, romantic bokeh, delicate lace detailing' },
  { id: 'couple', name: 'Romantic Couple', icon: '❤️', prompt: 'Intimate candid couple portrait, golden sunset warmth, genuine emotional expression' },
  { id: 'family', name: 'Warm Family Moment', icon: '👨‍👩‍👧', prompt: 'Heartwarming family lifestyle photo, natural outdoor light, laughing and joyful' },
  { id: 'business', name: 'Corporate Headshot', icon: '💼', prompt: 'Executive corporate headshot, modern office background, clean rim lighting, confident posture' },
  { id: 'travel', name: 'Wanderlust Travel', icon: '✈️', prompt: 'National Geographic travel photography, scenic mountain vistas, golden hour, epic scale' },
  { id: 'desi_pakistani', name: 'Pakistani / Desi Festive', icon: '✨', prompt: 'Rich South Asian Pakistani bridal aesthetic, intricate embroidery, jhumkas, vibrant royal tones' },
  { id: 'eid_ramadan', name: 'Eid & Ramadan Festive', icon: '🌙', prompt: 'Festive Eid Mubarak celebration, warm lantern glow, crescent moon lighting, elegant traditional attire' },
  { id: 'social_media', name: 'Social Media Influencer', icon: '📱', prompt: 'Trendy aesthetic creator lifestyle, bright pastel lighting, crisp phone lens look' },
  { id: 'product', name: 'Commercial Product', icon: '📦', prompt: 'Commercial product photography on minimalist marble pedestal, sharp studio rim lights' },
  { id: 'dslr', name: 'DSLR Masterpiece', icon: '📷', prompt: 'Canon 1DX Mark III photo, f/1.2 prime lens, razor-sharp focus, natural chromatic richness' },
  { id: 'film_look', name: '35mm Vintage Film', icon: '🎞️', prompt: 'Kodak Portra 400 film grain, warm nostalgic tones, subtle light leak, analog aesthetic' },
];

const ASPECT_RATIOS: ImageAspectRatio[] = ['1:1', '9:16', '16:9', '4:5', '3:4', '2:3', '3:2'];
const RESOLUTIONS: ImageResolution[] = ['1K', '2K', '4K'];

export const AiPhotoGeneratorModal: React.FC<AiPhotoGeneratorModalProps> = ({
  isOpen,
  onClose,
  onOpenInEditor,
}) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('9:16');
  const [resolution, setResolution] = useState<ImageResolution>('1K');
  const [provider, setProvider] = useState<AIProviderId>('gemini');
  const [model, setModel] = useState<string>('gemini-3.1-flash-image');
  const [referenceImages, setReferenceImages] = useState<AIImageReference[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof STYLE_PRESETS[0]) => {
    setSelectedPreset(preset.id);
    if (!prompt.trim()) {
      setPrompt(preset.name);
    }
  };

  const handleAddReferenceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newRef: AIImageReference = { dataUrl, mimeType: file.type, type: 'subject' };
      setReferenceImages((prev) => [...prev, newRef].slice(0, 3));
    };
    reader.readAsDataURL(file);
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const executeGeneration = async () => {
    if (!prompt.trim()) {
      setErrorMsg('Please enter a description or prompt for the image.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setResult(null);

    const presetObj = STYLE_PRESETS.find((p) => p.id === selectedPreset);

    try {
      const res = await AIProviderService.generateImage({
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        stylePreset: presetObj ? presetObj.prompt : undefined,
        aspectRatio,
        resolution,
        provider,
        model,
        referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'Image generation failed. Please try again.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateClick = () => {
    if (!AIProviderService.hasUserAcceptedCloudConsent()) {
      setShowConsentModal(true);
    } else {
      executeGeneration();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Photo Generator</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Cloud AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Generate hyper-realistic portraits, editorial fashion, cinematic frames, and festive looks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main 2-Column Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Controls Panel */}
          <div className="lg:col-span-6 p-6 overflow-y-auto space-y-5 border-r border-slate-800/80">
            
            {/* Prompt Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Prompt Description</span>
                <span className="text-[10px] text-slate-500">{prompt.length}/500 chars</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create (e.g. A high-fashion Pakistani bridal portrait in Lahore Fort courtyard, golden sunset, natural skin texture...)"
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Style & Mood Presets</label>
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PRESETS.slice(0, 9).map((p) => {
                  const isSelected = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePresetSelect(p)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="text-base mb-1">{p.icon}</div>
                      <div className="text-[11px] font-semibold truncate">{p.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reference Images (Multi-Reference Support) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Reference Images (Optional)
                </label>
                <span className="text-[10px] text-slate-500">{referenceImages.length}/3 attached</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {referenceImages.map((ref, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 flex-shrink-0 group">
                    <img src={ref.dataUrl} alt="ref" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeReferenceImage(idx)}
                      className="absolute inset-0 bg-rose-950/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {referenceImages.length < 3 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/40 text-slate-400 hover:text-cyan-400 flex-shrink-0">
                    <Plus className="w-4 h-4" />
                    <span className="text-[9px] mt-0.5">Add</span>
                    <input type="file" accept="image/*" onChange={handleAddReferenceImage} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Aspect Ratio & Resolution */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Aspect Ratio</label>
                <div className="flex flex-wrap gap-1.5">
                  {ASPECT_RATIOS.map((ar) => (
                    <button
                      key={ar}
                      onClick={() => setAspectRatio(ar)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        aspectRatio === ar
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Output Resolution</label>
                <div className="flex gap-1.5">
                  {RESOLUTIONS.map((res) => (
                    <button
                      key={res}
                      onClick={() => setResolution(res)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        resolution === res
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Provider & Model Select */}
            <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  AI Model Engine
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <Coins className="w-3 h-3" />
                  Est. $0.03
                </span>
              </div>

              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="gemini-3.1-flash-image">Gemini 3.1 Flash Image (Nano Banana 2 - 4K Capable)</option>
                <option value="gemini-3.1-flash-lite-image">Gemini 3.1 Flash Lite (Fast Synthesis)</option>
                <option value="gemini-3-pro-image">Gemini 3 Pro Image (Nano Banana Pro)</option>
                <option value="leonardo-photoreal-v2">Leonardo PhotoReal v2 (DSLR Aesthetic)</option>
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateClick}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                isGenerating || !prompt.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-cyan-500/20 active:scale-[0.99]'
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Synthesizing Photo with {model.includes('gemini') ? 'Gemini' : 'Leonardo'}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generate Photo</span>
                </>
              )}
            </button>
          </div>

          {/* Right Preview & Result Canvas */}
          <div className="lg:col-span-6 p-6 bg-slate-950/40 flex flex-col justify-between overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs max-w-md w-full space-y-2 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto text-rose-400" />
                  <p className="font-semibold">{errorMsg}</p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 animate-pulse">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Rendering Photographic Master</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Executing cloud neural pipeline: resolving lighting geometry, camera depth, and textures...
                  </p>
                </div>
              )}

              {!isGenerating && !errorMsg && !result && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-slate-400">Ready to Generate</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Choose a preset or type a custom prompt to generate photo studio visuals.
                  </p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[500px] flex items-center justify-center">
                    <img
                      src={result.imageUrl}
                      alt="Generated Visual"
                      className="max-h-[500px] w-auto object-contain mx-auto"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Model: {result.model}</span>
                    <span>Time: {(result.executionTimeMs / 1000).toFixed(1)}s</span>
                    <span className="text-emerald-400 font-semibold">Cost: ~${result.costEstimate?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar for Result */}
            {result && result.imageUrl && (
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
                <a
                  href={result.imageUrl}
                  download="ZeeStudio_AI_Photo.png"
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

      {/* Privacy Consent Modal */}
      <CloudConsentModal
        isOpen={showConsentModal}
        providerName={provider === 'gemini' ? 'Google Gemini' : 'Leonardo AI'}
        operationName="AI Photo Generation"
        onConfirm={() => {
          setShowConsentModal(false);
          executeGeneration();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
