/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  X,
  ShieldCheck,
  CheckCircle2,
  Key,
  Server,
  Zap,
  Info,
  RefreshCw
} from 'lucide-react';
import { AIProviderService, AIProviderConfig } from '../../services/aiProviderService';
import { AIProviderId } from '../../types/ai';

interface AiProviderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiProviderConfigModal: React.FC<AiProviderConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<AIProviderConfig>(AIProviderService.getConfig());
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(AIProviderService.getConfig());
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    AIProviderService.updateConfig(config);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 space-y-4 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Provider & Routing Settings</h3>
              <p className="text-[11px] text-slate-400">Configure cloud providers, model routing, and fallback behavior</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary & Fallback Provider */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Preferred AI Provider</label>
            <select
              value={config.preferredProvider}
              onChange={(e) => setConfig({ ...config, preferredProvider: e.target.value as AIProviderId })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini">Google Gemini (Nano Banana 2 / Flash Image)</option>
              <option value="leonardo">Leonardo AI (PhotoReal / Creative)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Fallback Provider (If Primary Unavailable)</label>
            <select
              value={config.fallbackProvider}
              onChange={(e) => setConfig({ ...config, fallbackProvider: e.target.value as AIProviderId })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="leonardo">Leonardo AI</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
        </div>

        {/* Model Selection */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Default Gemini Model</label>
            <select
              value={config.geminiModel}
              onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="gemini-3.1-flash-image">gemini-3.1-flash-image (Nano Banana 2 - 4K Capable)</option>
              <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image (Fast Synthesis)</option>
              <option value="gemini-3-pro-image">gemini-3-pro-image (Nano Banana Pro)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Default Leonardo Model</label>
            <select
              value={config.leonardoModel}
              onChange={(e) => setConfig({ ...config, leonardoModel: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="leonardo-photoreal-v2">leonardo-photoreal-v2 (DSLR Photorealism)</option>
              <option value="leonardo-creative">leonardo-creative (Artistic / Illustration)</option>
            </select>
          </div>
        </div>

        {/* Optional Custom API Key overrides */}
        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Optional Custom Leonardo API Key
          </div>
          <input
            type="password"
            value={config.userLeonardoApiKey || ''}
            onChange={(e) => setConfig({ ...config, userLeonardoApiKey: e.target.value })}
            placeholder="Enter Leonardo API key if using custom account..."
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <p className="text-[10px] text-slate-500">
            Keys are encrypted in local device storage and used only to authorize direct requests.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict zero-fake fallback policy</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
            >
              {isSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
              {isSaved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
