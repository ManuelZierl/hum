import { MockClient } from '../apps/mobile/src/hum/MockClient';
import { createMatrixMessageContent } from '@hum/rich-text';

describe('rich text messaging e2e', () => {
  it('stores sanitized matrix payloads', async () => {
    const client = new MockClient('hs', 'store');
    const payload = createMatrixMessageContent({
      html: '<h1>Title</h1><ul><li>Item</li></ul><script>bad()</script>',
      text: 'Title\nItem',
    });

    await client.sendMessage('!room:mock', payload);

    const timeline = await client.getMessages('!room:mock');
    const last = timeline[timeline.length - 1]!;
    expect(last.body).toBe('Title\nItem');
    expect(last.formattedBody).toBe('<h1>Title</h1><ul><li>Item</li></ul>');
  });
});
