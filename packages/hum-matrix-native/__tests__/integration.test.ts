import HumNative, { type Client } from '../src';
import nock from 'nock';

describe('@hum/hum-matrix-native integration tests', () => {
  let client: Client;

  beforeAll(async () => {
    client = await HumNative.createClient('https://hs', '/tmp/store');
  });

  afterAll(async () => {
    nock.cleanAll();
  });

  it('authenticates and verifies authentication state', async () => {
    nock('https://hs')
      .post('/_matrix/client/v3/login')
      .reply(200, { access_token: 'mock_access_token' });

    await client.login('testUser', 'testPassword');
    const isAuthenticated = await client.isAuthenticated();
    expect(isAuthenticated).toBe(true);

    await client.logout();
    const isLoggedOut = await client.isAuthenticated();
    expect(isLoggedOut).toBe(false);
  });

  it('creates, joins, and leaves a room', async () => {
    nock('https://hs')
      .post('/_matrix/client/v3/createRoom')
      .reply(200, { room_id: '!mockRoomId:hs' });

    nock('https://hs')
      .post('/_matrix/client/v3/join/!mockRoomId:hs')
      .reply(200, { room_id: '!mockRoomId:hs' });

    const roomId = await client.createRoom({ name: 'Test Room', isPublic: true });
    expect(roomId).toBe('!mockRoomId:hs');

    const joinedRoomId = await client.joinRoom(roomId);
    expect(joinedRoomId).toBe(roomId);

    nock('https://hs')
      .post('/_matrix/client/v3/rooms/!mockRoomId:hs/leave')
      .reply(200, {});

    await client.leaveRoom(roomId);
  });

  it('uploads and downloads media', async () => {
    nock('https://hs')
      .post('/_matrix/media/v3/upload')
      .reply(200, { content_uri: 'mxc://mock/media' });

    nock('https://hs')
      .get('/_matrix/media/v3/download/mock/media')
      .reply(200, Buffer.from([1, 2, 3]));

    const mediaData = new Uint8Array([1, 2, 3]);
    const mimeType = 'image/png';

    const mxcUri = await client.uploadMedia(mediaData, mimeType);
    expect(mxcUri).toBe('mxc://mock/media');

    const downloadedData = await client.downloadMedia(mxcUri);
    expect(downloadedData).toEqual(mediaData);
  });

  it('sets and gets presence state', async () => {
    nock('https://hs')
      .put('/_matrix/client/v3/presence/testUser/status')
      .reply(200, {});

    nock('https://hs')
      .get('/_matrix/client/v3/presence/testUser/status')
      .reply(200, { presence: 'online' });

    await client.setPresence(0); // PresenceState.Online
    const presence = await client.getPresence('testUser');
    expect(presence).toBe(0); // PresenceState.Online
  });

  it('fetches rooms and verifies their structure', async () => {
    nock('https://hs')
      .get('/_matrix/client/v3/joined_rooms')
      .reply(200, { joined_rooms: ['!mockRoomId:hs'] });

    const rooms = await client.getRooms();
    expect(Array.isArray(rooms)).toBe(true);
    if (rooms.length > 0) {
      expect(rooms[0]).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
        })
      );
    }
  });
});
