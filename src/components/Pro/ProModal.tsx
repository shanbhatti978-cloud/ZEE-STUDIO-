import React from 'react';
import { Crown, Check, Zap, Sparkles, X } from 'lucide-react';

interface ProModalProps {
  isPro: boolean;
  onTogglePro: (pro: boolean) => void;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({
  isPro,
  onTogglePro,
  onClose,
}) => {
  const features = [
    { name: '4K & 2K Ultra HD Export', free: '1080p Max', pro: '4K 60 FPS' },
    { name: 'AI Multilingual Auto Captions', free: 'Basic English', pro: 'All 5 Languages' },
    { name: 'AI Smart Cut & Dead Space Trim', free: 'Manual', pro: 'Instant Auto-Trim' },
    { name: 'Chroma Key & Background Removal', free: 'Limited', pro: 'Full Green Screen' },
    { name: 'Trending TikTok/Reels Templates', free: '3 Included', pro: 'All Templates' },
    { name: 'Premium Transitions & VFX', free: 'Standard', pro: 'All 3D & Whips' },
    { name: 'Custom Template JSON Export', free: 'No', pro: 'Unlimited' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#121624] border border-amber-500/30 rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Crown size={24} className="fill-slate-950" />
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            VeloCut <span className="text-amber-400">PRO</span> Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unlock maximum export resolution, advanced AI processing, and viral creative templates
          </p>
        </div>

        {/* Features Table */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-3 mb-5 flex flex-col gap-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
              <span className="text-slate-300 font-medium">{f.name}</span>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-500">{f.free}</span>
                <span className="text-amber-400 font-bold flex items-center gap-1">
                  <Check size={12} />
                  <span>{f.pro}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Toggle */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onTogglePro(!isPro);
              onClose();
            }}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
              isPro
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25'
            }`}
          >
            <Crown size={15} className={isPro ? '' : 'fill-slate-950'} />
            <span>{isPro ? 'Deactivate Pro Mode' : 'Activate Pro Access (Demo)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
