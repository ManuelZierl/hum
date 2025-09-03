import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
// Temporary workaround for missing Jest DOM matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
} from './accordion';
import { ThemeProvider } from './theme/theme-provider';
import { colors } from './theme/colors';

function renderAccordion(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AccordionProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Accordion {...props}>
        <AccordionItem value="item1">
          {/* eslint-disable-next-line react-native/no-raw-text */}
          <AccordionTrigger testID="trigger1">Trigger</AccordionTrigger>
          <AccordionContent testID="content1">
            <Text>Content</Text>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ThemeProvider>,
  );
}

describe('Accordion (RTL)', () => {
  it('renders closed by default', () => {
    const { baseElement } = renderAccordion();
    expectAny(screen.queryByTestId('content1')).not.toBeInTheDocument();
    // Keep a light snapshot of the initial DOM if you want parity with the old test
    expectAny(baseElement).toMatchSnapshot();
  });

  it('opens on press and calls onValueChange', () => {
    const onValueChange = jest.fn();
    renderAccordion('light', { onValueChange });

    // RN Web maps Pressable with accessibilityRole="button" to a DOM button role
    const trigger = screen.getByTestId('trigger1');
    // Before click: content is not there
    expectAny(screen.queryByTestId('content1')).not.toBeInTheDocument();

    // Fire a click on the trigger
    fireEvent.click(trigger);

    // Callback and content should be present
    expectAny(onValueChange).toHaveBeenCalledWith('item1');
    expectAny(screen.getByTestId('content1')).toBeInTheDocument();

    // Role sanity check — getByRole should also find it
    expectAny(
      screen.getByRole('button', { name: /trigger/i }),
    ).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    // LIGHT
    const { unmount } = renderAccordion('light');
    const lightText = screen.getByText('Trigger');
    // RN Web inlines styles; jest-dom can assert them
    expectAny(lightText).toHaveStyle({ color: colors.light.foreground });
    unmount();

    // DARK
    renderAccordion('dark');
    const darkText = screen.getByText('Trigger');
    expectAny(darkText).toHaveStyle({ color: colors.dark.foreground });
  });
});
