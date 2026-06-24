package com.learningapp.security

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.scottyab.rootbeer.RootBeer
import java.util.concurrent.Executors
import org.json.JSONObject
import com.learningapp.BuildConfig

class SecurityManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String {
        return "SecurityManager"
    }

    @ReactMethod
    fun checkSecurityStatus(promise: Promise) {
        val context = reactApplicationContext
        
        executor.execute {
            try {
                // 1. Execute Java-layer checks
                val rootBeer = RootBeer(context)
                val javaRootDetected = rootBeer.isRooted
                val javaHookDetected = HookChecks.checkHookFrameworks(context)
                val isSignatureValid = ApkSignatureChecker.verifySignature(context)
                val apkPath = context.packageCodePath

                // 2. Execute Native-layer deep checks
                var nativeRiskLevel = "SAFE"
                try {
                    nativeRiskLevel = IntegrityChecks.nativeGetSecurityRiskLevel(apkPath, isSignatureValid)
                } catch (e: UnsatisfiedLinkError) {
                    nativeRiskLevel = "TAMPERED" // Fail secure if library is missing/tampered
                }
                
                var finalRiskLevel = nativeRiskLevel

                // 3. Cross-Validation (Layer Mismatch Detection)
                // If Java detects root/hooks but Native returns SAFE, the native engine was bypassed!
                // If Native detects tampering, it already returns TAMPERED or COMPROMISED.
                if ((javaRootDetected || javaHookDetected) && nativeRiskLevel == "SAFE") {
                    finalRiskLevel = "TAMPERED"
                }

                // Also escalate to TAMPERED if signature is invalid
                if (!isSignatureValid && finalRiskLevel != "TAMPERED") {
                    finalRiskLevel = "TAMPERED"
                }

                // --- DEVELOPMENT BYPASS ---
                // In debug mode, we allow the app to run on emulators and with debug signatures.
                // We print the actual risk level to logcat, but force it to SAFE so the UI loads.
                if (BuildConfig.DEBUG) {
                    android.util.Log.w("SecurityManager", "DEBUG MODE: Bypassing strict risk level. Actual level was: $finalRiskLevel")
                    finalRiskLevel = "SAFE"
                }

                val jsonResponse = JSONObject()
                jsonResponse.put("riskLevel", finalRiskLevel)

                promise.resolve(jsonResponse.toString())
            } catch (e: Exception) {
                promise.reject("SECURITY_CHECK_ERROR", e)
            }
        }
    }
    
    @ReactMethod
    fun getBackendAttestationPayload(nonce: String, promise: Promise) {
        val context = reactApplicationContext
        
        executor.execute {
            try {
                // 1. Get Local Risk Level (Synchronously on this thread)
                val rootBeer = RootBeer(context)
                val isSignatureValid = ApkSignatureChecker.verifySignature(context)
                val apkPath = context.packageCodePath
                var nativeRiskLevel = "SAFE"
                try {
                    nativeRiskLevel = IntegrityChecks.nativeGetSecurityRiskLevel(apkPath, isSignatureValid)
                } catch (e: UnsatisfiedLinkError) {
                    nativeRiskLevel = "TAMPERED"
                }
                var finalRiskLevel = nativeRiskLevel
                if ((rootBeer.isRooted || HookChecks.checkHookFrameworks(context)) && nativeRiskLevel == "SAFE") {
                    finalRiskLevel = "TAMPERED"
                }
                if (!isSignatureValid && finalRiskLevel != "TAMPERED") {
                    finalRiskLevel = "TAMPERED"
                }

                if (BuildConfig.DEBUG) {
                    android.util.Log.w("SecurityManager", "DEBUG MODE: Bypassing strict risk level for Attestation. Actual level was: $finalRiskLevel")
                    finalRiskLevel = "SAFE"
                }

                // 2. Get Play Integrity Token
                val integrityProvider = PlayIntegrityProvider(context)
                integrityProvider.requestToken(nonce) { token ->
                    val jsonResponse = JSONObject()
                    jsonResponse.put("nativeRiskLevel", finalRiskLevel)
                    jsonResponse.put("integrityToken", token ?: "")
                    promise.resolve(jsonResponse.toString())
                }
            } catch (e: Exception) {
                promise.reject("ATTESTATION_ERROR", e)
            }
        }
    }
}
