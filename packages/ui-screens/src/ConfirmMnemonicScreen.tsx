import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ReactNative from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, useTheme } from '@hum/ui-components';

const CHIP_SPACING = 8;
const SUGGESTION_LIMIT = 8;

export interface ConfirmMnemonicScreenProps {
  mnemonic: string;
  dictionary: string[];
  onComplete: () => void;
  bottomOffset?: number;
}

const normalizeMnemonic = (value: string) =>
  value.trim().toLowerCase().split(/\s+/).filter(Boolean).join(' ');

export const ConfirmMnemonicScreen: React.FC<ConfirmMnemonicScreenProps> = ({
  mnemonic,
  dictionary,
  onComplete,
  bottomOffset = 0,
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const words = useMemo(() => mnemonic.split(' '), [mnemonic]);

  const [confirmedWords, setConfirmedWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboard = (
      ReactNative as unknown as {
        Keyboard?: {
          addListener: (
            event: 'keyboardDidShow' | 'keyboardDidHide',
            listener: () => void,
          ) => { remove(): void };
        };
      }
    ).Keyboard;
    if (!keyboard || typeof keyboard.addListener !== 'function') {
      return undefined;
    }

    const showSub = keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSub = keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const themedStyles = useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: colors.background,
      } satisfies ViewStyle,
      content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom:
          spacing.lg + (keyboardVisible ? insets.bottom : bottomOffset),
        gap: spacing.md,
        flexGrow: 1,
      } satisfies ViewStyle,
      title: {
        color: colors.foreground,
        fontSize: type.size.base,
        fontWeight: type.weight.medium,
      } satisfies TextStyle,
      helper: {
        color: colors.mutedForeground,
        fontSize: type.size.sm,
        flex: 1,
      } satisfies TextStyle,
      card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderColor: colors.border,
        borderWidth: 1,
        padding: spacing.lg,
        gap: spacing.md,
      } satisfies ViewStyle,
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
      inputRow: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
      } satisfies ViewStyle,
      textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        color: colors.foreground,
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
      bottomActions: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: insets.bottom + spacing.lg,
        backgroundColor: colors.background,
        marginBottom: keyboardVisible ? 0 : bottomOffset,
      } satisfies ViewStyle,
      buttonLabel: {
        color: colors.humPrimaryForeground,
        fontSize: type.size.base,
        fontWeight: type.weight.bold,
      } satisfies TextStyle,
    }),
    [
      bottomOffset,
      colors,
      insets.bottom,
      keyboardVisible,
      radius,
      spacing,
      type,
    ],
  );

  const processWords = useCallback(
    (
      parts: string[],
      remainderSeed: string,
    ): {
      next: string[];
      remainder: string;
      errorWord: string | null;
    } => {
      const next = [...confirmedWords];
      let remainder = remainderSeed;
      let errorWord: string | null = null;

      parts.forEach((rawPart) => {
        if (errorWord) return;
        const part = rawPart.trim().toLowerCase();
        if (!part) {
          remainder = '';
          return;
        }
        const expected = words[next.length];
        if (!expected) return;

        if (part === expected) {
          next.push(part);
          remainder = '';
          return;
        }

        errorWord = part;
        remainder = part;
      });

      return { next, remainder, errorWord };
    },
    [confirmedWords, words],
  );

  const commitWord = useCallback(
    (rawWord: string) => {
      const normalized = rawWord.trim().toLowerCase();
      if (!normalized) return false;
      let added = false;
      setConfirmedWords((prev) => {
        if (prev.length >= words.length) return prev;
        const expected = words[prev.length];
        if (normalized !== expected) {
          setInputError(
            t('payments.activate.confirmation.invalid_word', {
              word: normalized,
            }),
          );
          setCurrentInput(normalized);
          return prev;
        }
        added = true;
        setInputError(null);
        setCurrentInput('');
        return [...prev, normalized];
      });
      return added;
    },
    [t, words],
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.includes(' ')) {
        const endsWithSpace = /\s$/.test(value);
        const parts = value.split(/\s+/).filter(Boolean);
        const commitAll = !endsWithSpace && parts.length > 1;
        const shouldCommitAll = commitAll || endsWithSpace;
        const effectiveParts = shouldCommitAll ? parts : parts.slice(0, -1);
        const partial = shouldCommitAll ? '' : (parts[parts.length - 1] ?? '');
        const { next, remainder, errorWord } = processWords(
          effectiveParts,
          partial,
        );
        if (next.length !== confirmedWords.length) {
          setConfirmedWords(next);
        }
        if (errorWord) {
          setInputError(
            t('payments.activate.confirmation.invalid_word', {
              word: errorWord,
            }),
          );
          setCurrentInput(remainder);
          return;
        }
        setInputError(null);
        setCurrentInput((shouldCommitAll ? '' : partial).toLowerCase());
        return;
      }
      setCurrentInput(value.toLowerCase());
      setInputError(null);
    },
    [confirmedWords.length, processWords, t],
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
      if (index >= confirmedWords.length - 1) {
        setCurrentInput('');
      }
    },
    [confirmedWords.length],
  );

  const suggestions = useMemo(() => {
    const prefix = currentInput.trim().toLowerCase();
    if (!prefix) return [] as string[];
    const matches = dictionary.filter((word) => word.startsWith(prefix));
    const expected = words[confirmedWords.length];
    const ordered =
      expected && matches.includes(expected) ? [expected, ...matches] : matches;
    const unique: string[] = [];
    for (const word of ordered) {
      if (!unique.includes(word)) {
        unique.push(word);
      }
      if (unique.length >= SUGGESTION_LIMIT) break;
    }
    return unique;
  }, [confirmedWords.length, currentInput, dictionary, words]);

  const isConfirmationValid = useMemo(
    () =>
      confirmedWords.length === words.length &&
      normalizeMnemonic(confirmedWords.join(' ')) ===
        normalizeMnemonic(mnemonic),
    [confirmedWords, mnemonic, words.length],
  );

  return (
    <View style={themedStyles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={themedStyles.content}
      >
        <View>
          <Text style={themedStyles.title}>
            {t('payments.activate.steps.confirm.title')}
          </Text>
          <Text style={themedStyles.helper}>
            {t('payments.activate.confirmation.helper', {
              remaining: words.length - confirmedWords.length,
            })}
          </Text>
        </View>

        <View style={themedStyles.card}>
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

          <View style={themedStyles.inputRow}>
            <TextInput
              value={currentInput}
              onChangeText={handleInputChange}
              onSubmitEditing={handleSubmitEditing}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder={t('payments.activate.confirmation.placeholder')}
              placeholderTextColor={colors.mutedForeground}
              style={themedStyles.textInput}
              returnKeyType="done"
              blurOnSubmit={false}
              testID="mnemonic-confirm-input"
              accessibilityLabel={t(
                'payments.activate.confirmation.placeholder',
              )}
            />
          </View>

          {inputError ? (
            <Text
              style={themedStyles.errorText}
              accessibilityRole="alert"
              accessibilityLabel={inputError}
              testID="mnemonic-error"
            >
              {inputError}
            </Text>
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
      </ScrollView>

      <View
        style={themedStyles.bottomActions}
        testID="confirm-bottom-actions"
        accessible
        accessibilityLabel="confirm-bottom-actions"
      >
        <Button
          accessibilityLabel={t('payments.activate.actions.finish')}
          disabled={!isConfirmationValid}
          onPress={onComplete}
          testID="activate-wallet"
        >
          <Text style={themedStyles.buttonLabel}>
            {t('payments.activate.actions.finish')}
          </Text>
        </Button>
      </View>
    </View>
  );
};

export default ConfirmMnemonicScreen;
