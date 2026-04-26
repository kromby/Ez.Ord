import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLORS, SPACING } from '@/constants/gameTokens';

interface CategoryToggleProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  theme: typeof COLORS.parchment;
}

export function CategoryToggle({
  label,
  checked,
  onPress,
  theme,
}: CategoryToggleProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderWidth: 2,
          borderColor: theme.border,
          borderRadius: 4,
          backgroundColor: checked ? theme.primary : 'transparent',
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: SPACING.md,
        }}
      >
        {checked && (
          <Text
            style={{
              color: theme.bg,
              fontSize: 14,
              fontWeight: '700',
              lineHeight: 16,
            }}
          >
            ✓
          </Text>
        )}
      </View>
      <Text
        style={{
          color: theme.text,
          fontSize: 16,
          fontWeight: '400',
          fontFamily: 'FamiljenGrotesk_400Regular',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
