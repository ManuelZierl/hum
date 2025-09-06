import HumNative, { type Client } from '../src';

describe('@hum/hum-matrix-native contract (mocked)', () => {
  let client: Client;
  beforeAll(async () => {
    client = await HumNative.createClient('https://hs', '/tmp/store');
  });

  it('auth flow toggles isAuthenticated', async () => {
    expect(await client.isAuthenticated()).toBe(false);
    await client.login('user', 'pass');
    expect(await client.isAuthenticated()).toBe(true);
    await client.logout();
    expect(await client.isAuthenticated()).toBe(false);
  });

  it('returns room summaries in expected shape', async () => {
    const rooms = await client.getRooms();
    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
      }),
    );
  });

  it('supports simple messaging and sync methods', async () => {
    await expect(client.sendText('!a:hs', 'hello')).resolves.toBeUndefined();
    await expect(client.startSyncLoop(100)).resolves.toBeUndefined();
    await expect(client.stopSyncLoop()).resolves.toBeUndefined();
  });
});
