import React, { useEffect, useRef, useState } from 'react';
import { AppState, NativeModules, Alert, BackHandler } from 'react-native';

const { SecurityManager } = NativeModules;

export const SecurityProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const appState = useRef(AppState.currentState);
    const [isSecure, setIsSecure] = useState(true);

    const performSecurityCheck = async () => {
        try {
            // Generate a random nonce for this request to prevent replay attacks
            const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
            
            // This calls the native method we wrote, which calculates local risk
            // AND requests a Play Integrity Token from Google
            const payloadStr = await SecurityManager.getBackendAttestationPayload(nonce);
            const payload = JSON.parse(payloadStr);

            // In a real application, you would send this payload to your backend:
            // const response = await fetch('https://api.yourdomain.com/verify-device', {
            //     method: 'POST',
            //     body: JSON.stringify(payload)
            // });
            // const result = await response.json();
            // if (!result.accessGranted) throw new Error("Backend rejected device");

            // Since we don't have a backend connected in this prototype, we'll
            // fall back to purely evaluating the local risk engine's output:
            if (payload.nativeRiskLevel === 'TAMPERED' || payload.nativeRiskLevel === 'COMPROMISED') {
                throw new Error(`Device Security Status: ${payload.nativeRiskLevel}`);
            }

        } catch (error: any) {
            console.error('Security Check Failed:', error);
            setIsSecure(false);
            Alert.alert(
                "Security Violation Detected",
                "Your device does not meet the security requirements to run this application.",
                [{ text: "Exit", onPress: () => BackHandler.exitApp() }],
                { cancelable: false }
            );
        }
    };

    useEffect(() => {
        // 1. App Launch Check
        performSecurityCheck();

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
            subscription.remove();
            clearInterval(intervalId);
        };
    }, []);

    if (!isSecure) {
        return null; // Don't render the app if security failed
    }

    return <>{children}</>;
};
