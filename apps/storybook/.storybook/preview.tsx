import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from '@hum/ui-components';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ThemeProvider forcedScheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
};
export default preview;
