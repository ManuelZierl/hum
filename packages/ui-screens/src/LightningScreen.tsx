/* eslint-disable react-native/no-unused-styles */
import React from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore ScrollView types may be unavailable in tests
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, FeatureCard, Button } from '@hum/ui-components';
import { Ionicons } from '@expo/vector-icons';

export interface LightningScreenProps {
  onBack?: () => void;
}

export const LightningScreen: React.FC<LightningScreenProps> = ({ onBack }) => {
  const { colors, spacing, radius, type } = useTheme();
  const insets = useSafeAreaInsets();

  const iconColor = colors.humPrimaryForeground;
  const iconSize = 24;

  const features = React.useMemo(
    () => [
      {
        icon: <Ionicons name="wallet" size={iconSize} color={iconColor} />,
        title: 'Lightning Wallet',
        description:
          'Manage your Lightning Bitcoin balance and make instant payments',
      },
      {
        icon: <Ionicons name="qr-code" size={iconSize} color={iconColor} />,
        title: 'Send & Receive',
        description:
          'Scan QR codes or share payment links to send money instantly',
      },
      {
        icon: <Ionicons name="time" size={iconSize} color={iconColor} />,
        title: 'Transaction History',
        description: 'View all your Lightning payment history and receipts',
      },
      {
        icon: <Ionicons name="card" size={iconSize} color={iconColor} />,
        title: 'Payment Methods',
        description:
          'Connect your bank account or debit card to fund your wallet',
      },
      {
        icon: <Ionicons name="flash" size={iconSize} color={iconColor} />,
        title: 'Instant Settlements',
        description: 'Settle payments in milliseconds with low fees',
      },
      {
        icon: <Ionicons name="wallet" size={iconSize} color={iconColor} />,
        title: 'Multi-Currency Support',
        description:
          'Support for Bitcoin, sats, and other Lightning currencies',
      },
      {
        icon: <Ionicons name="qr-code" size={iconSize} color={iconColor} />,
        title: 'Invoice Generation',
        description: 'Create and share payment invoices with custom amounts',
      },
      {
        icon: <Ionicons name="time" size={iconSize} color={iconColor} />,
        title: 'Payment Routing',
        description:
          'Automatic routing through the Lightning Network for optimal fees',
      },
      {
        icon: <Ionicons name="card" size={iconSize} color={iconColor} />,
        title: 'Channel Management',
        description: 'Open and manage Lightning channels for better liquidity',
      },
      {
        icon: <Ionicons name="flash" size={iconSize} color={iconColor} />,
        title: 'Backup & Recovery',
        description:
          'Secure backup and recovery options for your Lightning wallet',
      },
    ],
    [iconColor, iconSize],
  );

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        backButton: {
          position: 'absolute',
          left: spacing.lg,
          padding: spacing.sm,
        },
        headerTitle: {
          marginLeft: spacing.sm,
          fontSize: type.size.xl,
          color: colors.foreground,
          fontWeight: type.weight.medium,
        },
        contentContainer: {
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
        },
        heroIcon: {
          width: 96,
          height: 96,
          borderRadius: 48,
          backgroundColor: colors.humPrimary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.lg,
        },
        heroSection: {
          alignItems: 'center',
          marginBottom: spacing.xl,
        },
        heroTitle: {
          fontSize: type.size['2xl'],
          color: colors.foreground,
          fontWeight: type.weight.bold,
          marginBottom: spacing.sm,
          textAlign: 'center',
        },
        heroText: {
          fontSize: type.size.base,
          color: colors.mutedForeground,
          textAlign: 'center',
        },
        featuresSection: {
          marginBottom: spacing.xl,
        },
        cardSpacer: {
          marginBottom: spacing.lg,
        },
        banner: {
          backgroundColor: colors.muted,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
        },
        bannerTitle: {
          fontSize: type.size.lg,
          color: colors.foreground,
          marginBottom: spacing.sm,
          textAlign: 'center',
        },
        bannerText: {
          fontSize: type.size.sm,
          color: colors.mutedForeground,
          textAlign: 'center',
        },
        infoContainer: {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radius.lg,
          padding: spacing.lg,
          marginBottom: spacing.xl,
        },
        infoTitle: {
          fontSize: type.size.lg,
          color: colors.foreground,
          marginBottom: spacing.md,
        },
        infoText: {
          fontSize: type.size.sm,
          color: colors.mutedForeground,
          marginBottom: spacing.sm,
        },
        infoTextLast: {
          fontSize: type.size.sm,
          color: colors.mutedForeground,
          marginBottom: 0,
        },
        betaContainer: {
          backgroundColor: 'rgba(254,202,26,0.1)',
          borderRadius: radius.lg,
          padding: spacing.lg,
          alignItems: 'center',
        },
        betaTitle: {
          fontSize: type.size.lg,
          color: colors.foreground,
          marginBottom: spacing.sm,
        },
        betaText: {
          fontSize: type.size.sm,
          color: colors.mutedForeground,
          marginBottom: spacing.lg,
          textAlign: 'center',
        },
      }),
    [colors, spacing, radius, type, insets.top],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
        ) : null}
        <Ionicons name="flash" size={24} color={colors.humPrimary} />
        <Text style={styles.headerTitle}>Lightning</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="flash"
              size={48}
              color={colors.humPrimaryForeground}
            />
          </View>
          <Text style={styles.heroTitle}>Lightning Payments</Text>
          <Text style={styles.heroText}>
            Fast, cheap Bitcoin payments for everyone
          </Text>
        </View>
        <View style={styles.featuresSection}>
          {features.map((f, idx) => (
            <View
              key={f.title}
              style={
                idx === features.length - 1 ? undefined : styles.cardSpacer
              }
            >
              <FeatureCard {...f} />
            </View>
          ))}
        </View>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Coming Soon</Text>
          <Text style={styles.bannerText}>
            Lightning payments will be available in a future update. Stay tuned
            for instant Bitcoin transactions!
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Why Lightning?</Text>
          <Text style={styles.infoText}>
            • Lightning Network enables instant Bitcoin payments
          </Text>
          <Text style={styles.infoText}>
            • Extremely low fees, often less than a penny
          </Text>
          <Text style={styles.infoText}>
            • Built on Bitcoin’s secure infrastructure
          </Text>
          <Text style={styles.infoText}>
            • Perfect for microtransactions and everyday payments
          </Text>
          <Text style={styles.infoTextLast}>
            • Global reach with 24/7 availability
          </Text>
        </View>
        <View style={styles.betaContainer}>
          <Text style={styles.betaTitle}>Get Early Access</Text>
          <Text style={styles.betaText}>
            Be among the first to try Lightning payments when they launch.
          </Text>
          {/* eslint-disable-next-line react-native/no-raw-text */}
          <Button accessibilityLabel="Join Beta Waitlist">
            Join Beta Waitlist
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default LightningScreen;
