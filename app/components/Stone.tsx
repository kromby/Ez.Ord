import React, { useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';

interface StoneProps {
  children: React.ReactNode;
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  color?: string;
  fg?: string;
  selected?: boolean;
  onClick?: () => void;
  style?: ViewStyle;
  radius?: number;
  border?: string;
  depth?: number;
}

export function Stone({
  children,
  tk,
  color,
  fg,
  selected,
  onClick,
  style,
  radius = 14,
  border,
  depth = 2,
}: StoneProps) {
  const [pressed, setPressed] = useState(false);

  const bg = color || tk.card;
  const text = fg || tk.ink;
  const b = border || tk.ink;

  // Calculate shadow based on pressed state and depth
  const shadowElevation = pressed ? 0 : depth;

  return (
    <Pressable
      onPress={onClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={!onClick}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: b,
        paddingVertical: 12,
        paddingHorizontal: 14,
        opacity: onClick ? 1 : 1,
        elevation: shadowElevation,
        // iOS shadow
        shadowColor: b,
        shadowOffset: { width: 0, height: shadowElevation },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        transform: [{ translateY: pressed ? depth : 0 }],
        ...style,
      }}
    >
      <View style={{ color: text }}>
        {children}
      </View>
    </Pressable>
  );
}
