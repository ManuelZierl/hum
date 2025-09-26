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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { Button, Icon, TopBar, useTheme } from '@hum/ui-components';
import { WORDLIST, generateMnemonic } from './utils/mnemonic';

export interface ActivatePaymentScreenProps {
  onBack?: () => void;
  onActivated: (mnemonic: string) => void;
}

type Step = 'display' | 'confirm';
type CopyStatus = 'idle' | 'copied';

const normalizeMnemonic = (value: string) =>
  value.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ');

const CHIP_SPACING = 8;

export const ActivatePaymentScreen: React.FC<ActivatePaymentScreenProps> = ({
  onBack,
  onActivated,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('display');
  const [mnemonic, setMnemonic] = useState(() => generateMnemonic());
  const words = useMemo(() => mnemonic.split(' '), [mnemonic]);
  const dictionary = useMemo(
    () => (Array.isArray(WORDLIST) ? WORDLIST : []),
    [],
  );
  const [confirmedWords, setConfirmedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const expectedWord = words[confirmedWords.length] ?? null;

  const themedStyles = useMemo(
    () => ({
      screen: {
        backgroundColor: colors.background,
        paddingBottom: insets.bottom,
      } satisfies ViewStyle,
      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl + insets.bottom,
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
      confirmContainer: {
        gap: spacing.lg,
      } satisfies ViewStyle,
      confirmTitle: {
        color: colors.foreground,
        fontSize: type.size.lg,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      confirmHelper: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CHIP_SPACING,
      } satisfies ViewStyle,
      chip: {
        borderRadius: radius.lg,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      } satisfies ViewStyle,
      chipText: {
        color: colors.foreground,
        fontSize: type.size.sm,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      textInput: {
        color: colors.foreground,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        fontSize: type.size.base,
      } satisfies TextStyle & ViewStyle,
      errorText: {
        color: colors.destructive,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      suggestions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: CHIP_SPACING,
      } satisfies ViewStyle,
      suggestion: {
        borderRadius: radius.lg,
        backgroundColor: colors.muted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
      } satisfies ViewStyle,
      suggestionText: {
        color: colors.foreground,
        fontSize: type.size.sm,
      } satisfies TextStyle,
      progressText: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
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

  const resetConfirmation = useCallback(() => {
    setConfirmedWords([]);
    setCurrentInput('');
    setInputError(null);
    setStep('display');
  }, []);

  const regenerateMnemonic = useCallback(() => {
    resetConfirmation();
    setMnemonic(generateMnemonic());
    setCopyStatus('idle');
  }, [resetConfirmation]);

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

  const commitWord = useCallback(
    (rawWord: string) => {
      const word = rawWord.trim().toLowerCase();
      if (!word) return false;
      if (confirmedWords.length >= words.length) return false;
      if (word !== words[confirmedWords.length]) {
        setInputError(
          t('payments.activate.confirmation.invalid_word', {
            word,
          }),
        );
        setCurrentInput(word);
        return false;
      }
      setConfirmedWords((prev) => [...prev, word]);
      setCurrentInput('');
      setInputError(null);
      return true;
    },
    [confirmedWords.length, t, words],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.includes(' ')) {
        const parts = value.split(/\s+/).filter(Boolean);
        let remainder = '';
        parts.forEach((part, index) => {
          const added = commitWord(part);
          if (!added && index === parts.length - 1) {
            remainder = part;
          }
        });
        setCurrentInput(remainder);
        return;
      }
      setCurrentInput(value.toLowerCase());
      setInputError(null);
    },
    [commitWord],
  );

  const handleSubmitEditing = useCallback(() => {
    if (currentInput) {
      commitWord(currentInput);
    }
  }, [commitWord, currentInput]);

  const removeWordAt = useCallback(
    (index: number) => {
      setConfirmedWords((prev) => prev.filter((_, idx) => idx !== index));
      setInputError(null);
      if (index === confirmedWords.length - 1) {
        setCurrentInput('');
      }
    },
    [confirmedWords.length],
  );

  const suggestions = useMemo(() => {
    const prefix = currentInput.trim().toLowerCase();
    if (!expectedWord || !prefix) return [] as string[];
    const matches = dictionary.filter((word) => word.startsWith(prefix));
    const ordered = matches.includes(expectedWord)
      ? [expectedWord, ...matches]
      : matches;
    const unique: string[] = [];
    for (const word of ordered) {
      if (!unique.includes(word)) {
        unique.push(word);
      }
      if (unique.length >= 8) break;
    }
    return unique;
  }, [currentInput, dictionary, expectedWord]);

  const isConfirmationValid = useMemo(
    () =>
      confirmedWords.length === words.length &&
      normalizeMnemonic(confirmedWords.join(' ')) ===
        normalizeMnemonic(mnemonic),
    [confirmedWords, mnemonic, words.length],
  );

  const handleContinue = useCallback(() => {
    setStep('confirm');
  }, []);

  const handleActivate = useCallback(() => {
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
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={themedStyles.content}
      >
        <View style={themedStyles.header}>
          <Text style={themedStyles.headline}>
            {step === 'display'
              ? t('payments.activate.steps.write_down.title')
              : t('payments.activate.steps.confirm.title')}
          </Text>
          <Text style={themedStyles.subtitle}>
            {step === 'display'
              ? t('payments.activate.steps.write_down.subtitle')
              : t('payments.activate.steps.confirm.subtitle')}
          </Text>
        </View>

        {step === 'display' ? (
          <View style={themedStyles.card}>
            <View style={themedStyles.wordGrid}>
              {words.map((word, index) => (
                <View
                  key={`${word}-${index}`}
                  style={[styles.wordBadge, themedStyles.wordBadge]}
                >
                  <Text style={themedStyles.wordIndex}>
                    {(index + 1).toString().padStart(2, '0')}
                  </Text>
                  <View style={styles.wordContent}>
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
                accessibilityLabel={t('payments.activate.actions.copy')}
                onPress={copyMnemonic}
              >
                {copyStatus === 'copied'
                  ? t('payments.activate.actions.copied')
                  : t('payments.activate.actions.copy')}
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
            <Button
              accessibilityLabel={t(
                'payments.activate.actions.confirm_written',
              )}
              onPress={handleContinue}
            >
              <Text style={styles.buttonLabel}>
                {t('payments.activate.actions.confirm_written')}
              </Text>
            </Button>
          </View>
        ) : (
          <View style={themedStyles.confirmContainer}>
            <View style={themedStyles.card}>
              <Text style={themedStyles.confirmTitle}>
                {t('payments.activate.confirmation.prompt')}
              </Text>
              <Text style={themedStyles.confirmHelper}>
                {t('payments.activate.confirmation.helper', {
                  remaining: words.length - confirmedWords.length,
                })}
              </Text>
              <View style={themedStyles.chipsContainer}>
                {confirmedWords.map((word, index) => (
                  <TouchableOpacity
                    key={`${word}-${index}`}
                    onPress={() => removeWordAt(index)}
                    style={themedStyles.chip}
                    accessibilityLabel={t(
                      'payments.activate.confirmation.remove_word',
                      { index: index + 1 },
                    )}
                  >
                    <Text style={themedStyles.chipText}>
                      {(index + 1).toString().padStart(2, '0')} {word}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.inputRow}>
                <TextInput
                  value={currentInput}
                  onChangeText={handleInputChange}
                  onSubmitEditing={handleSubmitEditing}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={t('payments.activate.confirmation.placeholder')}
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.textInput, themedStyles.textInput]}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  testID="mnemonic-confirm-input"
                />
              </View>
              {inputError ? (
                <Text style={themedStyles.errorText}>{inputError}</Text>
              ) : null}
              <View style={themedStyles.suggestions}>
                {suggestions.map((word) => (
                  <TouchableOpacity
                    key={word}
                    style={themedStyles.suggestion}
                    onPress={() => commitWord(word)}
                    accessibilityLabel={t(
                      'payments.activate.confirmation.use_suggestion',
                      { word },
                    )}
                  >
                    <Text style={themedStyles.suggestionText}>{word}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={themedStyles.progressText}>
                {t('payments.activate.confirmation.progress', {
                  entered: confirmedWords.length,
                  total: words.length,
                })}
              </Text>
            </View>
            <Button
              accessibilityLabel={t('payments.activate.actions.finish')}
              disabled={!isConfirmationValid}
              onPress={handleActivate}
              testID="activate-wallet"
            >
              <Text style={styles.buttonLabel}>
                {t('payments.activate.actions.finish')}
              </Text>
            </Button>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  wordBadge: {
    minWidth: 110,
  },
  wordContent: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ActivatePaymentScreen;
