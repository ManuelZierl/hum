/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type Client,
  type RoomSummary,
  type CreateRoomOptions,
  PresenceState,
  type UserSummary,
  type DeviceInfo,
} from '@hum/hum-matrix-native';
import type { MatrixMessageContent } from '@hum/rich-text';
import seedData from './mock-data.json';

type SeedMessage = {
  id?: string;
  body: string;
  isOutgoing: boolean;
  minutesAgo: number;
};

type SeedRoom = {
  id: string;
  name: string;
  avatarUrl: string;
  unreadCount?: number;
  messages: SeedMessage[];
};

type SeedData = {
  rooms: SeedRoom[];
};

type TimelineMessage = {
  id: string;
  body: string;
  ts: number;
  isOutgoing: boolean;
  formattedBody?: string;
};

const SEED: SeedData = seedData as SeedData;

function minutesAgoToTs(
  minutesAgo: number,
  index: number,
  now: number,
): number {
  return now - Math.max(0, minutesAgo) * 60_000 - index;
}

function cloneTimeline(messages: TimelineMessage[]): TimelineMessage[] {
  return messages.map((m) => ({ ...m }));
}

/**
 * In-memory mock implementation of the Hum Matrix client.
 *
 * Provides just enough functionality for UI development without a backend.
 */
export class MockClient implements Client {
  private rooms: RoomSummary[];
  private messages = new Map<string, TimelineMessage[]>();
  private authed = false;
  private presence = new Map<string, PresenceState>();

  private appendMessage(roomId: string, entry: TimelineMessage) {
    const existing = this.messages.get(roomId) ?? [];
    const timeline = [...existing, entry];
    this.messages.set(roomId, timeline);

    const room = this.rooms.find((r) => r.id === roomId);
    if (room) {
      room.lastMessage = entry.body;
      room.lastMessageTs = entry.ts;
      room.unreadCount = 0;
    } else {
      this.rooms.push({
        id: roomId,
        name: roomId,
        lastMessage: entry.body,
        lastMessageTs: entry.ts,
      });
    }

    this.rooms.sort((a, b) => (b.lastMessageTs ?? 0) - (a.lastMessageTs ?? 0));
  }

  constructor(_hsUrl: string, _storePath: string) {
    const now = Date.now();
    const rooms = SEED.rooms ?? [];
    this.rooms = rooms.map((room, roomIndex) => {
      const timeline = (room.messages ?? [])
        .map((msg, messageIndex) => ({
          id: msg.id ?? `${room.id}-msg-${messageIndex + 1}`,
          body: msg.body,
          ts: minutesAgoToTs(msg.minutesAgo ?? 0, messageIndex, now),
          isOutgoing: msg.isOutgoing,
        }))
        .sort((a, b) => a.ts - b.ts);

      this.messages.set(room.id, timeline);
      const last = timeline[timeline.length - 1];
      const fallbackTs = now - (roomIndex + 1) * 60_000;
      return {
        id: room.id,
        name: room.name,
        lastMessage: last?.body ?? '',
        lastMessageTs: last?.ts ?? fallbackTs,
        avatarUrl: room.avatarUrl,
        unreadCount: room.unreadCount,
      } satisfies RoomSummary;
    });

    this.rooms.sort((a, b) => (b.lastMessageTs ?? 0) - (a.lastMessageTs ?? 0));
  }

  async login(_username: string, _password: string): Promise<void> {
    this.authed = true;
  }

  async logout(): Promise<void> {
    this.authed = false;
  }

  async isAuthenticated(): Promise<boolean> {
    return this.authed;
  }

  async getRooms(): Promise<RoomSummary[]> {
    return this.rooms.map((room) => ({ ...room }));
  }

  async sendText(roomId: string, body: string): Promise<void> {
    const ts = Date.now();
    const entry: TimelineMessage = {
      id: `${roomId}-${ts}`,
      body,
      ts,
      isOutgoing: true,
    };
    this.appendMessage(roomId, entry);
  }

  async sendMessage(
    roomId: string,
    content: MatrixMessageContent,
  ): Promise<void> {
    const ts = Date.now();
    const entry: TimelineMessage = {
      id: `${roomId}-${ts}`,
      body: content.body,
      formattedBody: content.formatted_body,
      ts,
      isOutgoing: true,
    };
    this.appendMessage(roomId, entry);
  }

  async getMessages(roomId: string): Promise<TimelineMessage[]> {
    const timeline = this.messages.get(roomId) ?? [];
    return cloneTimeline(timeline);
  }

  async sendReaction(
    _roomId: string,
    _eventId: string,
    _key: string,
  ): Promise<void> {
    // no-op
  }

  async redact(
    _roomId: string,
    _eventId: string,
    _reason?: string,
  ): Promise<void> {
    // no-op
  }

  async sendReadReceipt(_roomId: string, _eventId: string): Promise<void> {
    // no-op
  }

  async setTyping(
    _roomId: string,
    _isTyping: boolean,
    _timeoutMs?: number,
  ): Promise<void> {
    // no-op
  }

  async createRoom(options?: CreateRoomOptions): Promise<string> {
    const id = `!mock${this.rooms.length + 1}:mock`;
    const ts = Date.now();
    const room: RoomSummary = {
      id,
      name: options?.name ?? `Room ${this.rooms.length + 1}`,
      lastMessage: '',
      lastMessageTs: ts,
      avatarUrl: `https://picsum.photos/seed/mock${this.rooms.length + 1}/100`,
    };
    this.rooms.push(room);
    this.messages.set(id, []);
    this.rooms.sort((a, b) => (b.lastMessageTs ?? 0) - (a.lastMessageTs ?? 0));
    return id;
  }

  async joinRoom(idOrAlias: string): Promise<string> {
    return idOrAlias;
  }

  async leaveRoom(roomId: string): Promise<void> {
    this.rooms = this.rooms.filter((r) => r.id !== roomId);
    this.messages.delete(roomId);
  }

  async startSyncLoop(_timeoutMs: number): Promise<void> {
    // no-op
  }

  async stopSyncLoop(): Promise<void> {
    // no-op
  }

  async syncOnce(_timeoutMs: number): Promise<void> {
    // no-op
  }

  async dispose(): Promise<void> {
    // no-op
  }

  async importRecoveryKey(_key: string): Promise<void> {
    // no-op
  }

  async searchUsers(_query: string, _limit = 20): Promise<UserSummary[]> {
    return [];
  }

  async getDevices(): Promise<DeviceInfo[]> {
    return [];
  }

  async renameDevice(_deviceId: string, _name: string): Promise<void> {
    // no-op
  }

  async deleteDevice(_deviceId: string): Promise<void> {
    // no-op
  }

  async uploadMedia(_data: Uint8Array, _mime: string): Promise<string> {
    return 'mxc://mock';
  }

  async downloadMedia(_uri: string): Promise<Uint8Array> {
    return new Uint8Array();
  }

  async setPresence(state: PresenceState): Promise<void> {
    this.presence.set('me', state);
  }

  async getPresence(userId: string): Promise<PresenceState> {
    return this.presence.get(userId) ?? PresenceState.Online;
  }
}

export default MockClient;
