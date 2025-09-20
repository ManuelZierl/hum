import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

const createClientMock = jest.fn();

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    appOwnership: 'standalone',
    executionEnvironment: 'bare',
    expoConfig: { extra: {} },
  },
}));

jest.mock('@hum/hum-matrix-native', () => ({
  __esModule: true,
  default: {
    createClient: (...args: unknown[]) => createClientMock(...args),
  },
}));

jest.mock('../apps/mobile/src/hum/MockClient', () => ({
  MockClient: class {
    constructor(hs: string, store: string) {}
    async login() {}
    async logout() {}
    async isAuthenticated() {
      return false;
    }
    async getRooms() {
      return [{ id: 'r1' }];
    }
    async sendText() {}
    async sendMessage() {}
    async sendReaction() {}
    async redact() {}
    async sendReadReceipt() {}
    async setTyping() {}
    async createRoom() {
      return 'r1';
    }
    async joinRoom(id: string) {
      return id;
    }
    async leaveRoom() {}
    async startSyncLoop() {}
    async stopSyncLoop() {}
    async syncOnce() {}
    async dispose() {}
    async importRecoveryKey() {}
    async searchUsers() {
      return [];
    }
    async getDevices() {
      return [];
    }
    async renameDevice() {}
    async deleteDevice() {}
    async uploadMedia() {
      return '';
    }
    async downloadMedia() {
      return new Uint8Array();
    }
    async setPresence() {}
    async getPresence() {
      return 0;
    }
  },
}));

const {
  HumClientProvider,
  useHumClient,
} = require('../apps/mobile/src/hum/HumClientProvider');

beforeEach(() => {
  jest.clearAllMocks();
  createClientMock.mockReset();
  (globalThis as any).__DEV__ = true;
  delete (globalThis as any).__HUM_FORCE_MOCK__;
});

