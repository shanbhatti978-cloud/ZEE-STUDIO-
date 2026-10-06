/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Shield, KeyRound, Fingerprint, Clock, Zap, 
  Globe, Wifi, WifiOff, RefreshCw, HardDrive, Cloud, AlertCircle, Check, Trash2, Key
} from 'lucide-react';
import { SecurityService, AutoLockDelay } from '../../services/securityService';
import { NetworkService, NetworkState } from '../../services/networkService';
import { AudioEngine } from '../../engine/AudioEngine';

interface SettingsDrawerProps {
  onClose: () => void;
  onOpenPinSetup: () => void;
  onOpenStorageManager?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ onClose, onOpenPinSetup, onOpenStorageManager }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'connection'>('security');
  
  // Security States
  const [pinEnabled, setPinEnabled] = useState(SecurityService.isPinEnabled());
  const [biometricsEnabled, setBiometricsEnabled] = useState(SecurityService.isBiometricsEnabled());
  const [autoLockDelay, setAutoLockDelay] = useState<AutoLockDelay>(SecurityService.getAutoLockDelay());
  const [bgLockEnabled, setBgLockEnabled] = useState(SecurityService.isBgLockEnabled());
  
  // Change PIN States
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [changePinError, setChangePinError] = useState<string | null>(null);
  const [changePinSuccess, setChangePinSuccess] = useState<string | null>(null);

  // Network & Cloud States
  const [networkState, setNetworkState] = useState<NetworkState>(NetworkService.getNetworkState());
  const [cloudBackup, setCloudBackup] = useState(() => localStorage.getItem('velocut_cloud_backup_v1') === 'true');

  // Monitor network events inside component
  useEffect(() => {
    const handleState = (state: NetworkState) => {
      setNetworkState(state);
    };
    NetworkService.registerListener(handleState);
    return () => {
      NetworkService.unregisterListener(handleState);
    };
  }, []);

  const handleTogglePin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      if (!SecurityService.isPinSet()) {
        // Redirect to PIN creation UI
        onOpenPinSetup();
        onClose();
      } else {
        SecurityService.setPinEnabled(true);
        setPinEnabled(true);
      }
    } else {
      SecurityService.setPinEnabled(false);
      setPinEnabled(false);
    }
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.85);
  };

  const handleToggleBiometrics = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    SecurityService.setBiometricsEnabled(checked);
    setBiometricsEnabled(checked);
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.85);
  };

  const handleAutoLockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as AutoLockDelay;
    SecurityService.setAutoLockDelay(val);
    setAutoLockDelay(val);
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.85);
  };

  const handleToggleBgLock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    SecurityService.setBgLockEnabled(checked);
    setBgLockEnabled(checked);
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.85);
  };

  const handleChangePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError(null);
    setChangePinSuccess(null);

    if (newPin.length < 4) {
      setChangePinError('New PIN must be at least 4 digits long (6 digits preferred).');
      return;
    }

    if (newPin !== confirmNewPin) {
      setChangePinError('New PIN confirmation does not match.');
      return;
    }

    const success = await SecurityService.changePin(oldPin, newPin);
    if (success) {
      setChangePinSuccess('Passcode successfully changed and secured!');
      setOldPin('');
      setNewPin('');
      setConfirmNewPin('');
      setTimeout(() => {
        setIsChangingPin(false);
        setChangePinSuccess(null);
      }, 1500);
      AudioEngine.playSoundEffect('sfx-pop-bubble', 0.9);
    } else {
      setChangePinError('Current Passcode is incorrect.');
    }
  };

  const handleToggleCloudBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setCloudBackup(checked);
    localStorage.setItem('velocut_cloud_backup_v1', checked ? 'true' : 'false');
    AudioEngine.playSoundEffect('sfx-pop-bubble', 0.85);
  };

  const handleForcePing = async () => {
    AudioEngine.playSoundEffect('sfx-glitch-digital', 0.8);
    await NetworkService.verifyRealConnection();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#121624] border border-slate-800 rounded-2xl w-full max-w-md p-5 flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-sky-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">System Control Deck</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 mb-4 shrink-0">
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'security' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={13} />
            <span>Vault & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('connection')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'connection' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe size={13} />
            <span>AI Provider & Cloud</span>
          </button>
        </div>

        {/* Scrollable Container Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: VAULT & SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              
              {/* PIN Lock toggle */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Vault Passcode Lock</span>
                  <span className="text-[10px] text-slate-400 block">Require PIN on application launch</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={pinEnabled}
                    onChange={handleTogglePin}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950" />
                </label>
              </div>

              {/* Change PIN Button Flow */}
              {pinEnabled && (
                <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                  {!isChangingPin ? (
                    <button
                      onClick={() => setIsChangingPin(true)}
                      className="w-full py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-300 font-semibold text-[11px] rounded-lg border border-slate-800 flex items-center justify-center gap-1 transition-colors"
                    >
                      <KeyRound size={12} />
                      <span>Modify Passcode Lock</span>
                    </button>
                  ) : (
                    <form onSubmit={handleChangePinSubmit} className="space-y-2.5">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Modify PIN Credentials</span>
                      
                      <div>
                        <input
                          type="password"
                          value={oldPin}
                          onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Current Passcode..."
                          required
                          maxLength={6}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="password"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="New Passcode..."
                          required
                          maxLength={6}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                        <input
                          type="password"
                          value={confirmNewPin}
                          onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                          placeholder="Confirm New..."
                          required
                          maxLength={6}
                          className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                        />
                      </div>

                      {changePinError && (
                        <span className="text-[10px] font-bold text-rose-400 block">{changePinError}</span>
                      )}
                      {changePinSuccess && (
                        <span className="text-[10px] font-bold text-emerald-400 block">{changePinSuccess}</span>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsChangingPin(false);
                            setOldPin('');
                            setNewPin('');
                            setConfirmNewPin('');
                            setChangePinError(null);
                          }}
                          className="flex-1 py-1.5 bg-slate-800 text-slate-300 font-semibold text-[11px] rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg hover:bg-amber-400"
                        >
                          Save New PIN
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Biometrics biometric Toggle */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Biometric Fingerprint / Face ID</span>
                  <span className="text-[10px] text-slate-400 block">Use device hardware credentials if supported</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={biometricsEnabled}
                    onChange={handleToggleBiometrics}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950" />
                </label>
              </div>

              {/* Configurable Auto-Lock Selector */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Inactivity Auto-Lock</span>
                  <span className="text-[10px] text-slate-400 block">Lock screen after inactivity delay</span>
                </div>
                <select
                  value={autoLockDelay}
                  onChange={handleAutoLockChange}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold px-2 py-1 text-slate-200 focus:border-amber-500 outline-none"
                >
                  <option value="immediately">Immediately</option>
                  <option value="1">1 Minute</option>
                  <option value="5">5 Minutes</option>
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="never">Never</option>
                </select>
              </div>

              {/* Background Lock Toggle */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Background Lockout Protection</span>
                  <span className="text-[10px] text-slate-400 block">Force PIN lock when app leaves foreground</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={bgLockEnabled}
                    onChange={handleToggleBgLock}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950" />
                </label>
              </div>

            </div>
          )}

          {/* TAB 2: AI PROVIDER & NETWORK STATE */}
          {activeTab === 'connection' && (
            <div className="space-y-4">
              
              {/* Connection Diagnostics Indicator */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {networkState === 'ONLINE' ? (
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <Wifi size={15} />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-rose-500/10 text-rose-400 rounded-lg">
                        <WifiOff size={15} />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-bold text-white block">Connection Diagnostic</span>
                      <span className="text-[10px] text-slate-400 block">Real-time gateway analysis</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      networkState === 'ONLINE' 
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/35'
                        : networkState === 'CONNECTING'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/35 animate-pulse'
                        : 'bg-rose-500/15 text-rose-400 border-rose-500/35'
                    }`}>
                      {networkState}
                    </span>
                    <button
                      onClick={handleForcePing}
                      className="p-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white rounded-lg border border-slate-800"
                      title="Verify Connection Now"
                    >
                      <RefreshCw size={12} className={networkState === 'CONNECTING' ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cloud Backup (ON / OFF) */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Optional Cloud Sync Backups</span>
                  <span className="text-[10px] text-slate-400 block">Sync version histories on secure remote vault</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={cloudBackup}
                    onChange={handleToggleCloudBackup}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-slate-950" />
                </label>
              </div>

              {/* Local-First Architecture Indicators */}
              <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">Local-First Vault & Storage</span>
                  {onOpenStorageManager && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenStorageManager();
                      }}
                      className="text-[10px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20"
                    >
                      <HardDrive size={10} />
                      <span>Manage Storage</span>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-850 flex items-center gap-1.5">
                    <HardDrive size={13} className="text-emerald-400" />
                    <div>
                      <span className="text-slate-300 block font-bold">100% Offline Capable</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">Drafts, edits and rendering remain on-device</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-slate-900/60 border border-slate-850 flex items-center gap-1.5">
                    <Cloud size={13} className="text-sky-400" />
                    <div>
                      <span className="text-slate-300 block font-bold">Opt-in Online AI</span>
                      <span className="text-[9px] text-slate-500 block leading-tight">Gemini endpoints enhance b-roll tracking & translation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Breakdown */}
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Available Features Mapping</span>
                
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">Local Offline Editor:</span>
                    <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <Check size={10} /> Active
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">Timeline compilation, local filters, curves, keyframes, transitions, stickers, and video photo JPEG/MP4 export compilers work without any network.</p>

                  <div className="h-px bg-slate-850 my-1" />

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold">Online AI Cloud Proxies:</span>
                    <span className={networkState === 'ONLINE' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {networkState === 'ONLINE' ? '● AVAILABLE' : '○ OFFLINE FALLBACK'}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 leading-tight">Gemini 3.8 video link crawler, automatic speech-to-text karaoke captions, dynamic translation, and natural language prompts are activated when online.</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer lock state indicator */}
        <div className="pt-3 border-t border-slate-800/80 mt-4 text-center shrink-0 flex items-center justify-between text-[10px] text-slate-500">
          <span>Security Protocol Active</span>
          <span className="font-mono text-sky-500/80 font-bold">TLS / SHA-256</span>
        </div>

      </div>
    </div>
  );
};
export default SettingsDrawer;
