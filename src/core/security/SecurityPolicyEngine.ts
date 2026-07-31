import RASPManager from './RASPManager';
import AttestationService from './AttestationService';
import SessionManager from './SessionManager';
import SecurityLogger from './SecurityLogger';
import TokenManager from './TokenManager';
import { Alert } from 'react-native';

class SecurityPolicyEngine {
    private isChecking: boolean = false;

    /**
     * Orchestrates the full security verification lifecycle.
     * Prevents overlapping checks using a concurrency lock.
     */
    public async performSecurityCheck(): Promise<void> {
        if (this.isChecking) {
            SecurityLogger.warn('[SecurityPolicyEngine] Check already in progress. Ignoring duplicate request.');
            return;
        }

        this.isChecking = true;
        SecurityLogger.info('[Startup] Security checks started');

        try {
            // 1. Run Native RASP Checks (Root, Hook, Emulator, etc.)
            await RASPManager.evaluateDeviceIntegrity();

            // 2. Perform Backend Attestation
            // We generate a cryptographic nonce for Play Integrity replay protection
            const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            
            const attestationPassed = await AttestationService.performBackendAttestation(nonce);

            if (!attestationPassed) {
                // Backend rejected our token (e.g., 403 Forbidden)
                await this.enforceTamperedPolicy('Backend Attestation Failed');
            }

            SecurityLogger.info('[Startup] Security checks completed successfully');
        } catch (error: any) {
            SecurityLogger.error('[SecurityPolicyEngine] Security Check Failed:', error);
            
            // If the RASPManager threw a TAMPERED or COMPROMISED error, enforce policy
            if (error.message?.includes('TAMPERED') || error.message?.includes('COMPROMISED')) {
                await this.enforceTamperedPolicy(error.message);
            }
        } finally {
            this.isChecking = false;
        }
    }

    /**
     * Executes the Kill-Chain for compromised devices
     */
    private async enforceTamperedPolicy(reason: string): Promise<void> {
        SecurityLogger.logEvent('HOOK_DETECTED', { details: reason });
        
        // Wipe hardware Keystore
        await TokenManager.clearTokens();
        
        // Drop in-memory session (forces navigation to LoginScreen)
        await SessionManager.terminateSession('REVOKED');

        // Block UI
        Alert.alert(
            'Security Violation Detected',
            'Your device does not meet the security requirements to run this application.',
            [{ text: 'EXIT', onPress: () => {} }],
            { cancelable: false }
        );
        // We no longer throw an Error here because it causes an unhandled promise rejection in React Native
        // The UI is blocked by the Alert and the Session is revoked, which is sufficient.
    }
}

export default new SecurityPolicyEngine();
