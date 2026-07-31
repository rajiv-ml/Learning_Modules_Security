import TokenManager, { Tokens } from './TokenManager';
import SecurityLogger from './SecurityLogger';

export enum SessionState {
  CREATED = 'CREATED',
  LOCKED = 'LOCKED',
  UNLOCKED = 'UNLOCKED',
  REFRESHING = 'REFRESHING',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
  LOGGED_OUT = 'LOGGED_OUT'
}

class SessionManager {
  private static instance: SessionManager;
  private state: SessionState = SessionState.LOGGED_OUT;
  private listeners: Array<(state: SessionState) => void> = [];
  
  // Keep tokens in RAM after unlock, avoiding Biometric prompts on every API call.
  // Note: Due to JS Garbage Collection, memory zeroization isn't perfectly guaranteed,
  // but we remove references immediately upon lock/logout.
  private inMemoryTokens: Tokens | null = null;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public getState(): SessionState {
    return this.state;
  }

  private setState(newState: SessionState) {
    this.state = newState;
    this.listeners.forEach(listener => listener(newState));
  }

  public subscribe(listener: (state: SessionState) => void): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Called on App Launch or Biometric Resume
   */
  public async unlockSession(): Promise<boolean> {
    try {
      const tokens = await TokenManager.getTokens();
      if (tokens) {
        this.inMemoryTokens = tokens;
        this.setState(SessionState.UNLOCKED);
        return true;
      }
      return false;
    } catch (error) {
      SecurityLogger.logEvent({
        eventType: 'BIOMETRIC_FAILED',
        deviceId: await TokenManager.getDeviceId(),
        riskScore: 20,
        details: 'Failed to unlock Keystore tokens'
      });
      return false;
    }
  }

  /**
   * Called specifically by LoginScreen after a successful explicit authentication.
   */
  public setSessionActive(tokens: Tokens): void {
    this.inMemoryTokens = tokens;
    this.setState(SessionState.UNLOCKED);
  }

  /**
   * Returns RAM tokens. If null, caller should prompt unlockSession().
   */
  public getActiveTokens(): Tokens | null {
    return this.inMemoryTokens;
  }

  /**
   * Called on 10-min Idle Timeout
   */
  public lockSession(): void {
    // Drop references so GC can eventually sweep them
    this.inMemoryTokens = null;
    if (this.state === SessionState.UNLOCKED) {
      this.setState(SessionState.LOCKED);
    }
  }

  /**
   * Called during full Logout or Session Revocation
   */
  public async terminateSession(reason: 'LOGOUT' | 'REVOKED' | 'EXPIRED'): Promise<void> {
    this.inMemoryTokens = null;
    await TokenManager.clearTokens();
    
    switch (reason) {
      case 'LOGOUT': this.setState(SessionState.LOGGED_OUT); break;
      case 'REVOKED': this.setState(SessionState.REVOKED); break;
      case 'EXPIRED': this.setState(SessionState.EXPIRED); break;
    }
  }

  /**
   * Used strictly by API interceptor after a successful refresh
   */
  public updateInMemoryTokens(tokens: Tokens): void {
    this.inMemoryTokens = tokens;
  }
}

export default SessionManager.getInstance();
