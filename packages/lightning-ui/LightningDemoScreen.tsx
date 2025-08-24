import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import HighlightLightningText from './HighlightLightningText';
import RequestPaymentMock from './RequestPaymentMock';

export const LightningDemoScreen: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([
    'Pay me at lnbc2501hello for lunch.',
    'Try this LNURL: lnurl1dp68gurn8ghj7ctsdyhxyctwv96kx.',
    'Or a lightning URI lightning:lnbc501testmemo.',
  ]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {messages.map((m, i) => (
        <View key={i} style={styles.message}>
          <HighlightLightningText text={m} />
        </View>
      ))}
      <RequestPaymentMock onInvoice={(inv) => setMessages([...messages, inv])} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  message: {
    marginBottom: 16,
  },
});

export default LightningDemoScreen;
