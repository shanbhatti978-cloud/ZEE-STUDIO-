/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NetworkState = 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR';

type StateListener = (state: NetworkState) => void;

export class NetworkService {
  private static listeners: Set<StateListener> = new Set();
  private static currentState: NetworkState = navigator.onLine ? 'ONLINE' : 'OFFLINE';

  static {
    // Hook standard browser network events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.updateState('ONLINE'));
      window.addEventListener('offline', () => this.updateState('OFFLINE'));

      // Periodically ping in background to verify real internet connectivity, not just Wi-Fi hook
      setInterval(() => {
        this.verifyRealConnection();
      }, 15000);
    }
  }

  public static getNetworkState(): NetworkState {
    return this.currentState;
  }

  public static isOnline(): boolean {
    return this.currentState === 'ONLINE';
  }

  public static registerListener(listener: StateListener) {
    this.listeners.add(listener);
    // Emit immediate current state
    listener(this.currentState);
  }

  public static unregisterListener(listener: StateListener) {
    this.listeners.delete(listener);
  }

  private static updateState(newState: NetworkState) {
    if (this.currentState === newState) return;
    this.currentState = newState;
    this.listeners.forEach(cb => {
      try {
        cb(newState);
      } catch (e) {
        console.error('Network listener error', e);
      }
    });
  }

  /**
   * Performs an actual background network request to verify genuine internet access (Google/DNS response).
   */
  public static async verifyRealConnection(): Promise<NetworkState> {
    if (typeof window === 'undefined') return 'OFFLINE';
    
    if (!navigator.onLine) {
      this.updateState('OFFLINE');
      return 'OFFLINE';
    }

    try {
      this.updateState('CONNECTING');
      // Fetch dynamic tiny assets or verify CORS response
      const res = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
      if (res) {
        this.updateState('ONLINE');
        return 'ONLINE';
      }
      this.updateState('ONLINE');
      return 'ONLINE';
    } catch (e) {
      // Offline or network error
      console.warn('Real connection verification failed', e);
      this.updateState('OFFLINE');
      return 'OFFLINE';
    }
  }
}
