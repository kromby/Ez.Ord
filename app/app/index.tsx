import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { GAMES } from '@/constants/games';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';
import { HelloWave } from '@/components/HelloWave';

export default function Index() {
  const router = useRouter();
  const tk = COLORS.parchment;
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const handleStart = () => {
    if (!selectedGame) return;
    router.push({ pathname: '/games/setup', params: { game: selectedGame } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.6, color: tk.inkSoft, textTransform: 'uppercase' }}>
          Orð · Kafli I
        </Text>
        <RuneStrip tk={tk} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 28 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 8 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.ink, fontWeight: '700' }}>
            Byrja nýjan
          </Text>
          <HelloWave />
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.teal, fontStyle: 'italic', fontWeight: '700', marginBottom: 28 }}>
          leik
        </Text>

        <View style={{ gap: 10 }}>
          {GAMES.map((game) => {
            const isSelected = selectedGame === game.id;
            return (
              <Stone
                key={game.id}
                tk={tk}
                color={isSelected ? tk.teal : tk.card}
                fg={isSelected ? tk.bg : tk.ink}
                onClick={() => setSelectedGame(game.id)}
                style={{ paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: isSelected ? tk.ochreLight : tk.bgDeep, borderWidth: 1.5, borderColor: tk.ink, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 24 }}>{game.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 26, fontWeight: '700', fontStyle: isSelected ? 'italic' : 'normal', color: isSelected ? tk.bg : tk.ink }}>
                    {game.label}
                  </Text>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, letterSpacing: 1.2, marginTop: 2, textTransform: 'uppercase', color: isSelected ? tk.bg : tk.inkSoft }}>
                    {game.description}
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', opacity: isSelected ? 1 : 0.4, color: isSelected ? tk.bg : tk.ink }}>
                  {isSelected ? '◆' : '◇'}
                </Text>
              </Stone>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 22, paddingBottom: 28, paddingTop: 14, backgroundColor: tk.bg }}>
        <Stone
          tk={tk}
          color={selectedGame ? tk.teal : tk.bgDeep}
          fg={selectedGame ? tk.bg : tk.inkSoft}
          depth={selectedGame ? 4 : 1}
          onClick={selectedGame ? handleStart : undefined}
          style={{ paddingVertical: 16, alignItems: 'center', opacity: selectedGame ? 1 : 0.6 }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: selectedGame ? tk.bg : tk.inkSoft }}>
            Hefja leik →
          </Text>
        </Stone>
      </View>
    </View>
  );
}
