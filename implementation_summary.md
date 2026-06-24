# Enterprise Security Implementation Summary

This document summarizes the comprehensive, multi-phase security architecture implemented for the Learning App. The goal of this architecture is to protect premium educational content, prevent API abuse, and detect hostile environments (jailbreaks, roots, and instrumentation frameworks) across both Android and iOS.

---

## Phase 1: Native Security Foundation

We bypassed standard npm security packages (which are easily bypassed by script kiddies) in favor of writing raw, low-level native code for both platforms.

### Android Native Engine (`libsecurity_checks.so`)
- **Root & Magisk Detection:** Implemented `RootChecks.cpp` to look for `su` binaries, known Magisk hide paths, and `rw` mounts on system partitions.
- **Frida & Hooking Detection:** Implemented `FridaChecks.cpp` using raw `open()` and `read()` syscalls to scan `/proc/self/maps` for injected libraries (`frida-agent.so`) and hooked threads. 
- **APK Signature Validation:** Embedded the expected production SHA-256 certificate hash directly into C++ to verify that the APK has not been repackaged via APKTool.
- **Libraries Used:** Android NDK (C++), JNI.

---

## Phase 2: Anti-Reverse Engineering & Obfuscation

To prevent reverse engineers from patching our Native Security Engine, we heavily obfuscated the C++ binary.

- **String Obfuscation:** Implemented compile-time string encryption (`obfuscator.h`) using `constexpr` macros. Strings like `/proc/self/maps` or `frida` do not appear in the compiled `.so` file, preventing simple `grep` or `strings` analysis.
- **JNI Hiding (`RegisterNatives`):** Removed standard `Java_com_learningapp_...` JNI function exports. Instead, we use `JNI_OnLoad` to dynamically map native functions, breaking static analysis tools like Ghidra and IDA Pro.
- **Libraries Used:** Custom `constexpr` C++ macros, Android NDK.

---

## Phase 3: Central Risk Engine & Play Integrity

Instead of crashing the app immediately when a threat is detected (which helps attackers debug their bypasses), we aggregate the risk locally and silently evaluate it on the backend.

- **Unified Risk Levels:** The mobile apps generate a unified state (`SAFE`, `COMPROMISED`, `TAMPERED`).
- **Google Play Integrity API:** Integrated `PlayIntegrityProvider.kt` to securely attest device health. The app requests a signed cryptographic token from Google Play Services that proves the app is unmodified and the Android OS is not rooted.
- **Test Automation:** Built a suite of Python scripts (`security-tests/`) to simulate Frida injections, APK repackaging, and Root environments, verifying that the C++ engine catches all attacks.
- **Libraries Used:** `com.google.android.play:integrity` (Google Play Services), Python (for CI/CD testing).

---

## Phase 4: Cross-Platform Security & Token Lifecycle

This phase brought the iOS platform up to parity with Android and secured the REST API session lifecycle.

### Sprint 1: Secure Hardware Storage
- **Protocol:** Migrated all sensitive data (Access Tokens, Refresh Tokens, Device IDs) out of plaintext `AsyncStorage` and into the hardware-backed Android Keystore and iOS Secure Enclave.
- **Container Hardening:** Disabled `allowBackup` and configured `data_extraction_rules.xml` to prevent ADB physical extraction on Android.
- **Libraries Used:** `react-native-keychain`.

### Sprint 2: Token Lifecycle & Replay Protection
- **Protocol:** Implemented strict Refresh Token Rotation via `ApiClient.ts` (Axios interceptor). Every time a refresh token is used, a new one is issued.
- **Theft Detection:** If the backend detects a reused Refresh Token (indicating token theft), it immediately triggers a `TOKEN_REUSE_DETECTED` event, revoking the entire session family and banning the device.
- **Libraries Used:** `axios`.

### Sprint 3 & 4: iOS Native Security & App Attest
- **Custom Swift Engine:** Built `IOSSecurityEngine.swift` to detect Jailbreaks (Cydia/Sileo files), sandbox violations (attempting to write to `/private/`), and Hooking (scanning `_dyld_get_image_name` for MobileSubstrate/Frida and detecting `fork()` anomalies).
- **Apple App Attest:** Integrated the `DCAppAttestService` (DeviceCheck) to generate hardware-backed cryptographic attestations for the backend, bringing iOS to parity with Google Play Integrity.
- **Backend Verification:** Built Node.js verification scripts (`app-attest-verifier.js` and `play-integrity-verifier.js`) that independently parse Apple's CBOR payloads and Google's JWTs to construct a platform-agnostic trust decision.
- **Libraries Used:** `DeviceCheck`, `MachO`, `cbor` (Node.js).

---

## Phase 5: Content Protection & DRM

With the environment secured, we applied strict controls to prevent screen capture and piracy of premium educational videos.

- **Android Screenshot/Recording Block:** Applied `WindowManager.LayoutParams.FLAG_SECURE` in `MainActivity.kt`, natively instructing the Android OS to block screenshots and blank the screen during screen recording.
- **iOS Soft-Blurring:** iOS lacks `FLAG_SECURE`, so we built `IOSContentProtection.swift` to listen to `UIScreen.capturedDidChangeNotification`. When a recording starts, it instantly overlays a native `UIVisualEffectView` (blur) over the app window.
- **React Native Sync:** An event emitter instructs `ContentProtectionProvider.tsx` to automatically pause the React Native video player when screen recording is detected.
- **Forensic Watermarking:** Created `WatermarkOverlay.tsx` to diagonally render the `userEmail`, `courseId`, and `timestamp` over premium videos at 15% opacity. If a user physically points a second camera at the screen, the source of the leak is permanently identifiable.
- **Libraries Used:** Native Android `WindowManager`, iOS `UIVisualEffectView`, React Native `NativeEventEmitter`.

---

## Summary

The LearningApp architecture relies on a **Defense-in-Depth** strategy:
1. **Local Checks:** Highly obfuscated C++ and Swift dynamically detect hostile environments (Root, Jailbreak, Frida).
2. **Hardware Attestation:** Google Play Integrity and Apple App Attest cryptographically prove the device is genuine to the backend.
3. **Session Hardening:** Hardware Keychains and Token Rotation prevent session hijacking.
4. **Content DRM:** `FLAG_SECURE`, native blurring, and dynamic watermarking prevent unauthorized media distribution.
