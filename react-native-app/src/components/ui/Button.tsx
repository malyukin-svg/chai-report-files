import React from 'react';
import { Pressable, Text, StyleSheet, type PressableProps } from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <Pressable
      style={[
        styles.button,
        variant === 'primary' ? styles.primary : styles.secondary,
        { backgroundColor: Colors[theme].tint },
        style,
      ]}
      {...props}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C6C6C8',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
});
