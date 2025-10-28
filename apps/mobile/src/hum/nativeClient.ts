import MatrixSDK from 'react-native-matrix-sdk';

import type {
  Client,
  CreateRoomOptions,
  RoomSummary,
  TimelineMessage,
} from './types';

const DEFAULT_MESSAGE_LIMIT = 25;

type MatrixMessageEvent = {
  event_id?: string;
  eventId?: string;
  room_id?: string;
  sender_id?: string;
  ts?: number;
  content?: {
    body?: string;
    msgtype?: string;
  };
};

type MatrixRoomAttributes = {
  room_id?: string;
  id?: string;
  name?: string;
  notification_count?: number;
  unread_notifications?: number;
  last_message?: MatrixMessageEvent | null;
  lastMessage?: MatrixMessageEvent | null;
  members?: Array<{ avatarUrl?: string } | null> | null;
};

function mapRoom(room: MatrixRoomAttributes): RoomSummary {
  const last = room.last_message ?? room.lastMessage ?? null;
  const lastBody = last?.content?.body ?? undefined;
  const lastTs = typeof last?.ts === 'number' ? last?.ts : undefined;
  const avatar = room.members?.find((member) => member?.avatarUrl)?.avatarUrl;
  return {
    id: room.room_id ?? room.id ?? '',
    name: room.name ?? room.room_id ?? room.id ?? '',
    lastMessage: lastBody,
    lastMessageTs: lastTs,
    unreadCount: room.notification_count ?? room.unread_notifications ?? 0,
    avatarUrl: avatar ?? undefined,
  };
}

function mapMessage(
  event: MatrixMessageEvent,
  currentUserId: string | null,
): TimelineMessage | null {
  const id = event.event_id ?? event.eventId;
  const body = event.content?.body;
  if (!id || typeof body !== 'string') {
    return null;
  }
  const ts = typeof event.ts === 'number' ? event.ts : Date.now();
  return {
    id,
    body,
    ts,
    isOutgoing: currentUserId != null && event.sender_id === currentUserId,
  };
}

class NativeMatrixClient implements Client {
  private authenticated = false;
  private sessionReady = false;
  private userId: string | null = null;

  constructor(private readonly homeserver: string) {}

  private async ensureConfigured(): Promise<void> {
    if (!this.sessionReady) {
      const session = await MatrixSDK.startSession();
      if (session && typeof session === 'object') {
        const maybeUser = (session as { user_id?: string }).user_id;
        if (typeof maybeUser === 'string') {
          this.userId = maybeUser;
        }
      }
      this.sessionReady = true;
    }
  }

  async login(username: string, password: string): Promise<void> {
    const credentials = await MatrixSDK.login(username, password);
    if (credentials && typeof credentials === 'object') {
      const accessToken = (credentials as { access_token?: string }).access_token;
      const deviceId = (credentials as { device_id?: string }).device_id;
      const userId = (credentials as { user_id?: string }).user_id;
      const homeServer = (credentials as { home_server?: string }).home_server;
      const refreshToken = (credentials as { refresh_token?: string }).refresh_token;
      if (
        typeof accessToken === 'string' &&
        typeof deviceId === 'string' &&
        typeof userId === 'string' &&
        typeof homeServer === 'string'
      ) {
        MatrixSDK.setCredentials(
          accessToken,
          deviceId,
          userId,
          homeServer,
          typeof refreshToken === 'string' ? refreshToken : undefined,
        );
        this.userId = userId;
      }
    }
    this.authenticated = true;
    await this.ensureConfigured();
  }

  async logout(): Promise<void> {
    this.authenticated = false;
    this.sessionReady = false;
    await this.stopSyncLoop();
  }

  async isAuthenticated(): Promise<boolean> {
    if (!this.authenticated) {
      return false;
    }
    try {
      await this.ensureConfigured();
      return true;
    } catch {
      return false;
    }
  }

  async getRooms(): Promise<RoomSummary[]> {
    await this.ensureConfigured();
    const rooms = await MatrixSDK.getJoinedRooms();
    if (!Array.isArray(rooms)) {
      return [];
    }
    return rooms
      .map((room) => mapRoom((room ?? {}) as MatrixRoomAttributes))
      .filter((room) => room.id.length > 0);
  }

