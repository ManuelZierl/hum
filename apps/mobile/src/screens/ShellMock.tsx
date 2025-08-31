import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  ScrollView,
} from 'react-native';
import { TabBarMock } from '@mchat/mobile-ui';
import Search from 'react-native-bootstrap-icons/icons/search';

const ShellMock = () => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const shimmer = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [shimmer]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>mChat</Text>
        <View style={styles.topIcons}>
          <Search
            width={18}
            height={18}
            fill={colors.subtext}
            accessibilityLabel="search"
          />
          <Text style={[styles.topIcon, { color: colors.subtext }]}>📷</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, shadowColor: colors.shadow },
          ]}
        >
          <Text style={[styles.cardText, { color: colors.text }]}>
            This is the shell
          </Text>
        </View>
        {[0, 1, 2, 3].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.placeholder,
              { backgroundColor: colors.placeholder, opacity: shimmer },
            ]}
          />
        ))}
      </ScrollView>
      <TabBarMock />
    </View>
  );
};

const lightColors = {
  background: '#f5f5f5',
  card: '#ffffff',
  text: '#000000',
  subtext: '#777777',
  border: '#e0e0e0',
  placeholder: '#e0e0e0',
  shadow: '#000000',
};
const darkColors = {
  background: '#000000',
  card: '#1c1c1c',
  text: '#ffffff',
  subtext: '#aaaaaa',
  border: '#333333',
  placeholder: '#333333',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBar: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  topIcons: {
    flexDirection: 'row',
  },
  topIcon: {
    marginLeft: 16,
    fontSize: 18,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 24,
    borderRadius: 8,
    marginBottom: 24,
    elevation: 2,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardText: {
    fontSize: 16,
  },
  placeholder: {
    height: 40,
    borderRadius: 4,
    marginBottom: 12,
  },
});

export default ShellMock;
