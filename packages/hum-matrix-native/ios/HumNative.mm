#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#if __has_include("hum.h")
#define HUM_NATIVE_HAS_FFI 1
#import "hum.h"
#else
#define HUM_NATIVE_HAS_FFI 0
#endif

#if HUM_NATIVE_HAS_FFI

static NSMutableDictionary<NSNumber *, struct HumClientHandle *> *sClients;
static NSInteger sNextHandle = 1;

static NSNumber *storeClient(struct HumClientHandle *ptr) {
  if (!sClients) {
    sClients = [NSMutableDictionary new];
  }
  NSNumber *hid = @(sNextHandle++);
  sClients[hid] = ptr;
  return hid;
}

static struct HumClientHandle *getClient(NSNumber *hid) {
  return sClients[hid];
}

static void freeClient(NSNumber *hid) {
  struct HumClientHandle *ptr = sClients[hid];
  if (ptr) {
    hum_client_free(ptr);
    [sClients removeObjectForKey:hid];
  }
}

static NSError *ffiError(char *err) {
  NSString *msg = err ? [NSString stringWithUTF8String:err] : @"Unknown error";
  if (err) hum_free_string(err);
  NSDictionary *info = @{NSLocalizedDescriptionKey : msg};
  return [NSError errorWithDomain:@"hum.native" code:-1 userInfo:info];
}

@interface HumNative : NSObject <RCTBridgeModule>
@end

@implementation HumNative

RCT_EXPORT_MODULE(HumNative);

RCT_REMAP_METHOD(createClient,
                 createClientWithHs:(NSString *)hsUrl
                 storePath:(NSString *)storePath
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  char *err = NULL;
  struct HumClientHandle *handle = hum_client_new(hsUrl.UTF8String, storePath.UTF8String, &err);
  if (!handle) {
    NSError *e = ffiError(err);
    reject(@"ERR_CREATE", e.localizedDescription, e);
    return;
  }
  NSNumber *hid = storeClient(handle);
  resolve(hid);
}

RCT_REMAP_METHOD(clientFree,
                 clientFreeWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  freeClient(hid);
  resolve(nil);
}

