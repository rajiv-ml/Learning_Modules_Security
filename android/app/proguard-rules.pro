# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# Keep JNI methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep our Security Telemetry models so they aren't mangled before JSON conversion
-keep class com.learningapp.security.SecurityTelemetry { *; }

# Keep Play Integrity
-keep class com.google.android.play.core.integrity.** { *; }

# Keep RootBeer
-keep class com.scottyab.rootbeer.** { *; }

# Keep our IntegrityChecks class and its native methods so RegisterNatives can find it
-keep class com.learningapp.security.IntegrityChecks {
    native <methods>;
}
