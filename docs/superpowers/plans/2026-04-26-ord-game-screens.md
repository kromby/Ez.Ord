# Orð Game Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Nordic vintage-themed game screens (Setup, Play, Review, Summary) for the Orð Icelandic word learning app, matching the Saga design prototype.

**Architecture:** The game flow uses Expo Router file-based routing with a React Context + useReducer state management pattern. Each screen is a route file that reads game state and dispatches actions. The design token system (colors, fonts, spacing) is centralized in a constants file. All UI is built with React Native + NativeWind for styling.

**Tech Stack:** Expo/React Native, TypeScript, NativeWind (Tailwind for RN), Expo Google Fonts, React Context, useReducer

---

## File Structure

### New Files to Create

- `app/contexts/GameContext.tsx` — Game state provider, reducer definition, action types
- `app/hooks/useGameState.ts` — Hook to access game state and dispatch
- `app/constants/gameTokens.ts` — Design tokens (colors, fonts, spacing, sizes)
- `app/constants/games.ts` — Game definitions and metadata
- `app/constants/words.ts` — Word list with categories and difficulty metadata
- `app/components/GameCard.tsx` — Reusable card component for displaying words
- `app/components/GameButton.tsx` — Primary CTA button (Hefjum leik, Fá annað orð)
- `app/components/DifficultyChip.tsx` — Selectable difficulty rating chips
- `app/components/CategoryToggle.tsx` — Category checkbox toggle
- `app/components/Divider.tsx` — Section divider with title
- `app/components/RuneStrip.tsx` — Decorative rune strip (optional visual)
- `app/components/GameLayout.tsx` — Shared layout wrapper for game screens
- `app/games/setup.tsx` — Setup screen (game + category selection)
- `app/games/play.tsx` — Play screen (word card display)
- `app/games/review.tsx` — Review screen (difficulty rating)
- `app/games/summary.tsx` — Summary screen (final stats)
- `app/games/_layout.tsx` — Games route group layout

### Files to Modify

- `app/_layout.tsx` — Add games route to root navigation
- `app/index.tsx` — Update home screen to link to games

---

## Tasks

### Task 1: Set Up Game State Management

**Files:**
- Create: `app/contexts/GameContext.tsx`
- Create: `app/hooks/useGameState.ts`

**Rationale:** Central state management ensures all screens read from the same source of truth and dispatch consistent actions.

- [ ] **Step 1: Define action types and state shape**

```typescript
// app/contexts/GameContext.tsx
import React, { useReducer, ReactNode } from 'react';

export type GameType = 'teikna' | 'utskyra' | 'leika';
export type Category = 'nafn' | 'sagn' | 'lys' | 'orne';
export type Rating = 'easy' | 'medium' | 'hard' | 'skipped';

export interface PlayedWord {
  id: string;
  word: string;
  category: Category;
  rating: Rating;
}

export interface GameState {
  route: 'setup' | 'play' | 'review' | 'summary';
  game: GameType;
  categories: Record<Category, boolean>;
  wordIndex: number;
  playedWords: PlayedWord[];
  currentRating: Rating | null;
}

export const INITIAL_STATE: GameState = {
  route: 'setup',
  game: 'utskyra',
  categories: { nafn: true, sagn: true, lys: true, orne: false },
  wordIndex: 0,
  playedWords: [],
  currentRating: null,
};

export type GameAction =
  | { type: 'setGame'; game: GameType }
  | { type: 'toggleCategory'; category: Category }
  | { type: 'startGame' }
  | { type: 'goToReview' }
  | { type: 'setRating'; rating: Rating }
  | { type: 'nextWord' }
  | { type: 'playAgain' }
  | { type: 'endGame' }
  | { type: 'goToMenu' };
```

- [ ] **Step 2: Write the reducer function**

