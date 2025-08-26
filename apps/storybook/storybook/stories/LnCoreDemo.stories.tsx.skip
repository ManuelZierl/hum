import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import LnCore, {
  addPaymentUpdatedListener,
  LnInvoice,
  Payment,
} from '@mchat/ln-core';

const LnCoreDemo = () => {
  const [info, setInfo] = useState<{
    pubkey: string;
    alias: string;
    connected: boolean;
  } | null>(null);
  const [invoice, setInvoice] = useState<LnInvoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    LnCore.init({ network: 'testnet' }).then(() => {
      LnCore.nodeInfo().then(setInfo);
      LnCore.listPayments().then(setPayments);
    });
    const sub = addPaymentUpdatedListener((evt) => {
      setPayments((prev) =>
        prev.map((p) => (p.id === evt.id ? { ...p, status: evt.status } : p)),
      );
    });
    return () => sub.remove();
  }, []);

  const handleCreate = async () => {
    const inv = await LnCore.createInvoice({ amountSats: 1000, memo: 'demo' });
    setInvoice(inv);
    setPayments(await LnCore.listPayments());
  };

  const handlePay = async () => {
    if (!invoice) return;
    await LnCore.payInvoice(invoice.bolt11);
    setPayments(await LnCore.listPayments());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {info
          ? `Node ${info.alias} (${info.pubkey.slice(0, 8)}...)`
          : 'Initializing...'}
      </Text>
      <Button title="Create Invoice" onPress={handleCreate} />
      {invoice && (
        <>
          <Text selectable style={styles.invoice}>
            {invoice.bolt11}
          </Text>
          <Button title="Pay Invoice" onPress={handlePay} />
        </>
      )}
      <FlatList
        style={styles.list}
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{`${item.bolt11.slice(0, 10)}… - ${item.status}`}</Text>
        )}
      />
    </View>
  );
};

storiesOf('Lightning UI', module).add('LnCore Demo', () => <LnCoreDemo />);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { marginBottom: 8 },
  invoice: { marginVertical: 8 },
  list: { marginTop: 16 },
});
