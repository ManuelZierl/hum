import { MockClient } from '../apps/mobile/src/hum/MockClient';

describe('MockClient', () => {
  const BASE_TS = 1_700_000_000_000;
  let nowSpy: jest.SpyInstance<number, []>;

  beforeEach(() => {
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(BASE_TS);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('seeds multiple rooms with avatars and timelines', async () => {
    const c = new MockClient('hs', 'store');
    const rooms = await c.getRooms();
    expect(rooms.length).toBeGreaterThanOrEqual(8);
    expect(
      rooms.every(
        (r) => typeof r.avatarUrl === 'string' && r.avatarUrl.length > 0,
      ),
    ).toBe(true);

    const sample = rooms.find((r) => r.id === '!alice:mock') ?? rooms[0];
    const msgs = await c.getMessages(sample.id);
    expect(msgs.length).toBeGreaterThan(0);
    const sorted = [...msgs].sort((a, b) => a.ts - b.ts);
    expect(msgs).toEqual(sorted);

    msgs[0]!.body = 'changed';
    const fresh = await c.getMessages(sample.id);
    expect(fresh[0]!.body).not.toBe('changed');
  });

  it('tracks authentication state', async () => {
    const c = new MockClient('hs', 'store');

    await expect(c.isAuthenticated()).resolves.toBe(false);

    await c.login('user', 'pass');
    await expect(c.isAuthenticated()).resolves.toBe(true);

    await c.logout();
    await expect(c.isAuthenticated()).resolves.toBe(false);
  });

  it('appends outgoing messages and updates room summaries', async () => {
    const c = new MockClient('hs', 'store');
    const rooms = await c.getRooms();
    expect(rooms.length).toBeGreaterThan(1);

    const target = rooms[1] ?? rooms[0];

    nowSpy.mockReturnValue(BASE_TS + 60_000);
    await c.sendText(target.id, 'Hello there');

    const timeline = await c.getMessages(target.id);
    const last = timeline[timeline.length - 1]!;
    expect(last.body).toBe('Hello there');
    expect(last.isOutgoing).toBe(true);
    expect(last.ts).toBe(BASE_TS + 60_000);

    const updatedRooms = await c.getRooms();
    expect(updatedRooms[0]!.id).toBe(target.id);
    expect(updatedRooms[0]!.lastMessage).toBe('Hello there');
    expect(updatedRooms[0]!.unreadCount).toBe(0);
  });

  it('creates rooms on demand when sending to unknown rooms', async () => {
    const c = new MockClient('hs', 'store');
    const newRoomId = '!brand-new:mock';

    nowSpy.mockReturnValue(BASE_TS + 120_000);
    await c.sendText(newRoomId, 'First!');

    const rooms = await c.getRooms();
    const created = rooms.find((room) => room.id === newRoomId);
    expect(created).toBeDefined();
    expect(created!.name).toBe(newRoomId);
    expect(created!.lastMessage).toBe('First!');
    expect(created!.lastMessageTs).toBe(BASE_TS + 120_000);

    const msgs = await c.getMessages(newRoomId);
    expect(msgs).toHaveLength(1);
    expect(msgs[0]!.isOutgoing).toBe(true);
  });

  it('creates, joins, and leaves rooms', async () => {
    const c = new MockClient('hs', 'store');

    nowSpy.mockReturnValue(BASE_TS + 240_000);
    const id = await c.createRoom({ name: 'Test Room' });

    const roomsAfterCreate = await c.getRooms();
    const created = roomsAfterCreate.find((room) => room.id === id);
    expect(created).toBeDefined();
    expect(created!.name).toBe('Test Room');
    expect(created!.lastMessage).toBe('');
    expect(created!.avatarUrl).toContain('https://');

    const timeline = await c.getMessages(id);
    expect(timeline).toEqual([]);

    await expect(c.joinRoom(id)).resolves.toBe(id);

    await c.leaveRoom(id);
    const roomsAfterLeave = await c.getRooms();
    expect(roomsAfterLeave.some((room) => room.id === id)).toBe(false);
    await expect(c.getMessages(id)).resolves.toEqual([]);
  });

  it('handles miscellaneous operations without throwing', async () => {
    const c = new MockClient('hs', 'store');

    await expect(
      c.sendReaction('room', 'event', '👍'),
    ).resolves.toBeUndefined();
    await expect(c.redact('room', 'event')).resolves.toBeUndefined();
    await expect(c.sendReadReceipt('room', 'event')).resolves.toBeUndefined();
    await expect(c.setTyping('room', true, 5_000)).resolves.toBeUndefined();
    await expect(c.startSyncLoop(10_000)).resolves.toBeUndefined();
    await expect(c.stopSyncLoop()).resolves.toBeUndefined();
    await expect(c.syncOnce(15_000)).resolves.toBeUndefined();
    await expect(c.dispose()).resolves.toBeUndefined();
  });
});
