import React from 'react';
import { ScrollView, View, Text, StyleSheet, useColorScheme } from 'react-native';
import ProfileCard from '../components/settings/ProfileCard';
import SectionHeader from '../components/settings/SectionHeader';
import SettingsListItem from '../components/settings/SettingsListItem';

const SettingsMock = () => {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? darkColors : lightColors;

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]}> 
      <ProfileCard name="Jane Doe" handle="@jane" />
      <View style={styles.section}>
        <SectionHeader title="Account" />
        <SettingsListItem label="Phone Number" />
        <SettingsListItem label="Privacy" />
        <SettingsListItem label="Security" />
        <SettingsListItem label="Two-Step Verify" />
      </View>
      <View style={styles.section}>
        <SectionHeader title="Appearance" />
        <SettingsListItem label="Theme" />
        <SettingsListItem label="Wallpapers" />
      </View>
      <View style={styles.section}>
        <SectionHeader title="Notifications" />
        <SettingsListItem label="Message tones" />
        <SettingsListItem label="Vibrate" />
      </View>
      <View style={styles.section}>
        <SectionHeader title="Data & Storage" />
        <SettingsListItem label="Media auto-download" />
      </View>
      <View style={styles.section}>
        <SectionHeader title="Help" />
        <SettingsListItem label="FAQ" />
        <SettingsListItem label="Report a problem" />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.version, { color: colors.subtext }]}>v0.0.0</Text>
        <Text style={[styles.license, { color: colors.subtext }]}>Open source, no telemetry</Text>
      </View>
    </ScrollView>
  );
};

const lightColors = { background: '#f5f5f5', subtext: '#777777' };
const darkColors = { background: '#000000', subtext: '#aaaaaa' };

const styles = StyleSheet.create({
  screen: { flex: 1 },
  section: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  version: {
    fontSize: 12,
  },
  license: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsMock;
