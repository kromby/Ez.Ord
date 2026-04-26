import React from 'react';
import { Pressable, Text } from 'react-native';
import { COLORS, SIZES, SPACING } from '@/constants/gameTokens';

interface DifficultyChipProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: (value: string) => void;
  theme: typeof COLORS.parchment;
}

export function DifficultyChip({
  label,
  value,
  selected,
  onPress,
  theme,
}: DifficultyChipProps) {
  const backgroundColor = selected ? theme.primary : 'transparent';
  const textColor = selected ? theme.bg : theme.text;
  const borderColor = selected ? theme.primary : theme.border;

  return (
    <Pressable
      onPress={() => onPress(value)}
      style={{
        height: SIZES.chipHeight,
        borderWidth: 2,
        borderColor,
        borderRadius: 10,
        backgroundColor,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
      }}
    >
      <Text
        style={{
          color: textColor,
          fontSize: 14,
          fontWeight: '600',
          fontFamily: 'FamiljenGrotesk_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
