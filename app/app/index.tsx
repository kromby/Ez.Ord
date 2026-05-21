import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { GAMES } from '@/constants/games';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';
import { HelloWave } from '@/components/HelloWave';
import { useGameState } from '@/hooks/useGameState';

export default function Index() {
  const router = useRouter();
  const tk = COLORS.parchment;
  const { state, dispatch, startGameAsync, loadCategoriesAsync } = useGameState();
  const [isStarting, setIsStarting] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsCategoriesLoading(true);
      await loadCategoriesAsync();
      if (active) setIsCategoriesLoading(false);
    })();
    return () => { active = false; };
  }, [loadCategoriesAsync]);

  useEffect(() => {
    if (!isStarting || state.isLoading) return;
    if (state.error) { setIsStarting(false); return; }
    if (state.gameId) {
      setIsStarting(false);
      router.push('/games/play');
    }
  }, [isStarting, state.gameId, state.isLoading, state.error, router]);

  const selectedCatsCount = Object.values(state.selectedCategories).filter(Boolean).length;
  const canStart = !!state.game && selectedCatsCount > 0 && !state.isLoading && !isStarting;

  const handleStart = async () => {
    if (!canStart) return;
    const selectedCategoryIds = Object.keys(state.selectedCategories).filter(id => state.selectedCategories[id]);
    setIsStarting(true);
    try {
      await startGameAsync(state.game!, selectedCategoryIds);
    } catch {
      setIsStarting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.6, color: tk.inkSoft, textTransform: 'uppercase' }}>
          ez Orð
        </Text>
        <RuneStrip tk={tk} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 8 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.ink, fontWeight: '700' }}>
            Byrja nýtt
          </Text>
          <HelloWave />
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.teal, fontStyle: 'italic', fontWeight: '700', marginBottom: 28 }}>
          spil
        </Text>

        {/* Game selection */}
        <View style={{ gap: 10 }}>
          {GAMES.map((game) => {
            const isSelected = state.game === game.id;
            return (
              <Stone
                key={game.id}
                tk={tk}
                color={isSelected ? tk.teal : tk.card}
                fg={isSelected ? tk.bg : tk.ink}
                onClick={() => dispatch({ type: 'SET_GAME', payload: game.id })}
                style={{ paddingVertical: 12, paddingHorizontal: 14 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={{ flex: 1, fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 26, fontWeight: '700', fontStyle: isSelected ? 'italic' : 'normal', color: isSelected ? tk.bg : tk.ink }}>
                    {game.label}
                  </Text>
                  <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: isSelected ? tk.ochreLight : tk.bgDeep, borderWidth: 1.5, borderColor: tk.ink, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 24 }}>{game.icon}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 1.2, marginTop: 4, textTransform: 'uppercase', color: isSelected ? tk.bg : tk.inkSoft }}>
                  {game.description}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 4, opacity: isSelected ? 1 : 0.4, color: isSelected ? tk.bg : tk.ink }}>
                  {isSelected ? '◆' : '◇'}
                </Text>
              </Stone>
            );
          })}
        </View>

        {/* Category selection — appears after a game is chosen */}
        {state.game && (
          <View style={{ marginTop: 28 }}>
            <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
              · Orðaflokkar · {selectedCatsCount}/{state.availableCategories.length}
            </Text>
            {isCategoriesLoading ? (
              <View style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color={tk.inkSoft} />
                <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.inkSoft }}>
                  Sæki flokka…
                </Text>
              </View>
            ) : state.availableCategories.length === 0 ? (
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.inkSoft }}>
                Engir virkir flokkar fundust.
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {state.availableCategories.map((cat) => {
                  const isOn = !!state.selectedCategories[cat.id];
                  return (
                    <Stone
                      key={cat.id}
                      tk={tk}
                      color={isOn ? tk.ochreLight : tk.card}
                      fg={tk.ink}
                      onClick={() => dispatch({ type: 'TOGGLE_CATEGORY', payload: cat.id })}
                      radius={999}
                      style={{ paddingVertical: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                    >
                      <Text style={{ fontSize: 12, color: tk.ink }}>{isOn ? '✦' : '◌'}</Text>
                      <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, fontWeight: '700', fontStyle: isOn ? 'italic' : 'normal', color: tk.ink }}>
                        {cat.name}
                      </Text>
                    </Stone>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Start button */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 28, paddingTop: 14, backgroundColor: tk.bg }}>
        {state.error && (
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.rust, marginBottom: 8, textAlign: 'center' }}>
            {state.error}
          </Text>
        )}
        <Stone
          tk={tk}
          color={canStart ? tk.teal : tk.bgDeep}
          fg={canStart ? tk.bg : tk.inkSoft}
          depth={canStart ? 4 : 1}
          onClick={canStart ? handleStart : undefined}
          style={{ paddingVertical: 16, alignItems: 'center', opacity: canStart ? 1 : 0.6 }}
        >
          {state.isLoading || isStarting ? (
            <ActivityIndicator color={tk.inkSoft} />
          ) : (
            <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: canStart ? tk.bg : tk.inkSoft }}>
              Hefjum leik →
            </Text>
          )}
          {!state.game && !state.isLoading && !isStarting && (
            <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.7, letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase', color: tk.inkSoft }}>
              Veldu leik
            </Text>
          )}
          {state.game && selectedCatsCount === 0 && !state.isLoading && !isStarting && (
            <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.7, letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase', color: tk.inkSoft }}>
              Veldu a.m.k. einn flokk
            </Text>
          )}
        </Stone>
      </View>
    </View>
  );
}
