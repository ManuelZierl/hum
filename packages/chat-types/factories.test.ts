import {
  mockMedia,
  mockReaction,
  mockReceipt,
  mockMessage,
  mockChat,
} from './src';

describe('chat-types factories', () => {
  test('mockMedia returns default media and applies overrides', () => {
    const media = mockMedia();
    expect(typeof media.id).toBe('string');
    expect(media.kind).toBe('image');
    expect(media.url).toBe('https://example.com/image.png');
    expect(media.thumbnailUrl).toBe('https://example.com/thumb.png');

    const overridden = mockMedia({ kind: 'video', url: 'video.mp4' });
    expect(overridden.kind).toBe('video');
    expect(overridden.url).toBe('video.mp4');
  });

  // test reaction
  test('mockReaction returns default reaction and applies overrides', () => {
    const reaction = mockReaction();
    expect(typeof reaction.userId).toBe('string');
    expect(reaction.emoji).toBe('👍');
    expect(typeof reaction.timestamp).toBe('number');

    const overridden = mockReaction({ emoji: '👎', timestamp: 123 });
    expect(overridden.emoji).toBe('👎');
    expect(overridden.timestamp).toBe(123);
  });

  // test receipt
  test('mockReceipt returns default receipt and applies overrides', () => {
    const receipt = mockReceipt();
    expect(typeof receipt.userId).toBe('string');
    expect(receipt.type).toBe('read');
    expect(typeof receipt.timestamp).toBe('number');

    const overridden = mockReceipt({ type: 'delivered', timestamp: 456 });
    expect(overridden.type).toBe('delivered');
    expect(overridden.timestamp).toBe(456);
  });

  // test message
  test('mockMessage returns default message and applies overrides', () => {
    const message = mockMessage();
    expect(typeof message.id).toBe('string');
    expect(typeof message.chatId).toBe('string');
    expect(typeof message.senderId).toBe('string');
    expect(typeof message.timestamp).toBe('number');
    expect(message.text).toBe('Hello world');
    expect(message.media).toEqual([]);
    expect(message.reactions).toEqual([]);
    expect(message.receipts).toEqual([]);

    const media = mockMedia();
    const reaction = mockReaction();
    const receipt = mockReceipt();
    const chatId = 'chat123';
    const overridden = mockMessage({
      chatId,
      text: 'hi',
      media: [media],
      reactions: [reaction],
      receipts: [receipt],
    });
    expect(overridden.chatId).toBe(chatId);
    expect(overridden.text).toBe('hi');
    expect(overridden.media).toEqual([media]);
    expect(overridden.reactions).toEqual([reaction]);
    expect(overridden.receipts).toEqual([receipt]);
  });

  // test chat
  test('mockChat returns default chat and applies overrides', () => {
    const chat = mockChat();
    expect(typeof chat.id).toBe('string');
    expect(chat.participants).toHaveLength(2);
    expect(chat.messages).toHaveLength(1);
    expect(chat.messages[0].chatId).toBe(chat.id);

    const message = mockMessage({ id: 'm1', chatId: 'chat1' });
    const overridden = mockChat({
      id: 'chat1',
      participants: ['u1', 'u2', 'u3'],
      messages: [message],
    });
    expect(overridden.id).toBe('chat1');
    expect(overridden.participants).toEqual(['u1', 'u2', 'u3']);
    expect(overridden.messages).toEqual([message]);
  });
});