RCT_REMAP_METHOD(clientLogin,
                 clientLoginWithHandle:(nonnull NSNumber *)hid
                 username:(NSString *)username
                 password:(NSString *)password
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_login(c, username.UTF8String, password.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_LOGIN", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientIsAuthenticated,
                 clientIsAuthenticatedWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  bool isAuth = false;
  int rc = hum_client_is_authenticated(c, &isAuth, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_IS_AUTH", e.localizedDescription, e);
    return;
  }
  resolve(@(isAuth));
}

RCT_REMAP_METHOD(clientLogout,
                 clientLogoutWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_logout(c, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_LOGOUT", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientGetRooms,
                 clientGetRoomsWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  char *json = NULL;
  int rc = hum_client_get_rooms(c, &json, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_GET_ROOMS", e.localizedDescription, e);
    return;
  }
  NSString *s = json ? [NSString stringWithUTF8String:json] : @"[]";
  if (json) hum_free_string(json);
  resolve(s);
}

RCT_REMAP_METHOD(clientCreateRoom,
                 clientCreateRoomWithHandle:(nonnull NSNumber *)hid
                 name:(NSString * _Nullable)name
                 topic:(NSString * _Nullable)topic
                 isPublic:(BOOL)isPublic
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  char *out_room_id = NULL;
  const char *n = name ? name.UTF8String : NULL;
  const char *t = topic ? topic.UTF8String : NULL;
  int rc = hum_client_create_room(c, n, t, isPublic, &out_room_id, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_CREATE_ROOM", e.localizedDescription, e);
    return;
  }
  NSString *rid = out_room_id ? [NSString stringWithUTF8String:out_room_id] : @"";
  if (out_room_id) hum_free_string(out_room_id);
  resolve(rid);
}

RCT_REMAP_METHOD(clientJoinRoom,
                 clientJoinRoomWithHandle:(nonnull NSNumber *)hid
                 idOrAlias:(NSString *)idOrAlias
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  char *out_room_id = NULL;
  int rc = hum_client_join_room(c, idOrAlias.UTF8String, &out_room_id, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_JOIN_ROOM", e.localizedDescription, e);
    return;
  }
  NSString *rid = out_room_id ? [NSString stringWithUTF8String:out_room_id] : @"";
  if (out_room_id) hum_free_string(out_room_id);
  resolve(rid);
}

RCT_REMAP_METHOD(clientLeaveRoom,
                 clientLeaveRoomWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_leave_room(c, roomId.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_LEAVE_ROOM", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSendText,
                 clientSendTextWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 body:(NSString *)body
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_send_text(c, roomId.UTF8String, body.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SEND_TEXT", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSendReaction,
                 clientSendReactionWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 eventId:(NSString *)eventId
                 key:(NSString *)key
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_send_reaction(c, roomId.UTF8String, eventId.UTF8String, key.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SEND_REACTION", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientRedact,
                 clientRedactWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 eventId:(NSString *)eventId
                 reason:(NSString * _Nullable)reason
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  const char *r = reason ? reason.UTF8String : NULL;
  int rc = hum_client_redact(c, roomId.UTF8String, eventId.UTF8String, r, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_REDACT", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSendReadReceipt,
                 clientSendReadReceiptWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 eventId:(NSString *)eventId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_send_read_receipt(c, roomId.UTF8String, eventId.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_READ_RECEIPT", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSetTyping,
                 clientSetTypingWithHandle:(nonnull NSNumber *)hid
                 roomId:(NSString *)roomId
                 isTyping:(BOOL)isTyping
                 timeoutMs:(nonnull NSNumber *)timeoutMs
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  uint32_t t = timeoutMs ? (uint32_t)timeoutMs.unsignedIntValue : 0;
  int rc = hum_client_set_typing(c, roomId.UTF8String, isTyping, t, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SET_TYPING", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientStartSyncLoop,
                 clientStartSyncLoopWithHandle:(nonnull NSNumber *)hid
                 timeoutMs:(nonnull NSNumber *)timeoutMs
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_start_sync_loop(c, timeoutMs.unsignedLongLongValue, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_START_SYNC", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientStopSyncLoop,
                 clientStopSyncLoopWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_stop_sync_loop(c, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_STOP_SYNC", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSyncOnce,
                 clientSyncOnceWithHandle:(nonnull NSNumber *)hid
                 timeoutMs:(nonnull NSNumber *)timeoutMs
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_sync_once(c, timeoutMs.unsignedLongLongValue, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SYNC_ONCE", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientImportRecoveryKey,
                 clientImportRecoveryKeyWithHandle:(nonnull NSNumber *)hid
                 key:(NSString *)key
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_import_recovery_key(c, key.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_IMPORT_RECOVERY_KEY", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientSearchUsers,
                 clientSearchUsersWithHandle:(nonnull NSNumber *)hid
                 query:(NSString *)query
                 limit:(nonnull NSNumber *)limit
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  char *json = NULL;
  int rc = hum_client_search_users(c, query.UTF8String, (uint32_t)limit.unsignedIntValue, &json, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SEARCH_USERS", e.localizedDescription, e);
    return;
  }
  NSString *s = json ? [NSString stringWithUTF8String:json] : @"[]";
  if (json) hum_free_string(json);
  resolve(s);
}

RCT_REMAP_METHOD(clientGetDevices,
                 clientGetDevicesWithHandle:(nonnull NSNumber *)hid
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  char *json = NULL;
  int rc = hum_client_get_devices(c, &json, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_GET_DEVICES", e.localizedDescription, e);
    return;
  }
  NSString *s = json ? [NSString stringWithUTF8String:json] : @"[]";
  if (json) hum_free_string(json);
  resolve(s);
}

RCT_REMAP_METHOD(clientRenameDevice,
                 clientRenameDeviceWithHandle:(nonnull NSNumber *)hid
                 deviceId:(NSString *)deviceId
                 name:(NSString *)name
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_rename_device(c, deviceId.UTF8String, name.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_RENAME_DEVICE", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientDeleteDevice,
                 clientDeleteDeviceWithHandle:(nonnull NSNumber *)hid
                 deviceId:(NSString *)deviceId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_delete_device(c, deviceId.UTF8String, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_DELETE_DEVICE", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientUploadMedia,
                 clientUploadMediaWithHandle:(nonnull NSNumber *)hid
                 dataBase64:(NSString *)dataBase64
                 mime:(NSString *)mime
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  NSData *data = [[NSData alloc] initWithBase64EncodedString:dataBase64 options:0];
  if (!data) { reject(@"ERR_MEDIA_DATA", @"invalid base64 data", nil); return; }
  char *err = NULL;
  char *out_uri = NULL;
  int rc = hum_client_upload_media(c, (const uint8_t *)data.bytes, (uintptr_t)data.length, mime.UTF8String, &out_uri, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_UPLOAD_MEDIA", e.localizedDescription, e);
    return;
  }
  NSString *uri = out_uri ? [NSString stringWithUTF8String:out_uri] : @"";
  if (out_uri) hum_free_string(out_uri);
  resolve(uri);
}

RCT_REMAP_METHOD(clientDownloadMedia,
                 clientDownloadMediaWithHandle:(nonnull NSNumber *)hid
                 uri:(NSString *)uri
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  uint8_t *buf = NULL;
  uintptr_t len = 0;
  int rc = hum_client_download_media(c, uri.UTF8String, &buf, &len, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_DOWNLOAD_MEDIA", e.localizedDescription, e);
    return;
  }
  NSData *data = [NSData dataWithBytes:buf length:(NSUInteger)len];
  // free buffer allocated by FFI
  hum_free_buf(buf, len);
  NSString *b64 = [data base64EncodedStringWithOptions:0];
  resolve(b64);
}

RCT_REMAP_METHOD(clientSetPresence,
                 clientSetPresenceWithHandle:(nonnull NSNumber *)hid
                 state:(nonnull NSNumber *)state
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  int rc = hum_client_set_presence(c, (uint32_t)state.unsignedIntValue, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_SET_PRESENCE", e.localizedDescription, e);
    return;
  }
  resolve(nil);
}

RCT_REMAP_METHOD(clientGetPresence,
                 clientGetPresenceWithHandle:(nonnull NSNumber *)hid
                 userId:(NSString *)userId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject) {
  struct HumClientHandle *c = getClient(hid);
  if (!c) { reject(@"ERR_HANDLE", @"invalid client handle", nil); return; }
  char *err = NULL;
  uint32_t state = 0;
  int rc = hum_client_get_presence(c, userId.UTF8String, &state, &err);
  if (rc != 0) {
    NSError *e = ffiError(err);
    reject(@"ERR_GET_PRESENCE", e.localizedDescription, e);
    return;
  }
  resolve(@(state));
}

@end

#else

static NSError *HumUnavailableError(void) {
  NSDictionary *info = @{
    NSLocalizedDescriptionKey :
      @"Hum native FFI not available. Rebuild with Rust artifacts to enable native Matrix bridging."
  };
  return [NSError errorWithDomain:@"hum.native" code:-2 userInfo:info];
}

@interface HumNative : NSObject <RCTBridgeModule>
@end

@implementation HumNative

RCT_EXPORT_MODULE(HumNative);

#define HUM_STUB_METHOD(js_name, ...)                                                  \
  RCT_REMAP_METHOD(js_name, __VA_ARGS__) {                                             \
    NSError *error = HumUnavailableError();                                            \
    reject(@"ERR_UNAVAILABLE", error.localizedDescription, error);                     \
    return;                                                                            \
  }

HUM_STUB_METHOD(createClient,
                createClientWithHs:(NSString *)hsUrl
                storePath:(NSString *)storePath
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientFree,
                clientFreeWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientLogin,
                clientLoginWithHandle:(nonnull NSNumber *)hid
                username:(NSString *)username
                password:(NSString *)password
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientIsAuthenticated,
                clientIsAuthenticatedWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientLogout,
                clientLogoutWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientGetRooms,
                clientGetRoomsWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientCreateRoom,
                clientCreateRoomWithHandle:(nonnull NSNumber *)hid
                name:(NSString *_Nullable)name
                topic:(NSString *_Nullable)topic
                isPublic:(BOOL)isPublic
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientJoinRoom,
                clientJoinRoomWithHandle:(nonnull NSNumber *)hid
                idOrAlias:(NSString *)idOrAlias
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientLeaveRoom,
                clientLeaveRoomWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSendText,
                clientSendTextWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                body:(NSString *)body
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSendReaction,
                clientSendReactionWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                eventId:(NSString *)eventId
                key:(NSString *)key
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientRedact,
                clientRedactWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                eventId:(NSString *)eventId
                reason:(NSString *_Nullable)reason
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSendReadReceipt,
                clientSendReadReceiptWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                eventId:(NSString *)eventId
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSetTyping,
                clientSetTypingWithHandle:(nonnull NSNumber *)hid
                roomId:(NSString *)roomId
                isTyping:(BOOL)isTyping
                timeoutMs:(nonnull NSNumber *)timeoutMs
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientStartSyncLoop,
                clientStartSyncLoopWithHandle:(nonnull NSNumber *)hid
                timeoutMs:(nonnull NSNumber *)timeoutMs
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientStopSyncLoop,
                clientStopSyncLoopWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSyncOnce,
                clientSyncOnceWithHandle:(nonnull NSNumber *)hid
                timeoutMs:(nonnull NSNumber *)timeoutMs
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientImportRecoveryKey,
                clientImportRecoveryKeyWithHandle:(nonnull NSNumber *)hid
                key:(NSString *)key
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSearchUsers,
                clientSearchUsersWithHandle:(nonnull NSNumber *)hid
                query:(NSString *)query
                limit:(nonnull NSNumber *)limit
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientGetDevices,
                clientGetDevicesWithHandle:(nonnull NSNumber *)hid
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientRenameDevice,
                clientRenameDeviceWithHandle:(nonnull NSNumber *)hid
                deviceId:(NSString *)deviceId
                name:(NSString *)name
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientDeleteDevice,
                clientDeleteDeviceWithHandle:(nonnull NSNumber *)hid
                deviceId:(NSString *)deviceId
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientUploadMedia,
                clientUploadMediaWithHandle:(nonnull NSNumber *)hid
                dataBase64:(NSString *)dataBase64
                mime:(NSString *)mime
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientDownloadMedia,
                clientDownloadMediaWithHandle:(nonnull NSNumber *)hid
                uri:(NSString *)uri
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientSetPresence,
                clientSetPresenceWithHandle:(nonnull NSNumber *)hid
                state:(nonnull NSNumber *)state
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

HUM_STUB_METHOD(clientGetPresence,
                clientGetPresenceWithHandle:(nonnull NSNumber *)hid
                userId:(NSString *)userId
                resolver:(RCTPromiseResolveBlock)resolve
                rejecter:(RCTPromiseRejectBlock)reject)

#undef HUM_STUB_METHOD

@end

#endif
