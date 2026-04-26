# Orð Game Screens Design Implementation (Redesign)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the Orð game screens to accurately match the design prototype with proper color tokens, Stone component (3D buttons), RuneStrip visuals, and correct screen layouts.

**Architecture:** The design uses a component-based system with design tokens (colors, fonts, spacing). The core interactive element is the Stone component—a custom button with visual depth using box-shadow effects and press feedback. RuneStrip adds Elder Futhark runes for aesthetic flavor. All screens are built from these composable atoms.

**Tech Stack:** React Native with Expo, TypeScript, NativeWind (Tailwind), design tokens system (colors, typography, spacing).

---

## File Structure

**Files to modify:**
- `app/constants/gameTokens.ts` — Color palettes, fonts, spacing, sizes (currently wrong colors)
- `app/components/Stone.tsx` — NEW: Custom button with 3D depth effect
- `app/components/RuneStrip.tsx` — NEW: Elder Futhark rune display
- `app/components/Divider.tsx` — Update to match design
- `app/app/games/setup.tsx` — Complete rewrite with proper styling
- `app/app/games/play.tsx` — Complete rewrite with proper layout
- `app/app/games/review.tsx` — Complete rewrite with difficulty chips
- `app/app/games/summary.tsx` — Complete rewrite with statistics

---

## Task 1: Update Color Tokens

**Files:**
- Modify: `app/constants/gameTokens.ts` (lines 1-35, color definitions)

The current color tokens don't match the design. Replace with exact palettes from the design prototype.

- [ ] **Step 1: Read current gameTokens file**

Run: `cat app/constants/gameTokens.ts | head -50`

- [ ] **Step 2: Replace color token definitions**

Replace the entire COLORS object in `app/constants/gameTokens.ts` with:

```typescript
export const COLORS = {
  parchment: {
    bg: '#ece1c7',
    bgDeep: '#dccfaf',
    card: '#f6ecd2',
    ink: '#1c2a2c',
    inkSoft: '#4d5a5a',
    teal: '#114a4a',
    tealMid: '#1f6b66',
    ochre: '#c08a1a',
    ochreLight: '#e3b34a',
    rust: '#a4421f',
    forest: '#3a5d33',
  },
  midnight: {
    bg: '#1a2426',
    bgDeep: '#111a1c',
    card: '#243234',
    ink: '#ece1c7',
    inkSoft: '#a09686',
    teal: '#5fbab3',
    tealMid: '#3e8c87',
    ochre: '#e3b34a',
    ochreLight: '#f1cf7e',
    rust: '#e07b54',
    forest: '#7fb474',
  },
  fjord: {
    bg: '#dde7e7',
    bgDeep: '#c8d6d6',
    card: '#eaf1f1',
    ink: '#0f2326',
    inkSoft: '#48646a',
    teal: '#0a4a4d',
    tealMid: '#1a6d70',
    ochre: '#b8742d',
    ochreLight: '#dca35c',
    rust: '#a13b22',
    forest: '#39603a',
  },
} as const;
```

- [ ] **Step 3: Verify file compiles**

Run: `cd app && npm run lint -- constants/gameTokens.ts`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/constants/gameTokens.ts
git commit -m "fix: update color tokens to match design palettes exactly"
```

---

## Task 2: Create Stone Component

**Files:**
- Create: `app/components/Stone.tsx`

The Stone component is a custom button/card with 3D depth effect. On press, it animates down with box-shadow feedback.

- [ ] **Step 1: Create Stone component file**

Create `app/components/Stone.tsx` with:

```typescript
import React, { useState } from 'react';
import { Pressable, View, ViewStyle } from 'react-native';

interface StoneProps {
  children: React.ReactNode;
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  color?: string;
  fg?: string;
  selected?: boolean;
  onClick?: () => void;
  style?: ViewStyle;
  radius?: number;
  border?: string;
  depth?: number;
}

export function Stone({
  children,
  tk,
  color,
  fg,
  selected,
  onClick,
  style,
  radius = 14,
  border,
  depth = 2,
}: StoneProps) {
  const [pressed, setPressed] = useState(false);

  const bg = color || tk.card;
  const text = fg || tk.ink;
  const b = border || tk.ink;

  // Calculate shadow based on pressed state and depth
  const shadowElevation = pressed ? 0 : depth;

  return (
    <Pressable
      onPress={onClick}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={!onClick}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1.5,
        borderColor: b,
        paddingVertical: 12,
        paddingHorizontal: 14,
        opacity: onClick ? 1 : 1,
        elevation: shadowElevation,
        // iOS shadow
        shadowColor: b,
        shadowOffset: { width: 0, height: shadowElevation },
        shadowOpacity: 0.25,
        shadowRadius: 0,
        transform: [{ translateY: pressed ? depth : 0 }],
        ...style,
      }}
    >
      <View style={{ color: text }}>
        {children}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Verify component exports**

