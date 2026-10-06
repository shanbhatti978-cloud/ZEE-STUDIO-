/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Delete, KeyRound, Fingerprint, Lock, RefreshCw, AlertTriangle } from 'lucide-react';
import { SecurityService } from '../../services/securityService';

interface PinLockScreenProps {
  onUnlock: () => void;
  forceSetup?: boolean;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock, forceSetup = false }) => {
  const isSetupFlow = !SecurityService.isPinSet() || forceSetup;

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [setupStep, setSetupStep] = useState<'create' | 'confirm'>('create');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Initialize and check lockout or biometrics
  useEffect(() => {
    checkLockout();
    const interval = setInterval(checkLockout, 1000);

    // Check biometrics availability
    if (SecurityService.isBiometricsEnabled()) {
      setBiometricsAvailable(true);
      // Attempt immediate auto-biometric unlock on launch
      handleBiometricUnlock();
    }

    return () => clearInterval(interval);
  }, []);

  const checkLockout = () => {
    if (SecurityService.isLockedOut()) {
      const remaining = SecurityService.getLockoutTimeRemaining();
      setLockoutTime(remaining);
      setErrorMsg(`Too many failed attempts. Locked out for ${remaining}s.`);
    } else {
      if (lockoutTime > 0) {
        setLockoutTime(0);
        setErrorMsg(null);
      }
    }
  };

  const handleKeyPress = (num: string) => {
    if (lockoutTime > 0) return;
    setErrorMsg(null);
    
    setPin(prev => {
      if (prev.length >= 6) return prev;
      const next = prev + num;
      // Auto-validate challenge PIN if 6 digits or setup confirm auto-transitions
      return next;
    });
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  // Run validation whenever PIN updates
  useEffect(() => {
    if (!isSetupFlow && pin.length >= 4) {
      // If PIN is 6 digits or after a short delay for 4-5 digits, try verifying
      if (pin.length === 6) {
        verifyAndSubmit(pin);
      }
    }
  }, [pin]);

  const verifyAndSubmit = async (inputPin: string) => {
    const success = await SecurityService.verifyPin(inputPin);
    if (success) {
      onUnlock();
    } else {
      setPin('');
      if (SecurityService.isLockedOut()) {
        checkLockout();
      } else {
        const remainingAttempts = 5 - SecurityService.getFailedAttempts();
        setErrorMsg(`Incorrect PIN. ${remainingAttempts} attempts remaining.`);
      }
    }
  };

  const handleBiometricUnlock = async () => {
    const success = await SecurityService.authenticateBiometric();
    if (success) {
      onUnlock();
    }
  };

  const handleSetupSubmit = async () => {
    if (pin.length < 4) {
      setErrorMsg('PIN must be at least 4 digits long (6 digits preferred).');
      return;
    }

    if (setupStep === 'create') {
      setConfirmPin(pin);
      setPin('');
      setSetupStep('confirm');
      setErrorMsg(null);
    } else {
      if (pin !== confirmPin) {
        setErrorMsg('PINs do not match. Please start again.');
        setPin('');
        setConfirmPin('');
        setSetupStep('create');
        return;
      }

      await SecurityService.setupPin(pin);
      onUnlock();
    }
  };

  const handleEmergencyReset = () => {
    if (window.confirm('Emergency PIN Reset: Wiping PIN security data. Your local projects will remain completely safe. Continue?')) {
      SecurityService.performEmergencyReset();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#07090e] flex flex-col items-center justify-center z-[9999] px-6 select-none">
      <div className="w-full max-w-sm flex flex-col items-center">
        
        {/* Shield Icon header */}
        <div className="p-4 bg-sky-500/10 rounded-full border border-sky-500/20 mb-6 animate-pulse">
          <Shield size={36} className="text-sky-400" />
        </div>

        {/* Dynamic Title */}
        <h2 className="text-lg font-black text-white text-center leading-tight tracking-tight uppercase">
          {isSetupFlow 
            ? (setupStep === 'create' ? 'Create Secure App PIN' : 'Confirm App PIN')
            : 'VeloCut Pro Locked'
          }
        </h2>
        
        <p className="text-xs text-slate-400 text-center mt-1 mb-6 max-w-[280px]">
          {isSetupFlow
            ? 'Prevent unauthorized access to your professional creative drafts'
            : 'Enter your 4-6 digit passcode to unlock workspace'
          }
        </p>

        {/* Visual Dots Indicators */}
        <div className="flex items-center gap-4.5 justify-center mb-6 h-6">
          {Array(6).fill(0).map((_, i) => {
            const hasChar = i < pin.length;
            return (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-full border transition-all ${
                  hasChar 
                    ? 'bg-sky-400 border-sky-400 scale-110 shadow-md shadow-sky-400/20' 
                    : 'bg-transparent border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error / Lockout Messages */}
        {errorMsg && (
          <div className="mb-4 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-lg text-center flex items-center gap-1.5 animate-bounce">
            <AlertTriangle size={12} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button for setup flow */}
        {isSetupFlow && (
          <button
            onClick={handleSetupSubmit}
            disabled={pin.length < 4}
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 disabled:opacity-40 mb-6 active:scale-98 transition-all uppercase tracking-wider"
          >
            {setupStep === 'create' ? 'Next: Confirm PIN' : 'Enable Secure Lock'}
          </button>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              disabled={lockoutTime > 0}
              className="h-14 rounded-full bg-slate-900 hover:bg-slate-850 text-white text-lg font-black border border-slate-800/80 active:scale-90 transition-all flex items-center justify-center disabled:opacity-30"
            >
              {num}
            </button>
          ))}

          {/* Biometrics trigger or Lock icon */}
          {biometricsAvailable && !isSetupFlow ? (
            <button
              onClick={handleBiometricUnlock}
              disabled={lockoutTime > 0}
              className="h-14 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 active:scale-90 transition-all flex items-center justify-center"
              title="Biometric Fingerprint / Face ID"
            >
              <Fingerprint size={24} />
            </button>
          ) : (
            <div className="flex items-center justify-center">
              <Lock size={16} className="text-slate-600" />
            </div>
          )}

          {/* Zero key */}
          <button
            onClick={() => handleKeyPress('0')}
            disabled={lockoutTime > 0}
            className="h-14 rounded-full bg-slate-900 hover:bg-slate-850 text-white text-lg font-black border border-slate-800/80 active:scale-90 transition-all flex items-center justify-center disabled:opacity-30"
          >
            0
          </button>

          {/* Delete key */}
          <button
            onClick={handleDelete}
            className="h-14 rounded-full bg-slate-950 text-slate-400 hover:text-white active:scale-90 transition-all flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
        </div>

        {/* Back and Reset Options */}
        <div className="flex flex-col items-center gap-1">
          {!isSetupFlow && (
            <button
              onClick={handleEmergencyReset}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition-colors uppercase tracking-wider underline decoration-dashed decoration-1"
            >
              Forgot Passcode? Reset Security
            </button>
          )}
          <span className="text-[9px] text-slate-500 mt-1 font-semibold uppercase">VeloCut SafeLock Protocol v2</span>
        </div>

      </div>
    </div>
  );
};
export default PinLockScreen;
