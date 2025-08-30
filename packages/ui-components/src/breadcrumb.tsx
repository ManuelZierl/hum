/* eslint-disable react/prop-types */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewProps,
  TextProps,
  PressableProps,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export type BreadcrumbProps = ViewProps;

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ style, ...props }) => (
  <View accessibilityLabel="breadcrumb" style={style} {...props} />
);

export type BreadcrumbListProps = ViewProps;
export const BreadcrumbList: React.FC<BreadcrumbListProps> = ({
  style,
  ...props
}) => {
  return <View style={[styles.list, style]} {...props} />;
};

export type BreadcrumbItemProps = ViewProps;
export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  style,
  ...props
}) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[styles.item, { marginRight: spacing.xs }, style]}
      {...props}
    />
  );
};

export interface BreadcrumbLinkProps extends Omit<PressableProps, 'children'> {
  asChild?: boolean;
  textStyle?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
  asChild,
  children,
  textStyle,
  style,
  ...props
}) => {
  const { colors, type } = useTheme();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, props);
  }

  return (
    <Pressable accessibilityRole="link" style={style} {...props}>
      {({ pressed }: { pressed: boolean }) =>
        typeof children === 'string' ? (
          <Text
            style={[
              styles.linkText,
              {
                color: pressed ? colors.foreground : colors.humPrimary,
                fontSize: type.size.sm,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
        ) : (
          children
        )
      }
    </Pressable>
  );
};

export type BreadcrumbPageProps = TextProps;
export const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({
  style,
  ...props
}) => {
  const { colors, type } = useTheme();
  return (
    <Text
      accessibilityRole="text"
      accessibilityState={{ disabled: true }}
      style={[
        {
          color: colors.foreground,
          fontSize: type.size.sm,
          fontWeight: type.weight.normal,
        },
        style,
      ]}
      {...props}
    />
  );
};

export type BreadcrumbSeparatorProps = TextProps;
export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({
  children,
  style,
  ...props
}) => {
  const { colors, type, spacing } = useTheme();
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[
        {
          color: colors.mutedForeground,
          marginHorizontal: spacing.xs,
          fontSize: type.size.sm,
        },
        style,
      ]}
      {...props}
    >
      {children ?? '›'}
    </Text>
  );
};

export type BreadcrumbEllipsisProps = TextProps;
export const BreadcrumbEllipsis: React.FC<BreadcrumbEllipsisProps> = ({
  style,
  ...props
}) => {
  const { colors, type, spacing } = useTheme();
  return (
    <Text
      accessibilityLabel="More"
      style={[
        {
          color: colors.mutedForeground,
          marginHorizontal: spacing.xs,
          fontSize: type.size.sm,
        },
        style,
      ]}
      {...props}
    >
      …
    </Text>
  );
};

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    textDecorationLine: 'none',
  },
});

export default Breadcrumb;
