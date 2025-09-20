import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavItem } from './bottom-navigation-item';
import { Icon } from './theme/icon';
import { useTheme } from './theme/theme-provider';
import { useTranslation } from 'react-i18next';

export interface BottomNavigationProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  chatsBadgeCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab = 'chats',
  onTabChange,
  chatsBadgeCount = 0,
}) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const navItems = [
    {
      id: 'chats',
      icon: <Icon name="chat" />,
      activeIcon: <Icon name="chat-fill" />,
      label: t('nav.chats'),
      badgeCount: chatsBadgeCount,
    },
    {
      id: 'calls',
      icon: <Icon name="telephone" />,
      activeIcon: <Icon name="telephone-fill" />,
      label: t('nav.calls'),
    },
    {
      id: 'payments',
      icon: <Icon name="bitcoin-outline" />,
      activeIcon: <Icon name="bitcoin" />,
      label: t('nav.payments'),
    },
    {
      id: 'settings',
      icon: <Icon name="gear" />,
      activeIcon: <Icon name="gear-fill" />,
      label: t('nav.settings'),
    },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <View style={styles.row}>
        {navItems.map((item) => (
          <BottomNavItem
            key={item.id}
            icon={item.icon}
            activeIcon={item.activeIcon}
            label={item.label}
            isActive={activeTab === item.id}
            onPress={() => onTabChange?.(item.id)}
            badgeCount={item.badgeCount || 0}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
  },
  row: {
    flexDirection: 'row',
  },
});

export default BottomNavigation;
