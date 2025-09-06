// TurboModule spec skeleton (New Architecture).
// This is optional at this stage; included for future codegen wiring.
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Create client; returns an opaque numeric handle managed natively.
  createClient(hsUrl: string, storePath: string): Promise<number>;

  // Core lifecycle/auth
  clientFree(handle: number): Promise<void>;
  clientLogin(
    handle: number,
    username: string,
    password: string,
  ): Promise<void>;
  clientLogout(handle: number): Promise<void>;
  clientIsAuthenticated(handle: number): Promise<boolean>;

  // Rooms
  clientGetRooms(handle: number): Promise<string>; // JSON string from FFI
  clientCreateRoom(
    handle: number,
    name: string | null,
    topic: string | null,
    isPublic: boolean,
  ): Promise<string>; // returns room_id
  clientJoinRoom(handle: number, idOrAlias: string): Promise<string>; // returns room_id
  clientLeaveRoom(handle: number, roomId: string): Promise<void>;

  // Messaging
  clientSendText(handle: number, roomId: string, body: string): Promise<void>;
  clientSendReaction(
    handle: number,
    roomId: string,
    eventId: string,
    key: string,
  ): Promise<void>;
  clientRedact(
    handle: number,
    roomId: string,
    eventId: string,
    reason: string | null,
  ): Promise<void>;
  clientSendReadReceipt(
    handle: number,
    roomId: string,
    eventId: string,
  ): Promise<void>;
  clientSetTyping(
    handle: number,
    roomId: string,
    isTyping: boolean,
    timeoutMs: number,
  ): Promise<void>;

  // Sync
  clientStartSyncLoop(handle: number, timeoutMs: number): Promise<void>;
  clientStopSyncLoop(handle: number): Promise<void>;
  clientSyncOnce(handle: number, timeoutMs: number): Promise<void>;

  // Recovery
  clientImportRecoveryKey(handle: number, key: string): Promise<void>;

  // Contacts/Devices
  clientSearchUsers(
    handle: number,
    query: string,
    limit: number,
  ): Promise<string>; // JSON string
  clientGetDevices(handle: number): Promise<string>; // JSON string
  clientRenameDevice(
    handle: number,
    deviceId: string,
    name: string,
  ): Promise<void>;
  clientDeleteDevice(handle: number, deviceId: string): Promise<void>;

  // Media
  clientUploadMedia(
    handle: number,
    dataBase64: string,
    mime: string,
  ): Promise<string>; // returns mxc uri
  clientDownloadMedia(handle: number, uri: string): Promise<string>; // returns base64

  // Presence
  clientSetPresence(handle: number, state: number): Promise<void>;
  clientGetPresence(handle: number, userId: string): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('HumNative');
