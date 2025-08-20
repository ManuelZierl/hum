export type Platform = 'apns' | 'fcm';

export interface PushToken {
  /** Platform that issued the token */
  platform: Platform;
  /** Opaque token value from FCM or APNs */
  value: string;
}

export interface RegistrationRequest {
  /** Stable identifier for the device */
  deviceId: string;
  /** Push token information */
  token: PushToken;
}

export interface NotificationPayload {
  /** Matrix room identifier */
  room_id: string;
  /** Event that triggered the push */
  event_id: string;
  /** Matrix user ID of the sender */
  sender: string;
  /** Matrix event type */
  type: string;
  /** Optional total unread count for the room */
  unread_count?: number;
}

/**
 * Mock function that simulates sending a push notification.
 */
export function sendTestPush(token: PushToken): void {
  console.log(`Mock push to ${token.platform} token ${token.value}`);
}
