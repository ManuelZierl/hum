import React, { createContext, useContext } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

// Context to share variant with subcomponents
const AlertContext = createContext<{ variant: AlertVariant }>({
  variant: 'default',
});
const useAlert = () => useContext(AlertContext);

export type AlertVariant = 'default' | 'destructive';

export interface AlertProps extends PressableProps {
  variant?: AlertVariant;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'default',
  style,
  children,
  ...props
}) => {
  const { colors, spacing, radius } = useTheme();
  const childrenArray = React.Children.toArray(children);

  const hasIcon =
    React.isValidElement(childrenArray[0]) &&
    (childrenArray[0] as React.ReactElement).type !== AlertTitle &&
    (childrenArray[0] as React.ReactElement).type !== AlertDescription;

  const icon = hasIcon ? childrenArray[0] : null;
  const content = hasIcon ? childrenArray.slice(1) : childrenArray;

  return (
    <AlertContext.Provider value={{ variant }}>
      <Pressable
        accessibilityRole="alert"
        style={[
          styles.container,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: radius.lg,
          },
          style,
        ]}
        {...props}
      >
        {icon && <View style={{ marginRight: spacing.sm }}>{icon}</View>}
        <View style={styles.content}>{content}</View>
      </Pressable>
    </AlertContext.Provider>
  );
};

type RNTextProps = React.ComponentProps<typeof Text>;

export interface AlertTitleProps extends RNTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export const AlertTitle: React.FC<AlertTitleProps> = ({
  children,
  style,
  ...props
}) => {
  const { colors, type } = useTheme();
  const { variant } = useAlert();
  const color =
    variant === 'destructive' ? colors.destructive : colors.cardForeground;
  return (
    <Text
      style={[
        styles.title,
        {
          color,
          fontSize: type.size.md,
          fontWeight: type.weight.medium,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export interface AlertDescriptionProps extends RNTextProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  testID?: string;
}

export const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  style,
  ...props
}) => {
  const { colors, type } = useTheme();
  const { variant } = useAlert();
  const color =
    variant === 'destructive' ? colors.destructive : colors.mutedForeground;
  return (
    <Text
      style={[
        styles.description,
        {
          color,
          fontSize: type.size.base,
          lineHeight: type.lineHeight.relaxed,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginTop: 2,
  },
});
