package com.learningapp.security

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.scottyab.rootbeer.RootBeer
import java.util.concurrent.Executors
import org.json.JSONObject
import android.util.Log

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
                    Log.e("SecurityManager", "Native library not loaded", e)
                    nativeRiskLevel = "SAFE" // Don't fail-deadly if library can't load
                }
                
                var finalRiskLevel = nativeRiskLevel

                // 3. Cross-Validation (Layer Mismatch Detection)
                if ((javaRootDetected || javaHookDetected) && nativeRiskLevel == "SAFE") {
                    finalRiskLevel = "SUSPICIOUS"
                }

                // Signature validation only matters when we have a real expected hash configured
                // (ApkSignatureChecker returns true during development)

                Log.d("SecurityManager", "Security check result: $finalRiskLevel (sig=$isSignatureValid, root=$javaRootDetected, hook=$javaHookDetected, native=$nativeRiskLevel)")

                val jsonResponse = JSONObject()
                jsonResponse.put("riskLevel", finalRiskLevel)

                promise.resolve(jsonResponse.toString())
            } catch (e: Exception) {
                Log.e("SecurityManager", "Security check exception", e)
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
                    Log.e("SecurityManager", "Native library not loaded for attestation", e)
                    nativeRiskLevel = "SAFE" // Don't fail-deadly
                }
                var finalRiskLevel = nativeRiskLevel
                if ((rootBeer.isRooted || HookChecks.checkHookFrameworks(context)) && nativeRiskLevel == "SAFE") {
                    finalRiskLevel = "SUSPICIOUS"
                }

                Log.d("SecurityManager", "Attestation result: $finalRiskLevel (sig=$isSignatureValid, native=$nativeRiskLevel)")

                // 2. Get Play Integrity Token
                val integrityProvider = PlayIntegrityProvider(context)
                integrityProvider.requestToken(nonce) { token ->
                    val jsonResponse = JSONObject()
                    jsonResponse.put("nativeRiskLevel", finalRiskLevel)
                    jsonResponse.put("integrityToken", token ?: "")
                    promise.resolve(jsonResponse.toString())
                }
            } catch (e: Exception) {
                Log.e("SecurityManager", "Attestation exception", e)
                promise.reject("ATTESTATION_ERROR", e)
            }
        }
    }
}
