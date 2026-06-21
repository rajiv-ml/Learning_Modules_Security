cmake_minimum_required(VERSION 3.22.1)

project("security_checks")

add_library(
        security_checks
        SHARED
        IntegrityChecks.cpp
        RootChecks.cpp
        FridaChecks.cpp
        HookFrameworkChecks.cpp)

find_library(
        log-lib
        log)

target_link_libraries(
        security_checks
        ${log-lib})
