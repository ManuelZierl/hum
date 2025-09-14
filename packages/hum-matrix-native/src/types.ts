/**
 * Hum Matrix Native Module – TypeScript contract only.
 *
 * This file defines the minimal, typed JS/TS surface exposed to the app.
 * It intentionally contains types and interfaces only (no implementation).
 *
 * Error semantics: any non-zero native return maps to a rejected Promise
 * with `Error(message)` where `message` is the FFI error string.
 * Resource semantics: the returned Client owns a native handle; call
 * `dispose()` to free native resources if you created a client you no
 * longer need.
 */

/**
 * Lightweight summary used to render the Chats list.
 *
 * Designed to be easily mapped to `Chat` from `@hum/ui-screens`:
 * - `id` -> Chat.id
 * - `name` -> Chat.name
 * - `lastMessage` -> Chat.message
 * - `lastMessageTs` (optional) -> format to Chat.time in UI
 * - `avatarUrl` -> Chat.avatar
 * - `unreadCount` -> Chat.unreadCount
 */
export type RoomSummary = {
  id: string;
  name?: string;
  lastMessage?: string;
  /** UNIX epoch millis for the last message; UI should format to display */
  lastMessageTs?: number;
  unreadCount?: number;
  avatarUrl?: string;
};

/** Presence state mapping to FFI codes: 0 Online, 1 Idle, 2 DoNotDisturb, 3 Invisible */
export enum PresenceState {
  Online = 0,
  Idle = 1,
  DoNotDisturb = 2,
  Invisible = 3,
}

/** Create-room options, mapped to FFI name/topic/is_public. */
export interface CreateRoomOptions {
  name?: string;
  topic?: string;
  isPublic?: boolean;
}

/** Result shape for user search. */
export interface UserSummary {
  userId: string;
  displayName?: string;
}

/** Device list entry. */
export interface DeviceInfo {
  deviceId: string;
  displayName?: string;
}

/** Opaque client bound to a native `HumClientHandle`. */
export interface Client {
  /**
   * Log in with username and password.
   * Maps to `hum_client_login`.
   */
  login(username: string, password: string): Promise<void>;

  /** Logout of the current session. Maps to `hum_client_logout`. */
  logout(): Promise<void>;

  /**
   * Check if the client is authenticated.
   * Maps to `hum_client_is_authenticated`.
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Fetch a lightweight list of joined rooms.
   * Maps to `hum_client_get_rooms` (JSON array) and adapts fields.
   */
  getRooms(): Promise<RoomSummary[]>;

  /**
   * Send a text message to a room.
   * Maps to `hum_client_send_text`.
   */
  sendText(roomId: string, body: string): Promise<void>;

  /** Send a reaction on an event. Maps to `hum_client_send_reaction`. */
  sendReaction(roomId: string, eventId: string, key: string): Promise<void>;

  /** Redact an event. Maps to `hum_client_redact`. */
  redact(roomId: string, eventId: string, reason?: string): Promise<void>;

  /** Send a read receipt. Maps to `hum_client_send_read_receipt`. */
  sendReadReceipt(roomId: string, eventId: string): Promise<void>;

  /**
   * Set typing state (optionally with a server-side timeout).
   * Maps to `hum_client_set_typing`.
   */
  setTyping(
    roomId: string,
    isTyping: boolean,
    timeoutMs?: number,
  ): Promise<void>;

  /**
   * Create a room; returns the created room id.
   * Maps to `hum_client_create_room`.
   */
  createRoom(options?: CreateRoomOptions): Promise<string>;

  /**
   * Join a room by id or alias; returns resolved room id.
   * Maps to `hum_client_join_room`.
   */
  joinRoom(idOrAlias: string): Promise<string>;

  /** Leave a room. Maps to `hum_client_leave_room`. */
  leaveRoom(roomId: string): Promise<void>;

  /**
   * Start a continuous sync loop with a long-poll timeout per request.
   * Maps to `hum_client_start_sync_loop`.
   *
   * Threading/long-running: runs native background work; idempotent. Call
   * `stopSyncLoop` to shut down. Avoid starting multiple loops on one client.
   */
  startSyncLoop(timeoutMs: number): Promise<void>;

  /** Stop the ongoing sync loop. Maps to `hum_client_stop_sync_loop`. */
  stopSyncLoop(): Promise<void>;

  /** Run a single sync with timeout. Maps to `hum_client_sync_once`. */
  syncOnce(timeoutMs: number): Promise<void>;

  /**
   * Optional utility to free the underlying native handle when done.
   * Maps to `hum_client_free`.
   */
  dispose(): Promise<void>;

  /** Import a recovery key. Maps to `hum_client_import_recovery_key`. */
  importRecoveryKey(key: string): Promise<void>;

  /** Search users; returns a list of { userId, displayName? }. */
  searchUsers(query: string, limit?: number): Promise<UserSummary[]>;

  /**
   * Get devices for the current account.
   * Maps to `hum_client_get_devices`.
   */
  getDevices(): Promise<DeviceInfo[]>;

  /** Rename a device. Maps to `hum_client_rename_device`. */
  renameDevice(deviceId: string, name: string): Promise<void>;

  /** Delete a device. Maps to `hum_client_delete_device`. */
  deleteDevice(deviceId: string): Promise<void>;

  /**
   * Upload media; returns an MXC URI string.
   * Maps to `hum_client_upload_media`.
   */
  uploadMedia(data: Uint8Array, mime: string): Promise<string>;

  /**
   * Download media by MXC/HTTP URI; returns raw bytes.
   * Maps to `hum_client_download_media`.
   */
  downloadMedia(uri: string): Promise<Uint8Array>;

  /**
   * Set presence for the current user.
   * Maps to `hum_client_set_presence`.
   */
  setPresence(state: PresenceState): Promise<void>;

  /** Get presence for a user id. Maps to `hum_client_get_presence`. */
  getPresence(userId: string): Promise<PresenceState>;
}

/**
 * Factory function to create a client bound to a homeserver and store path.
 * Maps to `hum_client_new`.
 */
export type CreateClient = (
  hsUrl: string,
  storePath: string,
) => Promise<Client>;

/**
 * Public surface the RN NativeModule should provide. This keeps a single
 * entry point for creation and returns an object with bound methods.
 */
export interface HumMatrixNative {
  createClient: CreateClient;
}

/**
 * Error shape: Promise rejections should be plain `Error` with a message
 * sourced from the FFI `err_out` string. A concrete implementation MAY
 * subclass Error but callers should not rely on extra fields.
 */
export type HumNativeError = Error;