```typescript
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'setGame':
      return { ...state, game: action.game };

    case 'toggleCategory':
      return {
        ...state,
        categories: {
          ...state.categories,
          [action.category]: !state.categories[action.category],
        },
      };

    case 'startGame':
      return {
        ...state,
        route: 'play',
        wordIndex: 0,
        playedWords: [],
        currentRating: null,
      };

    case 'goToReview':
      return { ...state, route: 'review', currentRating: null };

    case 'setRating':
      return { ...state, currentRating: action.rating };

    case 'nextWord': {
      const word = WORDS[state.wordIndex % WORDS.length];
      const played = [...state.playedWords, { ...word, rating: state.currentRating || 'skipped' }];
      const nextIdx = state.wordIndex + 1;
      
      if (nextIdx >= WORDS.length) {
        return { ...state, route: 'summary', playedWords: played, currentRating: null };
      }
      
      return { ...state, route: 'play', wordIndex: nextIdx, playedWords: played, currentRating: null };
    }

    case 'playAgain':
      return { ...INITIAL_STATE, game: state.game, categories: state.categories, route: 'play', wordIndex: 0 };

    case 'endGame':
      return { ...state, route: 'summary' };

    case 'goToMenu':
      return { ...INITIAL_STATE, game: state.game, categories: state.categories };

    default:
      return state;
  }
}
```

- [ ] **Step 3: Create GameContext and provider**

```typescript
export const GameContext = React.createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}
```

- [ ] **Step 4: Create useGameState hook**

```typescript
// app/hooks/useGameState.ts
import { useContext } from 'react';
import { GameContext } from '@/contexts/GameContext';

export function useGameState() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within GameProvider');
  }
  return context;
}
```

- [ ] **Step 5: Run tests**

In `app/` directory, create a simple test file to verify state transitions:

```bash
# Verify the reducer logic by importing and testing manually in a test file
# (Jest should already be configured for the app directory)
```

- [ ] **Step 6: Commit**

```bash
git add app/contexts/GameContext.tsx app/hooks/useGameState.ts
git commit -m "feat: add game state management with context and reducer"
```

---

### Task 2: Define Game and Word Data Constants

**Files:**
- Create: `app/constants/games.ts`
- Create: `app/constants/words.ts`

- [ ] **Step 1: Create games constant**

```typescript
// app/constants/games.ts
export const GAMES = [
  {
    id: 'teikna',
    label: 'Teikna',
    icon: '✏️',
    description: 'Teiknaðu orðið',
  },
  {
    id: 'utskyra',
    label: 'Útskýra',
    icon: '💬',
    description: 'Útskýrðu orðið',
  },
  {
    id: 'leika',
    label: 'Leika',
    icon: '🎭',
    description: 'Leiktu orðið',
  },
] as const;

export type GameId = typeof GAMES[number]['id'];
```

- [ ] **Step 2: Create words constant**

```typescript
// app/constants/words.ts
export interface Word {
  id: string;
  word: string;
  category: 'nafn' | 'sagn' | 'lys' | 'orne';
}

export const WORDS: Word[] = [
  { id: '1', word: 'eldfjall', category: 'nafn' },
  { id: '2', word: 'dansa', category: 'sagn' },
  { id: '3', word: 'elding', category: 'nafn' },
  { id: '4', word: 'alþingi', category: 'nafn' },
  { id: '5', word: 'ráðherra', category: 'nafn' },
  { id: '6', word: 'Þingvallavatn', category: 'orne' },
  // Add more words as needed
];

export const CATEGORIES = [
  { id: 'nafn', label: 'Nafnorð', emoji: '🏠' },
  { id: 'sagn', label: 'Sagnorð', emoji: '🏃' },
  { id: 'lys', label: 'Lýsingaorð', emoji: '🎨' },
  { id: 'orne', label: 'Örnefni', emoji: '🗺️' },
] as const;
```

- [ ] **Step 3: Update GameContext to use words**

In `GameContext.tsx`, import and use the words:

```typescript
import { WORDS } from '@/constants/words';
// Already reference WORDS in the reducer nextWord case above
```

- [ ] **Step 4: Commit**

```bash
git add app/constants/games.ts app/constants/words.ts
git commit -m "feat: define game types and word data"
```

