import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';

export default function PlayScreen() {
  const router = useRouter();
  const { state, fetchNextWordAsync } = useGameState();
  const tk = COLORS.parchment;
  const game = GAMES.find((g) => g.id === state.game) || GAMES[2];

  useEffect(() => {
    if (!state.currentWord && state.gameId) {
      fetchNextWordAsync();
    }
  }, [state.currentWord, state.gameId]);

  const handleReview = () => {
    router.push({ pathname: './review', params: { intent: 'rate' } });
  };

  const handleSkip = () => {
    router.push({ pathname: './review', params: { intent: 'skip' } });
  };

  if (state.isLoading || !state.currentWord) {
    return (
      <View style={{ flex: 1, backgroundColor: tk.bg, justifyContent: 'center', alignItems: 'center' }}>
        {state.error ? (
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: tk.rust, letterSpacing: 1.2, textAlign: 'center', paddingHorizontal: 22 }}>
            {state.error}
          </Text>
        ) : (
          <ActivityIndicator color={tk.ink} />
        )}
      </View>
    );
  }

  const word = state.currentWord;
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
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: tk.inkSoft, letterSpacing: 1.2 }}>
            {word.typeName ? `${word.category} - ${word.typeName}` : word.category}
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
          onClick={handleSkip}
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
