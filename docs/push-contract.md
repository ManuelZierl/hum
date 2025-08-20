# Push Notifications Contract

This document defines the contract for push notifications used by the mchat application. It covers token registration, the payload delivered by the push service, and how the app should wake and sync on receipt.

## Token Registration

Clients obtain a platform-specific push token:

- **FCM (Android)**: retrieved from Firebase Cloud Messaging.
- **APNs (iOS)**: retrieved from Apple Push Notification service.

Registration is performed with a `POST /push/register` request containing:

```
{
  "device_id": "<stable identifier for the device>",
  "token": {
    "platform": "fcm" | "apns",
    "value": "<opaque device token>"
  }
}
```

The server stores the token and associates it with the user's device. Tokens may be rotated and should be re-registered whenever they change.

## Notification Payload

To preserve privacy, push payloads contain only metadata required to wake the client. Message bodies are never included.

Example payload:

```
{
  "room_id": "!abcdef:example.org",
  "event_id": "$123456:example.org",
  "sender": "@alice:example.org",
  "type": "m.room.message",
  "unread_count": 5
}
```

- `room_id` – Matrix room identifier.
- `event_id` – event that triggered the push.
- `sender` – Matrix user ID of the sender.
- `type` – Matrix event type.
- `unread_count` – optional total unread count for the room.

## Wake and Sync Behavior

Pushes are delivered as data-only messages on both FCM and APNs. On receipt the app should:

1. Wake in the background.
2. Open a network session and perform a Matrix `/sync` to fetch encrypted content.
3. Display a user-visible notification only after decrypting the event locally.

If the app is terminated, the push should start the application in the background so that a single sync cycle can complete.
