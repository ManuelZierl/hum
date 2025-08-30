import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export interface BadgeProps extends PressableProps {
  variant?: BadgeVariant;
  asChild?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  testID?: string;
}

export const badgeVariants = (
  colors: ReturnType<typeof useTheme>['colors'],
  variant: BadgeVariant,
) => {
  switch (variant) {
    case 'secondary':
      return {
        container: {
          backgroundColor: colors.secondary,
          borderColor: 'transparent',
        },
        text: { color: colors.secondaryForeground },
      } as const;
    case 'destructive':
      return {
        container: {
          backgroundColor: colors.destructive,
          borderColor: 'transparent',
        },
        text: { color: colors.destructiveForeground },
      } as const;
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: colors.border,
        },
        text: { color: colors.foreground },
      } as const;
    default:
      return {
        container: {
          backgroundColor: colors.humPrimary,
          borderColor: 'transparent',
        },
        text: { color: colors.humPrimaryForeground },
      } as const;
  }
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  asChild = false,
  style,
  textStyle,
  children,
  testID,
  ...props
}) => {
  const { colors, spacing, radius, type } = useTheme();
  const variantStyle = badgeVariants(colors, variant);

  const content = React.Children.toArray(children);

  const renderedChildren = content.map((child, index) => {
    const isLast = index === content.length - 1;
    if (typeof child === 'string') {
      return (
        <Text
          key={index}
          style={[
            styles.text,
            {
              color: variantStyle.text.color,
              fontSize: type.size.sm,
              fontWeight: type.weight.medium,
            },
            textStyle,
          ]}
        >
          {child}
        </Text>
      );
    }
    if (React.isValidElement(child)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.cloneElement(child as any, {
        key: index,
        style: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (child as any).props.style,
          !isLast && { marginRight: spacing.xs },
        ],
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return child as any;
  });

  const baseStyle = [
    styles.container,
    {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.md,
      backgroundColor: variantStyle.container.backgroundColor,
      borderColor: variantStyle.container.borderColor,
    },
    style,
  ];

  if (asChild && React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return React.cloneElement(children as any, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style: [baseStyle, (children as any).props.style],
      testID,
      ...props,
    });
  }

  return (
    <Pressable
      accessibilityRole={props.onPress ? 'button' : 'text'}
      testID={testID}
      style={baseStyle}
      {...props}
    >
      {renderedChildren}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    flexShrink: 1,
  },
});

export default Badge;
