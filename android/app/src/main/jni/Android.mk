LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE    := security_checks
LOCAL_SRC_FILES := ../cpp/IntegrityChecks.cpp ../cpp/RootChecks.cpp ../cpp/FridaChecks.cpp ../cpp/HookFrameworkChecks.cpp
LOCAL_LDLIBS    := -llog
include $(BUILD_SHARED_LIBRARY)
