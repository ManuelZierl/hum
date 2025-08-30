import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  type AccordionProps,
} from './accordion';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

function renderAccordion(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AccordionProps>,
) {
  return render(
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

describe('Accordion (RTL)', () => {
  it('renders closed by default', () => {
    const { baseElement } = renderAccordion();
    expect(screen.queryByTestId('content1')).not.toBeInTheDocument();
    // Keep a light snapshot of the initial DOM if you want parity with the old test
    expect(baseElement).toMatchSnapshot();
  });

  it('opens on press and calls onValueChange', () => {
    const onValueChange = jest.fn();
    renderAccordion('light', { onValueChange });

    // RN Web maps Pressable with accessibilityRole="button" to a DOM button role
    const trigger = screen.getByTestId('trigger1');
    // Before click: content is not there
    expect(screen.queryByTestId('content1')).not.toBeInTheDocument();

    // Fire a click on the trigger
    fireEvent.click(trigger);

    // Callback and content should be present
    expect(onValueChange).toHaveBeenCalledWith('item1');
    expect(screen.getByTestId('content1')).toBeInTheDocument();

    // Role sanity check — getByRole should also find it
    expect(
      screen.getByRole('button', { name: /trigger/i }),
    ).toBeInTheDocument();
  });

  it('applies theme colors', () => {
    // LIGHT
    const { unmount } = renderAccordion('light');
    const lightText = screen.getByText('Trigger');
    // RN Web inlines styles; jest-dom can assert them
    expect(lightText).toHaveStyle({ color: colors.light.foreground });
    unmount();

    // DARK
    renderAccordion('dark');
    const darkText = screen.getByText('Trigger');
    expect(darkText).toHaveStyle({ color: colors.dark.foreground });
  });
});