---

### Task 3: Create Design Token System

**Files:**
- Create: `app/constants/gameTokens.ts`

- [ ] **Step 1: Define colors**

```typescript
// app/constants/gameTokens.ts
export const COLORS = {
  parchment: {
    bg: '#F5F1E8',
    primary: '#1F6B66', // deep teal
    accent: '#C08A1A', // ochre
    secondary: '#8B6F47', // rust
    text: '#1A1A1C',
    textLight: '#6B6B70',
    border: '#D4CEBD',
  },
  midnight: {
    bg: '#1A1A1C',
    primary: '#7FB3AD', // lighter teal
    accent: '#E6C547', // lighter ochre
    secondary: '#C99A6E', // lighter rust
    text: '#F5F1E8',
    textLight: '#A8A8AD',
    border: '#3A3A3D',
  },
  fjord: {
    bg: '#E8EEF2',
    primary: '#1F4A6B', // cool teal
    accent: '#6B7B6B', // muted green
    secondary: '#8B5A4A', // cool rust
    text: '#1A1A1C',
    textLight: '#6B6B70',
    border: '#D4D9DF',
  },
};

export type ThemeName = keyof typeof COLORS;
export type Theme = typeof COLORS.parchment;
```

- [ ] **Step 2: Define typography**

```typescript
export const FONTS = {
  serif: {
    family: 'DMSerifDisplay_400Regular',
    weight: '400' as const,
  },
  serifBold: {
    family: 'DMSerifDisplay_400Regular', // Use bold variant when available
    weight: '700' as const,
  },
  sans: {
    family: 'FamiljenGrotesk_400Regular',
    weight: '400' as const,
  },
  sansBold: {
    family: 'FamiljenGrotesk_700Bold',
    weight: '700' as const,
  },
  mono: {
    family: 'JetBrainsMono_400Regular',
    weight: '400' as const,
  },
};

export const TYPOGRAPHY = {
  headline: {
    fontSize: 32,
    fontFamily: FONTS.serif.family,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.serifBold.family,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontFamily: FONTS.sans.family,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: FONTS.sans.family,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.sansBold.family,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 1,
  },
};
```

- [ ] **Step 3: Define spacing and sizing**

```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const SIZES = {
  buttonHeight: 52,
  chipHeight: 44,
  cardHeight: 240,
  iconSize: 24,
};
```

- [ ] **Step 4: Create theme getter**

```typescript
export function getTheme(themeName: ThemeName = 'parchment'): Theme {
  return COLORS[themeName];
}
```

- [ ] **Step 5: Commit**

```bash
git add app/constants/gameTokens.ts
git commit -m "feat: add design token system (colors, typography, spacing)"
```

---

### Task 4: Create Reusable Components

**Files:**
- Create: `app/components/GameCard.tsx`
- Create: `app/components/GameButton.tsx`
- Create: `app/components/DifficultyChip.tsx`
- Create: `app/components/CategoryToggle.tsx`
- Create: `app/components/Divider.tsx`

- [ ] **Step 1: Create GameCard component**

```typescript
// app/components/GameCard.tsx
import { View, Text } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING } from '@/constants/gameTokens';

interface GameCardProps {
  word: string;
  theme: typeof COLORS.parchment;
}

export function GameCard({ word, theme }: GameCardProps) {
  return (
    <View
      style={{
        backgroundColor: theme.bg,
        borderColor: theme.border,
        borderWidth: 2,
        borderRadius: 16,
        paddingVertical: SPACING.xxxl,
        paddingHorizontal: SPACING.xl,
        marginVertical: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
      }}
    >
      <Text
        style={{
          ...TYPOGRAPHY.headline,
          color: theme.text,
          textAlign: 'center',
          fontSize: word.length > 12 ? 48 : 64,
        }}
      >
        {word}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Create GameButton component**

```typescript
// app/components/GameButton.tsx
import { Pressable, Text } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING, SIZES } from '@/constants/gameTokens';

