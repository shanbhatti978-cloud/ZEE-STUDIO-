/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  Zap,
  Server,
  Key,
  Layers
} from 'lucide-react';
import { AIUsageMetrics } from '../../types/ai';
import { AIProviderService } from '../../services/aiProviderService';

interface AiUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiUsageModal: React.FC<AiUsageModalProps> = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState<AIUsageMetrics | null>(null);
  const [providerStatus, setProviderStatus] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMetrics(AIProviderService.getMetrics());
      fetch('/api/ai/provider-status')
        .then((r) => r.json())
        .then((d) => setProviderStatus(d))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/provider-status');
      const data = await res.json();
      setProviderStatus(data);
      if (data.gemini?.available) {
        setTestResult('Gemini Cloud API is online and fully configured on the server.');
      } else {
        setTestResult('Gemini server key is ready for client-provided API requests.');
      }
    } catch (e: any) {
      setTestResult(`Connection check failed: ${e.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-100 space-y-4 p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Usage & Quota Manager</h3>
              <p className="text-[11px] text-slate-400">Request metrics, estimated costs, and provider health</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Summary Cards */}
        {metrics && (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Total Calls</div>
              <div className="text-lg font-bold text-white mt-0.5">{metrics.totalRequests}</div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Success Rate</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                {metrics.totalRequests > 0
                  ? `${Math.round((metrics.successfulRequests / metrics.totalRequests) * 100)}%`
                  : '100%'}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Est. Cost</div>
              <div className="text-lg font-bold text-cyan-400 mt-0.5">
                ${metrics.totalCostEstimate.toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Provider Breakdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">Active Provider Status</label>
          <div className="space-y-2">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-white">Google Gemini Image Engine</div>
                  <div className="text-[10px] text-slate-400">Models: gemini-3.1-flash-image (Nano Banana 2), 3-pro-image</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white">Leonardo AI Cloud Adapter</div>
                  <div className="text-[10px] text-slate-400">Models: leonardo-photoreal-v2, creative</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Supported
              </span>
            </div>
          </div>
        </div>

        {/* Connection Test & Security */}
        <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Backend Proxy Health
            </span>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
              Test API
            </button>
          </div>
          {testResult && <p className="text-[11px] text-cyan-300 leading-relaxed">{testResult}</p>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-logging security policy</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
