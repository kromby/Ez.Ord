import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { WORDS } from '@/constants/words';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';

export default function PlayScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const tk = COLORS.parchment;
  const word = WORDS[state.wordIndex % WORDS.length];
  const game = GAMES.find((g) => g.id === state.game) || GAMES[2];

  const handleReview = () => {
    router.push('./review');
  };

  const fontSize = word.word.length > 9 ? 56 : 78;

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 16 }}>{game.icon}</Text>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 16, fontWeight: '700', fontStyle: 'italic', color: tk.ink }}>
            {game.label}
          </Text>
        </View>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          Orð #{state.wordIndex + 1}
        </Text>
      </View>

      {/* Word Card */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 20 }}>
        <Stone tk={tk} depth={4} radius={20} style={{ paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <View style={{ marginBottom: 20 }}>
            <RuneStrip tk={tk} />
          </View>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize, lineHeight: fontSize * 1.2, fontWeight: '700', color: tk.ink, letterSpacing: -2, marginVertical: 20 }}>
            {word.word}
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: tk.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {word.category}
          </Text>
        </Stone>
      </View>

      {/* Action Buttons */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 28, gap: 10 }}>
        <Stone
          tk={tk}
          color={tk.teal}
          fg={tk.bg}
          depth={3}
          onClick={handleReview}
          style={{ paddingVertical: 15, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: tk.bg }}>
            Fá annað orð →
          </Text>
        </Stone>
        <Stone
          tk={tk}
          color={tk.ochreLight}
          onClick={handleReview}
          style={{ paddingVertical: 13, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, fontWeight: '700', color: tk.ink }}>
            Sleppa
          </Text>
        </Stone>
      </View>
    </View>
  );
}
