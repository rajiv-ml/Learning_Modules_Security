#pragma once

#include <jni.h>
#include <string>

// Internal weighted scores
#define SCORE_ROOT 50
#define SCORE_FRIDA 100
#define SCORE_XPOSED 80
#define SCORE_EMULATOR 30
#define SCORE_DEX_TAMPER 150
#define SCORE_LIB_TAMPER 150
#define SCORE_LAYER_MISMATCH 200
#define SCORE_SIG_MISMATCH 200

enum RiskLevel {
    SAFE,
    SUSPICIOUS,
    COMPROMISED,
    TAMPERED
};

struct SecurityFindings {
    bool rootDetected;
    bool magiskDetected;
    bool zygiskDetected;
    bool fridaDetected;
    bool xposedDetected;
    bool debuggerDetected;
    bool emulatorDetected;
    bool signatureMismatch;
    bool dexTamperingDetected;
    bool libTamperingDetected;
};

class SecurityEngine {
public:
    static SecurityFindings getFindings(const char* apkPath, bool isSignatureValid);
    static int calculateScore(const SecurityFindings& findings);
    static RiskLevel evaluateRisk(int score);
    static std::string riskLevelToString(RiskLevel level);
    static void logFindings(const SecurityFindings& findings, int score, RiskLevel level);
};
