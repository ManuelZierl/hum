import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionProps,
} from './accordion';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

function renderAccordion(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AccordionProps>,
) {
  return renderer.create(
    <ThemeProvider forcedScheme={scheme}>
      <Accordion {...props}>
        <AccordionItem value="item1">
          <AccordionTrigger testID="trigger1">
            <Text>Trigger</Text>
          </AccordionTrigger>
          <AccordionContent testID="content1">
            <Text>Content</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ThemeProvider>,
  );
}

describe('Accordion', () => {
  it('renders closed by default', () => {
    const tree = renderAccordion();
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it('opens on press and calls onValueChange', () => {
    const onValueChange = jest.fn();
    const tree = renderAccordion('light', { onValueChange });
    const trigger = tree.root.findByProps({ testID: 'trigger1' });
    expect(() => tree.root.findByProps({ testID: 'content1' })).toThrow();
    act(() => trigger.props.onPress());
    expect(onValueChange).toHaveBeenCalledWith('item1');
    expect(tree.root.findByProps({ testID: 'content1' })).toBeTruthy();
    expect(trigger.props.accessibilityRole).toBe('button');
  });

  it('applies theme colors', () => {
    const light = renderAccordion('light');
    const lightStyle = light.root.findByProps({ children: 'Trigger' }).props
      .style;
    const lightColor = Array.isArray(lightStyle)
      ? lightStyle[0].color
      : lightStyle.color;
    expect(lightColor).toBe(colors.light.foreground);

    const dark = renderAccordion('dark');
    const darkStyle = dark.root.findByProps({ children: 'Trigger' }).props
      .style;
    const darkColor = Array.isArray(darkStyle)
      ? darkStyle[0].color
      : darkStyle.color;
    expect(darkColor).toBe(colors.dark.foreground);
  });
});
