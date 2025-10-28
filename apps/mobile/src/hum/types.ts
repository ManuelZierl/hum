export type RoomSummary = {
  id: string;
  name?: string;
  lastMessage?: string;
  lastMessageTs?: number;
  unreadCount?: number;
  avatarUrl?: string;
};

export interface CreateRoomOptions {
  name?: string;
  invitees?: string[];
  isDirect?: boolean;
  isTrustedPrivateChat?: boolean;
}

export type TimelineMessage = {
  id: string;
  body: string;
  ts: number;
  isOutgoing: boolean;
};

export interface Client {
  login(username: string, password: string): Promise<void>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
  getRooms(): Promise<RoomSummary[]>;
  sendText(roomId: string, body: string): Promise<void>;
  sendReaction(
    roomId: string,
    eventId: string,
    key: string,
  ): Promise<void>;
  redact(roomId: string, eventId: string, reason?: string): Promise<void>;
  sendReadReceipt(roomId: string, eventId: string): Promise<void>;
  setTyping(
    roomId: string,
    isTyping: boolean,
    timeoutMs?: number,
  ): Promise<void>;
  createRoom(options?: CreateRoomOptions): Promise<string | undefined>;
  joinRoom(idOrAlias: string): Promise<string | undefined>;
  leaveRoom(roomId: string): Promise<void>;
  startSyncLoop(timeoutMs: number): Promise<void>;
  stopSyncLoop(): Promise<void>;
  syncOnce(timeoutMs: number): Promise<void>;
  dispose(): Promise<void>;
  getMessages(roomId: string): Promise<TimelineMessage[]>;
}
