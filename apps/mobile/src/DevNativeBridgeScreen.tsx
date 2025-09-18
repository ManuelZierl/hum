import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Button } from '@hum/ui-components';
import { useTranslation } from 'react-i18next';
import HumNative, {
  type Client,
  type RoomSummary,
} from '@hum/hum-matrix-native';

export const DevNativeBridgeScreen: React.FC<{ onBack?: () => void }> = ({
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const clientRef = useRef<Client | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const { t } = useTranslation();
  const g = globalThis as Record<string, unknown>;
  const [backend, setBackend] = useState<string>(
    (g.__HUM_USE_BACKEND__ as string | undefined) ??
      ((g.__HUM_FORCE_MOCK__ as boolean | undefined) ? 'mock' : 'native'),
  );

  const toggleBackend = () => {
    const g2 = globalThis as Record<string, unknown> & {
      __HUM_FORCE_MOCK__?: boolean;
    };
    g2.__HUM_FORCE_MOCK__ = !g2.__HUM_FORCE_MOCK__;
    setBackend(g2.__HUM_FORCE_MOCK__ ? 'mock' : 'native');
  };

  const safeClient = async (): Promise<Client> => {
    if (!clientRef.current) {
      const c = await HumNative.createClient('https://hs.mock', '/tmp/mock');
      clientRef.current = c;
    }
    return clientRef.current!;
  };

  const handleCreate = async () => {
    try {
      clientRef.current = await HumNative.createClient(
        'https://hs.mock',
        '/tmp/mock',
      );
      setStatus('created');
    } catch (e) {
      setStatus(`create-error:${(e as Error).message}`);
    }
  };

  const handleLogin = async () => {
    try {
      const c = await safeClient();
      await c.login('user', 'pass');
      setStatus('login-ok');
    } catch (e) {
      setStatus(`login-error:${(e as Error).message}`);
    }
  };

  const handleIsAuth = async () => {
    try {
      const c = await safeClient();
      const v = await c.isAuthenticated();
      setIsAuth(v);
      setStatus('isAuth-ok');
    } catch (e) {
      setStatus(`isAuth-error:${(e as Error).message}`);
    }
  };

  const handleGetRooms = async () => {
    try {
      const c = await safeClient();
      const list = await c.getRooms();
      setRooms(list);
      setStatus('getRooms-ok');
    } catch (e) {
      setStatus(`getRooms-error:${(e as Error).message}`);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: colors.background,
          paddingHorizontal: spacing.md,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>
        {t('labels.dev_bridge')}
      </Text>

      <View testID="backendLabel">
        <Text style={{ color: colors.mutedForeground }}>
          {t('labels.backend')}:{backend}
        </Text>
      </View>
      <View style={{ height: spacing.xs }} />
      <Button testID="btnToggleBackend" onPress={toggleBackend}>
        <Text>{t('actions.toggle_mock')}</Text>
      </Button>
      <View style={{ height: spacing.sm }} />

      <Button testID="btnCreate" onPress={handleCreate}>
        <Text>{t('actions.create_client')}</Text>
      </Button>
      <View style={{ height: spacing.xs }} />
      <Button testID="btnLogin" onPress={handleLogin}>
        <Text>{t('actions.login')}</Text>
      </Button>
      <View style={{ height: spacing.xs }} />
      <Button testID="btnIsAuth" onPress={handleIsAuth}>
        <Text>{t('actions.is_authenticated')}</Text>
      </Button>
      <View style={{ height: spacing.xs }} />
      <Button testID="btnGetRooms" onPress={handleGetRooms}>
        <Text>{t('actions.get_rooms')}</Text>
      </Button>

      <View style={{ height: spacing.md }} />

      <Text testID="statusText" style={{ color: colors.mutedForeground }}>
        {status}
      </Text>
      <Text testID="isAuthValue" style={{ color: colors.mutedForeground }}>
        {String(isAuth)}
      </Text>
      <Text testID="roomsCount" style={{ color: colors.mutedForeground }}>
        {String(rooms.length)}
      </Text>

      {onBack && (
        <View style={[styles.backWrap, { top: insets.top + 8 }]}>
          <Button variant="secondary" testID="btnDevBack" onPress={onBack}>
            <Text>{t('actions.back')}</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  backWrap: {
    position: 'absolute',
    right: 12,
  },
});

export default DevNativeBridgeScreen;
