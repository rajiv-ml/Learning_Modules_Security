#include <jni.h>
#include <string>
#include <stdio.h>
#include <string.h>

extern "C" JNIEXPORT jboolean JNICALL
Java_com_learningapp_security_IntegrityChecks_nativeCheckHookFrameworks(JNIEnv *env, jobject /* this */) {
    FILE* maps_file = fopen("/proc/self/maps", "r");
    if (!maps_file) {
        return JNI_FALSE;
    }

    char line[512];
    jboolean detected = JNI_FALSE;
    
    while (fgets(line, sizeof(line), maps_file)) {
        if (strstr(line, "libfrida-gadget.so") != nullptr ||
            strstr(line, "liblsposed.so") != nullptr ||
            strstr(line, "libmagiskhide.so") != nullptr ||
            strstr(line, "zygisk") != nullptr ||
            strstr(line, "riru") != nullptr) {
            detected = JNI_TRUE;
            break;
        }
    }
    
    fclose(maps_file);
    return detected;
}
