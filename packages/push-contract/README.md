# Push Contract

Platform-agnostic TypeScript definitions for registering devices and
delivering push notifications. These contracts are intended to be shared
between server, CLI, and client applications.

## Token Registration

```ts
interface PushToken {
  platform: 'apns' | 'fcm';
  value: string;
}

interface RegistrationRequest {
  deviceId: string;
  token: PushToken;
}
```

A client registers a stable `deviceId` along with the opaque push token
issued by FCM or APNs.

## Notification Payload

```ts
interface NotificationPayload {
  room_id: string;
  event_id: string;
  sender: string;
  type: string;
  unread_count?: number;
}
```

The payload contains the Matrix identifiers needed by a client to fetch
and display the originating event. `unread_count` is optional and, when
present, represents the total unread messages for the room.

## Provider Messages

### FCM

```ts
interface FcmMessage {
  token: string;
  data: NotificationPayload;
  notification?: {
    title?: string;
    body?: string;
  };
}
```

The `notification` field is optional and, when set, controls the display
notification handled by the platform. `data` always carries the
`NotificationPayload`.

### APNs

```ts
interface ApnsMessage {
  token: string;
  aps: {
    alert: {
      title: string;
      body: string;
    };
    badge?: number;
  };
  data: NotificationPayload;
}
```

The `aps` dictionary follows APNs conventions. The client should read the
custom `data` field for Matrix-specific information.

## Delivery Semantics

Messages are delivered on a best-effort basis. Providers may drop or
duplicate notifications, so clients must de-duplicate using `event_id`.
Tokens are assumed to be valid until revoked; re-registration replaces
any existing token for the same `deviceId`.

