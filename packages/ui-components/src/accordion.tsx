import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ViewProps,
  PressableProps,
} from 'react-native';
import { useTheme } from './theme/theme-provider';

// Accordion Context
interface AccordionContextValue {
  type: 'single' | 'multiple';
  openItems: string[];
  toggleItem: (value: string) => void;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);

const useAccordion = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx)
    throw new Error('Accordion components must be used within Accordion');
  return ctx;
};

// Accordion Item Context
interface AccordionItemContextValue {
  value: string;
}
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
);
const useAccordionItem = () => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx)
    throw new Error(
      'AccordionItem components must be used within AccordionItem',
    );
  return ctx;
};

export interface AccordionProps {
  children: ReactNode;
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[] | undefined) => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  children,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
}) => {
  const isControlled = value !== undefined;
  const normalize = (val?: string | string[]) =>
    val === undefined ? [] : Array.isArray(val) ? val : [val];
  const [internal, setInternal] = useState<string[]>(() =>
    isControlled ? normalize(value) : normalize(defaultValue),
  );
  const openItems = isControlled ? normalize(value) : internal;

  const setOpenItems = (next: string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(type === 'single' ? next[0] : next);
  };

  const toggleItem = (val: string) => {
    const isOpen = openItems.includes(val);
    let next: string[];
    if (type === 'single') {
      next = isOpen ? [] : [val];
    } else {
      next = isOpen ? openItems.filter((v) => v !== val) : [...openItems, val];
    }
    setOpenItems(next);
  };

  return (
    <AccordionContext.Provider value={{ type, openItems, toggleItem }}>
      {children}
    </AccordionContext.Provider>
  );
};

export interface AccordionItemProps extends ViewProps {
  value: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
  value,
  children,
  style,
  testID,
  ...props
}) => {
  const { colors } = useTheme();
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <View
        style={[styles.item, { borderColor: colors.border }, style]}
        testID={testID}
        {...props}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
};

export interface AccordionTriggerProps extends PressableProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  style,
  textStyle,
  disabled,
  testID,
  ...props
}) => {
  const { colors, spacing, type } = useTheme();
  const { openItems, toggleItem } = useAccordion();
  const { value } = useAccordionItem();
  const isOpen = openItems.includes(value);

  const rotation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(rotation, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen, rotation]);

  const iconStyle = {
    transform: [
      {
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };

  const dynamicStyle = React.useMemo(
    () => ({ paddingVertical: spacing.lg, opacity: disabled ? 0.5 : 1 }),
    [spacing.lg, disabled],
  );

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => toggleItem(value)}
      disabled={disabled}
      testID={testID}
      style={[styles.trigger, dynamicStyle, style]}
      {...props}
    >
      <View style={styles.triggerContent}>
        {typeof children === 'string' ? (
          <Text
            style={[
              styles.triggerText,
              {
                color: colors.foreground,
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
      <Animated.Text
        style={[styles.icon, { color: colors.mutedForeground }, iconStyle]}
      >
        ⌄
      </Animated.Text>
    </Pressable>
  );
};

export interface AccordionContentProps extends ViewProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  style,
  testID,
  ...props
}) => {
  const { spacing } = useTheme();
  const { openItems } = useAccordion();
  const { value } = useAccordionItem();
  const isOpen = openItems.includes(value);

  if (!isOpen) return null;

  return (
    <View
      style={[{ paddingBottom: spacing.md }, style]}
      testID={testID}
      {...props}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerContent: {
    flex: 1,
  },
  triggerText: {
    textAlign: 'left',
  },
  icon: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default Accordion;
