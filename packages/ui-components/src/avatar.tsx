import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Image,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from './theme/ThemeProvider';

interface AvatarContextValue {
  loaded: boolean;
  setLoaded: (v: boolean) => void;
}
const AvatarCtx = createContext<AvatarContextValue | null>(null);
const useAvatarContext = () => {
  const ctx = useContext(AvatarCtx);
  if (!ctx) throw new Error('Avatar components must be used within Avatar');
  return ctx;
};

export interface AvatarProps extends PressableProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  style,
  children,
  testID,
  accessibilityRole,
  ...props
}) => {
  const [loaded, setLoaded] = useState(false);
  const value = useMemo(() => ({ loaded, setLoaded }), [loaded]);
  return (
    <AvatarCtx.Provider value={value}>
      <Pressable
        accessibilityRole={
          accessibilityRole ?? (props.onPress ? 'button' : 'image')
        }
        style={[
          styles.root,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
        {...(testID ? { testID, 'data-testid': testID } : {})}
        {...props}
      >
        {children}
      </Pressable>
    </AvatarCtx.Provider>
  );
};

export interface AvatarImageProps
  extends Omit<React.ComponentProps<typeof Image>, 'style'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: StyleProp<any>;
  testID?: string;
}

export const AvatarImage: React.FC<AvatarImageProps> = ({
  style,
  testID,
  ...props
}) => {
  const { setLoaded } = useAvatarContext();
  return (
    <Image
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
      style={[styles.image, style]}
      {...(testID ? { testID, 'data-testid': testID } : {})}
      {...props}
    />
  );
};

export interface AvatarFallbackProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({
  children,
  style,
  textStyle,
  testID,
  ...props
}) => {
  const { colors, type } = useTheme();
  const { loaded } = useAvatarContext();
  if (loaded) return null;
  return (
    <View
      style={[styles.fallback, { backgroundColor: colors.muted }, style]}
      {...(testID ? { testID, 'data-testid': testID } : {})}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.fallbackText,
            {
              color: colors.mutedForeground,
              fontSize: type.size.md,
              fontWeight: type.weight.medium,
            },
            textStyle,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    textAlign: 'center',
  },
});

export { Avatar as default };
