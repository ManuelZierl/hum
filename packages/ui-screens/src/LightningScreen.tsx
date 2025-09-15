import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FeatureCard,
  Button,
  useTheme,
  Icon,
  TopBar,
} from '@hum/ui-components';
import { useTranslation } from 'react-i18next';

export interface LightningScreenProps {
  onBack?: () => void;
}

export const LightningScreen: React.FC<LightningScreenProps> = ({ onBack }) => {
  const { colors, spacing, type, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const iconColor = colors.humPrimaryForeground;
  const heroSize = spacing.xl * 4;

  const features = [
    {
      icon: <Icon name="wallet" size={24} color={iconColor} />,
      key: 'lightning.features.wallet',
    },
    {
      icon: <Icon name="qr-code" size={24} color={iconColor} />,
      key: 'lightning.features.send_receive',
    },
    {
      icon: <Icon name="clock" size={24} color={iconColor} />,
      key: 'lightning.features.history',
    },
    {
      icon: <Icon name="credit-card" size={24} color={iconColor} />,
      key: 'lightning.features.methods',
    },
    {
      icon: <Icon name="lightning" size={24} color={iconColor} />,
      key: 'lightning.features.settlements',
    },
    {
      icon: <Icon name="arrow-left-right" size={24} color={iconColor} />,
      key: 'lightning.features.multicurrency',
    },
    {
      icon: <Icon name="receipt" size={24} color={iconColor} />,
      key: 'lightning.features.invoice',
    },
    {
      icon: <Icon name="compass" size={24} color={iconColor} />,
      key: 'lightning.features.routing',
    },
    {
      icon: <Icon name="broadcast" size={24} color={iconColor} />,
      key: 'lightning.features.channel',
    },
    {
      icon: <Icon name="save" size={24} color={iconColor} />,
      key: 'lightning.features.backup',
    },
  ];

  return (
    <View
      testID="lightning-screen"
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <TopBar
        backButton={!!onBack}
        onBackPress={onBack}
        title={t('nav.lightning')}
        titleIconName="lightning"
      />

      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View
          style={[
            styles.content,
            { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
          ]}
        >
          <View style={[styles.centered, { marginBottom: spacing.xl }]}>
            <View
              style={[
                styles.heroIcon,
                {
                  width: heroSize,
                  height: heroSize,
                  borderRadius: heroSize / 2,
                  backgroundColor: colors.humPrimary,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              <Icon name="lightning" size={48} color={iconColor} />
            </View>
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size['2xl'],
                fontWeight: type.weight.medium,
                marginBottom: spacing.sm,
              }}
            >
              {t('lightning.hero.title')}
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              {t('lightning.hero.subtitle')}
            </Text>
          </View>

          {features.map((f, idx) => {
            const wrapperStyle = {
              marginBottom: idx === features.length - 1 ? 0 : spacing.lg,
            };
            return (
              <View key={f.key} style={[styles.cardWrapper, wrapperStyle]}>
                <FeatureCard
                  icon={f.icon}
                  title={t(`${f.key}.title`)}
                  description={t(`${f.key}.description`)}
                />
              </View>
            );
          })}

          <View
            style={[
              styles.banner,
              {
                backgroundColor: colors.muted,
                borderRadius: radius.lg,
                padding: spacing.xl,
                marginTop: spacing.xl,
                marginBottom: spacing.xl,
              },
            ]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.lg,
                fontWeight: type.weight.medium,
                marginBottom: spacing.sm,
              }}
            >
              {t('lightning.coming.title')}
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              {t('lightning.coming.description')}
            </Text>
          </View>

          <View
            style={[
              styles.info,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing.xl,
                marginBottom: spacing.xl,
              },
            ]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.lg,
                fontWeight: type.weight.medium,
                marginBottom: spacing.md,
              }}
            >
              {t('lightning.why.title')}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {[
                t('lightning.why.bullets.instant'),
                t('lightning.why.bullets.low_fees'),
                t('lightning.why.bullets.secure'),
                t('lightning.why.bullets.micro'),
                t('lightning.why.bullets.global'),
              ].map((b) => (
                <Text
                  key={b}
                  style={{
                    color: colors.mutedForeground,
                    fontSize: type.size.sm,
                  }}
                >
                  {'• '}
                  {b}
                </Text>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.beta,
              { borderRadius: radius.lg, padding: spacing.xl },
            ]}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: type.size.lg,
                fontWeight: type.weight.medium,
                marginBottom: spacing.sm,
              }}
            >
              {t('lightning.beta.title')}
            </Text>
            <Text
              style={[
                styles.centerText,
                {
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                  marginBottom: spacing.md,
                },
              ]}
            >
              {t('lightning.beta.message')}
            </Text>
            <Button accessibilityLabel={t('lightning.beta.button')}>
              <Text>{t('lightning.beta.button')}</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  cardWrapper: {},
  banner: {},
  content: {},
  centered: { alignItems: 'center' },
  heroIcon: { alignItems: 'center', justifyContent: 'center' },
  info: { borderWidth: 1 },
  beta: { alignItems: 'center', backgroundColor: 'rgba(254,202,26,0.1)' },
  centerText: { textAlign: 'center' },
});

export default LightningScreen;
