/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  Trash2,
  Download,
  Edit3,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Search,
  Camera,
  Wand2,
  Palette,
  Maximize2
} from 'lucide-react';
import { AIGenerationHistoryItem } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';

interface AiHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInEditor?: (imageUrl: string) => void;
  onReusePrompt?: (prompt: string) => void;
}

export const AiHistoryModal: React.FC<AiHistoryModalProps> = ({
  isOpen,
  onClose,
  onOpenInEditor,
  onReusePrompt,
}) => {
  const [history, setHistory] = useState<AIGenerationHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(AIProviderService.getHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    AIProviderService.deleteHistoryItem(id);
    setHistory(AIProviderService.getHistory());
  };

  const handleClearAll = () => {
    AIProviderService.clearHistory();
    setHistory([]);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return item.prompt.toLowerCase().includes(q) || item.type.includes(q) || item.model.includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[88vh] max-h-[860px] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Generation History</h2>
              <p className="text-xs text-slate-400">
                Browse, regenerate, copy prompts, and send past neural generations to the Photo Editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history by prompt, operation type, or model..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2">
              <History className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-xs font-bold text-slate-400">No Generation History Found</p>
              <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                Any photos you generate, edit, or upscale with Cloud AI will be preserved here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div className="relative aspect-square bg-slate-900 overflow-hidden">
                      <img src={item.generatedImageUrl} alt={item.prompt} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-cyan-400 uppercase border border-slate-700">
                        {item.type}
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 space-y-2">
                      <p className="text-xs text-slate-200 line-clamp-2 font-medium leading-relaxed">
                        {item.prompt}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span className="font-mono">{item.model}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleCopyPrompt(item.id, item.prompt)}
                      title="Copy Prompt"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    <a
                      href={item.generatedImageUrl}
                      download={`ZeeStudio_AI_${item.type}.png`}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {onOpenInEditor && (
                      <button
                        onClick={() => {
                          onOpenInEditor(item.generatedImageUrl);
                          onClose();
                        }}
                        className="flex-1 py-1.5 px-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 shadow-md"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
