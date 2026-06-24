#include "SecurityEngine.h"
#include "RootChecks.h"
#include "FridaChecks.h"
#include "HookFrameworkChecks.h"
#include "DexIntegrity.h"
#include "NativeIntegrity.h"
#include <android/log.h>
#include <pthread.h>
#include <stdlib.h>
#include <unistd.h>

#define LOG_TAG "SecurityEngine"

SecurityFindings SecurityEngine::getFindings(const char* apkPath, bool isSignatureValid) {
    SecurityFindings findings;
    
    // Root & Zygisk Checks
    findings.rootDetected = checkRootFiles() || checkDangerousProperties() || checkSuspiciousMounts();
    findings.magiskDetected = checkMagisk();
    findings.zygiskDetected = checkZygisk();
    
    // Frida & Debugger Checks
    findings.fridaDetected = checkFridaPorts() || checkFridaMemoryMaps() || checkFridaNamedPipes() || checkFridaThreads() || checkFridaLibraries();
    findings.debuggerDetected = checkTracerPid();
    
    // Xposed / Hook Checks
    findings.xposedDetected = checkHookFrameworks();
    
    // Emulator and Clone Apps
    findings.emulatorDetected = checkEmulator() || checkCloneApps(); 
    
    findings.signatureMismatch = !isSignatureValid;
    findings.dexTamperingDetected = !verifyDexIntegrity(apkPath);
    findings.libTamperingDetected = !verifyNativeLibraryIntegrity();
    
    return findings;
}

int SecurityEngine::calculateScore(const SecurityFindings& findings) {
    int score = 0;
    
    if (findings.rootDetected) score += SCORE_ROOT;
    if (findings.magiskDetected) score += SCORE_ROOT;
    if (findings.zygiskDetected) score += SCORE_ROOT;
    
    if (findings.fridaDetected) score += SCORE_FRIDA;
    if (findings.debuggerDetected) score += SCORE_FRIDA;
    
    if (findings.xposedDetected) score += SCORE_XPOSED;
    
    if (findings.emulatorDetected) score += SCORE_EMULATOR;
    if (findings.signatureMismatch) score += SCORE_SIG_MISMATCH;
    if (findings.dexTamperingDetected) score += SCORE_DEX_TAMPER;
    if (findings.libTamperingDetected) score += SCORE_LIB_TAMPER;
    
    return score;
}

RiskLevel SecurityEngine::evaluateRisk(int score) {
    if (score < 30) return SAFE;
    if (score < 80) return SUSPICIOUS;
    if (score < 150) return COMPROMISED;
    return TAMPERED;
}

std::string SecurityEngine::riskLevelToString(RiskLevel level) {
    switch (level) {
        case SAFE: return "SAFE";
        case SUSPICIOUS: return "SUSPICIOUS";
        case COMPROMISED: return "COMPROMISED";
        case TAMPERED: return "TAMPERED";
        default: return "TAMPERED"; // fail secure
    }
}

void SecurityEngine::logFindings(const SecurityFindings& findings, int score, RiskLevel level) {
    // In release builds, do not log to logcat. We obfuscate the strings anyway just in case.
#ifndef NDEBUG
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "--- SECURITY REPORT ---");
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "Root: %d, Magisk: %d, Zygisk: %d", findings.rootDetected, findings.magiskDetected, findings.zygiskDetected);
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "Frida: %d, Debugger: %d, Xposed: %d", findings.fridaDetected, findings.debuggerDetected, findings.xposedDetected);
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "SigMismatch: %d, DexTamper: %d, LibTamper: %d", findings.signatureMismatch, findings.dexTamperingDetected, findings.libTamperingDetected);
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "Score: %d -> Level: %s", score, riskLevelToString(level).c_str());
    __android_log_print(ANDROID_LOG_INFO, LOG_TAG, "-----------------------");
#endif
}

// --- Phase 6: Runtime Memory Anti-Tamper Monitor ---
// A detached thread that wakes up at random intervals to verify code integrity and debuggers
void* runtimeMonitorThread(void* arg) {
    while (true) {
        // Sleep for a random interval between 5 and 25 seconds
        int sleepTime = 5 + (rand() % 20);
        sleep(sleepTime);

        if (checkTracerPid()) {
#ifndef NDEBUG
            __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, "RASP ALERT: Debugger attached at runtime!");
#endif
            // In a real app, you might trigger a crash or wipe keys here.
            // Only exit in Release mode so local debugging isn't broken
#ifdef NDEBUG
            exit(0);
#endif
        }

        if (!verifyNativeLibraryIntegrity()) {
#ifndef NDEBUG
            __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, "RASP ALERT: Native library memory patched!");
#endif
#ifdef NDEBUG
            exit(0);
#endif
        }
    }
    return nullptr;
}

// Ensure the monitor is started once
static bool monitorStarted = false;

// JNI method to be registered via RegisterNatives
jstring nativeGetSecurityRiskLevel(JNIEnv *env, jobject /* this */, jstring apkPath, jboolean isSignatureValid) {
    if (!monitorStarted) {
        pthread_t tid;
        pthread_create(&tid, nullptr, runtimeMonitorThread, nullptr);
        pthread_detach(tid);
        monitorStarted = true;
    }

    const char* nativeApkPath = env->GetStringUTFChars(apkPath, 0);
    
    SecurityFindings findings = SecurityEngine::getFindings(nativeApkPath, isSignatureValid == JNI_TRUE);
    
    env->ReleaseStringUTFChars(apkPath, nativeApkPath);
    
    int score = SecurityEngine::calculateScore(findings);
    RiskLevel level = SecurityEngine::evaluateRisk(score);
    
    SecurityEngine::logFindings(findings, score, level);
    
    return env->NewStringUTF(SecurityEngine::riskLevelToString(level).c_str());
}
