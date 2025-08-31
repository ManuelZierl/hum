import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomNavItem, Icon, useTheme } from '@hum/ui-components';

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

  const navItems = [
    {
      id: 'chats',
      icon: <Icon name="chat" />,
      label: 'Chats',
      badgeCount: chatsBadgeCount,
    },
    { id: 'lightning', icon: <Icon name="lightning" />, label: 'Lightning' },
    { id: 'settings', icon: <Icon name="gear" />, label: 'Settings' },
  ];

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
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
