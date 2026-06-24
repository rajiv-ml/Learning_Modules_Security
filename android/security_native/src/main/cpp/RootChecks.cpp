#include "RootChecks.h"
#include <jni.h>
#include <string>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/system_properties.h>
#include <stdio.h>
#include <string.h>
#include "Obfuscate.h"

bool checkFileExists(const char* path) {
    struct stat buffer;
    return (stat(path, &buffer) == 0);
}

bool checkRootFiles() {
    const std::string paths[] = {
        OBFUSCATE_STR("/system/bin/su"),
        OBFUSCATE_STR("/system/xbin/su"),
        OBFUSCATE_STR("/sbin/su"),
        OBFUSCATE_STR("/vendor/bin/su"),
        OBFUSCATE_STR("/data/local/su"),
        OBFUSCATE_STR("/data/local/bin/su"),
        OBFUSCATE_STR("/data/local/xbin/su"),
        OBFUSCATE_STR("/su/bin/su")
    };
    for (const auto& path : paths) {
        if (checkFileExists(path.c_str())) {
            return true;
        }
    }
    return false;
}

bool checkMagisk() {
    const std::string paths[] = {
        OBFUSCATE_STR("/sbin/.magisk"),
        OBFUSCATE_STR("/data/adb/modules"),
        OBFUSCATE_STR("/data/adb/magisk"),
        OBFUSCATE_STR("/data/adb/magisk.db")
    };
    for (const auto& path : paths) {
        if (checkFileExists(path.c_str())) {
            return true;
        }
    }
    return false;
}

bool checkZygisk() {
    bool found = false;
    FILE* fp = fopen(OBFUSCATE_STR("/proc/self/maps").c_str(), "r");
    if (fp) {
        char line[512];
        std::string zygiskStr = OBFUSCATE_STR("zygisk");
        std::string magiskStr = OBFUSCATE_STR("magisk");
        while (fgets(line, sizeof(line), fp)) {
            if (strstr(line, zygiskStr.c_str()) != nullptr || strstr(line, magiskStr.c_str()) != nullptr) {
                found = true;
                break;
            }
        }
        fclose(fp);
    }
    return found;
}

bool checkDangerousProperties() {
    char value[PROP_VALUE_MAX];
    
    if (__system_property_get(OBFUSCATE_STR("ro.debuggable").c_str(), value) > 0) {
        if (strcmp(value, "1") == 0) return true;
    }
    
    if (__system_property_get(OBFUSCATE_STR("ro.secure").c_str(), value) > 0) {
        if (strcmp(value, "0") == 0) return true;
    }

    if (__system_property_get(OBFUSCATE_STR("ro.build.tags").c_str(), value) > 0) {
        std::string testKeys = OBFUSCATE_STR("test-keys");
        if (strstr(value, testKeys.c_str()) != nullptr) return true;
    }
    
    if (__system_property_get(OBFUSCATE_STR("ro.boot.vbmeta.device_state").c_str(), value) > 0) {
        std::string unlocked = OBFUSCATE_STR("unlocked");
        if (strcmp(value, unlocked.c_str()) == 0) return true;
    }
    
    return false;
}

bool checkSuspiciousMounts() {
    bool suspicious = false;
    FILE* fp = fopen(OBFUSCATE_STR("/proc/mounts").c_str(), "r");
    if (fp) {
        char line[512];
        std::string magiskStr = OBFUSCATE_STR("magisk");
        std::string overlayStr = OBFUSCATE_STR("overlayfs");
        while (fgets(line, sizeof(line), fp)) {
            if (strstr(line, magiskStr.c_str()) != nullptr || strstr(line, overlayStr.c_str()) != nullptr) {
                // If it's overlayfs on system/vendor/data it is suspicious
                suspicious = true;
                break;
            }
        }
        fclose(fp);
    }
    return suspicious;
}

bool checkEmulator() {
    char value[PROP_VALUE_MAX];
    
    // Check for common emulator hardware properties
    if (__system_property_get(OBFUSCATE_STR("ro.hardware").c_str(), value) > 0) {
        if (strstr(value, OBFUSCATE_STR("goldfish").c_str()) != nullptr ||
            strstr(value, OBFUSCATE_STR("vbox86").c_str()) != nullptr ||
            strstr(value, OBFUSCATE_STR("ranchu").c_str()) != nullptr) {
            return true;
        }
    }
    
    if (__system_property_get(OBFUSCATE_STR("ro.kernel.qemu").c_str(), value) > 0) {
        if (strcmp(value, "1") == 0) return true;
    }

    if (__system_property_get(OBFUSCATE_STR("ro.product.model").c_str(), value) > 0) {
        if (strstr(value, OBFUSCATE_STR("Emulator").c_str()) != nullptr ||
            strstr(value, OBFUSCATE_STR("Android SDK built for x86").c_str()) != nullptr) {
            return true;
        }
    }

    return false;
}

bool checkCloneApps() {
    // Clone apps (Parallel Space, Dual Apps) often run the app from a strange directory
    // or under a secondary user id like /data/user/999/ instead of /data/user/0/
    char cwd[1024];
    if (getcwd(cwd, sizeof(cwd)) != nullptr) {
        std::string currentPath(cwd);
        // Typical path is /data/user/0/com.learningapp or /data/data/com.learningapp
        if (currentPath.find(OBFUSCATE_STR("/data/user/0/")) == std::string::npos &&
            currentPath.find(OBFUSCATE_STR("/data/data/")) == std::string::npos &&
            currentPath.find(OBFUSCATE_STR("/data/app/")) == std::string::npos) {
            
            // If it's in /data/user/999/ or /data/user/10/, it might be a clone app
            if (currentPath.find(OBFUSCATE_STR("/data/user/")) != std::string::npos) {
                return true;
            }
        }
    }
    return false;
}

