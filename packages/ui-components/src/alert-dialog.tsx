import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewProps,
  TextProps,
  PressableProps,
  GestureResponderEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme/ThemeProvider';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

const useAlertDialog = () => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx)
    throw new Error('AlertDialog components must be used within AlertDialog');
  return ctx;
};

export interface AlertDialogProps {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = (next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  };

  return (
    <AlertDialogContext.Provider value={{ open: currentOpen, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
};

export const AlertDialogTrigger: React.FC<
  PressableProps & { children: ReactNode }
> = ({ children, onPress, ...props }) => {
  const { setOpen } = useAlertDialog();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(e: GestureResponderEvent) => {
        setOpen(true);
        onPress?.(e);
      }}
      {...props}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  );
};

export const AlertDialogPortal: React.FC<{ children: ReactNode }> = ({
  children,
}) => <>{children}</>;

export const AlertDialogOverlay: React.FC<PressableProps> = ({
  style,
  ...props
}) => (
  <Pressable
    style={[StyleSheet.absoluteFillObject, styles.overlay, style]}
    {...props}
  />
);

export interface AlertDialogContentProps extends ViewProps {
  children: ReactNode;
}

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  children,
  style,
  ...props
}) => {
  const { open, setOpen } = useAlertDialog();
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View
        style={[
          styles.modal,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <AlertDialogOverlay onPress={() => setOpen(false)} />
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: radius.lg,
              padding: spacing.lg,
            },
            style,
          ]}
          accessibilityRole="alert"
          {...props}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};

export const AlertDialogHeader: React.FC<ViewProps> = ({ style, ...props }) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[styles.header, { marginBottom: spacing.md }, style]}
      {...props}
    />
  );
};

export const AlertDialogFooter: React.FC<ViewProps> = ({ style, ...props }) => {
  const { spacing } = useTheme();
  return (
    <View
      style={[styles.footer, { marginTop: spacing.lg }, style]}
      {...props}
    />
  );
};

export const AlertDialogTitle: React.FC<TextProps> = ({ style, ...props }) => {
  const { colors, type } = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[
        styles.title,
        {
          color: colors.foreground,
          fontSize: type.size.lg,
          fontWeight: type.weight.bold,
        },
        style,
      ]}
      {...props}
    />
  );
};

export const AlertDialogDescription: React.FC<TextProps> = ({
  style,
  ...props
}) => {
  const { colors, type } = useTheme();
  return (
    <Text
      style={[
        styles.description,
        { color: colors.mutedForeground, fontSize: type.size.sm },
        style,
      ]}
      {...props}
    />
  );
};

export const AlertDialogAction: React.FC<
  PressableProps & { children: ReactNode }
> = ({ children, style, onPress, ...props }) => {
  const { colors, spacing, radius, type } = useTheme();
  const { setOpen } = useAlertDialog();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(e: GestureResponderEvent) => {
        setOpen(false);
        onPress?.(e);
      }}
      style={[
        styles.button,
        {
          backgroundColor: colors.humPrimary,
          borderColor: colors.humPrimary,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            color: colors.humPrimaryForeground,
            fontSize: type.size.md,
            fontWeight: type.weight.medium,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

export const AlertDialogCancel: React.FC<
  PressableProps & { children: ReactNode }
> = ({ children, style, onPress, ...props }) => {
  const { colors, spacing, radius, type } = useTheme();
  const { setOpen } = useAlertDialog();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={(e: GestureResponderEvent) => {
        setOpen(false);
        onPress?.(e);
      }}
      style={[
        styles.button,
        styles.cancelButton,
        {
          borderColor: colors.border,
          borderRadius: radius.md,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
        },
        style,
      ]}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            color: colors.foreground,
            fontSize: type.size.md,
            fontWeight: type.weight.medium,
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    borderWidth: 1,
    maxWidth: 420,
    width: '90%',
  },
  header: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  title: {
    textAlign: 'left',
  },
  description: {
    marginTop: 4,
  },
  button: {
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
});

export default AlertDialog;