  async sendText(roomId: string, body: string): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.sendMessageToRoom(roomId, 'm.room.message', {
      body,
      msgtype: 'm.text',
    });
  }

  async sendReaction(roomId: string, eventId: string, key: string): Promise<void> {
    await this.ensureConfigured();
    if (typeof MatrixSDK.sendEventToRoom !== 'function') {
      return;
    }
    await MatrixSDK.sendEventToRoom(roomId, 'm.reaction', {
      'm.relates_to': {
        rel_type: 'm.annotation',
        event_id: eventId,
        key,
      },
    });
  }

  async redact(roomId: string, eventId: string, reason?: string): Promise<void> {
    await this.ensureConfigured();
    if (typeof MatrixSDK.sendEventToRoom !== 'function') {
      return;
    }
    await MatrixSDK.sendEventToRoom(roomId, 'm.room.redaction', {
      redacts: eventId,
      reason,
    });
  }

  async sendReadReceipt(roomId: string, eventId: string): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.sendReadReceipt(roomId, eventId);
  }

  async setTyping(
    roomId: string,
    isTyping: boolean,
    timeoutMs: number = 0,
  ): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.sendTyping(roomId, isTyping, timeoutMs);
  }

  async createRoom(options?: CreateRoomOptions): Promise<string | undefined> {
    await this.ensureConfigured();
    const response = await MatrixSDK.createRoom(
      options?.invitees ?? [],
      options?.isDirect ?? false,
      options?.isTrustedPrivateChat ?? false,
      options?.name ?? '',
    );
    if (response && typeof response === 'object') {
      const attrs = response as { room_id?: string; id?: string };
      return attrs.room_id ?? attrs.id ?? undefined;
    }
    return undefined;
  }

  async joinRoom(idOrAlias: string): Promise<string | undefined> {
    await this.ensureConfigured();
    const response = await MatrixSDK.joinRoom(idOrAlias);
    if (response && typeof response === 'object') {
      const attrs = response as { room_id?: string; id?: string };
      return attrs.room_id ?? attrs.id ?? idOrAlias;
    }
    return idOrAlias;
  }

  async leaveRoom(roomId: string): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.leaveRoom(roomId);
  }

  async startSyncLoop(_timeoutMs: number): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.listen();
  }

  async stopSyncLoop(): Promise<void> {
    if (typeof MatrixSDK.unlisten === 'function') {
      MatrixSDK.unlisten();
    }
  }

  async syncOnce(_timeoutMs: number): Promise<void> {
    await this.ensureConfigured();
    await MatrixSDK.getLastEventsForAllRooms();
  }

  async dispose(): Promise<void> {
    await this.stopSyncLoop();
  }

  async getMessages(roomId: string): Promise<TimelineMessage[]> {
    await this.ensureConfigured();
    if (typeof MatrixSDK.loadMessagesInRoom !== 'function') {
      return [];
    }
    try {
      const events = await MatrixSDK.loadMessagesInRoom(
        roomId,
        DEFAULT_MESSAGE_LIMIT,
        true,
      );
      if (!Array.isArray(events)) {
        return [];
      }
      return events
        .map((event) => mapMessage((event ?? {}) as MatrixMessageEvent, this.userId))
        .filter((event): event is TimelineMessage => event !== null)
        .sort((a, b) => a.ts - b.ts);
    } catch {
      return [];
    }
  }
}

export async function createNativeClient(
  hsUrl: string,
  _storePath: string,
): Promise<Client> {
  if (!hsUrl) {
    throw new Error('createNativeClient: homeserver URL is required');
  }
  MatrixSDK.configure(hsUrl);
  if (typeof MatrixSDK.setAdditionalEventTypes === 'function') {
    MatrixSDK.setAdditionalEventTypes(['m.reaction']);
  }
  return new NativeMatrixClient(hsUrl);
}

const HumMatrixNative = {
  createClient: createNativeClient,
};

export default HumMatrixNative;
export type { Client, RoomSummary, TimelineMessage } from './types';
