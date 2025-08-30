import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import '@testing-library/jest-native/extend-expect';
// Temporary workaround for missing Jest Native matcher typings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from './breadcrumb';
import { ThemeProvider } from './theme/ThemeProvider';
import { colors } from './theme/colors';

const hexToRgba = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},1.00)`;
};

function renderBreadcrumb(scheme: 'light' | 'dark' = 'light') {
  const onPress = jest.fn();
  const result = render(
    <ThemeProvider forcedScheme={scheme}>
      <Breadcrumb accessibilityLabel="breadcrumb" testID="nav">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onPress={onPress} accessibilityLabel="home">
              <Text>Home</Text>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage accessibilityLabel="current">
              <Text>Library</Text>
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </ThemeProvider>,
  );
  return { onPress, ...result };
}

describe('Breadcrumb', () => {
  it('renders and matches snapshot', () => {
    const { toJSON } = renderBreadcrumb();
    expectAny(toJSON()).toMatchSnapshot();
  });

  it('handles press events', () => {
    const { onPress } = renderBreadcrumb();
    fireEvent.press(screen.getByLabelText('home'));
    expectAny(onPress).toHaveBeenCalled();
  });

  it('applies theme colors', () => {
    const { unmount } = renderBreadcrumb('light');
    expectAny(screen.getByLabelText('current')).toHaveStyle({
      color: hexToRgba(colors.light.foreground),
    });
    unmount();
    renderBreadcrumb('dark');
    expectAny(screen.getByLabelText('current')).toHaveStyle({
      color: hexToRgba(colors.dark.foreground),
    });
  });

  it('supports accessibility props', () => {
    renderBreadcrumb();
    expectAny(screen.getByLabelText('home')).toBeTruthy();
  });

  it('renders ellipsis with label', () => {
    render(
      <ThemeProvider forcedScheme="light">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis accessibilityLabel="more" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </ThemeProvider>,
    );
    expectAny(screen.getByLabelText('more')).toBeTruthy();
  });
});
