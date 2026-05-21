import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';
import { Divider } from '@/components/Divider';

export default function SummaryScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const tk = COLORS.parchment;

  const map: Record<string, { color: string; label: string; glyph: string }> = {
    easy: { color: tk.forest, label: 'Létt', glyph: '·' },
    medium: { color: tk.ochre, label: 'Mið', glyph: '··' },
    hard: { color: tk.rust, label: 'Þungt', glyph: '···' },
  };

  const played = state.playedWords || [];
  const counts = played.reduce<{ skipped: number; hard: number }>(
    (a, p) => ({
      skipped: a.skipped + (p.skipped ? 1 : 0),
      hard: a.hard + (p.rating === 'hard' ? 1 : 0),
    }),
    { skipped: 0, hard: 0 }
  );

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          Lokakafli
        </Text>
        <RuneStrip tk={tk} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 0 }}>
        {/* Stats Card */}
        <View style={{ marginTop: 18, marginBottom: 22 }}>
          <Stone
            tk={tk}
            color={tk.teal}
            fg={tk.bg}
            depth={4}
            radius={18}
            style={{ paddingVertical: 20, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-around', gap: 10 }}
          >
            <View style={{ alignItems: 'center', borderRightWidth: 1, borderRightColor: `${tk.bg}33`, flex: 1 }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 36, fontWeight: '700', color: tk.bg }}>
                {played.length}
              </Text>
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.85, letterSpacing: 1.5, marginTop: 4, color: tk.bg, textTransform: 'uppercase' }}>
                orð
              </Text>
            </View>
            <View style={{ alignItems: 'center', borderRightWidth: 1, borderRightColor: `${tk.bg}33`, flex: 1 }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 36, fontWeight: '700', color: tk.bg }}>
                {counts.skipped}
              </Text>
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.85, letterSpacing: 1.5, marginTop: 4, color: tk.bg, textTransform: 'uppercase' }}>
                sleppt
              </Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 36, fontWeight: '700', color: tk.bg }}>
                {counts.hard}
              </Text>
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.85, letterSpacing: 1.5, marginTop: 4, color: tk.bg, textTransform: 'uppercase' }}>
                þung
              </Text>
            </View>
          </Stone>
        </View>

        {/* Words List */}
        <Divider tk={tk} label="Orðin" />
        <View style={{ marginTop: 12, marginBottom: 22, gap: 8 }}>
          {played.map((p, i) => {
            const m = map[p.rating] || map.medium;
            return (
              <Stone
                key={i}
                tk={tk}
                radius={10}
                depth={1}
                style={{ paddingVertical: 10, paddingHorizontal: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft }}>
                    {String(i + 1).padStart(2, '0')}
                  </Text>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, fontWeight: '700', color: tk.ink, flex: 1 }} numberOfLines={1}>
                    {p.word}
                  </Text>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, color: tk.inkSoft, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {p.category}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 10 }}>
                  {p.skipped && (
                    <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: tk.inkSoft, letterSpacing: 1 }}>
                      ↷
                    </Text>
                  )}
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: m.color, letterSpacing: 1 }}>
                    {m.glyph}
                  </Text>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: m.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                    {m.label}
                  </Text>
                </View>
              </Stone>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 28, gap: 10 }}>
        <Stone
          tk={tk}
          color={tk.ochre}
          fg={tk.bg}
          depth={3}
          onClick={() => {
            dispatch({ type: 'PLAY_AGAIN' });
            router.push('./play');
          }}
          style={{ paddingVertical: 13, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, fontWeight: '700', fontStyle: 'italic', color: tk.bg }}>
            Aftur í leik
          </Text>
        </Stone>
        <Stone
          tk={tk}
          onClick={() => {
            dispatch({ type: 'GO_TO_MENU' });
            router.push('../');
          }}
          style={{ paddingVertical: 13, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 18, fontWeight: '700', color: tk.ink }}>
            Aðalvalmynd
          </Text>
        </Stone>
      </View>
    </View>
  );
}
