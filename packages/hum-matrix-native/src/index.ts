import type {
  HumMatrixNative,
  Client,
  RoomSummary,
  PresenceState,
  CreateRoomOptions,
  UserSummary,
  DeviceInfo,
} from './types';
export * from './types';

import Native from './nativeSpec';

type RawRoom = Partial<{
  room_id: string;
  id: string;
  name: string;
  last_message: string;
  lastMessage: string;
  last_message_ts: number;
  lastMessageTs: number;
  unread_count: number;
  unreadCount: number;
  avatar_url: string;
  avatarUrl: string;
}>;

function mapRoomsJson(json: string): RoomSummary[] {
  try {
    const arr = JSON.parse(json) as RawRoom[];
    return arr.map((r: RawRoom): RoomSummary => {
      const id = r.room_id ?? r.id;
      if (!id) {
        throw new Error('Room entry missing id');
      }
      return {
        id,
        name: r.name,
        lastMessage: r.lastMessage ?? r.last_message,
        lastMessageTs: r.lastMessageTs ?? r.last_message_ts,
        unreadCount: r.unreadCount ?? r.unread_count,
        avatarUrl: r.avatarUrl ?? r.avatar_url,
      };
    });
  } catch (e) {
    throw new Error(`Failed to parse rooms JSON: ${(e as Error).message}`);
  }
}

function mapUsersJson(json: string): UserSummary[] {
  try {
    const arr = JSON.parse(json) as Array<{
      user_id?: string;
      display_name?: string;
    }>;
    return arr.map((u) => ({
      userId: u.user_id ?? '',
      displayName: u.display_name,
    }));
  } catch (e) {
    throw new Error(`Failed to parse users JSON: ${(e as Error).message}`);
  }
}

function mapDevicesJson(json: string): DeviceInfo[] {
  try {
    const arr = JSON.parse(json) as Array<{
      device_id?: string;
      display_name?: string;
    }>;
    return arr.map((d) => ({
      deviceId: d.device_id ?? '',
      displayName: d.display_name,
    }));
  } catch (e) {
    throw new Error(`Failed to parse devices JSON: ${(e as Error).message}`);
  }
}

function toBase64(u8: Uint8Array): string {
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let binary = '';
  for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  if (typeof Buffer !== 'undefined')
    return new Uint8Array(Buffer.from(b64, 'base64'));
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const Module: HumMatrixNative = {
  async createClient(hsUrl: string, storePath: string): Promise<Client> {
    const handle = await Native.createClient(hsUrl, storePath);

    const client: Client = {
      async login(username, password) {
        await Native.clientLogin(handle, username, password);
      },
      async logout() {
        await Native.clientLogout(handle);
      },
      async isAuthenticated() {
        return await Native.clientIsAuthenticated(handle);
      },
      async getRooms() {
        const json = await Native.clientGetRooms(handle);
        return mapRoomsJson(json);
      },
      async sendText(roomId, body) {
        await Native.clientSendText(handle, roomId, body);
      },
      async startSyncLoop(timeoutMs) {
        await Native.clientStartSyncLoop(handle, timeoutMs);
      },
      async stopSyncLoop() {
        await Native.clientStopSyncLoop(handle);
      },
      async dispose() {
        await Native.clientStopSyncLoop(handle).catch(() => {});
        await Native.clientFree(handle);
      },
      async importRecoveryKey(key: string) {
        await Native.clientImportRecoveryKey(handle, key);
      },
      async searchUsers(query: string, limit = 20) {
        const json = await Native.clientSearchUsers(handle, query, limit);
        return mapUsersJson(json);
      },
      async getDevices() {
        const json = await Native.clientGetDevices(handle);
        return mapDevicesJson(json);
      },
      async renameDevice(deviceId: string, name: string) {
        await Native.clientRenameDevice(handle, deviceId, name);
      },
      async deleteDevice(deviceId: string) {
        await Native.clientDeleteDevice(handle, deviceId);
      },
      async syncOnce(timeoutMs: number) {
        await Native.clientSyncOnce(handle, timeoutMs);
      },
      async sendReaction(roomId: string, eventId: string, key: string) {
        await Native.clientSendReaction(handle, roomId, eventId, key);
      },
      async redact(roomId: string, eventId: string, reason?: string) {
        await Native.clientRedact(handle, roomId, eventId, reason ?? null);
      },
      async sendReadReceipt(roomId: string, eventId: string) {
        await Native.clientSendReadReceipt(handle, roomId, eventId);
      },
      async setTyping(roomId: string, isTyping: boolean, timeoutMs = 0) {
        await Native.clientSetTyping(handle, roomId, isTyping, timeoutMs);
      },
      async createRoom(options?: CreateRoomOptions) {
        const name = options?.name ?? null;
        const topic = options?.topic ?? null;
        const isPublic = options?.isPublic ?? false;
        return await Native.clientCreateRoom(handle, name, topic, isPublic);
      },
      async joinRoom(idOrAlias: string) {
        return await Native.clientJoinRoom(handle, idOrAlias);
      },
      async leaveRoom(roomId: string) {
        await Native.clientLeaveRoom(handle, roomId);
      },
      async uploadMedia(data: Uint8Array, mime: string) {
        const b64 = toBase64(data);
        return await Native.clientUploadMedia(handle, b64, mime);
      },
      async downloadMedia(uri: string) {
        const b64 = await Native.clientDownloadMedia(handle, uri);
        return fromBase64(b64);
      },
      async setPresence(state: PresenceState) {
        await Native.clientSetPresence(handle, state as number);
      },
      async getPresence(userId: string) {
        const code = await Native.clientGetPresence(handle, userId);
        return code as PresenceState;
      },
    };

    return client;
  },
};

export default Module;
