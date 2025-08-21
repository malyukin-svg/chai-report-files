import React from 'react';
import { StyleSheet, Platform } from 'react-native';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <ThemedText type="subtitle">Features included:</ThemedText>
      <ThemedText>• Expo Router for navigation</ThemedText>
      <ThemedText>• TypeScript support</ThemedText>
      <ThemedText>• New Architecture enabled</ThemedText>
      <ThemedText>• Themed components</ThemedText>
      <ThemedText>• Tab navigation</ThemedText>
      <ThemedText>• Modern React Native patterns</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});
