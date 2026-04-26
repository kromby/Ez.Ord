import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, SPACING, SIZES, TYPOGRAPHY } from '@/constants/gameTokens';

interface GameCardProps {
  word: string;
  theme: typeof COLORS.parchment;
}

export function GameCard({ word, theme }: GameCardProps) {
  // Adjust font size based on word length
  const fontSize = word.length > 12 ? 48 : 64;

  return (
    <View
      style={{
        minHeight: SIZES.cardHeight,
        borderWidth: 2,
        borderColor: theme.border,
        borderRadius: 16,
        paddingVertical: SPACING.xxxl,
        paddingHorizontal: SPACING.xl,
        backgroundColor: theme.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontSize,
          fontFamily: TYPOGRAPHY.headline.fontFamily,
          fontWeight: '700',
          color: theme.text,
          textAlign: 'center',
        }}
      >
        {word}
      </Text>
    </View>
  );
}
