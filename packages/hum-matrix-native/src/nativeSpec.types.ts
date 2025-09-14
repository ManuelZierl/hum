export type NativeBindings = {
  createClient(hsUrl: string, storePath: string): Promise<number> | number;
  clientFree(handle: number): Promise<void> | void;
  clientLogin(handle: number, u: string, p: string): Promise<void> | void;
  clientLogout(handle: number): Promise<void> | void;
  clientIsAuthenticated(handle: number): Promise<boolean> | boolean;
  clientGetRooms(handle: number): Promise<string> | string;
  clientSendText(
    handle: number,
    roomId: string,
    body: string,
  ): Promise<void> | void;
  clientStartSyncLoop(handle: number, timeoutMs: number): Promise<void> | void;
  clientStopSyncLoop(handle: number): Promise<void> | void;
  clientSyncOnce(handle: number, timeoutMs: number): Promise<void> | void;
  clientSendReaction(
    handle: number,
    roomId: string,
    eventId: string,
    key: string,
  ): Promise<void> | void;
  clientRedact(
    handle: number,
    roomId: string,
    eventId: string,
    reason: string | null,
  ): Promise<void> | void;
  clientSendReadReceipt(
    handle: number,
    roomId: string,
    eventId: string,
  ): Promise<void> | void;
  clientSetTyping(
    handle: number,
    roomId: string,
    isTyping: boolean,
    timeoutMs: number,
  ): Promise<void> | void;
  clientSearchUsers(
    handle: number,
    q: string,
    limit: number,
  ): Promise<string> | string;
  clientGetDevices(handle: number): Promise<string> | string;
  clientRenameDevice(
    handle: number,
    deviceId: string,
    name: string,
  ): Promise<void> | void;
  clientDeleteDevice(handle: number, deviceId: string): Promise<void> | void;
  clientSetPresence(handle: number, state: number): Promise<void> | void;
  clientGetPresence(handle: number, userId: string): Promise<number> | number;
  clientCreateRoom(
    handle: number,
    name: string | null,
    topic: string | null,
    isPublic: boolean,
  ): Promise<string> | string;
  clientJoinRoom(handle: number, idOrAlias: string): Promise<string> | string;
  clientLeaveRoom(handle: number, roomId: string): Promise<void> | void;
  clientUploadMedia(
    handle: number,
    base64: string,
    mime: string,
  ): Promise<string> | string;
  clientDownloadMedia(handle: number, uri: string): Promise<string> | string;
  clientImportRecoveryKey?: (
    handle: number,
    key: string,
  ) => Promise<void> | void;
};
