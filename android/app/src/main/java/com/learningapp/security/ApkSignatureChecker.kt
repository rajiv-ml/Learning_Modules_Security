package com.learningapp.security

import android.content.Context
import android.content.pm.PackageManager
import android.content.pm.Signature
import android.os.Build
import android.util.Log
import java.security.MessageDigest
import java.security.NoSuchAlgorithmException

object ApkSignatureChecker {
    // Replace with your actual production signing certificate hash
    private const val EXPECTED_SIGNATURE_HASH = "YOUR_EXPECTED_SHA256_HASH_HERE"

    fun verifySignature(context: Context): Boolean {
        try {
            val signatures: Array<Signature>?
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                val packageInfo = context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.GET_SIGNING_CERTIFICATES
                )
                val signingInfo = packageInfo.signingInfo
                if (signingInfo == null) return false
                
                signatures = if (signingInfo.hasMultipleSigners()) {
                    signingInfo.apkContentsSigners
                } else {
                    signingInfo.signingCertificateHistory
                }
            } else {
                @Suppress("DEPRECATION")
                val packageInfo = context.packageManager.getPackageInfo(
                    context.packageName,
                    PackageManager.GET_SIGNATURES
                )
                @Suppress("DEPRECATION")
                signatures = packageInfo.signatures
            }

            if (signatures == null) return false

            for (signature in signatures) {
                val currentHash = getSHA256(signature.toByteArray())
                if (currentHash == EXPECTED_SIGNATURE_HASH) {
                    return true
                }
            }
            // If in debug mode, you might want to return true for convenience, 
            // but for security it's best to always verify against the debug keystore hash if not production.
            return false 

        } catch (e: Exception) {
            Log.e("ApkSignatureChecker", "Error verifying signature", e)
            return false
        }
    }

    private fun getSHA256(signature: ByteArray): String {
        try {
            val md = MessageDigest.getInstance("SHA-256")
            md.update(signature)
            val digest = md.digest()
            return digest.joinToString("") { "%02x".format(it) }
        } catch (e: NoSuchAlgorithmException) {
            return ""
        }
    }
}
