import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const expectAny = expect as any;

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps,
} from './alert-dialog';
import { ThemeProvider } from './theme/theme-provider';
import { colors } from './theme/colors';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

function renderDialog(
  scheme: 'light' | 'dark' = 'light',
  props?: Partial<AlertDialogProps>,
) {
  return render(
    <ThemeProvider forcedScheme={scheme}>
      <AlertDialog {...props}>
        <AlertDialogTrigger>
          <Text>Open</Text>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <Text>Title</Text>
            </AlertDialogTitle>
            <AlertDialogDescription>
              <Text>Description</Text>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction>
              <Text>Ok</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ThemeProvider>,
  );
}

describe('AlertDialog', () => {
  it('renders closed by default', () => {
    const { baseElement } = renderDialog();
    expectAny(screen.queryByText('Title')).not.toBeInTheDocument();
    expectAny(baseElement).toMatchSnapshot();
  });

  it('opens on trigger press and calls onOpenChange', async () => {
    const onOpenChange = jest.fn();
    renderDialog('light', { onOpenChange });

    const trigger = screen.getByText('Open');
    fireEvent.click(trigger);
    await waitFor(() => expectAny(onOpenChange).toHaveBeenCalledWith(true));
    expectAny(screen.getByText('Title')).toBeInTheDocument();
  });

  it('applies theme colors', async () => {
    const { unmount } = renderDialog('light');
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() =>
      expectAny(
        screen.getByRole('heading', { name: 'Title' }),
      ).toBeInTheDocument(),
    );
    const lightTitle = screen.getByRole('heading', { name: 'Title' });
    expectAny(lightTitle).toHaveStyle({ color: colors.light.foreground });
    unmount();

    renderDialog('dark');
    fireEvent.click(screen.getByText('Open'));
    await waitFor(() =>
      expectAny(
        screen.getByRole('heading', { name: 'Title' }),
      ).toBeInTheDocument(),
    );
    const darkTitle = screen.getByRole('heading', { name: 'Title' });
    expectAny(darkTitle).toHaveStyle({ color: colors.dark.foreground });
  });
});
