import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Avatar, AvatarImage } from './avatar';
import { Button } from './button';
import { Icon } from './theme/icon';
import { useTheme } from './theme/theme-provider';

export interface CallItemProps {
  avatar: string;
  title: string;
  subtitle: string;
  type: 'incoming' | 'outgoing' | 'missed';
  isVideo?: boolean;
  onPress?: () => void;
  onPressCall?: () => void;
}

export const CallItem: React.FC<CallItemProps> = ({
  avatar,
  title,
  subtitle,
  type,
  isVideo = false,
  onPress,
  onPressCall,
}) => {
  const { colors, spacing, type: typography } = useTheme();
  const iconName =
    type === 'incoming'
      ? 'call_incoming'
      : type === 'outgoing'
        ? 'call_outgoing'
        : 'call_missed';
  const subtitleColor =
    type === 'missed' ? colors.destructive : colors.mutedForeground;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={`Call with ${title}`}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
          backgroundColor: pressed ? colors.muted : 'transparent',
        },
      ]}
    >
      <Avatar size={48} style={{ marginRight: spacing.md }}>
        <AvatarImage
          source={{ uri: avatar }}
          accessibilityLabel={`${title} avatar`}
        />
      </Avatar>
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: colors.foreground,
              fontSize: typography.size.md,
              fontWeight: typography.weight.medium,
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <View style={styles.subtitleRow}>
          <Icon
            name={iconName}
            size={16}
            color={subtitleColor}
            style={{ marginRight: spacing.xs }}
          />
          <Text
            style={[
              styles.subtitle,
              { color: subtitleColor, fontSize: typography.size.sm },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        </View>
      </View>
      <Button
        size="icon"
        accessibilityLabel={isVideo ? 'Call video' : 'Call voice'}
        style={{ marginLeft: spacing.md }}
        onPress={onPressCall}
      >
        <Icon
          name={isVideo ? 'video_call' : 'telephone'}
          size={24}
          color={colors.humPrimaryForeground}
        />
      </Button>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  content: { flex: 1, minWidth: 0 },
  title: { marginBottom: 2 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center' },
  subtitle: { flexShrink: 1 },
});

export default CallItem;
