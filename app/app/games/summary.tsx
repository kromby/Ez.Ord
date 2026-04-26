import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useGameState } from '@/hooks/useGameState';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/gameTokens';
import { GameButton } from '@/components/GameButton';

export default function SummaryScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = COLORS.parchment;

  // Calculate statistics
  const wordCount = state.playedWords.length;
  const skippedCount = state.playedWords.filter(w => w.rating === 'skipped').length;
  const hardCount = state.playedWords.filter(w => w.rating === 'hard').length;

  const handlePlayAgain = () => {
    dispatch({ type: 'PLAY_AGAIN' });
    router.push('./play');
  };

  const handleGoToMenu = () => {
    dispatch({ type: 'GO_TO_MENU' });
    router.push('../');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingHorizontal: SPACING.lg, justifyContent: 'center' }}>
      {/* Stats Section */}
      <View style={{ marginBottom: SPACING.xxl }}>
        {/* Headline */}
        <Text style={{ ...TYPOGRAPHY.headline, color: theme.text, marginBottom: SPACING.lg }}>
          Lokum
        </Text>

        {/* Stats Container */}
        <View style={{ marginVertical: SPACING.xl }}>
          {/* Stat Group 1: Words played */}
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>
              orð
            </Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>
              {wordCount}
            </Text>
          </View>

          {/* Stat Group 2: Skipped words */}
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>
              sleppt
            </Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>
              {skippedCount}
            </Text>
          </View>

          {/* Stat Group 3: Hard words */}
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>
              þung
            </Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>
              {hardCount}
            </Text>
          </View>
        </View>
      </View>

      {/* Buttons Section */}
      <View style={{ gap: SPACING.sm }}>
        <GameButton
          label="Aftur í leik"
          onPress={handlePlayAgain}
          theme={theme}
          variant="primary"
        />
        <GameButton
          label="Aðalvalmynd"
          onPress={handleGoToMenu}
          theme={theme}
          variant="secondary"
        />
      </View>
    </View>
  );
}
