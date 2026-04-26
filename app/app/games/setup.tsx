import { useRouter } from 'expo-router';
import { View, ScrollView, Text } from 'react-native';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { CATEGORIES } from '@/constants/words';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/gameTokens';
import { GameButton } from '@/components/GameButton';
import { CategoryToggle } from '@/components/CategoryToggle';
import { Divider } from '@/components/Divider';

export default function SetupScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = COLORS.parchment;

  // Check if at least one category is selected
  const hasSelectedCategories = Object.values(state.categories).some((v) => v);

  const handleGameSelect = (gameId: string) => {
    dispatch({ type: 'SET_GAME', payload: gameId as 'teikna' | 'utskyra' | 'leika' });
  };

  const handleCategoryToggle = (categoryId: string) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: categoryId as 'nafn' | 'sagn' | 'lys' | 'orne' });
  };

  const handleStartGame = () => {
    if (hasSelectedCategories) {
      dispatch({ type: 'START_GAME' });
      router.push('./play');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: SPACING.lg }}
        contentContainerStyle={{ paddingVertical: SPACING.xl }}
      >
        {/* Headline */}
        <Text
          style={{
            ...TYPOGRAPHY.headline,
            color: theme.text,
            marginBottom: SPACING.xl,
          }}
        >
          Orð
        </Text>

        {/* Games Section */}
        <Divider title="LEIKIR" theme={theme} />
        <View style={{ marginBottom: SPACING.xl }}>
          {GAMES.map((game) => (
            <View key={game.id} style={{ marginBottom: SPACING.md }}>
              <GameButton
                label={game.label}
                onPress={() => handleGameSelect(game.id)}
                theme={theme}
                variant={state.game === game.id ? 'primary' : 'secondary'}
              />
            </View>
          ))}
        </View>

        {/* Categories Section */}
        <Divider title="FLOKKAR" theme={theme} />
        <View style={{ marginBottom: SPACING.xl }}>
          {CATEGORIES.map((category) => (
            <CategoryToggle
              key={category.id}
              label={category.label}
              checked={state.categories[category.id as 'nafn' | 'sagn' | 'lys' | 'orne']}
              onPress={() => handleCategoryToggle(category.id)}
              theme={theme}
            />
          ))}
        </View>
      </ScrollView>

      {/* Sticky Button Section */}
      <View
        style={{
          paddingHorizontal: SPACING.lg,
          paddingBottom: SPACING.xl,
          backgroundColor: theme.bg,
        }}
      >
        <GameButton
          label="Hefjum leik →"
          onPress={handleStartGame}
          theme={theme}
          variant="primary"
          disabled={!hasSelectedCategories}
        />

        {!hasSelectedCategories && (
          <Text
            style={{
              color: theme.textLight,
              fontSize: 14,
              fontFamily: 'FamiljenGrotesk_400Regular',
              marginTop: SPACING.md,
              textAlign: 'center',
            }}
          >
            Veldu a.m.k. einn flokk
          </Text>
        )}
      </View>
    </View>
  );
}
