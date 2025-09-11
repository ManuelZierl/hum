package com.hum.nativepkg;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class HumNativeModule extends ReactContextBaseJavaModule {
  public static final String NAME = "HumNative";

  static {
    System.loadLibrary("hum"); // Load the Rust library
  }

  public HumNativeModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void createClient(String hsUrl, String storePath, Promise promise) {
    String[] error = new String[1];
    long handle = createClientNative(hsUrl, storePath, error);
    if (handle != 0) {
        promise.resolve(handle);
    } else {
        promise.reject("ERR_CREATE_CLIENT", error[0]);
    }
  }

  private native long createClientNative(String hsUrl, String storePath, String[] error);

  @ReactMethod
  public void clientFree(double handle, Promise promise) {
    promise.resolve(null);
  }

  @ReactMethod
  public void clientLogin(double handle, String username, String password, Promise promise) {
    String[] error = new String[1];
    int result = clientLoginNative(handle, username, password, error);
    if (result == 0) {
        promise.resolve(null);
    } else {
        promise.reject("ERR_LOGIN", error[0]);
    }
  }

  private native int clientLoginNative(double handle, String username, String password, String[] error);

  @ReactMethod
  public void clientLogout(double handle, Promise promise) {
    String[] error = new String[1];
    int result = clientLogoutNative(handle, error);
    if (result == 0) {
        promise.resolve(null);
    } else {
        promise.reject("ERR_LOGOUT", error[0]);
    }
  }

  private native int clientLogoutNative(double handle, String[] error);

  @ReactMethod
  public void clientIsAuthenticated(double handle, Promise promise) {
    promise.resolve(false);
  }

  @ReactMethod
  public void clientGetRooms(double handle, Promise promise) {
    promise.resolve("[]");
  }

  @ReactMethod
  public void clientCreateRoom(double handle, String name, String topic, boolean isPublic, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientJoinRoom(double handle, String idOrAlias, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientLeaveRoom(double handle, String roomId, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSendText(double handle, String roomId, String body, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSendReaction(double handle, String roomId, String eventId, String key, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientRedact(double handle, String roomId, String eventId, String reason, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSendReadReceipt(double handle, String roomId, String eventId, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSetTyping(double handle, String roomId, boolean isTyping, double timeoutMs, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientStartSyncLoop(double handle, double timeoutMs, Promise promise) {
    promise.resolve(null);
  }

  @ReactMethod
  public void clientStopSyncLoop(double handle, Promise promise) {
    promise.resolve(null);
  }

  @ReactMethod
  public void clientSyncOnce(double handle, double timeoutMs, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientImportRecoveryKey(double handle, String key, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSearchUsers(double handle, String query, int limit, Promise promise) {
    promise.resolve("[]");
  }

  @ReactMethod
  public void clientGetDevices(double handle, Promise promise) {
    promise.resolve("[]");
  }

  @ReactMethod
  public void clientRenameDevice(double handle, String deviceId, String name, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientDeleteDevice(double handle, String deviceId, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientUploadMedia(double handle, String base64Data, String mime, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientDownloadMedia(double handle, String uri, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientSetPresence(double handle, int state, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }

  @ReactMethod
  public void clientGetPresence(double handle, String userId, Promise promise) {
    promise.reject("ERR_UNIMPLEMENTED", "Android native glue not implemented yet");
  }
}
