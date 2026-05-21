import React from 'react';
import { View, Text } from 'react-native';
import { COLORS, SPACING, SIZES, TYPOGRAPHY } from '@/constants/gameTokens';

interface GameCardProps {
  word: string;
  theme: typeof COLORS.parchment;
}

export function GameCard({ word, theme }: GameCardProps) {
  const fontSize =
    word.length > 19 ? 28 :
    word.length > 14 ? 36 :
    word.length > 10 ? 48 : 64;

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
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.5}
      >
        {word}
      </Text>
    </View>
  );
}
