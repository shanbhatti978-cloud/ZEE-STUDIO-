/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Wand2,
  X,
  Upload,
  RefreshCw,
  Download,
  Edit3,
  AlertTriangle,
  Sparkles,
  Layers,
  Sun,
  CloudRain,
  Palette,
  Shirt,
  UserCheck,
  History,
  Scissors
} from 'lucide-react';
import { AIEditOperationType, AIResult } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';
import { CloudConsentModal } from './CloudConsentModal';

interface AiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageDataUrl?: string;
  onOpenInEditor?: (imageUrl: string) => void;
}

const EDIT_OPERATIONS: Array<{ id: AIEditOperationType; name: string; icon: any; placeholder: string }> = [
  { id: 'replace_object', name: 'Replace Object', icon: Wand2, placeholder: 'Replace the sunglasses with vintage aviator spectacles...' },
  { id: 'remove_object', name: 'Remove Object', icon: Scissors, placeholder: 'Remove the passerby and trash can in the background...' },
  { id: 'change_background', name: 'Change Background', icon: Layers, placeholder: 'Change background to a modern luxury penthouse balcony at night...' },
  { id: 'change_clothing', name: 'Change Clothing', icon: Shirt, placeholder: 'Change the t-shirt to a navy tailored blazer and crisp white shirt...' },
  { id: 'change_lighting', name: 'Relight Scene', icon: Sun, placeholder: 'Add dramatic golden hour sunset side lighting with soft shadows...' },
  { id: 'change_weather', name: 'Change Weather & Sky', icon: CloudRain, placeholder: 'Change sunny sky to dramatic moody rain and wet pavement reflections...' },
  { id: 'change_environment', name: 'Change Environment', icon: Wand2, placeholder: 'Transport the person into a traditional Pakistani historical bazaar...' },
  { id: 'restore_photo', name: 'Restore Old Photo', icon: History, placeholder: 'Remove scratches, restore vintage faded colors, and deblur faces...' },
  { id: 'enhance_portrait', name: 'Enhance Portrait', icon: UserCheck, placeholder: 'Enhance facial lighting, sharpen eyes, and refine hair contours...' },
  { id: 'change_color', name: 'Color Harmonize', icon: Palette, placeholder: 'Grade photo into a warm emerald and copper cinematic tone...' },
  { id: 'creative_transform', name: 'Creative Transform', icon: Sparkles, placeholder: 'Transform photo into a royal regal portrait oil painting...' },
];

export const AiEditModal: React.FC<AiEditModalProps> = ({
  isOpen,
  onClose,
  initialImageDataUrl,
  onOpenInEditor,
}) => {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(initialImageDataUrl || null);
  const [selectedOperation, setSelectedOperation] = useState<AIEditOperationType>('change_background');
  const [instructionPrompt, setInstructionPrompt] = useState('');
  const [replacementSubject, setReplacementSubject] = useState('');
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

  const executeEdit = async () => {
    if (!imageDataUrl) {
      setErrorMsg('Please upload or select an image to edit.');
      return;
    }
    if (!instructionPrompt.trim() && !replacementSubject.trim()) {
      setErrorMsg('Please enter your edit instructions.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await AIProviderService.editImage({
        originalImageDataUrl: imageDataUrl,
        operation: selectedOperation,
        instructionPrompt: instructionPrompt.trim(),
        replacementSubject: replacementSubject.trim() || undefined,
        provider: 'gemini',
        model: 'gemini-3.1-flash-image',
      });

      if (res.success) {
        setResult(res);
      } else {
        setErrorMsg(res.error || 'AI edit operation failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred during AI edit.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyClick = () => {
    if (!AIProviderService.hasUserAcceptedCloudConsent()) {
      setShowConsentModal(true);
    } else {
      executeEdit();
    }
  };

  const currentOp = EDIT_OPERATIONS.find((op) => op.id === selectedOperation) || EDIT_OPERATIONS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[92vh] max-h-[920px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">AI Multi-Modal Photo Edit</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Non-Destructive Neural Editing
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Replace objects, change backgrounds, relight portraits, restyle clothing, and restore vintage photos
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
            
            {/* Image Selection */}
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
                  <span className="text-xs font-semibold">Upload Photo to Edit</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Operations Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Choose AI Operation</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {EDIT_OPERATIONS.map((op) => {
                  const Icon = op.icon;
                  const isSelected = selectedOperation === op.id;
                  return (
                    <button
                      key={op.id}
                      onClick={() => setSelectedOperation(op.id)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[11px] font-semibold truncate">{op.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instruction Prompt */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Editing Instructions</label>
              <textarea
                value={instructionPrompt}
                onChange={(e) => setInstructionPrompt(e.target.value)}
                placeholder={currentOp.placeholder}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              />
            </div>

            {selectedOperation === 'replace_object' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Replacement Item</label>
                <input
                  type="text"
                  value={replacementSubject}
                  onChange={(e) => setReplacementSubject(e.target.value)}
                  placeholder="e.g. A vintage mechanical wristwatch"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleApplyClick}
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
                  <span>Processing Cloud AI Edit...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-cyan-300" />
                  <span>Apply AI Edit</span>
                </>
              )}
            </button>
          </div>

          {/* Result / Compare Preview */}
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
                    <Wand2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Applying Neural Transformation</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Preserving skin textures, lighting direction, and scene depth...
                  </p>
                </div>
              )}

              {!isProcessing && !errorMsg && !result && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <Sparkles className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs font-semibold text-slate-400">Ready to Edit</p>
                  <p className="text-[11px] text-slate-600 max-w-xs">
                    Select an operation and describe your desired change.
                  </p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className="w-full space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl max-h-[480px] flex items-center justify-center">
                    <img
                      src={showOriginal && imageDataUrl ? imageDataUrl : result.imageUrl}
                      alt="AI Edit Result"
                      className="max-h-[480px] w-auto object-contain mx-auto"
                    />

                    {/* Hold to compare button */}
                    {imageDataUrl && (
                      <button
                        onMouseDown={() => setShowOriginal(true)}
                        onMouseUp={() => setShowOriginal(false)}
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700 text-xs font-semibold text-slate-200 select-none shadow-lg active:bg-cyan-500 active:text-slate-950"
                      >
                        {showOriginal ? 'Showing Original' : 'Hold to Compare'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="font-semibold text-white">Non-destructive Version Created</span>
                    <span>Render: {(result.executionTimeMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            {result && result.imageUrl && (
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-2.5">
                <a
                  href={result.imageUrl}
                  download="ZeeStudio_AI_Edit.png"
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
        operationName="AI Photo Edit"
        onConfirm={() => {
          setShowConsentModal(false);
          executeEdit();
        }}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  );
};
