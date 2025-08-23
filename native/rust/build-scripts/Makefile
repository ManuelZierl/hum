# Simple wrapper Makefile for cross-compiling the Rust workspace.

# Override these variables when invoking make, e.g.:
#   make android ANDROID_ARCH=x86_64
#   make ios IOS_TARGET=x86_64-apple-ios

ANDROID_ARCH ?= arm64-v8a
IOS_TARGET ?= aarch64-apple-ios

.PHONY: android ios

android:
	./build-android.sh $(ANDROID_ARCH)

ios:
	./build-ios.sh $(IOS_TARGET)
