import Module from '../src/index';
import Native from '../src/nativeSpec';
import { PresenceState } from '../src/types';

type NativeMethod =
  | 'createClient'
  | 'clientLogin'
  | 'clientLogout'
  | 'clientIsAuthenticated'
  | 'clientGetRooms'
  | 'clientSendText'
  | 'clientStartSyncLoop'
  | 'clientStopSyncLoop'
  | 'clientFree'
  | 'clientSearchUsers'
  | 'clientGetDevices'
  | 'clientRenameDevice'
  | 'clientDeleteDevice'
  | 'clientSyncOnce'
  | 'clientSendReaction'
  | 'clientRedact'
  | 'clientSendReadReceipt'
  | 'clientSetTyping'
  | 'clientCreateRoom'
  | 'clientJoinRoom'
  | 'clientLeaveRoom'
  | 'clientUploadMedia'
  | 'clientDownloadMedia'
  | 'clientSetPresence'
  | 'clientGetPresence';

type NativeMock = {
  [K in NativeMethod]: jest.Mock<unknown, unknown[]>;
} & {
  clientImportRecoveryKey?: jest.Mock<unknown, unknown[]>;
};

function mockFn(): jest.Mock<unknown, unknown[]> {
  return jest.fn<unknown, unknown[]>();
}

function createNativeMock(): NativeMock {
  return {
    createClient: mockFn(),
    clientLogin: mockFn(),
    clientLogout: mockFn(),
    clientIsAuthenticated: mockFn(),
    clientGetRooms: mockFn(),
    clientSendText: mockFn(),
    clientStartSyncLoop: mockFn(),
    clientStopSyncLoop: mockFn(),
    clientFree: mockFn(),
    clientSearchUsers: mockFn(),
    clientGetDevices: mockFn(),
    clientRenameDevice: mockFn(),
    clientDeleteDevice: mockFn(),
    clientSyncOnce: mockFn(),
    clientSendReaction: mockFn(),
    clientRedact: mockFn(),
    clientSendReadReceipt: mockFn(),
    clientSetTyping: mockFn(),
    clientCreateRoom: mockFn(),
    clientJoinRoom: mockFn(),
    clientLeaveRoom: mockFn(),
    clientUploadMedia: mockFn(),
    clientDownloadMedia: mockFn(),
    clientSetPresence: mockFn(),
    clientGetPresence: mockFn(),
    clientImportRecoveryKey: mockFn(),
  };
}

jest.mock('../src/nativeSpec', () => ({
  __esModule: true,
  default: createNativeMock(),
}));

const nativeMock = Native as unknown as NativeMock;

const methodNames: NativeMethod[] = [
  'createClient',
  'clientLogin',
  'clientLogout',
  'clientIsAuthenticated',
  'clientGetRooms',
  'clientSendText',
  'clientStartSyncLoop',
  'clientStopSyncLoop',
  'clientFree',
  'clientSearchUsers',
  'clientGetDevices',
  'clientRenameDevice',
  'clientDeleteDevice',
  'clientSyncOnce',
  'clientSendReaction',
  'clientRedact',
  'clientSendReadReceipt',
  'clientSetTyping',
  'clientCreateRoom',
  'clientJoinRoom',
  'clientLeaveRoom',
  'clientUploadMedia',
  'clientDownloadMedia',
  'clientSetPresence',
  'clientGetPresence',
];

const resetNativeMocks = () => {
  methodNames.forEach((method) => {
    nativeMock[method] = mockFn();
  });
  nativeMock.clientImportRecoveryKey = mockFn();
};

beforeEach(() => {
  resetNativeMocks();
});

