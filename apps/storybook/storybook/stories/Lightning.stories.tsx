import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ThemeProvider } from '@mchat/ui-tokens';
import { LightningBolt } from '@mchat/lightning-ui';

storiesOf('Lightning UI', module).add('LightningBolt', () => (
  <ThemeProvider>
    <LightningBolt label="Bolt" />
  </ThemeProvider>
));
