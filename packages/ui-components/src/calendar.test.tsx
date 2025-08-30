import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';

import { Calendar, type CalendarProps } from './calendar';
import { ThemeProvider } from './theme/ThemeProvider';

// Temporary workaround for missing Jest Native matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

function renderCalendar(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<CalendarProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <Calendar {...props} />
    </ThemeProvider>,
  );
}

describe('Calendar', () => {
  it('renders default state and matches snapshot', () => {
    const { toJSON } = renderCalendar();
    expectAny(toJSON()).toMatchSnapshot();
  });

  it('selects a day and triggers onSelect', () => {
    const onSelect = jest.fn();
    renderCalendar('light', { onSelect });
    const day = screen.getByLabelText('Select 15');
    fireEvent.press(day);
    expectAny(onSelect).toHaveBeenCalled();
  });

  it('supports range selection', () => {
    const onSelect = jest.fn();
    renderCalendar('light', { mode: 'range', onSelect });
    fireEvent.press(screen.getByLabelText('Select 10'));
    fireEvent.press(screen.getByLabelText('Select 12'));
    expectAny(onSelect).toHaveBeenCalledTimes(2);
  });

  it('exposes navigation buttons for accessibility', () => {
    renderCalendar();
    expectAny(screen.getByLabelText('Previous month')).toBeOnTheScreen();
    expectAny(screen.getByLabelText('Next month')).toBeOnTheScreen();
  });

  it('applies theme colors', () => {
    const { toJSON, unmount } = renderCalendar('light');
    const lightTree = JSON.stringify(toJSON());
    unmount();
    const { toJSON: toJSONDark } = renderCalendar('dark');
    const darkTree = JSON.stringify(toJSONDark());
    expectAny(lightTree).not.toEqual(darkTree);
  });
});
