import { MockClient } from '../apps/mobile/src/hum/MockClient';

describe('MockClient', () => {
  it('seeds rooms with avatars and messages', async () => {
    const c = new MockClient('hs', 'store');
    const rooms = await c.getRooms();
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms.every((r) => !!r.avatarUrl)).toBe(true);
    const msgs = await c.getMessages(rooms[0].id);
    expect(msgs.length).toBeGreaterThan(0);
  });
});
