import { MockClient } from '../apps/mobile/src/hum/MockClient';

describe('MockClient', () => {
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
});
