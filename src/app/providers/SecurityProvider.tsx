import React, { useEffect, useRef, useState } from 'react';
import { AppState, NativeModules, Alert, BackHandler } from 'react-native';

const { SecurityManager } = NativeModules;

export const SecurityProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const appState = useRef(AppState.currentState);
    const [isSecure, setIsSecure] = useState(true);

    const performSecurityCheck = async () => {
        try {
            if (!SecurityManager) {
                // Native module not available (e.g. in development/testing)
                console.warn('SecurityManager native module not available');
                return;
            }

            // Generate a random nonce for this request to prevent replay attacks
            const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
            
            // This calls the native method we wrote, which calculates local risk
            // AND requests a Play Integrity Token from Google
            const payloadStr = await SecurityManager.getBackendAttestationPayload(nonce);
            const payload = JSON.parse(payloadStr);

            console.log('Security check result:', payload.nativeRiskLevel);

            // In a real application, you would send this payload to your backend:
            // const response = await fetch('https://api.yourdomain.com/verify-device', {
            //     method: 'POST',
            //     body: JSON.stringify(payload)
            // });
            // const result = await response.json();
            // if (!result.accessGranted) throw new Error("Backend rejected device");

            // Only hard-block on TAMPERED (active attack detected).
            // SUSPICIOUS is logged but allowed (e.g. emulator, rooted dev device).
            // COMPROMISED is a warning but does not block.
            if (payload.nativeRiskLevel === 'TAMPERED') {
                throw new Error(`Device Security Status: ${payload.nativeRiskLevel}`);
            }

            if (payload.nativeRiskLevel === 'COMPROMISED') {
                console.warn('Security Warning: Device is in COMPROMISED state');
            }

        } catch (error: any) {
            console.error('Security Check Failed:', error);
            
            // Only block the app for actual TAMPERED status
            if (error?.message?.includes('TAMPERED')) {
                setIsSecure(false);
                Alert.alert(
                    "Security Violation Detected",
                    "Your device does not meet the security requirements to run this application.",
                    [{ text: "Exit", onPress: () => BackHandler.exitApp() }],
                    { cancelable: false }
                );
            }
            // For all other errors (network, native module issues), allow the app to continue
        }
    };

    useEffect(() => {
        // 1. App Launch Check - delay slightly to let the RN bridge fully initialize
        const launchTimer = setTimeout(() => {
            performSecurityCheck();
        }, 2000);

        // 2. Foreground Resume Check
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                performSecurityCheck();
            }
            appState.current = nextAppState;
        });

        // 3. Periodic Runtime Validation (Every 5 minutes)
        const intervalId = setInterval(() => {
            performSecurityCheck();
        }, 5 * 60 * 1000);

        return () => {
            clearTimeout(launchTimer);
            subscription.remove();
            clearInterval(intervalId);
        };
    }, []);

    if (!isSecure) {
        return null; // Don't render the app if security failed
    }

    return <>{children}</>;
};