interface GameButtonProps {
  label: string;
  onPress: () => void;
  theme: typeof COLORS.parchment;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function GameButton({
  label,
  onPress,
  theme,
  variant = 'primary',
  disabled = false,
}: GameButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        height: SIZES.buttonHeight,
        backgroundColor: isPrimary ? theme.primary : theme.accent,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
        marginVertical: SPACING.sm,
      })}
    >
      <Text
        style={{
          ...TYPOGRAPHY.body,
          color: theme.bg,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 3: Create DifficultyChip component**

```typescript
// app/components/DifficultyChip.tsx
import { Pressable, Text } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING, SIZES } from '@/constants/gameTokens';

interface DifficultyChipProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: (value: string) => void;
  theme: typeof COLORS.parchment;
}

export function DifficultyChip({
  label,
  value,
  selected,
  onPress,
  theme,
}: DifficultyChipProps) {
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={{
        height: SIZES.chipHeight,
        borderWidth: 2,
        borderColor: selected ? theme.primary : theme.border,
        borderRadius: 10,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: selected ? theme.primary : 'transparent',
      }}
    >
      <Text
        style={{
          ...TYPOGRAPHY.body,
          color: selected ? theme.bg : theme.text,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 4: Create CategoryToggle component**

```typescript
// app/components/CategoryToggle.tsx
import { Pressable, Text, View } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING } from '@/constants/gameTokens';

interface CategoryToggleProps {
  label: string;
  checked: boolean;
  onPress: () => void;
  theme: typeof COLORS.parchment;
}

export function CategoryToggle({
  label,
  checked,
  onPress,
  theme,
}: CategoryToggleProps) {
  return (
    <Pressable onPress={onPress} style={{ marginVertical: SPACING.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: theme.primary,
            borderRadius: 4,
            marginRight: SPACING.md,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: checked ? theme.primary : 'transparent',
          }}
        >
          {checked && (
            <Text style={{ color: theme.bg, fontSize: 14, fontWeight: 'bold' }}>✓</Text>
          )}
        </View>
        <Text style={{ ...TYPOGRAPHY.body, color: theme.text }}>{label}</Text>
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 5: Create Divider component**

```typescript
// app/components/Divider.tsx
import { View, Text } from 'react-native';
import { TYPOGRAPHY, COLORS, SPACING } from '@/constants/gameTokens';

interface DividerProps {
  title: string;
  theme: typeof COLORS.parchment;
}

export function Divider({ title, theme }: DividerProps) {
  return (
    <View style={{ marginVertical: SPACING.lg, alignItems: 'center' }}>
      <Text
        style={{
          ...TYPOGRAPHY.label,
          color: theme.textLight,
          letterSpacing: 2,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: theme.border,
          width: '80%',
          marginTop: SPACING.md,
        }}
      />
    </View>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/components/GameCard.tsx app/components/GameButton.tsx \
         app/components/DifficultyChip.tsx app/components/CategoryToggle.tsx \
         app/components/Divider.tsx
git commit -m "feat: add reusable game UI components"
```

---

### Task 5: Install Required Fonts

**Files:**
- Modify: `app/package.json` (if needed)
- Modify: `app/_layout.tsx` (add font loading)

- [ ] **Step 1: Verify or install font packages**

Run in `app/` directory:

```bash
npx expo install expo-font @expo-google-fonts/familjen-grotesk @expo-google-fonts/dm-serif-display @expo-google-fonts/jetbrains-mono
```

- [ ] **Step 2: Update root layout to load fonts**

```typescript
// app/_layout.tsx (update the existing file)
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    FamiljenGrotesk_400Regular: require('@expo-google-fonts/familjen-grotesk/FamiljenGrotesk_400Regular.ttf'),
    FamiljenGrotesk_700Bold: require('@expo-google-fonts/familjen-grotesk/FamiljenGrotesk_700Bold.ttf'),
    DMSerifDisplay_400Regular: require('@expo-google-fonts/dm-serif-display/DMSerifDisplay_400Regular.ttf'),
    JetBrainsMono_400Regular: require('@expo-google-fonts/jetbrains-mono/JetBrainsMono_400Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  // ... rest of layout
}
```

- [ ] **Step 3: Verify fonts are accessible**

Create a simple test screen that renders text in each font to verify loading works.

- [ ] **Step 4: Commit**

```bash
git add app/package.json app/_layout.tsx
git commit -m "feat: add and load Nordic vintage fonts"
```

---

### Task 6: Create Setup Screen

**Files:**
- Create: `app/games/setup.tsx`
- Create: `app/games/_layout.tsx`

- [ ] **Step 1: Create games route layout**

```typescript
// app/games/_layout.tsx
import { Stack } from 'expo-router';
import { GameProvider } from '@/contexts/GameContext';

export default function GamesLayout() {
  return (
    <GameProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </GameProvider>
  );
}
```

- [ ] **Step 2: Create setup screen**

```typescript
// app/games/setup.tsx
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { CATEGORIES } from '@/constants/words';
import { getTheme, SPACING, TYPOGRAPHY } from '@/constants/gameTokens';
import { GameButton } from '@/components/GameButton';
import { CategoryToggle } from '@/components/CategoryToggle';
import { Divider } from '@/components/Divider';

export default function SetupScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = getTheme('parchment'); // TODO: make theme configurable

  const selectedGame = GAMES.find((g) => g.id === state.game);
  const hasSelectedCategories = Object.values(state.categories).some((v) => v);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <ScrollView
        style={{ flex: 1, paddingHorizontal: SPACING.lg }}
        contentContainerStyle={{ paddingVertical: SPACING.xl }}
      >
        <Text style={{ ...TYPOGRAPHY.headline, color: theme.text, marginBottom: SPACING.xl }}>
          Orð
        </Text>

        <Divider title="LEIKIR" theme={theme} />

        {GAMES.map((game) => (
          <GameButton
            key={game.id}
            label={`${game.icon} ${game.label}`}
            onPress={() => dispatch({ type: 'setGame', game: game.id as any })}
            theme={theme}
            variant={state.game === game.id ? 'primary' : 'secondary'}
          />
        ))}

        <Divider title="FLOKKAR" theme={theme} />

        {CATEGORIES.map((cat) => (
          <CategoryToggle
            key={cat.id}
            label={cat.label}
            checked={state.categories[cat.id as any]}
            onPress={() => dispatch({ type: 'toggleCategory', category: cat.id as any })}
            theme={theme}
          />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
        <GameButton
          label="Hefjum leik →"
          onPress={() => {
            if (hasSelectedCategories) {
              dispatch({ type: 'startGame' });
              router.push('/games/play');
            }
          }}
          theme={theme}
          disabled={!hasSelectedCategories}
        />
        {!hasSelectedCategories && (
          <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight, marginTop: SPACING.sm }}>
            Veldu a.m.k. einn flokk
          </Text>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Update root layout to add games route**

```typescript
// In app/_layout.tsx, add to Stack.Screen:
<Stack.Screen name="games" options={{ headerShown: false }} />
```

- [ ] **Step 4: Test navigation**

Run the app and verify:
- Setup screen loads
- Game selection works (buttons toggle)
- Category toggles work
- Start button navigates to /games/play
- Start button is disabled when no categories selected

- [ ] **Step 5: Commit**

```bash
git add app/games/_layout.tsx app/games/setup.tsx
git commit -m "feat: implement setup screen with game and category selection"
```

---

### Task 7: Create Play Screen

**Files:**
- Create: `app/games/play.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/games/play.tsx
import { View, Text, Pressable } from 'react-native';
import { useRouter } useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { WORDS } from '@/constants/words';
import { getTheme, SPACING, TYPOGRAPHY } from '@/constants/gameTokens';
import { GameCard } from '@/components/GameCard';
import { GameButton } from '@/components/GameButton';

export default function PlayScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = getTheme('parchment');
  
  const currentWord = WORDS[state.wordIndex % WORDS.length];

  if (!currentWord) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ ...TYPOGRAPHY.body, color: theme.text }}>Engin orð í boði</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg }}>
          <View />
          <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>
            {state.currentWord?.word || `Orð #${state.wordIndex + 1}`}
          </Text>
        </View>

        <GameCard word={currentWord.word} theme={theme} />
      </View>

      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm }}>
        <GameButton
          label="Fá annað orð"
          onPress={() => {
            dispatch({ type: 'goToReview' });
            router.push('/games/review');
          }}
          theme={theme}
        />
        <GameButton
          label="Sleppa"
          onPress={() => {
            dispatch({ type: 'goToReview' });
            router.push('/games/review');
          }}
          theme={theme}
          variant="secondary"
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Test the screen**

