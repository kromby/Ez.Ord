import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { CATEGORIES, type Category } from '@/constants/words';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';
import { Divider } from '@/components/Divider';

export default function SetupScreen() {
  const router = useRouter();
  const { game: gameParam } = useLocalSearchParams<{ game: string }>();
  const { state, dispatch, startGameAsync } = useGameState();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (gameParam && GAMES.some(g => g.id === gameParam)) {
      dispatch({ type: 'SET_GAME', payload: gameParam as 'teikna' | 'utskyra' | 'leika' });
    }
  }, [gameParam]);

  useEffect(() => {
    if (isStarting && state.gameId && !state.isLoading && !state.error) {
      setIsStarting(false);
      router.push('./play');
    }
  }, [isStarting, state.gameId, state.isLoading, state.error]);

  const tk = COLORS.parchment; // TODO: support theme switching
  const selectedCatsCount = Object.values(state.categories).filter(Boolean).length;

  const handleGameSelect = (gameId: string) => {
    dispatch({ type: 'SET_GAME', payload: gameId as 'teikna' | 'utskyra' | 'leika' });
  };

  const handleCategoryToggle = (catId: string) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: catId as 'nafn' | 'sagn' | 'lys' | 'orne' });
  };

  const handleStart = async () => {
    if (selectedCatsCount === 0 || !state.game) return;
    const selectedCategories = (Object.keys(state.categories) as Category[]).filter(
      cat => state.categories[cat]
    );
    setIsStarting(true);
    await startGameAsync(state.game, selectedCategories);
  };

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.6, color: tk.inkSoft, textTransform: 'uppercase' }}>
          Orð · Kafli I
        </Text>
        <RuneStrip tk={tk} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 28 }}>
        {/* Title */}
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, marginTop: 20, marginBottom: 4, color: tk.ink, fontWeight: '700' }}>
          Veldu þinn
        </Text>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.teal, fontStyle: 'italic', fontWeight: '700' }}>
          orðaleik
        </Text>

        {/* Games Section */}
        <Divider tk={tk} label="leikir" />
        <View style={{ marginTop: 14, marginBottom: 24, gap: 10 }}>
          {GAMES.map((game) => {
            const isSelected = state.game === game.id;
            return (
              <Stone
                key={game.id}
                tk={tk}
                color={isSelected ? tk.teal : tk.card}
                fg={isSelected ? tk.bg : tk.ink}
                onClick={() => handleGameSelect(game.id)}
                style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: isSelected ? tk.ochreLight : tk.bgDeep, borderWidth: 1.5, borderColor: tk.ink, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{game.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 22, fontWeight: '700', fontStyle: isSelected ? 'italic' : 'normal', color: isSelected ? tk.bg : tk.ink }}>
                    {game.label}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', opacity: isSelected ? 1 : 0.4, color: isSelected ? tk.bg : tk.ink }}>
                  {isSelected ? '◆' : '◇'}
                </Text>
              </Stone>
            );
          })}
        </View>

        {/* Categories Section */}
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
          · Orðaflokkar · {selectedCatsCount}/4
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {CATEGORIES.map((cat) => {
            const isOn = state.categories[cat.id as 'nafn' | 'sagn' | 'lys' | 'orne'];
            return (
              <Stone
                key={cat.id}
                tk={tk}
                color={isOn ? tk.ochreLight : tk.card}
                fg={isOn ? tk.ink : tk.ink}
                onClick={() => handleCategoryToggle(cat.id)}
                radius={999}
                style={{ paddingVertical: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                <Text style={{ fontSize: 12, color: isOn ? tk.ink : tk.ink }}>
                  {isOn ? '✦' : '◌'}
                </Text>
                <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, fontWeight: '700', fontStyle: isOn ? 'italic' : 'normal', color: tk.ink }}>
                  {cat.label}
                </Text>
                <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, opacity: 0.6, color: tk.ink }}>
                  {cat.count}
                </Text>
              </Stone>
            );
          })}
        </View>
      </ScrollView>

      {/* Start Button */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 28, paddingTop: 14, backgroundColor: tk.bg }}>
        {state.error && (
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.rust, marginBottom: 8, textAlign: 'center' }}>
            {state.error}
          </Text>
        )}
        <Stone
          tk={tk}
          color={selectedCatsCount > 0 && !state.isLoading ? tk.teal : tk.bgDeep}
          fg={selectedCatsCount > 0 && !state.isLoading ? tk.bg : tk.inkSoft}
          depth={selectedCatsCount > 0 && !state.isLoading ? 4 : 1}
          onClick={selectedCatsCount > 0 && !state.isLoading ? handleStart : undefined}
          style={{ paddingVertical: 16, alignItems: 'center', opacity: selectedCatsCount > 0 && !state.isLoading ? 1 : 0.6 }}
        >
          {state.isLoading ? (
            <ActivityIndicator color={tk.inkSoft} />
          ) : (
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: selectedCatsCount > 0 ? tk.bg : tk.inkSoft }}>
              Hefjum leik →
            </Text>
          )}
          {selectedCatsCount === 0 && !state.isLoading && (
            <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.7, letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase', color: tk.inkSoft }}>
              Veldu a.m.k. einn flokk
            </Text>
          )}
        </Stone>
      </View>
    </View>
  );
}
