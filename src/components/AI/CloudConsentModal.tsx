/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Cloud, X, Lock, CheckCircle2 } from 'lucide-react';
import { AIProviderService } from '../../services/aiProviderService';

interface CloudConsentModalProps {
  isOpen: boolean;
  providerName: string;
  operationName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CloudConsentModal: React.FC<CloudConsentModalProps> = ({
  isOpen,
  providerName,
  operationName,
  onConfirm,
  onCancel,
}) => {
  const [dontAskAgain, setDontAskAgain] = React.useState(true);

  if (!isOpen) return null;

  const handleAgree = () => {
    if (dontAskAgain) {
      AIProviderService.setCloudConsent(true);
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Cloud AI Media Processing</h3>
              <p className="text-[11px] text-slate-400">User privacy & cloud transmission check</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>
              You are about to run <strong>{operationName}</strong> using <strong>{providerName}</strong>.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Local-First Guarantee:</strong> Only the specific photo(s) selected for this operation will be transmitted securely over encrypted HTTPS. Your full project timeline and gallery remain strictly on your device.
            </span>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontAskAgain}
            onChange={(e) => setDontAskAgain(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400"
          />
          <span>Remember my consent for cloud AI features</span>
        </label>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAgree}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            Proceed with Cloud AI
          </button>
        </div>
      </div>
    </div>
  );
};
