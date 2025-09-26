import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, TopBar, useTheme } from '@hum/ui-components';
import type {
  Balance,
  Network,
  Payment,
  PaymentClient,
  PaymentEvent,
} from '@hum/payment-client';
import { createBreezePaymentClient } from '@hum/breeze-payment-client';
import ActivatePaymentScreen from './ActivatePaymentScreen';

export interface PaymentScreenStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem?(key: string): Promise<void>;
}

export interface PaymentScreenProps {
  apiKey: string;
  network?: Network;
  storage?: PaymentScreenStorage;
  workingDir?: string;
  onBack?: () => void;
}

type ScreenState =
  | { status: 'loading' }
  | { status: 'inactive' }
  | { status: 'activating' }
  | { status: 'ready'; balances: Balance[]; payments: Payment[] }
  | { status: 'error'; message: string };

const STORAGE_KEYS = {
  mnemonic: 'payments.mnemonic',
};

const DEFAULT_NETWORK: Network = 'testnet';

const inMemoryStorage: PaymentScreenStorage = {
  async getItem() {
    return null;
  },
  async setItem() {},
};

const formatDate = (timestamp: number, locale: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  return date.toLocaleString(locale);
};

const formatSats = (value: bigint) => `${value.toString()} sats`;

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  apiKey,
  network = DEFAULT_NETWORK,
  storage = inMemoryStorage,
  workingDir,
  onBack,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<ScreenState>({ status: 'loading' });
  const [showActivation, setShowActivation] = useState(false);
  const clientRef = useRef<PaymentClient | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const normalizedApiKey = useMemo(() => apiKey.trim(), [apiKey]);

  const ensureApiKey = useCallback(() => {
    if (normalizedApiKey) return true;
    setState({
      status: 'error',
      message: t('payments.errors.missing_api_key'),
    });
    return false;
  }, [normalizedApiKey, t]);

  const themedStyles = useMemo(
    () => ({
      screen: {
        backgroundColor: colors.background,
        paddingBottom: insets.bottom,
      } satisfies ViewStyle,
      loading: {
        gap: spacing.md,
      } satisfies ViewStyle,
      loadingText: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      activationTitle: {
        color: colors.foreground,
        fontSize: type.size.lg,
        fontWeight: type.weight.medium,
        textAlign: 'center',
        marginTop: spacing.md,
      } satisfies TextStyle,
      activationDescription: {
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
      } satisfies TextStyle,
      errorTitle: {
        color: colors.foreground,
        fontSize: type.size.lg,
        fontWeight: type.weight.medium,
        textAlign: 'center',
        marginTop: spacing.md,
      } satisfies TextStyle,
      errorMessage: {
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.lg,
        marginTop: spacing.sm,
      } satisfies TextStyle,
      scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.lg,
      } satisfies ViewStyle,
      sectionStack: {
        gap: spacing.lg,
      } satisfies ViewStyle,
      card: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
      } satisfies ViewStyle,
      balanceCard: {
        gap: spacing.sm,
      } satisfies ViewStyle,
      historyCard: {
        gap: spacing.md,
      } satisfies ViewStyle,
      cardTitle: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      balanceAmount: {
        color: colors.foreground,
        fontSize: type.size.lg,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      balanceAsset: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      balanceEmpty: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      historyEmpty: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      historyItem: {
        paddingVertical: spacing.sm,
        borderBottomColor: colors.border,
        gap: spacing.xs,
      } satisfies ViewStyle,
      historyAmountRow: {
        gap: spacing.xs,
      } satisfies ViewStyle,
      historyAmount: {
        color: colors.foreground,
        fontSize: type.size.base,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      historyStatus: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      historyDescription: {
        color: colors.foreground,
      } satisfies TextStyle,
      historyMeta: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
      counterparty: {
        color: colors.mutedForeground,
      } satisfies TextStyle,
    }),
    [colors, insets.bottom, radius, spacing, type],
  );

  const ensureUnsubscribe = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  }, []);

  const destroyClient = useCallback(async () => {
    ensureUnsubscribe();
    const current = clientRef.current;
    clientRef.current = null;
    if (current) {
      try {
        await current.destroy();
      } catch (error) {
        console.warn('[PaymentScreen] destroy failed', error);
      }
    }
  }, [ensureUnsubscribe]);

  const attachEvents = useCallback(
    (client: PaymentClient) => {
      ensureUnsubscribe();
      const unsubscribe = client.on((event: PaymentEvent) => {
        if (event.type === 'BALANCE_CHANGED') {
          setState((prev) => {
            if (prev.status !== 'ready') return prev;
            return { ...prev, balances: event.balances };
          });
        } else if (event.type === 'PAYMENT_UPDATED') {
          setState((prev) => {
            if (prev.status !== 'ready') return prev;
            const next = [event.payment, ...prev.payments];
            const deduped = new Map(next.map((p) => [p.id, p] as const));
            return { ...prev, payments: Array.from(deduped.values()) };
          });
        }
      });
      unsubscribeRef.current = unsubscribe;
    },
    [ensureUnsubscribe],
  );

  const fetchData = useCallback(async (client: PaymentClient) => {
    const [balances, history] = await Promise.all([
      client.getBalances(),
      client.listPayments({ limit: 50 }),
    ]);
    setState({ status: 'ready', balances, payments: history.items });
  }, []);

  const initializeClient = useCallback(
    async (mnemonic: string) => {
      if (!normalizedApiKey) {
        setState({
          status: 'error',
          message: t('payments.errors.missing_api_key'),
        });
        return;
      }
      setState({ status: 'loading' });
      try {
        const client = createBreezePaymentClient({
          apiKey: normalizedApiKey,
          mnemonic,
          workingDir,
        });
        clientRef.current = client;
        await client.init({
          network,
          logger: (level, message) => {
            if (level === 'error') {
              console.warn('[PaymentClient]', message);
            }
          },
        });
        attachEvents(client);
        await fetchData(client);
      } catch (error) {
        console.warn('[PaymentScreen] init failed', error);
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : t('payments.errors.generic'),
        });
      }
    },
    [attachEvents, fetchData, network, normalizedApiKey, t, workingDir],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!normalizedApiKey) {
        setState({
          status: 'error',
          message: t('payments.errors.missing_api_key'),
        });
        return;
      }
      try {
        const mnemonic = await storage.getItem(STORAGE_KEYS.mnemonic);
        if (cancelled) return;
        if (!mnemonic) {
          setState({ status: 'inactive' });
          return;
        }
        await initializeClient(mnemonic);
      } catch (error) {
        console.warn('[PaymentScreen] load mnemonic failed', error);
        if (!cancelled) {
          setState({ status: 'error', message: t('payments.errors.generic') });
        }
      }
    })();
    return () => {
      cancelled = true;
      void destroyClient();
    };
  }, [destroyClient, initializeClient, normalizedApiKey, storage, t]);

  const handleRefresh = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;
    try {
      const [balances, history] = await Promise.all([
        client.getBalances(),
        client.listPayments({ limit: 50 }),
      ]);
      setState({ status: 'ready', balances, payments: history.items });
    } catch (error) {
      console.warn('[PaymentScreen] refresh failed', error);
    }
  }, []);

  const handleActivationComplete = useCallback(
    async (mnemonic: string) => {
      if (!ensureApiKey()) return;
      setShowActivation(false);
      await storage.setItem(STORAGE_KEYS.mnemonic, mnemonic);
      await initializeClient(mnemonic);
    },
    [ensureApiKey, initializeClient, storage],
  );

  const handleRetry = useCallback(async () => {
    if (!ensureApiKey()) return;
    setState({ status: 'loading' });
    try {
      const mnemonic = await storage.getItem(STORAGE_KEYS.mnemonic);
      if (!mnemonic) {
        setState({ status: 'inactive' });
        return;
      }
      await initializeClient(mnemonic);
    } catch (error) {
      console.warn('[PaymentScreen] retry failed', error);
      setState({ status: 'error', message: t('payments.errors.generic') });
    }
  }, [ensureApiKey, initializeClient, storage, t]);

  const balanceSummary = useMemo(() => {
    if (state.status !== 'ready')
      return [] as { asset: string; balance: bigint; pending: bigint }[];
    const map = new Map<
      string,
      { asset: string; balance: bigint; pending: bigint }
    >();
    for (const bal of state.balances) {
      const entry = map.get(bal.asset) ?? {
        asset: bal.asset,
        balance: 0n,
        pending: 0n,
      };
      entry.balance += bal.spendable;
      entry.pending += bal.pending;
      map.set(bal.asset, entry);
    }
    return Array.from(map.values());
  }, [state]);

  useEffect(() => {
    return () => {
      ensureUnsubscribe();
    };
  }, [ensureUnsubscribe]);

  if (showActivation) {
    return (
      <ActivatePaymentScreen
        onBack={() => setShowActivation(false)}
        onActivated={handleActivationComplete}
      />
    );
  }

  return (
    <View
      testID="payment-screen"
      style={[styles.container, themedStyles.screen]}
    >
      <TopBar
        backButton={!!onBack}
        onBackPress={onBack}
        title={t('payments.title')}
        titleIconName="credit-card"
      />

      {state.status === 'loading' && (
        <View style={[styles.center, styles.full, themedStyles.loading]}>
          <Icon name="credit-card" size={48} color={colors.humPrimary} />
          <Text style={themedStyles.loadingText}>{t('payments.loading')}</Text>
        </View>
      )}

      {state.status === 'inactive' && (
        <View style={[styles.center, styles.inactiveContainer]}>
          <Icon name="wallet" size={48} color={colors.humPrimary} />
          <Text style={themedStyles.activationTitle}>
            {t('payments.activate.title')}
          </Text>
          <Text style={themedStyles.activationDescription}>
            {t('payments.activate.description')}
          </Text>
          <Button
            accessibilityLabel={t('payments.activate.cta')}
            disabled={!normalizedApiKey}
            onPress={() => {
              if (ensureApiKey()) {
                setShowActivation(true);
              }
            }}
            testID="activate-payments"
          >
            <Text style={styles.buttonLabel}>{t('payments.activate.cta')}</Text>
          </Button>
        </View>
      )}

      {state.status === 'error' && (
        <View style={[styles.center, styles.inactiveContainer]}>
          <Icon name="question-circle" size={48} color={colors.destructive} />
          <Text style={themedStyles.errorTitle}>
            {t('payments.errors.title')}
          </Text>
          <Text style={themedStyles.errorMessage}>{state.message}</Text>
          <Button
            accessibilityLabel={t('payments.errors.retry')}
            onPress={handleRetry}
          >
            <Text style={styles.buttonLabel}>{t('payments.errors.retry')}</Text>
          </Button>
        </View>
      )}

      {state.status === 'ready' && (
        <ScrollView contentContainerStyle={themedStyles.scrollContent}>
          <View style={themedStyles.sectionStack}>
            <View
              style={[
                styles.cardBase,
                themedStyles.card,
                themedStyles.balanceCard,
              ]}
            >
              <Text style={themedStyles.cardTitle}>
                {t('payments.balance.title')}
              </Text>
              {balanceSummary.map((bal) => (
                <View
                  key={bal.asset}
                  style={styles.balanceRow}
                  testID={`balance-row-${bal.asset}`}
                >
                  <Text
                    style={themedStyles.balanceAmount}
                    testID={`balance-amount-${bal.asset}`}
                    accessibilityLabel={`${formatSats(bal.balance)} ${bal.asset}`}
                  >
                    {formatSats(bal.balance)}
                  </Text>
                  <Text
                    style={themedStyles.balanceAsset}
                    testID={`balance-asset-${bal.asset}`}
                  >
                    {bal.asset}
                  </Text>
                </View>
              ))}
              {balanceSummary.length === 0 && (
                <Text style={themedStyles.balanceEmpty}>
                  {t('payments.balance.empty')}
                </Text>
              )}
            </View>

            <View
              style={[
                styles.cardBase,
                themedStyles.card,
                themedStyles.historyCard,
              ]}
            >
              <Text style={themedStyles.cardTitle}>
                {t('payments.history.title')}
              </Text>
              <View style={styles.rowEnd}>
                <Button
                  variant="secondary"
                  size="sm"
                  accessibilityLabel={t('payments.history.refresh')}
                  onPress={handleRefresh}
                >
                  {t('payments.history.refresh')}
                </Button>
              </View>
              {state.payments.length === 0 ? (
                <Text style={themedStyles.historyEmpty}>
                  {t('payments.history.empty')}
                </Text>
              ) : (
                state.payments.map((payment) => (
                  <View
                    key={payment.id}
                    style={[styles.historyItemBase, themedStyles.historyItem]}
                    testID={`payment-row-${payment.id}`}
                  >
                    <View style={styles.paymentRow}>
                      <View
                        style={[
                          styles.rowAlignCenter,
                          themedStyles.historyAmountRow,
                        ]}
                      >
                        <Icon
                          name="arrow-left-right"
                          size={16}
                          color={
                            payment.direction === 'INBOUND'
                              ? colors.humPrimary
                              : colors.destructive
                          }
                        />
                        <Text
                          style={themedStyles.historyAmount}
                          testID={`payment-amount-${payment.id}`}
                          accessibilityLabel={formatSats(payment.amount.sats)}
                        >
                          {formatSats(payment.amount.sats)}
                        </Text>
                      </View>
                      <Text style={themedStyles.historyStatus}>
                        {t(
                          `payments.status.${payment.status.toLowerCase()}` as const,
                        )}
                      </Text>
                    </View>
                    {payment.description ? (
                      <Text style={themedStyles.historyDescription}>
                        {payment.description}
                      </Text>
                    ) : null}
                    <View style={styles.paymentMetaRow}>
                      <Text style={themedStyles.historyMeta}>
                        {formatDate(payment.createdAt, i18n.language)}
                      </Text>
                      {payment.counterparty ? (
                        <Text
                          style={themedStyles.counterparty}
                          numberOfLines={1}
                        >
                          {payment.counterparty}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: {
    flex: 1,
  },
  inactiveContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  cardBase: {
    borderWidth: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyItemBase: {
    borderBottomWidth: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowEnd: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rowAlignCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export type PaymentScreenComponentProps = PaymentScreenProps;
export default PaymentScreen;