describe('HumClientProvider fallback', () => {
  it('falls back to MockClient when native init fails', async () => {
    createClientMock.mockRejectedValueOnce(new Error('native unavailable'));
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (globalThis as any).__HUM_FORCE_MOCK__ = true;

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <HumClientProvider>{children}</HumClientProvider>
    );

    const { result } = renderHook(() => useHumClient(), { wrapper });

    await waitFor(() => result.current.ready);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('HumClientProvider', () => {
  it('exposes the native client and delegates all actions', async () => {
    const roomList = [
      {
        id: 'room1',
        name: 'Room One',
        lastMessage: 'Last',
        lastMessageTs: Date.UTC(2023, 0, 1, 12, 30),
        unreadCount: 2,
        avatarUrl: 'avatar',
      },
    ];
    const messages = [
      {
        id: 'msg1',
        body: 'Hello',
        formattedBody: '<strong>Hello</strong>',
        ts: Date.UTC(2023, 0, 1, 13, 0),
        isOutgoing: true,
      },
    ];

    const client = {
      login: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      isAuthenticated: jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
      getRooms: jest.fn().mockResolvedValue(roomList),
      sendText: jest.fn().mockResolvedValue(undefined),
      sendMessage: jest.fn().mockResolvedValue(undefined),
      sendReaction: jest.fn().mockResolvedValue(undefined),
      redact: jest.fn().mockResolvedValue(undefined),
      sendReadReceipt: jest.fn().mockResolvedValue(undefined),
      setTyping: jest.fn().mockResolvedValue(undefined),
      createRoom: jest.fn().mockResolvedValue('created-room'),
      joinRoom: jest.fn().mockResolvedValue('joined-room'),
      leaveRoom: jest.fn().mockResolvedValue(undefined),
      startSyncLoop: jest.fn().mockResolvedValue(undefined),
      stopSyncLoop: jest.fn().mockResolvedValue(undefined),
      syncOnce: jest.fn().mockResolvedValue(undefined),
      importRecoveryKey: jest.fn().mockResolvedValue(undefined),
      searchUsers: jest.fn().mockResolvedValue([{ userId: '@alice:server' }]),
      getDevices: jest.fn().mockResolvedValue([{ deviceId: 'device-1' }]),
      renameDevice: jest.fn().mockResolvedValue(undefined),
      deleteDevice: jest.fn().mockResolvedValue(undefined),
      uploadMedia: jest.fn().mockResolvedValue('mxc://media'),
      downloadMedia: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      setPresence: jest.fn().mockResolvedValue(undefined),
      getPresence: jest.fn().mockResolvedValue(0),
      getMessages: jest.fn().mockResolvedValue(messages),
    };

    createClientMock.mockResolvedValue(client);

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <HumClientProvider>{children}</HumClientProvider>
    );

    const { result } = renderHook(() => useHumClient(), { wrapper });

    await waitFor(() => expect(result.current.ready).toBe(true));

    expect(result.current.client).toBe(client);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.rooms).toEqual(roomList);
    expect(result.current.chats[0]).toMatchObject({
      id: 'room1',
      name: 'Room One',
      message: 'Last',
      avatar: 'avatar',
      unreadCount: 2,
    });
    expect(result.current.chats[0].time).toEqual(expect.any(String));

    await act(async () => {
      await result.current.refreshRooms();
    });
    expect(client.getRooms).toHaveBeenCalledTimes(2);

    await act(async () => {
      await result.current.login('alice', 'pwd');
    });
    expect(client.login).toHaveBeenCalledWith('alice', 'pwd');

    await act(async () => {
      await result.current.sendText('room1', 'hello');
      await result.current.sendReaction('room1', 'event1', '👍');
      await result.current.redact('room1', 'event1', 'spam');
      await result.current.sendReadReceipt('room1', 'event1');
      await result.current.setTyping('room1', true, 5000);
      await result.current.startSyncLoop(1000);
      await result.current.stopSyncLoop();
      await result.current.syncOnce(1000);
      await result.current.leaveRoom('room1');
      await result.current.importRecoveryKey('recovery-key');
      await result.current.renameDevice('device-1', 'Phone');
      await result.current.deleteDevice('device-1');
      await result.current.setPresence(0);
      await result.current.sendMessage('room1', {
        msgtype: 'm.text',
        body: 'Hello',
        format: 'org.matrix.custom.html',
        formatted_body: '<strong>Hello</strong>',
      });
    });

    expect(client.sendText).toHaveBeenCalledWith('room1', 'hello');
    expect(client.sendReaction).toHaveBeenCalledWith('room1', 'event1', '👍');
    expect(client.redact).toHaveBeenCalledWith('room1', 'event1', 'spam');
    expect(client.sendReadReceipt).toHaveBeenCalledWith('room1', 'event1');
    expect(client.setTyping).toHaveBeenCalledWith('room1', true, 5000);
    expect(client.startSyncLoop).toHaveBeenCalledWith(1000);
    expect(client.stopSyncLoop).toHaveBeenCalled();
    expect(client.syncOnce).toHaveBeenCalledWith(1000);
    expect(client.leaveRoom).toHaveBeenCalledWith('room1');
    expect(client.importRecoveryKey).toHaveBeenCalledWith('recovery-key');
    expect(client.renameDevice).toHaveBeenCalledWith('device-1', 'Phone');
    expect(client.deleteDevice).toHaveBeenCalledWith('device-1');
    expect(client.setPresence).toHaveBeenCalledWith(0);
    expect(client.sendMessage).toHaveBeenCalledWith(
      'room1',
      expect.objectContaining({
        body: 'Hello',
        formatted_body: '<strong>Hello</strong>',
      }),
    );

    let createdRoom: string | undefined;
    let joinedRoom: string | undefined;
    let uploaded: string | undefined;
    let downloaded: Uint8Array | undefined;
    let presence: unknown;
    let devices: unknown;
    let users: unknown;
    let chatsMessages: unknown;

    await act(async () => {
      createdRoom = await result.current.createRoom({ name: 'New Room' });
      joinedRoom = await result.current.joinRoom('#alias:server');
      uploaded = await result.current.uploadMedia(
        new Uint8Array([9]),
        'text/plain',
      );
      downloaded = await result.current.downloadMedia('mxc://file');
      presence = await result.current.getPresence('@alice:server');
      devices = await result.current.getDevices();
      users = await result.current.searchUsers('alice', 5);
      chatsMessages = await result.current.getMessages('room1');
    });

    expect(createdRoom).toBe('created-room');
    expect(joinedRoom).toBe('joined-room');
    expect(uploaded).toBe('mxc://media');
    expect(downloaded).toEqual(new Uint8Array([1, 2, 3]));
    expect(presence).toBe(0);
    expect(devices).toEqual([{ deviceId: 'device-1' }]);
    expect(users).toEqual([{ userId: '@alice:server' }]);
    expect(chatsMessages).toEqual([
      expect.objectContaining({
        id: 'msg1',
        text: 'Hello',
        formattedBody: '<strong>Hello</strong>',
        isOutgoing: true,
        isRead: true,
      }),
    ]);
    expect(client.getMessages).toHaveBeenCalledWith('room1');

    await act(async () => {
      await result.current.logout();
    });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(client.logout).toHaveBeenCalled();
    expect(client.isAuthenticated).toHaveBeenCalledTimes(3);
  });

  it('falls back to sendText when sendMessage is unavailable', async () => {
    const client = {
      login: jest.fn().mockResolvedValue(undefined),
      logout: jest.fn().mockResolvedValue(undefined),
      isAuthenticated: jest.fn().mockResolvedValue(false),
      getRooms: jest.fn().mockResolvedValue([]),
      sendText: jest.fn().mockResolvedValue(undefined),
      sendReaction: jest.fn().mockResolvedValue(undefined),
      redact: jest.fn().mockResolvedValue(undefined),
      sendReadReceipt: jest.fn().mockResolvedValue(undefined),
      setTyping: jest.fn().mockResolvedValue(undefined),
      createRoom: jest.fn().mockResolvedValue('room'),
      joinRoom: jest.fn().mockResolvedValue('room'),
      leaveRoom: jest.fn().mockResolvedValue(undefined),
      startSyncLoop: jest.fn().mockResolvedValue(undefined),
      stopSyncLoop: jest.fn().mockResolvedValue(undefined),
      syncOnce: jest.fn().mockResolvedValue(undefined),
      importRecoveryKey: jest.fn().mockResolvedValue(undefined),
      searchUsers: jest.fn().mockResolvedValue([]),
      getDevices: jest.fn().mockResolvedValue([]),
      renameDevice: jest.fn().mockResolvedValue(undefined),
      deleteDevice: jest.fn().mockResolvedValue(undefined),
      uploadMedia: jest.fn().mockResolvedValue('mxc://mock'),
      downloadMedia: jest.fn().mockResolvedValue(new Uint8Array()),
      setPresence: jest.fn().mockResolvedValue(undefined),
      getPresence: jest.fn().mockResolvedValue(0),
      getMessages: jest.fn().mockResolvedValue([]),
    };

    createClientMock.mockResolvedValue(client);

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <HumClientProvider>{children}</HumClientProvider>
    );

    const { result } = renderHook(() => useHumClient(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.sendMessage('room1', {
        msgtype: 'm.text',
        body: 'Fallback',
        format: 'org.matrix.custom.html',
        formatted_body: '<strong>Fallback</strong>',
      });
    });

    expect(client.sendText).toHaveBeenCalledWith('room1', 'Fallback');
  });

  it('throws when useHumClient is used without a provider', () => {
    expect(() => renderHook(() => useHumClient())).toThrow(
      'useHumClient must be used within HumClientProvider',
    );
  });
});
