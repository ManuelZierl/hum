import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, TopBar } from '@hum/ui-components';

export interface CallsScreenProps {
  onBack?: () => void;
}

export const CallsScreen: React.FC<CallsScreenProps> = ({ onBack }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="calls-screen"
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom },
      ]}
    >
      <TopBar backButton={!!onBack} onBackPress={onBack} title="Calls" />
      <View style={styles.content}>
        <Text style={{ color: colors.foreground }}>Calls coming soon</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default CallsScreen;
