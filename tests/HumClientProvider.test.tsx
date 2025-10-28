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

jest.mock('../apps/mobile/src/hum/nativeClient', () => ({
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
      dispose: jest.fn().mockResolvedValue(undefined),
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
    let createdRoom: string | undefined;
    let joinedRoom: string | undefined;
    let chatsMessages: unknown;

    await act(async () => {
      createdRoom = await result.current.createRoom({ name: 'New Room' });
      joinedRoom = await result.current.joinRoom('#alias:server');
      chatsMessages = await result.current.getMessages('room1');
    });

    expect(createdRoom).toBe('created-room');
    expect(joinedRoom).toBe('joined-room');
    expect(chatsMessages).toEqual([
      expect.objectContaining({
        id: 'msg1',
        text: 'Hello',
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

  it('throws when useHumClient is used without a provider', () => {
    expect(() => renderHook(() => useHumClient())).toThrow(
      'useHumClient must be used within HumClientProvider',
    );
  });
});
