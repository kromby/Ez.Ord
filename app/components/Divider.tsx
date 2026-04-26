import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/gameTokens';

interface DividerProps {
  title: string;
  theme: typeof COLORS.parchment;
}

export function Divider({ title, theme }: DividerProps) {
  return (
    <View style={{ marginVertical: SPACING.lg }}>
      <Text
        style={{
          color: theme.textLight,
          fontSize: TYPOGRAPHY.label.fontSize,
          fontFamily: TYPOGRAPHY.label.fontFamily,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: SPACING.md,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: theme.border,
          width: '80%',
        }}
      />
    </View>
  );
}
