import {
  createFcmMessage,
  createApnsMessage,
  NotificationPayload,
} from './src';

describe('createFcmMessage', () => {
  const payload: NotificationPayload = {
    room_id: '!room:example',
    event_id: '$event',
    sender: '@alice:example',
    type: 'm.room.message',
    unread_count: 2,
  };

  test('creates message without notification', () => {
    const msg = createFcmMessage('token123', payload);
    expect(msg).toEqual({
      token: 'token123',
      data: payload,
      notification: undefined,
    });
  });

  test('creates message with notification', () => {
    const notification = { title: 'Hello', body: 'World' };
    const msg = createFcmMessage('token123', payload, notification);
    expect(msg).toEqual({
      token: 'token123',
      data: payload,
      notification,
    });
  });
});

describe('createApnsMessage', () => {
  const payload: NotificationPayload = {
    room_id: '!room:example',
    event_id: '$event',
    sender: '@alice:example',
    type: 'm.room.message',
    unread_count: 2,
  };

  const alert = { title: 'Hi', body: 'There' };

  test('creates message without badge', () => {
    const msg = createApnsMessage('token456', payload, alert);
    expect(msg).toEqual({
      token: 'token456',
      aps: { alert, badge: undefined },
      data: payload,
    });
  });

  test('creates message with badge', () => {
    const msg = createApnsMessage('token456', payload, alert, 5);
    expect(msg).toEqual({
      token: 'token456',
      aps: { alert, badge: 5 },
      data: payload,
    });
  });
});
