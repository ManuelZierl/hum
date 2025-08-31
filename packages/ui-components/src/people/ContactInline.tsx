import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface ContactInlineProps {
  name: string;
  online?: boolean;
}

export const ContactInline: React.FC<ContactInlineProps> = ({
  name,
  online = false,
}) => {
  const { colors, spacing, type } = useTheme();
  return (
    <View style={styles.container}>
      <Text
        style={{
          color: colors.foreground,
          fontSize: type.size.md,
          fontWeight: type.weight.medium,
        }}
      >
        {name}
      </Text>
      {online ? (
        <View
          testID="online-dot"
          style={[
            styles.dot,
            { backgroundColor: colors.humPrimary, marginLeft: spacing.xs },
          ]}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ContactInline;
