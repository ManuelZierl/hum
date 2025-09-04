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
import { useTheme } from './theme/theme-provider';

export type ButtonVariant =
  | 'default'
  | 'destructive'
  | 'outline'
  | 'secondary'
  | 'ghost'
  | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const buttonVariants = {
  variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
  sizes: ['default', 'sm', 'lg', 'icon'],
} as const;

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  asChild = false,
  style,
  textStyle,
  children,
  disabled,
  ...props
}) => {
  const { colors, spacing, radius, type } = useTheme();

  const variantStyle = React.useMemo(() => {
    switch (variant) {
      case 'destructive':
        return {
          container: { backgroundColor: colors.destructive },
          text: { color: colors.destructiveForeground },
          pressed: { opacity: 0.9 },
        } as const;
      case 'outline':
        return {
          container: {
            backgroundColor: colors.background,
            borderColor: colors.border,
            borderWidth: 1,
          },
          text: { color: colors.foreground },
          pressed: { backgroundColor: colors.accent },
        } as const;
      case 'secondary':
        return {
          container: { backgroundColor: colors.secondary },
          text: { color: colors.secondaryForeground },
          pressed: { opacity: 0.8 },
        } as const;
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.foreground },
          pressed: { backgroundColor: colors.accent },
        } as const;
      case 'link':
        return {
          container: { backgroundColor: 'transparent' },
          text: {
            color: colors.humPrimary,
            textDecorationLine: 'underline',
          },
          pressed: { opacity: 0.8 },
        } as const;
      case 'default':
      default:
        return {
          container: { backgroundColor: colors.humPrimary },
          text: { color: colors.humPrimaryForeground },
          pressed: { opacity: 0.9 },
        } as const;
    }
  }, [variant, colors]);

  const sizeStyle = React.useMemo<ViewStyle>(() => {
    switch (size) {
      case 'sm':
        return {
          height: 32,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
        };
      case 'lg':
        return {
          height: 40,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.md,
        };
      case 'icon':
        return {
          width: 36,
          height: 36,
          borderRadius: radius.md,
        };
      case 'default':
      default:
        return {
          height: 36,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: radius.md,
        };
    }
  }, [size, spacing, radius]);

  const baseStyle = [
    styles.base,
    sizeStyle,
    variantStyle.container,
    { opacity: disabled ? 0.5 : 1 },
    style,
  ];

  const textStyles = [
    { fontSize: type.size.base, fontWeight: type.weight.medium },
    variantStyle.text,
    textStyle,
  ];

  const content =
    typeof children === 'string' ? (
      <Text style={textStyles}>{children}</Text>
    ) : (
      children
    );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(
      children as React.ReactElement<Record<string, unknown>>,
      {
        ...(props as Record<string, unknown>),
        disabled,
        style: [baseStyle, (children.props as Record<string, unknown>)?.style],
      },
    );
  }

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }: { pressed: boolean }) => [
        baseStyle,
        pressed && variantStyle.pressed,
      ]}
      {...props}
    >
      {content}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Button;