Run the app, navigate to setup, select game/categories, start game. Verify:
- Word card displays the current word
- Buttons are visible and centered
- Word changes when expected
- Navigation to review works

- [ ] **Step 3: Commit**

```bash
git add app/games/play.tsx
git commit -m "feat: implement play screen with word display and navigation"
```

---

### Task 8: Create Review Screen

**Files:**
- Create: `app/games/review.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/games/review.tsx
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { WORDS } from '@/constants/words';
import { getTheme, SPACING, TYPOGRAPHY } from '@/constants/gameTokens';
import { GameCard } from '@/components/GameCard';
import { DifficultyChip } from '@/components/DifficultyChip';
import { GameButton } from '@/components/GameButton';

export default function ReviewScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = getTheme('parchment');

  const currentWord = WORDS[state.wordIndex % WORDS.length];

  const handleRating = (rating: string) => {
    dispatch({ type: 'setRating', rating: rating as any });
    // Auto-advance after brief delay
    setTimeout(() => {
      dispatch({ type: 'nextWord' });
      if (state.wordIndex + 1 >= WORDS.length) {
        router.push('/games/summary');
      } else {
        router.push('/games/play');
      }
    }, 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, paddingHorizontal: SPACING.lg, justifyContent: 'center' }}>
        <GameCard word={currentWord.word} theme={theme} />

        <Text style={{ ...TYPOGRAPHY.body, color: theme.text, marginBottom: SPACING.lg }}>
          Erfitt?
        </Text>

        <View style={{ gap: SPACING.md, marginBottom: SPACING.xl }}>
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

      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl }}>
        <GameButton
          label="Fá annað orð"
          onPress={() => {
            if (state.currentRating) {
              dispatch({ type: 'nextWord' });
              if (state.wordIndex + 1 >= WORDS.length) {
                router.push('/games/summary');
              } else {
                router.push('/games/play');
              }
            }
          }}
          theme={theme}
          disabled={!state.currentRating}
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Test the screen**

Verify:
- Difficulty chips are selectable
- Tapping a chip auto-advances to next word
- Navigation to summary or play works correctly
- Final word advances to summary

- [ ] **Step 3: Commit**

```bash
git add app/games/review.tsx
git commit -m "feat: implement review screen with difficulty rating"
```

---

### Task 9: Create Summary Screen

**Files:**
- Create: `app/games/summary.tsx`

- [ ] **Step 1: Write the screen**

```typescript
// app/games/summary.tsx
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { getTheme, SPACING, TYPOGRAPHY } from '@/constants/gameTokens';
import { GameButton } from '@/components/GameButton';

