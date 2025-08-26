import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ThemeProvider } from '@mchat/ui-tokens';
import { MessageBubble } from '@mchat/message-ui';

storiesOf('Message UI', module).add('MessageBubble', () => (
  <ThemeProvider>
    <MessageBubble sender="me" text="Hello world" timestamp="09:41" status="sent" />
  </ThemeProvider>
));
