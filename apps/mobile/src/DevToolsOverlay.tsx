import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Button } from '@hum/ui-components';

type Props = {
  onOpenDev: () => void;
  onSelectLanguage: (lang: string) => void;
};

export function DevToolsOverlay({ onOpenDev, onSelectLanguage }: Props) {
  return (
    <View style={styles.wrapper}>
      <View
        style={styles.devEntry}
        testID="btnOpenDev"
        onTouchEnd={onOpenDev}
      />
      <View style={styles.langRow}>
        <Button size="sm" onPress={() => onSelectLanguage('en')} testID="btnEn">
          <Text>EN</Text>
        </Button>
        <View style={styles.langSpacer} />
        <Button size="sm" onPress={() => onSelectLanguage('de')} testID="btnDe">
          <Text>DE</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  devEntry: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF00AA',
  },
  langSpacer: { width: 8 },
  langRow: { flexDirection: 'row', marginTop: 8 },
});
