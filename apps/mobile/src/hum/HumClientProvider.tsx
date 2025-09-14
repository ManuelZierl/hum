import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import HumNative, {
  type Client,
  type RoomSummary,
  type CreateRoomOptions,
  type UserSummary,
  type DeviceInfo,
  type PresenceState,
} from '@hum/hum-matrix-native';
import type { Chat } from '@hum/ui-screens';
import Constants from 'expo-constants';

type AppExtra = {
  hum?: { hsUrl?: string; storePath?: string };
  devFeatures?: boolean;
};
type ExpoConfigLike = { extra?: AppExtra };

function formatTime(ts?: number): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function mapRoomToChat(r: RoomSummary): Chat {
  return {
    id: r.id,
    name: r.name ?? r.id,
    message: r.lastMessage ?? '',
    time: formatTime(r.lastMessageTs),
    avatar: r.avatarUrl ?? '',
    unreadCount: r.unreadCount,
  };
}

export interface HumContextValue {
  ready: boolean;
  client: Client | null;
  isAuthenticated: boolean;
  rooms: RoomSummary[];
  chats: Chat[];
  refreshRooms: () => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  sendText: (roomId: string, body: string) => Promise<void>;
  logout: () => Promise<void>;
  startSyncLoop: (timeoutMs: number) => Promise<void>;
  stopSyncLoop: () => Promise<void>;
  syncOnce: (timeoutMs: number) => Promise<void>;
  createRoom: (options?: CreateRoomOptions) => Promise<string | undefined>;
  joinRoom: (idOrAlias: string) => Promise<string | undefined>;
  leaveRoom: (roomId: string) => Promise<void>;
  sendReaction: (roomId: string, eventId: string, key: string) => Promise<void>;
  redact: (roomId: string, eventId: string, reason?: string) => Promise<void>;
  sendReadReceipt: (roomId: string, eventId: string) => Promise<void>;
  setTyping: (
    roomId: string,
    isTyping: boolean,
    timeoutMs?: number,
  ) => Promise<void>;
  importRecoveryKey: (key: string) => Promise<void>;
  searchUsers: (query: string, limit?: number) => Promise<UserSummary[]>;
  getDevices: () => Promise<DeviceInfo[]>;
  renameDevice: (deviceId: string, name: string) => Promise<void>;
  deleteDevice: (deviceId: string) => Promise<void>;
  uploadMedia: (data: Uint8Array, mime: string) => Promise<string | undefined>;
  downloadMedia: (uri: string) => Promise<Uint8Array | undefined>;
  setPresence: (state: PresenceState) => Promise<void>;
  getPresence: (userId: string) => Promise<PresenceState | undefined>;
}

const HumContext = createContext<HumContextValue | undefined>(undefined);

