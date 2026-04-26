import React, { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { COLORS, SIZES, SPACING } from '@/constants/gameTokens';

interface GameButtonProps {
  label: string;
  onPress: () => void;
  theme: typeof COLORS.parchment;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function GameButton({
  label,
  onPress,
  theme,
  variant = 'primary',
  disabled = false,
}: GameButtonProps) {
  const [pressed, setPressed] = useState(false);

  const backgroundColor = variant === 'primary' ? theme.primary : theme.accent;

  // Determine opacity based on state
  let opacity = 1;
  if (disabled) {
    opacity = 0.5;
  } else if (pressed) {
    opacity = 0.8;
  }

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled}
      style={{
        height: SIZES.buttonHeight,
        backgroundColor,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        opacity,
      }}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 16,
          fontWeight: '600',
          fontFamily: 'FamiljenGrotesk_700Bold',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
