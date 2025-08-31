import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeatureCard, Button, useTheme, Icon } from '@hum/ui-components';

export interface LightningScreenProps {
  onBack?: () => void;
}

export const LightningScreen: React.FC<LightningScreenProps> = ({ onBack }) => {
  const { colors, spacing, type, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const iconColor = colors.humPrimaryForeground;
  const heroSize = spacing.xl * 4;

  const features = [
    {
      icon: <Icon name="wallet" size={24} color={iconColor} />,
      title: 'Lightning Wallet',
      description:
        'Manage your Lightning Bitcoin balance and make instant payments',
    },
    {
      icon: <Icon name="qr-code" size={24} color={iconColor} />,
      title: 'Send & Receive',
      description:
        'Scan QR codes or share payment links to send money instantly',
    },
    {
      icon: <Icon name="clock" size={24} color={iconColor} />,
      title: 'Transaction History',
      description: 'View all your Lightning payment history and receipts',
    },
    {
      icon: <Icon name="credit-card" size={24} color={iconColor} />,
      title: 'Payment Methods',
      description:
        'Connect your bank account or debit card to fund your wallet',
    },
    {
      icon: <Icon name="lightning" size={24} color={iconColor} />,
      title: 'Instant Settlements',
      description: 'Settle payments in milliseconds with low fees',
    },
    {
      icon: <Icon name="arrow-left-right" size={24} color={iconColor} />,
      title: 'Multi-Currency Support',
      description: 'Support for Bitcoin, sats, and other Lightning currencies',
    },
    {
      icon: <Icon name="receipt" size={24} color={iconColor} />,
      title: 'Invoice Generation',
      description: 'Create and share payment invoices with custom amounts',
    },
    {
      icon: <Icon name="compass" size={24} color={iconColor} />,
      title: 'Payment Routing',
      description:
        'Automatic routing through the Lightning Network for optimal fees',
    },
    {
      icon: <Icon name="broadcast" size={24} color={iconColor} />,
      title: 'Channel Management',
      description: 'Open and manage Lightning channels for better liquidity',
    },
    {
      icon: <Icon name="save" size={24} color={iconColor} />,
      title: 'Backup & Recovery',
      description:
        'Secure backup and recovery options for your Lightning wallet',
    },
  ];

  return (
    <View
      testID="lightning-screen"
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
          >
            <Text style={[styles.icon, { color: colors.humPrimary }]}>←</Text>
          </Pressable>
        ) : null}
        <View style={styles.headerCenter}>
          <Icon name="lightning" size={24} color={colors.humPrimary} />
          <Text
            style={{
              color: colors.foreground,
              fontSize: type.size.xl,
              fontWeight: type.weight.medium,
              marginLeft: spacing.sm,
            }}
          >
            Lightning
          </Text>
        </View>
      </View>

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
              Lightning Payments
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              Fast, cheap Bitcoin payments for everyone
            </Text>
          </View>

          {features.map((f, idx) => {
            const wrapperStyle = {
              marginBottom: idx === features.length - 1 ? 0 : spacing.lg,
            };
            return (
              <View key={f.title} style={[styles.cardWrapper, wrapperStyle]}>
                <FeatureCard
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
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
              Coming Soon
            </Text>
            <Text
              style={{ color: colors.mutedForeground, fontSize: type.size.sm }}
            >
              Lightning payments will be available in a future update. Stay
              tuned for instant Bitcoin transactions!
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
              Why Lightning?
            </Text>
            <View style={{ gap: spacing.sm }}>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                }}
              >
                • Lightning Network enables instant Bitcoin payments
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                }}
              >
                • Extremely low fees, often less than a penny
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                }}
              >
                • Built on Bitcoin&apos;s secure infrastructure
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                }}
              >
                • Perfect for microtransactions and everyday payments
              </Text>
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: type.size.sm,
                }}
              >
                • Global reach with 24/7 availability
              </Text>
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
              Get Early Access
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
              Be among the first to try Lightning payments when they launch.
            </Text>
            <Button accessibilityLabel="Join beta waitlist">
              <Text>Join Beta Waitlist</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  container: { flex: 1 },
  cardWrapper: {},
  banner: {},
  content: {},
  centered: { alignItems: 'center' },
  heroIcon: { alignItems: 'center', justifyContent: 'center' },
  info: { borderWidth: 1 },
  beta: { alignItems: 'center', backgroundColor: 'rgba(254,202,26,0.1)' },
  centerText: { textAlign: 'center' },
  icon: { fontSize: 24 },
});

export default LightningScreen;