export default function SummaryScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const theme = getTheme('parchment');

  const wordCount = state.playedWords.length;
  const skippedCount = state.playedWords.filter((w) => w.rating === 'skipped').length;
  const hardCount = state.playedWords.filter((w) => w.rating === 'hard').length;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, padding: SPACING.lg, justifyContent: 'center' }}>
      <View style={{ marginBottom: SPACING.xxl }}>
        <Text style={{ ...TYPOGRAPHY.headline, color: theme.text, marginBottom: SPACING.lg }}>
          Lokum
        </Text>

        <View style={{ marginVertical: SPACING.xl }}>
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>orð</Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>{wordCount}</Text>
          </View>
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>sleppt</Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>{skippedCount}</Text>
          </View>
          <View style={{ marginVertical: SPACING.md }}>
            <Text style={{ ...TYPOGRAPHY.bodySmall, color: theme.textLight }}>þung</Text>
            <Text style={{ ...TYPOGRAPHY.title, color: theme.text }}>{hardCount}</Text>
          </View>
        </View>
      </View>

      <View style={{ gap: SPACING.sm }}>
        <GameButton
          label="Aftur í leik"
          onPress={() => {
            dispatch({ type: 'playAgain' });
            router.push('/games/play');
          }}
          theme={theme}
        />
        <GameButton
          label="Aðalvalmynd"
          onPress={() => {
            dispatch({ type: 'goToMenu' });
            router.push('/');
          }}
          theme={theme}
          variant="secondary"
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Test the screen**

