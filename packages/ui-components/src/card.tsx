import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

export interface CardProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { colors, radius } = useTheme();
  return (
    <View
      accessibilityRole="summary"
      testID={testID}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: radius.xl,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export interface CardHeaderProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  testID?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { spacing } = useTheme();
  const childrenArray = React.Children.toArray(
    children,
  ) as React.ReactElement[];
  const actionChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === CardAction,
  );
  const contentChildren = childrenArray.filter(
    (child) => child !== actionChild,
  );

  return (
    <View
      testID={testID}
      style={[
        styles.header,
        { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
        style,
      ]}
      {...props}
    >
      <View style={styles.headerContent}>{contentChildren}</View>
      {actionChild}
    </View>
  );
};

export interface CardTitleProps extends React.ComponentProps<typeof Text> {
  style?: StyleProp<TextStyle>;
  testID?: string;
  children?: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { colors, type } = useTheme();
  return (
    <Text
      testID={testID}
      accessibilityRole="header"
      style={[
        styles.title,
        {
          color: colors.cardForeground,
          fontSize: type.size.lg,
          fontWeight: type.weight.bold,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

export interface CardDescriptionProps
  extends React.ComponentProps<typeof Text> {
  style?: StyleProp<TextStyle>;
  testID?: string;
  children?: React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { colors, type } = useTheme();
  return (
    <Text
      testID={testID}
      style={[
        styles.description,
        {
          color: colors.mutedForeground,
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

export interface CardActionProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: React.ReactNode;
}

export const CardAction: React.FC<CardActionProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  return (
    <View testID={testID} style={[styles.action, style]} {...props}>
      {children}
    </View>
  );
};

export interface CardContentProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { spacing } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

export interface CardFooterProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
  children?: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  style,
  children,
  testID,
  ...props
}) => {
  const { spacing } = useTheme();
  return (
    <View
      testID={testID}
      style={[
        styles.footer,
        { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginTop: 2,
  },
  action: {
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
export default Card;
