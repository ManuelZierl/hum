import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

interface RequestPaymentMockProps {
  onInvoice?: (invoice: string) => void;
}

export const RequestPaymentMock: React.FC<RequestPaymentMockProps> = ({ onInvoice }) => {
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [invoice, setInvoice] = useState<string | null>(null);

  const handleCreate = () => {
    const memoSanitized = memo.toLowerCase().replace(/[^02-9ac-hj-np-z]/g, '') || 'qq';
    const amt = amount.replace(/[^0-9]/g, '');
    const inv = `lnbc${amt}1${memoSanitized}`;
    setInvoice(inv);
    onInvoice?.(inv);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Request Lightning Payment (mock)</Text>
      <Text>Amount (sats)</Text>
      <TextInput
        accessibilityLabel="Amount (sats)"
        keyboardType="numeric"
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
      />
      <Text>Memo</Text>
      <TextInput
        accessibilityLabel="Memo"
        style={styles.input}
        value={memo}
        onChangeText={setMemo}
      />
      <Button title="Generate" onPress={handleCreate} />
      {invoice && (
        <Text selectable style={styles.invoice}>{invoice}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  title: {
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 4,
    marginBottom: 12,
  },
  invoice: {
    marginTop: 12,
    fontSize: 12,
  },
});

export default RequestPaymentMock;