export const HumClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const expoCfg = (Constants as unknown as { expoConfig?: ExpoConfigLike })
    .expoConfig;
  const extra = (expoCfg?.extra ?? {}) as AppExtra;
  const hsUrl = extra.hum?.hsUrl ?? 'https://hs.mock';
  const storePath = extra.hum?.storePath ?? 'hum_store';

  const clientRef = useRef<Client | null>(null);
  const [ready, setReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);

  const createClient = useCallback(async () => {
    if (!clientRef.current) {
      const g = globalThis as Record<string, unknown> & {
        __HUM_FORCE_MOCK__?: boolean;
        __HUM_USE_BACKEND__?: string;
      };
      const forceMock =
        extra.devFeatures === true ||
        g.__HUM_FORCE_MOCK__ === true ||
        Constants.appOwnership === 'expo' ||
        Constants.executionEnvironment === 'storeClient';
      try {
        if (forceMock) throw new Error('force-mock');
        clientRef.current = await HumNative.createClient(hsUrl, storePath);
        g.__HUM_USE_BACKEND__ = 'native';
      } catch (e) {
        console.warn('[Hum] Falling back to MockClient:', (e as Error).message);
        const { MockClient } = await import('./MockClient');
        clientRef.current = new MockClient(hsUrl, storePath);
        g.__HUM_USE_BACKEND__ = 'mock';
      }
    }
    return clientRef.current;
  }, [hsUrl, storePath, extra.devFeatures]);

  const refreshRooms = useCallback(async () => {
    const c = await createClient();
    if (!c) return;
    try {
      const list = await c.getRooms();
      setRooms(list);
    } catch (e) {
      console.warn('HumClientProvider: getRooms failed', e);
    }
  }, [createClient]);

  const login = useCallback(
    async (username: string, password: string) => {
      const c = await createClient();
      if (!c) return;
      await c.login(username, password);
      setIsAuthenticated(await c.isAuthenticated());
    },
    [createClient],
  );

  const sendText = useCallback(
    async (roomId: string, body: string) => {
      const c = await createClient();
      if (!c) return;
      await c.sendText(roomId, body);
    },
    [createClient],
  );

  const logout = useCallback(async () => {
    const c = await createClient();
    if (!c) return;
    await c.logout();
    setIsAuthenticated(await c.isAuthenticated());
  }, [createClient]);

  const startSyncLoop = useCallback(
    async (timeoutMs: number) => {
      const c = await createClient();
      if (!c) return;
      await c.startSyncLoop(timeoutMs);
    },
    [createClient],
  );

  const stopSyncLoop = useCallback(async () => {
    const c = await createClient();
    if (!c) return;
    await c.stopSyncLoop();
  }, [createClient]);

  const syncOnce = useCallback(
    async (timeoutMs: number) => {
      const c = await createClient();
      if (!c) return;
      await c.syncOnce(timeoutMs);
    },
    [createClient],
  );

  const createRoom = useCallback(
    async (options?: CreateRoomOptions) => {
      const c = await createClient();
      if (!c) return undefined;
      return c.createRoom(options);
    },
    [createClient],
  );

  const joinRoom = useCallback(
    async (idOrAlias: string) => {
      const c = await createClient();
      if (!c) return undefined;
      return c.joinRoom(idOrAlias);
    },
    [createClient],
  );

  const leaveRoom = useCallback(
    async (roomId: string) => {
      const c = await createClient();
      if (!c) return;
      await c.leaveRoom(roomId);
    },
    [createClient],
  );

  const sendReaction = useCallback(
    async (roomId: string, eventId: string, key: string) => {
      const c = await createClient();
      if (!c) return;
      await c.sendReaction(roomId, eventId, key);
    },
    [createClient],
  );

  const redact = useCallback(
    async (roomId: string, eventId: string, reason?: string) => {
      const c = await createClient();
      if (!c) return;
      await c.redact(roomId, eventId, reason);
    },
    [createClient],
  );

  const sendReadReceipt = useCallback(
    async (roomId: string, eventId: string) => {
      const c = await createClient();
      if (!c) return;
      await c.sendReadReceipt(roomId, eventId);
    },
    [createClient],
  );

  const setTyping = useCallback(
    async (roomId: string, isTyping: boolean, timeoutMs?: number) => {
      const c = await createClient();
      if (!c) return;
      await c.setTyping(roomId, isTyping, timeoutMs);
    },
    [createClient],
  );

  const importRecoveryKey = useCallback(
    async (key: string) => {
      const c = await createClient();
      if (!c) return;
      await c.importRecoveryKey(key);
    },
    [createClient],
  );

  const searchUsers = useCallback(
    async (query: string, limit?: number) => {
      const c = await createClient();
      if (!c) return [] as UserSummary[];
      return c.searchUsers(query, limit);
    },
    [createClient],
  );

  const getDevices = useCallback(async () => {
    const c = await createClient();
    if (!c) return [] as DeviceInfo[];
    return c.getDevices();
  }, [createClient]);

  const renameDevice = useCallback(
    async (deviceId: string, name: string) => {
      const c = await createClient();
      if (!c) return;
      await c.renameDevice(deviceId, name);
    },
    [createClient],
  );

  const deleteDevice = useCallback(
    async (deviceId: string) => {
      const c = await createClient();
      if (!c) return;
      await c.deleteDevice(deviceId);
    },
    [createClient],
  );

  const uploadMedia = useCallback(
    async (data: Uint8Array, mime: string) => {
      const c = await createClient();
      if (!c) return undefined;
      return c.uploadMedia(data, mime);
    },
    [createClient],
  );

  const downloadMedia = useCallback(
    async (uri: string) => {
      const c = await createClient();
      if (!c) return undefined;
      return c.downloadMedia(uri);
    },
    [createClient],
  );

  const setPresence = useCallback(
    async (state: PresenceState) => {
      const c = await createClient();
      if (!c) return;
      await c.setPresence(state);
    },
    [createClient],
  );

  const getPresence = useCallback(
    async (userId: string) => {
      const c = await createClient();
      if (!c) return undefined;
      return c.getPresence(userId);
    },
    [createClient],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await createClient();
      if (!c || cancelled) return;
      try {
        setIsAuthenticated(await c.isAuthenticated());
      } catch {
        // ignore
      }
      setReady(true);
      await refreshRooms();
    })();
    return () => {
      cancelled = true;
    };
  }, [createClient, refreshRooms]);

  const chats = useMemo(() => rooms.map(mapRoomToChat), [rooms]);

  const value: HumContextValue = useMemo(
    () => ({
      ready,
      client: clientRef.current,
      isAuthenticated,
      rooms,
      chats,
      refreshRooms,
      login,
      sendText,
      logout,
      startSyncLoop,
      stopSyncLoop,
      syncOnce,
      createRoom,
      joinRoom,
      leaveRoom,
      sendReaction,
      redact,
      sendReadReceipt,
      setTyping,
      importRecoveryKey,
      searchUsers,
      getDevices,
      renameDevice,
      deleteDevice,
      uploadMedia,
      downloadMedia,
      setPresence,
      getPresence,
    }),
    [
      ready,
      isAuthenticated,
      rooms,
      chats,
      refreshRooms,
      login,
      sendText,
      logout,
      startSyncLoop,
      stopSyncLoop,
      syncOnce,
      createRoom,
      joinRoom,
      leaveRoom,
      sendReaction,
      redact,
      sendReadReceipt,
      setTyping,
      importRecoveryKey,
      searchUsers,
      getDevices,
      renameDevice,
      deleteDevice,
      uploadMedia,
      downloadMedia,
      setPresence,
      getPresence,
    ],
  );

  return <HumContext.Provider value={value}>{children}</HumContext.Provider>;
};

export function useHumClient(): HumContextValue {
  const ctx = useContext(HumContext);
  if (!ctx)
    throw new Error('useHumClient must be used within HumClientProvider');
  return ctx;
}
