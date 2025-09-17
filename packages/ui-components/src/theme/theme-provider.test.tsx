import React from 'react';
import { render } from '@testing-library/react';

import { ThemeProvider, useTheme } from './theme-provider';
import { colors } from './colors';

const TestComponent: React.FC<{
  onRender: (value: ReturnType<typeof useTheme>) => void;
}> = ({ onRender }) => {
  const value = useTheme();
  React.useEffect(() => {
    onRender(value);
  }, [onRender, value]);
  return null;
};

describe('ThemeProvider', () => {
  it('provides light theme when forced', () => {
    const spy = jest.fn();
    render(
      <ThemeProvider forcedScheme="light">
        <TestComponent onRender={spy} />
      </ThemeProvider>,
    );
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.at(-1)?.[0].colors).toBe(colors.light);
  });

  it('provides dark theme when forced', () => {
    const spy = jest.fn();
    render(
      <ThemeProvider forcedScheme="dark">
        <TestComponent onRender={spy} />
      </ThemeProvider>,
    );
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.at(-1)?.[0].colors).toBe(colors.dark);
  });

  it('throws when used outside of ThemeProvider', () => {
    const renderOutside = () => render(<TestComponent onRender={() => {}} />);
    expect(renderOutside).toThrow('useTheme must be used within ThemeProvider');
  });
});
