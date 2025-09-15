/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  type Client,
  type RoomSummary,
  type CreateRoomOptions,
  PresenceState,
  type UserSummary,
  type DeviceInfo,
} from '@hum/hum-matrix-native';

/**
 * In-memory mock implementation of the Hum Matrix client.
 *
 * Provides just enough functionality for UI development without a backend.
 */
export class MockClient implements Client {
  private rooms: RoomSummary[];
  private messages = new Map<
    string,
    Array<{ id: string; body: string; ts: number; isOutgoing: boolean }>
  >();
  private authed = false;
  private presence = new Map<string, PresenceState>();

  constructor(_hsUrl: string, _storePath: string) {
    const now = Date.now();
    this.rooms = [
      {
        id: '!alice:mock',
        name: 'Alice',
        lastMessage: 'Hello from Alice',
        lastMessageTs: now - 60_000,
        avatarUrl: 'https://picsum.photos/seed/alice/100',
      },
      {
        id: '!devs:mock',
        name: 'Hum Devs',
        lastMessage: 'Welcome to Hum',
        lastMessageTs: now - 120_000,
        avatarUrl: 'https://picsum.photos/seed/humdevs/100',
      },
    ];
    this.messages.set('!alice:mock', [
      {
        id: 'm1',
        body: 'Hello from Alice',
        ts: now - 60_000,
        isOutgoing: false,
      },
      {
        id: 'm2',
        body: 'Hi Alice!',
        ts: now - 30_000,
        isOutgoing: true,
      },
    ]);
    this.messages.set('!devs:mock', [
      {
        id: 'm3',
        body: 'Welcome to Hum',
        ts: now - 120_000,
        isOutgoing: false,
      },
    ]);
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
    return this.rooms;
  }

  async sendText(roomId: string, body: string): Promise<void> {
    const r = this.rooms.find((r) => r.id === roomId);
    if (r) {
      const ts = Date.now();
      r.lastMessage = body;
      r.lastMessageTs = ts;
      const arr = this.messages.get(roomId) ?? [];
      arr.push({
        id: `${roomId}-${arr.length + 1}`,
        body,
        ts,
        isOutgoing: true,
      });
      this.messages.set(roomId, arr);
    }
  }

  async getMessages(
    roomId: string,
  ): Promise<
    Array<{ id: string; body: string; ts: number; isOutgoing: boolean }>
  > {
    return this.messages.get(roomId) ?? [];
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
    const room: RoomSummary = {
      id,
      name: options?.name ?? `Room ${this.rooms.length + 1}`,
      lastMessage: '',
      lastMessageTs: Date.now(),
    };
    this.rooms.push(room);
    return id;
  }

  async joinRoom(idOrAlias: string): Promise<string> {
    return idOrAlias;
  }

  async leaveRoom(roomId: string): Promise<void> {
    this.rooms = this.rooms.filter((r) => r.id !== roomId);
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
