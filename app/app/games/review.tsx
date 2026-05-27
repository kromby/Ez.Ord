import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';

export default function ReviewScreen() {
  const router = useRouter();
  const { intent } = useLocalSearchParams<{ intent?: 'rate' | 'skip' }>();
  const isSkip = intent === 'skip';
  const { state, rateWordAsync, skipWordAsync, endGameAsync, prefetchNextWordAsync } = useGameState();
  const tk = COLORS.parchment;
  const word = state.currentWord;
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state.gameId) {
      router.replace('/');
    }
  }, [state.gameId, router]);

  useEffect(() => {
    prefetchNextWordAsync();
  }, [prefetchNextWordAsync]);

  const ratings = [
    { id: 'easy' as const, label: 'Létt', color: tk.forest, glyph: '·' },
    { id: 'medium' as const, label: 'Mið', color: tk.ochre, glyph: '··' },
    { id: 'hard' as const, label: 'Þungt', color: tk.rust, glyph: '···' },
  ];

  const handleRate = async (rating: 'easy' | 'medium' | 'hard') => {
    if (!word || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (isSkip) {
        await skipWordAsync(rating);
      } else {
        await rateWordAsync(rating);
      }
      await new Promise((resolve) => setTimeout(resolve, 220));
      router.back();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEnd = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await endGameAsync();
      router.push('./summary');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fontSize = word ? (word.word.length > 9 ? 54 : 66) : 66;

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 28 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <Text
            onPress={() => {
              router.back();
            }}
            style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            ← Aftur
          </Text>
          <Text
            onPress={handleEnd}
            style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.rust, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            Hætta
          </Text>
        </View>

        {/* Word Display */}
        <View style={{ alignItems: 'center', marginTop: 22, marginBottom: 22 }}>
          <View style={{ marginBottom: 10 }}>
            <RuneStrip tk={tk} />
          </View>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.5, color: tk.inkSoft, textTransform: 'uppercase' }}>
            {isSkip ? 'Sleppti orðinu' : 'Orðið var'}
          </Text>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize, lineHeight: fontSize * 1.05, fontWeight: '700', color: tk.ink, letterSpacing: -1.5, marginTop: 6 }}>
            {word?.word ?? '—'}
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.inkSoft, marginTop: 4 }}>
            {word?.category ?? ''}
          </Text>
        </View>

        {/* Question */}
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 24, fontWeight: '700', color: tk.ink, marginTop: 26, marginBottom: 12 }}>
          Hversu erfitt var orðið?
        </Text>

        {/* Rating Chips */}
        <View style={{ gap: 8, marginBottom: 'auto' }}>
          {ratings.map((r) => {
            const isSelected = state.currentRating === r.id;
            return (
              <Stone
                key={r.id}
                tk={tk}
                color={isSelected ? r.color : tk.card}
                fg={isSelected ? tk.bg : tk.ink}
                selected={isSelected}
                onClick={() => handleRate(r.id)}
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 16, letterSpacing: 2, width: 40, color: isSelected ? tk.bg : tk.ink }}>
                    {r.glyph}
                  </Text>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: isSelected ? 'italic' : 'normal', color: isSelected ? tk.bg : tk.ink }}>
                    {r.label}
                  </Text>
                </View>
              </Stone>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
