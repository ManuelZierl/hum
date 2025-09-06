/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  HumMatrixNative,
  Client,
  RoomSummary,
  CreateRoomOptions,
} from '../src/types';
import { PresenceState } from '../src/types';

let nextHandle = 1;

export interface MockState {
  authenticated: boolean;
  rooms: RoomSummary[];
}

function makeClient(state: MockState): Client {
  return {
    async login(_u: string, _p: string) {
      state.authenticated = true;
    },
    async logout() {
      state.authenticated = false;
    },
    async isAuthenticated() {
      return state.authenticated;
    },
    async getRooms() {
      return state.rooms.slice();
    },
    async sendText(_roomId: string, _body: string) {
      return;
    },
    async startSyncLoop(_timeoutMs: number) {
      return;
    },
    async stopSyncLoop() {
      return;
    },
    async dispose() {
      return;
    },
    async importRecoveryKey(_key: string) {
      return;
    },
    async searchUsers(_query: string, _limit?: number) {
      return [];
    },
    async getDevices() {
      return [];
    },
    async renameDevice(_deviceId: string, _name: string) {
      return;
    },
    async deleteDevice(_deviceId: string) {
      return;
    },
    async syncOnce(_timeoutMs: number) {
      return;
    },
    async sendReaction(_roomId: string, _eventId: string, _key: string) {
      return;
    },
    async redact(_roomId: string, _eventId: string, _reason?: string) {
      return;
    },
    async sendReadReceipt(_roomId: string, _eventId: string) {
      return;
    },
    async setTyping(_roomId: string, _isTyping: boolean, _timeoutMs?: number) {
      return;
    },
    async createRoom(_options?: CreateRoomOptions) {
      const id = `!room:${++nextHandle}`;
      return id;
    },
    async joinRoom(idOrAlias: string) {
      return idOrAlias.startsWith('!') ? idOrAlias : `!joined:${idOrAlias}`;
    },
    async leaveRoom(_roomId: string) {
      return;
    },
    async uploadMedia(_data: Uint8Array, _mime: string) {
      return 'mxc://mock/media';
    },
    async downloadMedia(_uri: string) {
      return new Uint8Array([1, 2, 3]);
    },
    async setPresence(_state: PresenceState) {
      return;
    },
    async getPresence(_userId: string) {
      return PresenceState.Online;
    },
  };
}

const MockModule: HumMatrixNative = {
  async createClient(_hsUrl: string, _storePath: string): Promise<Client> {
    const state: MockState = {
      authenticated: false,
      rooms: [
        {
          id: '!a:hs',
          name: 'General',
          lastMessage: 'Welcome to Hum',
          lastMessageTs: 1700000000000,
          unreadCount: 0,
          avatarUrl: 'https://example.com/a.png',
        },
      ],
    };
    return makeClient(state);
  },
};

export default MockModule;