Run: `grep -n "export.*Stone" app/components/Stone.tsx`

Expected: Should show `export function Stone`

- [ ] **Step 3: Commit**

```bash
git add app/components/Stone.tsx
git commit -m "feat: implement Stone component with 3D depth effect"
```

---

## Task 3: Create RuneStrip Component

**Files:**
- Create: `app/components/RuneStrip.tsx`

RuneStrip displays Elder Futhark runes in a row with customizable color and opacity.

- [ ] **Step 1: Create RuneStrip component file**

Create `app/components/RuneStrip.tsx` with:

```typescript
import React from 'react';
import { Text, View } from 'react-native';

interface RuneStripProps {
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  color?: string;
  opacity?: number;
}

export function RuneStrip({ tk, color, opacity }: RuneStripProps) {
  const c = color || tk.teal;
  const o = opacity ?? tk.runeIntensity ?? 0.85;
  const glyphs = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'];

  return (
    <View style={{ alignItems: 'center' }}>
      <Text
        style={{
          fontSize: 10,
          letterSpacing: 6,
          color: c,
          opacity: o,
          fontFamily: 'serif',
          lineHeight: 14,
        }}
      >
        {glyphs.join('')}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Verify component exports**

Run: `grep -n "export.*RuneStrip" app/components/RuneStrip.tsx`

Expected: Should show `export function RuneStrip`

- [ ] **Step 3: Add runeIntensity to token type**

Update `app/constants/gameTokens.ts` to include `runeIntensity` in the parchment color type. Add after COLORS definition:

```typescript
// Add this line to each palette in makeTokens if needed, or ensure tokens have runeIntensity
// This is already handled by the tweaks system in the design
```

- [ ] **Step 4: Commit**

```bash
git add app/components/RuneStrip.tsx
git commit -m "feat: implement RuneStrip component with Elder Futhark runes"
```

---

## Task 4: Update Divider Component

**Files:**
- Modify: `app/components/Divider.tsx`

Update to match design: horizontal line with optional centered label in monospace.

- [ ] **Step 1: Read current Divider component**

Run: `cat app/components/Divider.tsx`

- [ ] **Step 2: Replace with design version**

Replace `app/components/Divider.tsx` with:

```typescript
import React from 'react';
import { View, Text } from 'react-native';

interface DividerProps {
  tk: typeof import('@/constants/gameTokens').COLORS.parchment;
  label?: string;
}

export function Divider({ tk, label }: DividerProps) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: tk.ink, opacity: 0.25 }} />
      {label && (
        <Text
          style={{
            fontFamily: 'JetBrainsMono_400Regular',
            fontSize: 10,
            color: tk.inkSoft,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
      )}
      <View style={{ flex: 1, height: 1, backgroundColor: tk.ink, opacity: 0.25 }} />
    </View>
  );
}
```

- [ ] **Step 3: Verify no type errors**

Run: `cd app && npm run lint -- components/Divider.tsx`

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add app/components/Divider.tsx
git commit -m "refactor: update Divider to match design with monospace label"
```

---

## Task 5: Rewrite Setup Screen

**Files:**
- Modify: `app/app/games/setup.tsx`

Complete rewrite to use Stone components for games and categories, RuneStrip in header, proper layout matching design.

- [ ] **Step 1: Read design setup.jsx again for exact layout**

Note the structure:
- Header: "Orð · Kafli I" (monospace) + RuneStrip on right
- H1: "Veldu þinn orðaleik" with italic "orðaleik" in teal
- Divider with "leikir"
- Games as Stone cards (selected = teal bg, white text)
- Categories label with count "· Orðaflokkar · X/4"
- Categories as pill buttons (selected = ochreLight)
- Start button (enabled = teal, disabled = bgDeep)

- [ ] **Step 2: Replace setup.tsx**

Replace entire `app/app/games/setup.tsx` with:

