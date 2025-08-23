import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList } from 'react-native';
import LnCore, { addPaymentUpdatedListener, LnInvoice, Payment } from '../../native/ln-core';

const LnCoreDemoScreen: React.FC = () => {
  const [info, setInfo] = useState<{ pubkey: string; alias: string; connected: boolean } | null>(null);
  const [invoice, setInvoice] = useState<LnInvoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    LnCore.init({ network: 'testnet' }).then(() => {
      LnCore.nodeInfo().then(setInfo);
      LnCore.listPayments().then(setPayments);
    });
    const sub = addPaymentUpdatedListener((evt) => {
      setPayments((prev) => prev.map((p) => (p.id === evt.id ? { ...p, status: evt.status } : p)));
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
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ marginBottom: 8 }}>
        {info ? `Node ${info.alias} (${info.pubkey.slice(0, 8)}...)` : 'Initializing...'}
      </Text>
      <Button title="Create Invoice" onPress={handleCreate} />
      {invoice && (
        <>
          <Text selectable style={{ marginVertical: 8 }}>{invoice.bolt11}</Text>
          <Button title="Pay Invoice" onPress={handlePay} />
        </>
      )}
      <FlatList
        style={{ marginTop: 16 }}
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text>{`${item.bolt11.slice(0, 10)}… - ${item.status}`}</Text>
        )}
      />
    </View>
  );
};

export default LnCoreDemoScreen;
