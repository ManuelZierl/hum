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

export interface FcmMessage {
  /** Target device token */
  token: string;
  /** Transported notification payload */
  data: NotificationPayload;
  /** Optional display notification */
  notification?: {
    title?: string;
    body?: string;
  };
}

export interface ApnsMessage {
  /** Target device token */
  token: string;
  /** Standard APNs aps dictionary */
  aps: {
    alert: {
      title: string;
      body: string;
    };
    badge?: number;
  };
  /** Custom data sent alongside the aps dictionary */
  data: NotificationPayload;
}

/**
 * Helper to create an FCM message
 */
export function createFcmMessage(
  token: string,
  payload: NotificationPayload,
  notification?: { title?: string; body?: string },
): FcmMessage {
  return { token, data: payload, notification };
}

/**
 * Helper to create an APNs message
 */
export function createApnsMessage(
  token: string,
  payload: NotificationPayload,
  alert: { title: string; body: string },
  badge?: number,
): ApnsMessage {
  return {
    token,
    aps: { alert, badge },
    data: payload,
  };
}
