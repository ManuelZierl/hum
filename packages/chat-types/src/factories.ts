import { Chat, Message, Media, Reaction, Receipt } from './types';

const createId = () => Math.random().toString(36).slice(2);

export const mockMedia = (overrides: Partial<Media> = {}): Media => ({
  id: createId(),
  kind: 'image',
  url: 'https://example.com/image.png',
  thumbnailUrl: 'https://example.com/thumb.png',
  ...overrides,
});

export const mockReaction = (overrides: Partial<Reaction> = {}): Reaction => ({
  userId: createId(),
  emoji: '👍',
  timestamp: Date.now(),
  ...overrides,
});

export const mockReceipt = (overrides: Partial<Receipt> = {}): Receipt => ({
  userId: createId(),
  type: 'read',
  timestamp: Date.now(),
  ...overrides,
});

export const mockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: createId(),
  chatId: overrides.chatId || createId(),
  senderId: createId(),
  timestamp: Date.now(),
  text: 'Hello world',
  media: [],
  reactions: [],
  receipts: [],
  ...overrides,
});

export const mockChat = (overrides: Partial<Chat> = {}): Chat => {
  const id = overrides.id || createId();
  return {
    id,
    participants: [createId(), createId()],
    messages: [mockMessage({ chatId: id })],
    ...overrides,
  };
};
