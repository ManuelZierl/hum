ANDROID_SCRIPT := native/rust/build-scripts/build-android.sh
IOS_SCRIPT := native/rust/build-scripts/build-ios.sh

.PHONY: android ios all

android:
	bash $(ANDROID_SCRIPT)

ios:
	bash $(IOS_SCRIPT)

all: android ios
