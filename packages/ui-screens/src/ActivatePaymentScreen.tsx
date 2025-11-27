import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { Button, Icon, TopBar, useTheme } from '@hum/ui-components';
import { WORDLIST, generateMnemonic } from './utils/mnemonic';
import { ConfirmMnemonicScreen } from './ConfirmMnemonicScreen';

export interface ActivatePaymentScreenProps {
  onBack?: () => void;
  onActivated: (mnemonic: string) => void;
}

type Step = 'display' | 'confirm';
type CopyStatus = 'idle' | 'copied';

const BOTTOM_BAR_HEIGHT = 72;

export const ActivatePaymentScreen: React.FC<ActivatePaymentScreenProps> = ({
  onBack,
  onActivated,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('display');
  const [mnemonic, setMnemonic] = useState(() => generateMnemonic());
  const dictionary = useMemo(
    () => (Array.isArray(WORDLIST) ? WORDLIST : []),
    [],
  );
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyLabel = useMemo(
    () =>
      copyStatus === 'copied'
        ? t('payments.activate.actions.copied')
        : t('payments.activate.actions.copy'),
    [copyStatus, t],
  );

  const themedStyles = useMemo(
    () => ({
      screen: {
        backgroundColor: colors.background,
        paddingBottom: insets.bottom,
      } satisfies ViewStyle,
      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + insets.bottom + BOTTOM_BAR_HEIGHT,
        flexGrow: 1,
        gap: spacing.lg,
      } satisfies ViewStyle,
      header: {
        gap: spacing.sm,
      } satisfies ViewStyle,
      headline: {
        color: colors.foreground,
        fontSize: type.size['2xl'],
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      subtitle: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      card: {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.lg,
        gap: spacing.lg,
      } satisfies ViewStyle,
      wordGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: spacing.lg,
        rowGap: spacing.lg,
      } satisfies ViewStyle,
      wordBadge: {
        gap: spacing.xs,
      } satisfies ViewStyle,
      wordContent: {
        backgroundColor: colors.muted,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.lg,
      } satisfies ViewStyle,
      wordIndex: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      wordValue: {
        color: colors.foreground,
        fontSize: type.size.base,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      warning: {
        backgroundColor: colors.muted,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
      } satisfies ViewStyle,
      warningText: {
        color: colors.foreground,
        flex: 1,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      actionRow: {
        flexDirection: 'row',
        gap: spacing.md,
        flexWrap: 'wrap',
      } satisfies ViewStyle,
      bottomActions: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: insets.bottom + spacing.lg,
        backgroundColor: colors.background,
        marginBottom: BOTTOM_BAR_HEIGHT,
      } satisfies ViewStyle,
      buttonLabel: {
        color: colors.humPrimaryForeground,
        fontSize: type.size.base,
        fontWeight: type.weight.bold,
      } satisfies TextStyle,
    }),
    [colors, insets.bottom, radius, spacing, type],
  );

  useEffect(() => {
    return () => {
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
        copyTimer.current = null;
      }
    };
  }, []);

  const regenerateMnemonic = useCallback(() => {
    setStep('display');
    setMnemonic(generateMnemonic());
    setCopyStatus('idle');
  }, []);

  const copyMnemonic = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(mnemonic);
      setCopyStatus('copied');
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
      copyTimer.current = setTimeout(() => {
        setCopyStatus('idle');
        copyTimer.current = null;
      }, 60_000);
    } catch (error) {
      console.warn('[ActivatePaymentScreen] copy failed', error);
    }
  }, [mnemonic]);

  const handleContinue = useCallback(() => {
    setStep('confirm');
  }, []);

  const handleConfirmationComplete = useCallback(() => {
    onActivated(mnemonic);
  }, [mnemonic, onActivated]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, themedStyles.screen]}
      keyboardVerticalOffset={insets.top + 56}
    >
      <TopBar
        backButton={!!onBack}
        onBackPress={onBack}
        title={t('payments.activate.title')}
        titleIconName="lightning"
      />
      {step === 'display' ? (
        <View style={styles.flex}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={themedStyles.content}
          >
            <View style={themedStyles.header}>
              <Text style={themedStyles.headline}>
                {t('payments.activate.steps.write_down.title')}
              </Text>
              <Text style={themedStyles.subtitle}>
                {t('payments.activate.steps.write_down.subtitle')}
              </Text>
            </View>

            <View style={themedStyles.card}>
              <View style={themedStyles.wordGrid}>
                {mnemonic.split(' ').map((word, index) => (
                  <View
                    key={`${word}-${index}`}
                    style={[styles.wordBadge, themedStyles.wordBadge]}
                    accessible
                    accessibilityRole="text"
                    accessibilityLabel={`${(index + 1)
                      .toString()
                      .padStart(2, '0')} ${word}`}
                    testID={`mnemonic-word-${index + 1}`}
                  >
                    <Text style={themedStyles.wordIndex}>
                      {(index + 1).toString().padStart(2, '0')}
                    </Text>
                    <View style={themedStyles.wordContent}>
                      <Text style={themedStyles.wordValue}>{word}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={themedStyles.warning}>
                <Icon name="shield" size={20} color={colors.humPrimary} />
                <Text style={themedStyles.warningText}>
                  {t('payments.activate.security_note')}
                  {'\n'}
                  {t('payments.activate.self_custody_warning')}
                </Text>
              </View>
              <View style={themedStyles.actionRow}>
                <Button
                  variant="secondary"
                  size="sm"
                  accessibilityLabel={copyLabel}
                  onPress={copyMnemonic}
                >
                  {copyLabel}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  accessibilityLabel={t('payments.activate.actions.regenerate')}
                  onPress={regenerateMnemonic}
                >
                  {t('payments.activate.actions.regenerate')}
                </Button>
              </View>
            </View>
          </ScrollView>
          <View
            style={themedStyles.bottomActions}
            testID="activate-bottom-actions"
            accessible
            accessibilityLabel="activate-bottom-actions"
          >
            <Button
              accessibilityLabel={t(
                'payments.activate.actions.confirm_written',
              )}
              onPress={handleContinue}
            >
              <Text style={themedStyles.buttonLabel}>
                {t('payments.activate.actions.confirm_written')}
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        <ConfirmMnemonicScreen
          mnemonic={mnemonic}
          dictionary={dictionary}
          onComplete={handleConfirmationComplete}
          bottomOffset={BOTTOM_BAR_HEIGHT}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  wordBadge: {
    minWidth: 110,
  },
});

export default ActivatePaymentScreen;