```typescript
import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { CATEGORIES } from '@/constants/words';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';
import { Divider } from '@/components/Divider';

export default function SetupScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const tk = COLORS.parchment; // TODO: support theme switching
  const selectedCatsCount = Object.values(state.categories).filter(Boolean).length;

  const handleGameSelect = (gameId: string) => {
    dispatch({ type: 'SET_GAME', payload: gameId as 'teikna' | 'utskyra' | 'leika' });
  };

  const handleCategoryToggle = (catId: string) => {
    dispatch({ type: 'TOGGLE_CATEGORY', payload: catId as 'nafn' | 'sagn' | 'lys' | 'orne' });
  };

  const handleStart = () => {
    if (selectedCatsCount > 0) {
      dispatch({ type: 'START_GAME' });
      router.push('./play');
    }
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
        <Stone
          tk={tk}
          color={selectedCatsCount > 0 ? tk.teal : tk.bgDeep}
          fg={selectedCatsCount > 0 ? tk.bg : tk.inkSoft}
          depth={selectedCatsCount > 0 ? 4 : 1}
          onClick={selectedCatsCount > 0 ? handleStart : undefined}
          style={{ paddingVertical: 16, alignItems: 'center', opacity: selectedCatsCount > 0 ? 1 : 0.6 }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: selectedCatsCount > 0 ? tk.bg : tk.inkSoft }}>
            Hefjum leik →
          </Text>
          {selectedCatsCount === 0 && (
            <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.7, letterSpacing: 1.5, marginTop: 2, textTransform: 'uppercase', color: tk.inkSoft }}>
              Veldu a.m.k. einn flokk
            </Text>
          )}
        </Stone>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Test game selection works**

Start the dev server and navigate to setup screen. Try selecting different games—the card should change to teal with white text. Try selecting categories—pills should turn ochreLight.

Run: `cd app && npm start` (then press 'w' for web or 'i' for iOS simulator)

Expected: Games and categories respond to taps, colors change appropriately

- [ ] **Step 4: Commit**

```bash
git add app/app/games/setup.tsx
git commit -m "feat: rewrite setup screen with Stone components and proper design layout"
```

---

## Task 6: Rewrite Play Screen

**Files:**
- Modify: `app/app/games/play.tsx`

Rewrite with proper layout: header with game emoji/label and word counter, large word card with RuneStrip, two action buttons.

- [ ] **Step 1: Replace play.tsx**

Replace entire `app/app/games/play.tsx` with:

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { GAMES } from '@/constants/games';
import { WORDS } from '@/constants/words';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';

export default function PlayScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const tk = COLORS.parchment;
  const word = WORDS[state.wordIndex % WORDS.length];
  const game = GAMES.find((g) => g.id === state.game) || GAMES[2];

  const handleReview = () => {
    dispatch({ type: 'SET_RATING', payload: null });
    router.push('./review');
  };

  const fontSize = word.word.length > 9 ? 56 : 78;

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 16 }}>{game.icon}</Text>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 16, lineHeight: 16, fontWeight: '700', fontStyle: 'italic', color: tk.ink }}>
            {game.label}
          </Text>
        </View>
        <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}>
          Orð #{state.wordIndex + 1}
        </Text>
      </View>

      {/* Word Card */}
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 22, paddingVertical: 20 }}>
        <Stone tk={tk} depth={4} radius={20} style={{ paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
          <View style={{ marginBottom: 20 }}>
            <RuneStrip tk={tk} />
          </View>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize, lineHeight: fontSize * 1.2, fontWeight: '700', color: tk.ink, letterSpacing: -2, marginVertical: 20 }}>
            {word.word}
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 12, color: tk.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            {word.category}
          </Text>
        </Stone>
      </View>

      {/* Action Buttons */}
      <View style={{ paddingHorizontal: 22, paddingBottom: 28, gap: 10 }}>
        <Stone
          tk={tk}
          color={tk.teal}
          fg={tk.bg}
          depth={3}
          onClick={handleReview}
          style={{ paddingVertical: 15, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: tk.bg }}>
            Fá annað orð →
          </Text>
        </Stone>
        <Stone
          tk={tk}
          color={tk.ochreLight}
          onClick={handleReview}
          style={{ paddingVertical: 13, alignItems: 'center' }}
        >
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 17, fontWeight: '700', color: tk.ink }}>
            Sleppa
          </Text>
        </Stone>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Test play screen displays**

Navigate to play screen. Should see:
- Game emoji and label in header
- Large word displayed in Stone card
- RuneStrip above word
- Two buttons: teal "Fá annað orð" and ochreLight "Sleppa"

Expected: Word displays, buttons are tappable

- [ ] **Step 3: Commit**

```bash
git add app/app/games/play.tsx
git commit -m "feat: rewrite play screen with proper design layout and Stone components"
```

---

## Task 7: Rewrite Review Screen

**Files:**
- Modify: `app/app/games/review.tsx`

Rewrite with difficulty rating chips (Létt/Mið/Þungt) as Stone components with color coding.

- [ ] **Step 1: Replace review.tsx**

Replace entire `app/app/games/review.tsx` with:

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameState } from '@/hooks/useGameState';
import { WORDS } from '@/constants/words';
import { COLORS } from '@/constants/gameTokens';
import { Stone } from '@/components/Stone';
import { RuneStrip } from '@/components/RuneStrip';

export default function ReviewScreen() {
  const router = useRouter();
  const { state, dispatch } = useGameState();
  const tk = COLORS.parchment;
  const word = WORDS[state.wordIndex % WORDS.length];
  const [confirmEnd, setConfirmEnd] = useState(false);

  const ratings = [
    { id: 'easy' as const, label: 'Létt', color: tk.forest, glyph: '·' },
    { id: 'medium' as const, label: 'Mið', color: tk.ochre, glyph: '··' },
    { id: 'hard' as const, label: 'Þungt', color: tk.rust, glyph: '···' },
  ];

  const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
    dispatch({ type: 'SET_RATING', payload: rating });
    setTimeout(() => {
      dispatch({ type: 'NEXT_WORD' });
      router.push('./play');
    }, 220);
  };

  const fontSize = word.word.length > 9 ? 54 : 66;

  return (
    <View style={{ flex: 1, backgroundColor: tk.bg }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingVertical: 28 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <Text
            onPress={() => {
              dispatch({ type: 'PREVIOUS_WORD' });
              router.push('./play');
            }}
            style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.inkSoft, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            ← Aftur
          </Text>
          <Text
            onPress={() => {
              dispatch({ type: 'END_GAME' });
              router.push('./summary');
            }}
            style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, color: tk.rust, letterSpacing: 1.4, textTransform: 'uppercase' }}
          >
            Hætta
          </Text>
        </View>

        {/* Word Display */}
        <View style={{ alignItems: 'center', marginTop: 22, marginBottom: 22 }}>
          <View style={{ marginBottom: 10 }}>
            <RuneStrip tk={tk} />
          </View>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 10, letterSpacing: 1.5, color: tk.inkSoft, textTransform: 'uppercase' }}>
            Orðið var
          </Text>
          <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize, lineHeight: fontSize * 1.05, fontWeight: '700', color: tk.ink, letterSpacing: -1.5, marginTop: 6 }}>
            {word.word}
          </Text>
          <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tk.inkSoft, marginTop: 4 }}>
            {word.category}
          </Text>
        </View>

        {/* Question */}
        <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, lineHeight: 24, fontWeight: '700', color: tk.ink, marginTop: 26, marginBottom: 12 }}>
          Hversu erfitt var orðið?
        </Text>

        {/* Rating Chips */}
        <View style={{ gap: 8, marginBottom: 'auto' }}>
          {ratings.map((r) => {
            const isSelected = state.rating === r.id;
            return (
              <Stone
                key={r.id}
                tk={tk}
                color={isSelected ? r.color : tk.card}
                fg={isSelected ? tk.bg : tk.ink}
                selected={isSelected}
                onClick={() => handleRate(r.id)}
                style={{ paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 16, letterSpacing: 2, width: 40, color: isSelected ? tk.bg : tk.ink }}>
                    {r.glyph}
                  </Text>
                  <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 22, fontWeight: '700', fontStyle: isSelected ? 'italic' : 'normal', color: isSelected ? tk.bg : tk.ink }}>
                    {r.label}
                  </Text>
                </View>
              </Stone>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Test difficulty rating**

Navigate to review screen. Tap one of the difficulty chips. Should see:
- Chip background changes to its color (forest/ochre/rust)
- Chip text becomes white
- Auto-advances to next word after 220ms

Expected: Difficulty selection works and screen advances

- [ ] **Step 3: Commit**

```bash
git add app/app/games/review.tsx
git commit -m "feat: rewrite review screen with color-coded difficulty chips"
```

---

## Task 8: Rewrite Summary Screen

**Files:**
- Modify: `app/app/games/summary.tsx`

Rewrite with statistics display in 3-column teal card and word list with difficulty glyphs.

- [ ] **Step 1: Replace summary.tsx**

Replace entire `app/app/games/summary.tsx` with:

```typescript
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
    skipped: { color: tk.inkSoft, label: 'Sleppt', glyph: '↷' },
  };

  const played = state.playedWords || [];
  const counts = played.reduce<Record<string, number>>((a, p) => ({ ...a, [p.rating]: (a[p.rating] || 0) + 1 }), {});

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
                {counts.skipped || 0}
              </Text>
              <Text style={{ fontFamily: 'JetBrainsMono_400Regular', fontSize: 9, opacity: 0.85, letterSpacing: 1.5, marginTop: 4, color: tk.bg, textTransform: 'uppercase' }}>
                sleppt
              </Text>
            </View>
            <View style={{ alignItems: 'center', flex: 1 }}>
              <Text style={{ fontFamily: 'DMSerifDisplay_400Regular', fontSize: 36, lineHeight: 36, fontWeight: '700', color: tk.bg }}>
                {counts.hard || 0}
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
            const m = map[p.rating || 'skipped'];
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
```

- [ ] **Step 2: Test summary screen**

Complete a game by selecting difficulties for all words. Should see:
- Stats card with word counts (total, skipped, hard)
- Word list with difficulty glyphs
- Two buttons: ochre "Aftur í leik" and default "Aðalvalmynd"

Expected: Summary displays correctly, buttons navigate back to play or menu

- [ ] **Step 3: Commit**

```bash
git add app/app/games/summary.tsx
git commit -m "feat: rewrite summary screen with stats card and word list"
```

---

## Task 9: Verify End-to-End Game Flow

**Files:**
- Test: All game screens

Manual testing to ensure the full game flow works and matches the design.

- [ ] **Step 1: Start dev server**

Run: `cd app && npm start`

Then press 'w' for web or 'i' for iOS simulator.

Expected: Dev server starts, app loads

- [ ] **Step 2: Test setup screen**

- Verify header displays "Orð · Kafli I" with RuneStrip
- Select a game (should turn teal)
- Select categories (should turn ochreLight)
- Tap "Hefjum leik" (should be disabled until ≥1 category selected)
- Game advances to play screen

Expected: All interactions work, colors change, navigation works

- [ ] **Step 3: Test play screen**

- Verify game icon and label in header
- Verify word displays in Stone card with RuneStrip above it
- Verify font size changes for long words (>9 chars)
- Tap "Fá annað orð →" (should advance to review)
- Tap "Sleppa" (should advance to review)

Expected: All buttons work, word displays correctly

- [ ] **Step 4: Test review screen**

- Verify word displays with RuneStrip
- Tap each difficulty chip (should change color)
- Verify auto-advance to next word after selection
- Test "← Aftur" button (should go back to play)
- Test "Hætta" button (should go to summary)

Expected: Difficulty selection works, auto-advance works, navigation works

- [ ] **Step 5: Test summary screen**

- Verify stats card displays correct counts
- Verify word list shows all played words with difficulty glyphs
- Tap "Aftur í leik" (should restart game)
- Tap "Aðalvalmynd" (should return to setup)

Expected: All data displays correctly, buttons navigate properly

- [ ] **Step 6: Full flow test**

Play one complete game from start to finish, selecting different difficulties for each word. Verify:
- Setup screen works
- All words display
- Difficulty selection works
- Summary shows correct stats
- Can restart or return to menu

Expected: Full game loop completes without errors

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: verify end-to-end game flow matches design"
```

---

## Success Criteria

- [ ] All color tokens match design palettes exactly (parchment, midnight, fjord)
- [ ] Stone component renders with proper 3D depth effect (elevation/shadow)
- [ ] RuneStrip displays Elder Futhark runes
- [ ] All 4 game screens match design layout and styling
- [ ] Game selection works (games highlight when selected)
- [ ] Category selection works (categories toggle on/off)
- [ ] Word display uses correct font sizes (78px short, 56px long)
- [ ] Difficulty chips auto-advance after selection
- [ ] Summary stats display correctly
- [ ] Full end-to-end game flow works without errors