describe('hum-matrix-native module', () => {
  it('creates a client that proxies native operations and maps data', async () => {
    nativeMock.createClient.mockResolvedValue('handle-1');
    nativeMock.clientIsAuthenticated.mockResolvedValue(true);
    nativeMock.clientGetRooms.mockResolvedValue(
      JSON.stringify([
        {
          room_id: 'room-1',
          name: 'Alpha',
          last_message: 'Hello',
          last_message_ts: 111,
          unread_count: 2,
          avatar_url: 'mxc://alpha',
        },
        {
          id: 'room-2',
          name: 'Beta',
          lastMessage: 'World',
          lastMessageTs: 222,
          unreadCount: 4,
          avatarUrl: 'mxc://beta',
        },
      ]),
    );
    nativeMock.clientSearchUsers.mockResolvedValue(
      JSON.stringify([
        { user_id: '@alice', display_name: 'Alice' },
        { display_name: 'No Id' },
      ]),
    );
    nativeMock.clientGetDevices.mockResolvedValue(
      JSON.stringify([
        { device_id: 'device-1', display_name: 'Phone' },
        { display_name: 'Mystery Device' },
      ]),
    );
    nativeMock.clientUploadMedia
      .mockResolvedValueOnce('mxc://upload-1')
      .mockResolvedValueOnce('mxc://upload-2');
    nativeMock.clientDownloadMedia.mockResolvedValue('AQIDBA==\n');
    nativeMock.clientGetPresence.mockResolvedValue(PresenceState.DoNotDisturb);

    const client = await Module.createClient('https://hs', '/tmp/store');

    expect(nativeMock.createClient).toHaveBeenCalledWith(
      'https://hs',
      '/tmp/store',
    );

    await client.login('user', 'pass');
    expect(nativeMock.clientLogin).toHaveBeenCalledWith(
      'handle-1',
      'user',
      'pass',
    );

    await client.logout();
    expect(nativeMock.clientLogout).toHaveBeenCalledWith('handle-1');

    await client.sendText('room-1', 'hello everyone');
    expect(nativeMock.clientSendText).toHaveBeenCalledWith(
      'handle-1',
      'room-1',
      'hello everyone',
    );

    await client.sendReaction('room-1', 'event-5', '👍');
    expect(nativeMock.clientSendReaction).toHaveBeenCalledWith(
      'handle-1',
      'room-1',
      'event-5',
      '👍',
    );

    await client.redact('room-1', 'event-6');
    await client.redact('room-1', 'event-7', 'cleanup');
    expect(nativeMock.clientRedact).toHaveBeenNthCalledWith(
      1,
      'handle-1',
      'room-1',
      'event-6',
      null,
    );
    expect(nativeMock.clientRedact).toHaveBeenNthCalledWith(
      2,
      'handle-1',
      'room-1',
      'event-7',
      'cleanup',
    );

    await client.sendReadReceipt('room-1', 'event-8');
    expect(nativeMock.clientSendReadReceipt).toHaveBeenCalledWith(
      'handle-1',
      'room-1',
      'event-8',
    );

    await client.setTyping('room-1', true);
    expect(nativeMock.clientSetTyping).toHaveBeenCalledWith(
      'handle-1',
      'room-1',
      true,
      0,
    );

    nativeMock.clientCreateRoom
      .mockResolvedValueOnce('room-created-1')
      .mockResolvedValueOnce('room-created-2');
    const createdDefault = await client.createRoom();
    expect(createdDefault).toBe('room-created-1');
    expect(nativeMock.clientCreateRoom).toHaveBeenNthCalledWith(
      1,
      'handle-1',
      null,
      null,
      false,
    );

    const createdCustom = await client.createRoom({
      name: 'Room name',
      topic: 'Topic',
      isPublic: true,
    });
    expect(createdCustom).toBe('room-created-2');
    expect(nativeMock.clientCreateRoom).toHaveBeenNthCalledWith(
      2,
      'handle-1',
      'Room name',
      'Topic',
      true,
    );

    nativeMock.clientJoinRoom.mockResolvedValue('joined-room');
    const joined = await client.joinRoom('#alias:server');
    expect(joined).toBe('joined-room');
    expect(nativeMock.clientJoinRoom).toHaveBeenCalledWith(
      'handle-1',
      '#alias:server',
    );

    await client.leaveRoom('room-1');
    expect(nativeMock.clientLeaveRoom).toHaveBeenCalledWith(
      'handle-1',
      'room-1',
    );

    await client.startSyncLoop(1234);
    expect(nativeMock.clientStartSyncLoop).toHaveBeenCalledWith(
      'handle-1',
      1234,
    );

    await client.syncOnce(777);
    expect(nativeMock.clientSyncOnce).toHaveBeenCalledWith('handle-1', 777);

    const authed = await client.isAuthenticated();
    expect(authed).toBe(true);
    expect(nativeMock.clientIsAuthenticated).toHaveBeenCalledWith('handle-1');

    const rooms = await client.getRooms();
    expect(rooms).toEqual([
      {
        id: 'room-1',
        name: 'Alpha',
        lastMessage: 'Hello',
        lastMessageTs: 111,
        unreadCount: 2,
        avatarUrl: 'mxc://alpha',
      },
      {
        id: 'room-2',
        name: 'Beta',
        lastMessage: 'World',
        lastMessageTs: 222,
        unreadCount: 4,
        avatarUrl: 'mxc://beta',
      },
    ]);

    const users = await client.searchUsers('ali');
    expect(nativeMock.clientSearchUsers).toHaveBeenCalledWith(
      'handle-1',
      'ali',
      20,
    );
    expect(users).toEqual([
      { userId: '@alice', displayName: 'Alice' },
      { userId: '', displayName: 'No Id' },
    ]);

    const devices = await client.getDevices();
    expect(devices).toEqual([
      { deviceId: 'device-1', displayName: 'Phone' },
      { deviceId: '', displayName: 'Mystery Device' },
    ]);

    await client.renameDevice('device-1', 'New name');
    expect(nativeMock.clientRenameDevice).toHaveBeenCalledWith(
      'handle-1',
      'device-1',
      'New name',
    );

    await client.deleteDevice('device-2');
    expect(nativeMock.clientDeleteDevice).toHaveBeenCalledWith(
      'handle-1',
      'device-2',
    );

    await client.importRecoveryKey('secret');
    expect(nativeMock.clientImportRecoveryKey).toHaveBeenCalledWith(
      'handle-1',
      'secret',
    );

    await client.setPresence(PresenceState.Idle);
    expect(nativeMock.clientSetPresence).toHaveBeenCalledWith(
      'handle-1',
      PresenceState.Idle,
    );

    const presence = await client.getPresence('@user:server');
    expect(presence).toBe(PresenceState.DoNotDisturb);
    expect(nativeMock.clientGetPresence).toHaveBeenCalledWith(
      'handle-1',
      '@user:server',
    );

    const uploadOne = await client.uploadMedia(
      new Uint8Array([1, 2, 3, 4]),
      'text/plain',
    );
    expect(uploadOne).toBe('mxc://upload-1');
    expect(nativeMock.clientUploadMedia).toHaveBeenNthCalledWith(
      1,
      'handle-1',
      Buffer.from([1, 2, 3, 4]).toString('base64'),
      'text/plain',
    );

    const uploadTwo = await client.uploadMedia(
      new Uint8Array([5, 6]),
      'text/plain',
    );
    expect(uploadTwo).toBe('mxc://upload-2');
    expect(nativeMock.clientUploadMedia).toHaveBeenNthCalledWith(
      2,
      'handle-1',
      Buffer.from([5, 6]).toString('base64'),
      'text/plain',
    );

    const media = await client.downloadMedia('mxc://file');
    expect(nativeMock.clientDownloadMedia).toHaveBeenCalledWith(
      'handle-1',
      'mxc://file',
    );
    expect(Array.from(media)).toEqual([1, 2, 3, 4]);

    await client.stopSyncLoop();
    expect(nativeMock.clientStopSyncLoop).toHaveBeenCalledWith('handle-1');
  });

  it('swallows stop loop failures and always frees the client on dispose', async () => {
    nativeMock.createClient.mockResolvedValue('handle-2');
    const error = new Error('stop failed');
    nativeMock.clientStopSyncLoop.mockRejectedValue(error);
    nativeMock.clientFree.mockResolvedValue(undefined);

    const client = await Module.createClient('hs', 'store');

    await expect(client.stopSyncLoop()).resolves.toBeUndefined();
    expect(nativeMock.clientStopSyncLoop).toHaveBeenCalledTimes(1);

    await expect(client.dispose()).resolves.toBeUndefined();
    expect(nativeMock.clientStopSyncLoop).toHaveBeenCalledTimes(2);
    expect(nativeMock.clientFree).toHaveBeenCalledWith('handle-2');
  });

  it('handles optional recovery key import gracefully', async () => {
    nativeMock.createClient.mockResolvedValue('handle-3');
    nativeMock.clientImportRecoveryKey = undefined;

    const client = await Module.createClient('hs', 'store');
    await expect(client.importRecoveryKey('ignored')).resolves.toBeUndefined();
  });

  it('throws descriptive errors when room JSON is invalid', async () => {
    nativeMock.createClient.mockResolvedValue('handle-4');
    nativeMock.clientGetRooms
      .mockResolvedValueOnce('[{}]')
      .mockResolvedValueOnce('not json');

    const client = await Module.createClient('hs', 'store');

    await expect(client.getRooms()).rejects.toThrow(
      'Failed to parse rooms JSON: Room entry missing id',
    );
    await expect(client.getRooms()).rejects.toThrow(
      /Failed to parse rooms JSON/,
    );
  });

  it('throws descriptive errors when user or device JSON cannot be parsed', async () => {
    nativeMock.createClient.mockResolvedValue('handle-5');
    nativeMock.clientSearchUsers.mockResolvedValue('not json');
    nativeMock.clientGetDevices.mockResolvedValue('still not json');

    const client = await Module.createClient('hs', 'store');

    await expect(client.searchUsers('foo')).rejects.toThrow(
      /Failed to parse users JSON/,
    );
    await expect(client.getDevices()).rejects.toThrow(
      /Failed to parse devices JSON/,
    );
  });
});
