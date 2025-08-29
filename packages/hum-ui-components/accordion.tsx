/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import * as RN from 'react-native';

const { View, Text, Pressable, StyleSheet, useColorScheme } = RN as any;

// Minimal style type placeholders to avoid requiring full react-native typings
type StyleProp = any;

export type AccordionValue = string | string[];

export interface AccordionProps {
  /**
   * Currently opened item(s).
   * If `type` is `single`, use a string. If `multiple`, use an array of strings.
   */
  value?: AccordionValue;
  /**
   * Callback when item is toggled.
   */
  onValueChange?: (value: AccordionValue) => void;
  /**
   * Allow multiple items to be expanded.
   */
  type?: 'single' | 'multiple';
  children: React.ReactNode;
  style?: StyleProp;
}

interface AccordionItemInternalProps {
  openValues?: string[];
  onToggle?: (value: string) => void;
  type?: 'single' | 'multiple';
}

export interface AccordionItemProps {
  value: string;
  children: React.ReactNode;
  style?: StyleProp;
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  style?: StyleProp;
  textStyle?: StyleProp;
}

export interface AccordionContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  style?: StyleProp;
}

/**
 * Root accordion component providing open state to items.
 */
export function Accordion({
  value,
  onValueChange,
  type = 'single',
  children,
  style,
}: AccordionProps) {
  const values = value ? (Array.isArray(value) ? value : [value]) : [];

  const handleToggle = (val: string) => {
    const isOpen = values.includes(val);
    let next: string[];
    if (type === 'multiple') {
      next = isOpen ? values.filter((v) => v !== val) : [...values, val];
      onValueChange?.(next);
    } else {
      next = isOpen ? [] : [val];
      onValueChange?.(next[0] ?? '');
    }
  };

  const rendered = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(
      child as any,
      {
        openValues: values,
        onToggle: handleToggle,
        type,
      } as any,
    );
  });

  return <View style={style}>{rendered}</View>;
}

const lightColors = {
  border: '#e5e5e5',
  text: '#000000',
};
const darkColors = {
  border: '#333333',
  text: '#ffffff',
};

/**
 * Item wrapper that knows its own open state.
 */
export function AccordionItem({
  value,
  children,
  style,
  openValues = [],
  onToggle = () => {},
}: AccordionItemProps & AccordionItemInternalProps) {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const isOpen = openValues.includes(value);

  const rendered = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;
    return React.cloneElement(child as React.ReactElement<any>, {
      isOpen,
      onToggle: () => onToggle(value),
      textColor: colors.text,
    });
  });

  return (
    <View style={[styles.item, { borderColor: colors.border }, style]}>
      {rendered}
    </View>
  );
}

/**
 * Pressable trigger to open/close the item.
 */
export function AccordionTrigger({
  children,
  isOpen = false,
  onToggle = () => {},
  style,
  textStyle,
  textColor,
}: AccordionTriggerProps & { textColor?: string }) {
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.trigger, style]}
      accessibilityRole="button"
      accessibilityState={{ expanded: isOpen }}
    >
      <View style={styles.triggerRow}>
        {typeof children === 'string' ? (
          <Text style={[styles.triggerText, { color: textColor }, textStyle]}>
            {children}
          </Text>
        ) : (
          children
        )}
        <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>⌄</Text>
      </View>
    </Pressable>
  );
}

/**
 * Content shown when the item is open.
 */
export function AccordionContent({
  children,
  isOpen = false,
  style,
}: AccordionContentProps) {
  if (!isOpen) return null;
  return <View style={[styles.content, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  trigger: {
    paddingVertical: 12,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 16,
    color: '#FECA1A',
    transform: [{ rotate: '0deg' }],
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    paddingBottom: 16,
  },
});

export default Accordion;