Verify:
- Stats display correctly (word, skipped, hard counts)
- Play again button restarts the game
- Menu button returns to home
- Layout is visually balanced

- [ ] **Step 3: Commit**

```bash
git add app/games/summary.tsx
git commit -m "feat: implement summary screen with game statistics"
```

---

### Task 10: Test Complete Flow

**Files:**
- Modify: `app/__tests__/` (add integration test)

- [ ] **Step 1: Manual end-to-end test**

Run the app with `npm start` and manually:

1. Navigate to games setup
2. Select a game (Teikna, Útskýra, or Leika)
3. Select at least one category
4. Start game
5. View word on play screen
6. Navigate to review screen
7. Rate difficulty (or skip)
8. Proceed through words until summary
9. View stats on summary screen
10. Test "Aftur í leik" and "Aðalvalmynd" buttons

Verify all navigation works and state persists correctly.

- [ ] **Step 2: Test on device or simulator**

Run on both web and iOS simulator to verify responsive layout.

- [ ] **Step 3: Commit**

```bash
git add . # Stage any test files or config changes
git commit -m "test: verify end-to-end game flow"
```

---

### Task 11: Polish and Refinements

**Files:**
- Modify: Components as needed for visual refinement

- [ ] **Step 1: Adjust spacing and sizing for visual balance**

Run the app and review:
- Button heights, card sizing, text scaling
- Padding/margins between sections
- Touch target sizes (minimum 44x44 per accessibility)

Make adjustments to `SPACING` and `SIZES` constants as needed.

- [ ] **Step 2: Test accessibility**

Verify:
- Text is readable without zooming
- Colors have sufficient contrast (WCAG AA)
- Buttons are large enough to tap
- All interactive elements have clear focus states

- [ ] **Step 3: Commit refinements**

```bash
git add app/constants/gameTokens.ts app/components/*.tsx
git commit -m "refactor: polish spacing, sizing, and accessibility"
```

---

## Verification Checklist

Before marking this plan complete:

- [ ] All 4 screens render without errors
- [ ] State management works (words advance, ratings persist)
- [ ] Navigation flows correctly (Setup → Play → Review → Summary → Menu)
- [ ] Design tokens are applied consistently (colors, fonts, spacing)
- [ ] Buttons and interactive elements have appropriate sizes (44x44 minimum)
- [ ] Text is readable without zooming
- [ ] Responsive layout works on web, iOS, Android simulators
- [ ] Game can be restarted and played multiple times

---

## Notes for Implementation

1. **Theme Management**: Currently hardcoded to 'parchment'. Can be expanded later to support Midnight/Fjord via React Context.

2. **Word Data**: Currently stored in constants. Can be replaced with API calls to the Go backend.

3. **Score Tracking**: Removed per user feedback. Can be re-added later if needed.

4. **Progress Counter**: Removed per user feedback (don't display total word count).

5. **Rune Strip**: Design includes optional rune strip decoration. Can be added as optional visual refinement in `GameLayout` component.

6. **Animations**: Basic animations included (route transitions). Can be enhanced with screen entry/exit animations.
