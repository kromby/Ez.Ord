import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useGameState } from '@/hooks/useGameState';
import { WORDS } from '@/constants/words';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/gameTokens';
import { GameCard } from '@/components/GameCard';
import { GameButton } from '@/components/GameButton';

export default function PlayScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = COLORS.parchment;

  // Get current word safely
  const currentWord = state.wordIndex < WORDS.length ? WORDS[state.wordIndex] : null;

  const handleGoToReview = () => {
    dispatch({ type: 'GO_TO_REVIEW' });
    router.push('./review');
  };

  const handleSkip = () => {
    dispatch({ type: 'SET_RATING', payload: 'skipped' });
    router.push('./review');
  };

  if (!currentWord) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ ...TYPOGRAPHY.body, color: theme.text }}>
          Engin orð í boði
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Inner flex View with padding and centered content */}
      <View style={{ flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center' }}>
        {/* Header with word counter */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <View />
          <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>
            Orð #{state.wordIndex + 1}
          </Text>
        </View>

        {/* Word Card */}
        <GameCard word={currentWord.word} theme={theme} />
      </View>

      {/* Bottom Buttons */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm }}>
        <GameButton
          label="Fá annað orð"
          onPress={handleGoToReview}
          theme={theme}
          variant="primary"
        />
        <GameButton
          label="Sleppa"
          onPress={handleSkip}
          theme={theme}
          variant="secondary"
        />
      </View>
    </View>
  );
}
