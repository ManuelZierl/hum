import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { detectPaymentStrings } from './detect';
import PaymentSheet from './PaymentSheet';

interface HighlightLightningTextProps {
  text: string;
}

export const HighlightLightningText: React.FC<HighlightLightningTextProps> = ({ text }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const matches = detectPaymentStrings(text);
  let cursor = 0;
  const elements: React.ReactNode[] = [];

  const occurrences = matches.map((m) => {
    const index = text.indexOf(m.value, cursor);
    const occurrence = { ...m, index };
    if (index >= 0) {
      cursor = index + m.value.length;
    }
    return occurrence;
  });
  occurrences.sort((a, b) => a.index - b.index);

  cursor = 0;
  occurrences.forEach((m, i) => {
    if (m.index > cursor) {
      elements.push(<Text key={`t-${i}`}>{text.slice(cursor, m.index)}</Text>);
    }
    elements.push(
      <TouchableOpacity
        key={`c-${i}`}
        onPress={() => setSelected(m.value)}
        style={styles.chip}
        accessibilityRole="button"
      >
        <Text style={styles.chipText}>{m.value}</Text>
      </TouchableOpacity>
    );
    cursor = m.index + m.value.length;
  });
  if (cursor < text.length) {
    elements.push(<Text key="tail">{text.slice(cursor)}</Text>);
  }

  return (
    <>
      <Text>{elements}</Text>
      {selected && (
        <PaymentSheet
          visible={true}
          invoice={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#e0f7ff',
    paddingHorizontal: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  chipText: {
    color: '#0366d6',
  },
});

export default HighlightLightningText;
