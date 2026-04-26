import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  label?: string;
}

export function Divider({ tk, label }: DividerProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: tk.ink, opacity: 0.25 }} />
      {label && (
        <Text
          style={{
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 10,
            color: tk.inkSoft,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: tk.ink, opacity: 0.25 }} />
    </View>
  );
}
