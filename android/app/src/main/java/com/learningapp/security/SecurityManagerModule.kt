package com.learningapp.security

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.scottyab.rootbeer.RootBeer
import java.util.UUID

class SecurityManagerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val playIntegrityProvider = PlayIntegrityProvider(reactContext)

    override fun getName(): String {
        return "SecurityManager"
    }

    @ReactMethod
    fun getSecurityTelemetry(promise: Promise) {
        val telemetry = SecurityTelemetry()
        val context = reactApplicationContext

        // 1. RootBeer Checks
        val rootBeer = RootBeer(context)
        telemetry.rootDetected = rootBeer.isRooted

        // 2. Native C++ Checks (Defense in Depth)
        try {
            telemetry.magiskDetected = IntegrityChecks.nativeCheckRootFiles()
            telemetry.fridaDetected = IntegrityChecks.nativeCheckFrida()
            telemetry.zygiskDetected = IntegrityChecks.nativeCheckHookFrameworks() // Includes LSPosed, Zygisk, Riru
            // We'll bundle them into zygiskDetected for simplicity here, or map individually if native bindings were split.
        } catch (e: UnsatisfiedLinkError) {
            // Library failed to load, assume unsafe or handle gracefully
        }

        // 3. Play Integrity (Async)
        val nonce = UUID.randomUUID().toString()
        playIntegrityProvider.requestToken(nonce) { token ->
            if (token != null) {
                telemetry.playIntegrity = true
                telemetry.playIntegrityToken = token
            } else {
                telemetry.playIntegrity = false
            }
            
            promise.resolve(telemetry.toJSON().toString())
        }
    }
}
