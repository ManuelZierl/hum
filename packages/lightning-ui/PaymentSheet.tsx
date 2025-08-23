import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Share,
  ScrollView,
} from 'react-native';
// Clipboard has been moved out of core, but for demo purposes we keep a simple
// reference that works in the RN environment without additional deps.
// @ts-ignore
import { Clipboard } from 'react-native';
import { normalizeInvoice } from './detect';

declare const process: any;

interface ParsedInvoice {
  amountSat?: number;
  memo?: string;
}

function parseInvoice(invoice: string): ParsedInvoice {
  const normalized = normalizeInvoice(invoice);
  const match = normalized.match(/^ln[a-z]{2}(\d*)1([02-9ac-hj-np-z]+)$/i);
  const amount = match && match[1] ? Number(match[1]) : undefined;
  const memo = match && match[2] ? match[2] : undefined;
  return { amountSat: amount, memo };
}

export interface PaymentSheetProps {
  visible: boolean;
  invoice: string;
  onClose: () => void;
}

export const PaymentSheet: React.FC<PaymentSheetProps> = ({
  visible,
  invoice,
  onClose,
}) => {
  const { amountSat, memo } = parseInvoice(invoice);
  const normalized = normalizeInvoice(invoice);

  const prefixes = (typeof process !== 'undefined'
    ? process.env?.LIGHTNING_DEEP_LINK_SCHEME_PREFIXES
    : undefined);
  const schemePrefixes = prefixes
    ? prefixes.split(',').map((s: string) => s.trim()).filter(Boolean)
    : ['lightning:'];

  const handlePay = async () => {
    for (const prefix of schemePrefixes) {
      const url = `${prefix}${normalized}`;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        Linking.openURL(url);
        return;
      }
    }
    Linking.openURL(`lightning:${normalized}`);
  };

  const handleCopy = () => {
    if (typeof Clipboard?.setString === 'function') {
      Clipboard.setString(invoice);
    }
  };

  const handleShare = () => {
    Share.share({ message: invoice });
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Pay Lightning Invoice</Text>
          <ScrollView style={styles.invoiceContainer}>
            <Text selectable style={styles.invoiceText}>
              {invoice}
            </Text>
          </ScrollView>
          <Text style={styles.label}>
            Amount (sats):{' '}
            {typeof amountSat === 'number' ? amountSat : 'Amount set by wallet'}
          </Text>
          {memo ? (
            <Text style={styles.label}>Memo: {memo}</Text>
          ) : null}
          <View style={styles.actions}>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={() => handlePay()}
            >
              <Text style={styles.actionText}>Pay with Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={handleCopy}
            >
              <Text style={styles.actionText}>Copy Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  invoiceContainer: {
    maxHeight: 100,
    marginBottom: 12,
  },
  invoiceText: {
    fontSize: 12,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    fontSize: 14,
  },
});

export default PaymentSheet;
