import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@hum/ui-components';
import { colors } from '../../ui-components/src/theme/colors';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@expo/vector-icons', () => ({
  Feather: () => null,
}));
import { TopBar, type TopBarProps } from './TopBar';

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderTopBar(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<TopBarProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <TopBar {...props} />
    </ThemeProvider>,
  );
}

describe('TopBar', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderTopBar();
    expect(toJSON()).toMatchSnapshot();
  });

  it('handles button presses', () => {
    const more = jest.fn();
    const camera = jest.fn();
    const add = jest.fn();
    renderTopBar('light', {
      onMorePress: more,
      onCameraPress: camera,
      onAddPress: add,
    });
    fireEvent.press(screen.getByLabelText('More options'));
    fireEvent.press(screen.getByLabelText('Open camera'));
    fireEvent.press(screen.getByLabelText('Add'));
    expect(more).toHaveBeenCalled();
    expect(camera).toHaveBeenCalled();
    expect(add).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount, toJSON } = renderTopBar('light');
    const root = toJSON() as { props: { style: Record<string, unknown> } };
    expect(root.props.style).toMatchObject({
      backgroundColor: hexToRgba(colors.light.background),
    });
    unmount();
    const darkRender = renderTopBar('dark');
    const darkRoot = darkRender.toJSON() as {
      props: { style: Record<string, unknown> };
    };
    expect(darkRoot.props.style).toMatchObject({
      backgroundColor: hexToRgba(colors.dark.background),
    });
  });
});
