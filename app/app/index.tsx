import React from 'react';
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

  const goToSetup = (game: string) => {
    router.push({ pathname: '/games/setup', params: { game } });
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 8 }}>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.ink, fontWeight: '700' }}>
            Byrja nýjan
          </Text>
          <HelloWave />
        </View>
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 44, lineHeight: 42, color: tk.teal, fontStyle: 'italic', fontWeight: '700', marginBottom: 28 }}>
          leik
        </Text>

        {/* Games */}
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.5, marginBottom: 10, textTransform: 'uppercase' }}>
          · Veldu leik ·
        </Text>
        <View style={{ gap: 10 }}>
          {GAMES.map((game) => (
            <Stone
              key={game.id}
              tk={tk}
              color={tk.card}
              fg={tk.ink}
              onClick={() => goToSetup(game.id)}
              style={{ paddingVertical: 14, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }}
            >
              <View style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: tk.bgDeep, borderWidth: 1.5, borderColor: tk.ink, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 26 }}>{game.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 24, lineHeight: 26, fontWeight: '700', color: tk.ink }}>
                  {game.label}
                </Text>
                <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1, marginTop: 2, textTransform: 'uppercase' }}>
                  {game.description}
                </Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '600', opacity: 0.4, color: tk.ink }}>
                →
              </Text>
            </Stone>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
