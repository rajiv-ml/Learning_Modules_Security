#include <jni.h>

extern "C" JNIEXPORT jboolean JNICALL
Java_com_learningapp_security_IntegrityChecks_nativeCheckRootFiles(JNIEnv *env, jobject /* this */);

extern "C" JNIEXPORT jboolean JNICALL
Java_com_learningapp_security_IntegrityChecks_nativeCheckFrida(JNIEnv *env, jobject /* this */);

extern "C" JNIEXPORT jboolean JNICALL
Java_com_learningapp_security_IntegrityChecks_nativeCheckHookFrameworks(JNIEnv *env, jobject /* this */);

extern "C" JNIEXPORT void JNICALL
Java_com_learningapp_security_IntegrityChecks_nativeInit(JNIEnv *env, jclass clazz) {
    // Initialization code if needed
}
