import React, { useState, useEffect } from 'react';
import {
  Share2,
  Download,
  Settings,
  Shield,
  Key,
  Lock,
  Smartphone,
  Wifi,
  WifiOff,
  Camera,
  Mic,
  HardDrive,
  Check,
  ExternalLink,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';
import { ZStudioLogo } from '../Branding/ZStudioLogo';
import { SystemIntents, SystemPermissionStatus } from '../../services/systemIntents';
import { SecurityService, AutoLockDelay } from '../../services/securityService';
import { Project } from '../../types/editor';

interface ExportAndSettingsViewProps {
  project: Project;
  onOpenPinSetup: () => void;
  networkStatus: string;
}

export const ExportAndSettingsView: React.FC<ExportAndSettingsViewProps> = ({
  project,
  onOpenPinSetup,
  networkStatus,
}) => {
  const [permissions, setPermissions] = useState<SystemPermissionStatus>(SystemIntents.getPermissions());
  const [exportRes, setExportRes] = useState<'4k' | '1080p' | '720p'>('1080p');
  const [exportFps, setExportFps] = useState<60 | 30 | 24>(60);
  const [exportBitrate, setExportBitrate] = useState<'high' | 'medium' | 'standard'>('high');

  // Security States
  const [isPinActive, setIsPinActive] = useState(SecurityService.isPinEnabled());
  const [isBgLock, setIsBgLock] = useState(SecurityService.isBgLockEnabled());
  const [autoLockDelay, setAutoLockDelay] = useState<AutoLockDelay>(SecurityService.getAutoLockDelay());
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(SecurityService.isBiometricsEnabled());

  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsub = SystemIntents.subscribe((p) => setPermissions(p));
    if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
      setIsBiometricSupported(true);
    }
    return unsub;
  }, []);

  const handleShareIntent = async (
    platform: 'system' | 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'whatsapp' | 'download'
  ) => {
    setShareFeedback(`Preparing ${platform.toUpperCase()} Share Intent...`);
    const res = await SystemIntents.dispatchExportAndShareIntent({
      title: project.name,
      text: `Mastered with Z-Studio Next-Gen AI Media Engine. Resolution: ${exportRes.toUpperCase()} @ ${exportFps}fps`,
      fileName: `${project.name.replace(/\s+/g, '_')}_${exportRes}_${exportFps}fps.mp4`,
      targetPlatform: platform,
    });

    setShareFeedback(res.message);
    setTimeout(() => setShareFeedback(null), 3500);
  };

  const handleToggleBgLock = (enabled: boolean) => {
    setIsBgLock(enabled);
    SecurityService.setBgLockEnabled(enabled);
  };

  const handleChangeAutoLock = (delay: AutoLockDelay) => {
    setAutoLockDelay(delay);
    SecurityService.setAutoLockDelay(delay);
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    SecurityService.setBiometricsEnabled(enabled);
  };

  return (
    <div className="flex-1 bg-[#090d16] text-slate-200 overflow-y-auto select-none p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <ZStudioLogo size={36} variant="neon" />
          <div>
            <h1 className="text-lg font-bold text-white">Export & System Architecture</h1>
            <p className="text-xs text-slate-400">
              Media sharing intents, system permissions & PIN security
            </p>
          </div>
        </div>

        {/* Network status pill */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            networkStatus === 'ONLINE'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
          }`}
        >
          {networkStatus === 'ONLINE' ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{networkStatus}</span>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {shareFeedback && (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check size={14} className="text-cyan-400" />
            {shareFeedback}
          </span>
          <button
            onClick={() => setShareFeedback(null)}
            className="text-slate-400 hover:text-white text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. EXPORT & SHARE INTENTS SECTION */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Export & Social Sharing Intents
            </h2>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 font-bold">
            Project: {project.name}
          </span>
        </div>

        {/* Resolution & FPS Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Render Resolution
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['4k', '1080p', '720p'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setExportRes(r)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    exportRes === r
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Frame Rate (FPS)
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {([60, 30, 24] as const).map((fps) => (
                <button
                  key={fps}
                  onClick={() => setExportFps(fps)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    exportFps === fps
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fps} FPS
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Encoding Bitrate
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(['high', 'medium', 'standard'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setExportBitrate(b)}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    exportBitrate === b
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Direct Sharing Platforms Grid */}
        <div className="pt-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-2">
            Target Platform Direct Share Intent
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* System Native Share */}
            <button
              onClick={() => handleShareIntent('system')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <Share2 size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <span>System Share</span>
            </button>

            {/* Direct Local Download */}
            <button
              onClick={() => handleShareIntent('download')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <Download size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Local Storage</span>
            </button>

            {/* TikTok */}
            <button
              onClick={() => handleShareIntent('tiktok')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-pink-500 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <ExternalLink size={18} className="text-pink-400 group-hover:scale-110 transition-transform" />
              <span>TikTok Share</span>
            </button>

            {/* Instagram Reels */}
            <button
              onClick={() => handleShareIntent('instagram')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <ExternalLink size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Instagram Reels</span>
            </button>

            {/* YouTube Shorts */}
            <button
              onClick={() => handleShareIntent('youtube')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <ExternalLink size={18} className="text-rose-400 group-hover:scale-110 transition-transform" />
              <span>YouTube Shorts</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleShareIntent('whatsapp')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-400 text-center font-bold text-xs flex flex-col items-center gap-1.5 transition-all hover:bg-slate-900 group"
            >
              <ExternalLink size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Direct</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SYSTEM MEDIA PERMISSIONS & INTENTS MANAGER */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Smartphone size={18} className="text-indigo-400" />
          <h2 className="text-sm font-bold text-white">
            System Intents & Hardware Permissions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Camera Permission */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Camera size={16} />
              </span>
              <div>
                <h4 className="font-bold text-white">Camera Access Intent</h4>
                <p className="text-[10px] text-slate-400">Photo capture & video recording</p>
              </div>
            </div>
            <button
              onClick={() => SystemIntents.requestCameraPermission(true)}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] capitalize transition-colors ${
                permissions.camera === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {permissions.camera === 'granted' ? '✓ Granted' : 'Authorize'}
            </button>
          </div>

          {/* Media Gallery Permission */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <HardDrive size={16} />
              </span>
              <div>
                <h4 className="font-bold text-white">Media Gallery Access</h4>
                <p className="text-[10px] text-slate-400">Read & write external media</p>
              </div>
            </div>
            <button
              onClick={() => SystemIntents.requestMediaGalleryPermission()}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]"
            >
              ✓ Ready
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECURITY & PIN LOCK CONFIGURATION */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={18} className="text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              Application Security & PIN Lock
            </h2>
          </div>
          <button
            onClick={onOpenPinSetup}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Key size={13} />
            <span>{isPinActive ? 'Change PIN' : 'Setup PIN Lock'}</span>
          </button>
        </div>

        <div className="space-y-3 text-xs">
          {/* Auto Lock Timeout */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Auto-Lock Inactivity Period</h4>
              <p className="text-[10px] text-slate-400">
                Automatically lock screen when idle
              </p>
            </div>
            <select
              value={autoLockDelay}
              onChange={(e) => handleChangeAutoLock(e.target.value as AutoLockDelay)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 px-3 py-1.5 rounded-lg outline-none"
            >
              <option value="immediately">Immediately</option>
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>

          {/* Background Lock Switch */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Lock When App Leaves Foreground</h4>
              <p className="text-[10px] text-slate-400">
                Immediately lock when app is minimized or backgrounded
              </p>
            </div>
            <button
              onClick={() => handleToggleBgLock(!isBgLock)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isBgLock ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isBgLock ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Biometric Unlock */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">Biometric Unlock (Face / Fingerprint)</h4>
              <p className="text-[10px] text-slate-400">
                {isBiometricSupported
                  ? 'Hardware biometric sensor detected & ready'
                  : 'WebAuthn hardware key biometric unlock'}
              </p>
            </div>
            <button
              onClick={() => handleToggleBiometric(!isBiometricEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                isBiometricEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  isBiometricEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
