import { useRouter } from 'expo-router';
import { View, Text } from 'react-native';
import { useGameState } from '@/hooks/useGameState';
import { WORDS } from '@/constants/words';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/gameTokens';
import { GameCard } from '@/components/GameCard';
import { DifficultyChip } from '@/components/DifficultyChip';
import { GameButton } from '@/components/GameButton';

export default function ReviewScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = COLORS.parchment;

  // Get current word safely
  const currentWord = state.wordIndex < WORDS.length ? WORDS[state.wordIndex] : null;

  // Handle difficulty rating with auto-advance after 200ms
  const handleRating = (rating: string) => {
    dispatch({ type: 'SET_RATING', payload: rating as 'easy' | 'medium' | 'hard' | 'skipped' });

    // Auto-advance after 200ms
    setTimeout(() => {
      dispatch({ type: 'NEXT_WORD' });

      // Navigate to summary if we've reached the end, otherwise go to play
      if (state.wordIndex + 1 >= WORDS.length) {
        router.push('./summary');
      } else {
        router.push('./play');
      }
    }, 200);
  };

  // Handle manual button press
  const handleManualAdvance = () => {
    if (state.currentRating) {
      dispatch({ type: 'NEXT_WORD' });

      // Navigate to summary if we've reached the end, otherwise go to play
      if (state.wordIndex + 1 >= WORDS.length) {
        router.push('./summary');
      } else {
        router.push('./play');
      }
    }
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
        {/* Word Card */}
        <GameCard word={currentWord.word} theme={theme} />

        {/* "Erfitt?" Question Text */}
        <Text style={{ ...TYPOGRAPHY.body, color: theme.text, marginTop: SPACING.xl, marginBottom: SPACING.lg, textAlign: 'center' }}>
          Erfitt?
        </Text>

        {/* Difficulty Chips */}
        <View style={{ gap: SPACING.md }}>
          <DifficultyChip
            label="Auðvelt"
            value="easy"
            selected={state.currentRating === 'easy'}
            onPress={handleRating}
            theme={theme}
          />
          <DifficultyChip
            label="Miðlungs"
            value="medium"
            selected={state.currentRating === 'medium'}
            onPress={handleRating}
            theme={theme}
          />
          <DifficultyChip
            label="Erfitt"
            value="hard"
            selected={state.currentRating === 'hard'}
            onPress={handleRating}
            theme={theme}
          />
          <DifficultyChip
            label="Sleppt"
            value="skipped"
            selected={state.currentRating === 'skipped'}
            onPress={handleRating}
            theme={theme}
          />
        </View>
      </View>

      {/* Bottom Button */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
        <GameButton
          label="Fá annað orð"
          onPress={handleManualAdvance}
          theme={theme}
          variant="primary"
          disabled={!state.currentRating}
        />
      </View>
    </View>
  );
}
