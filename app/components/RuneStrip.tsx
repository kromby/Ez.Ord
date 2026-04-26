import React from 'react';
import { Text, View } from 'react-native';

interface RuneStripProps {
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  color?: string;
  opacity?: number;
}

export function RuneStrip({ tk, color, opacity }: RuneStripProps) {
  const c = color || tk.teal;
  const o = opacity ?? 0.85;
  const glyphs = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 6,
          color: c,
          opacity: o,
          fontFamily: 'serif',
          lineHeight: 14,
        }}
      >
        {glyphs.join('')}
      </Text>
    </View>
  );
}
