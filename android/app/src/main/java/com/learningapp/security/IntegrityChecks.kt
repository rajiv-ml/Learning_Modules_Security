package com.learningapp.security

object IntegrityChecks {
    init {
        try {
            System.loadLibrary("security_checks")
            nativeInit()
        } catch (e: UnsatisfiedLinkError) {
            // Handle error, maybe crash or log
        }
    }

    @JvmStatic
    external fun nativeInit()

    @JvmStatic
    external fun nativeCheckRootFiles(): Boolean

    @JvmStatic
    external fun nativeCheckFrida(): Boolean

    @JvmStatic
    external fun nativeCheckHookFrameworks(): Boolean
}
