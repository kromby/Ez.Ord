/**
 * Design Token System for Orð Games
 * Centralized definitions for colors, typography, spacing, and sizes
 */

// ===== COLORS =====
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

// ===== FONTS =====
export const FONTS = {
  serif: {
    fontFamily: 'DMSerifDisplay_400Regular',
    weight: 400,
  },
  serifBold: {
    fontFamily: 'DMSerifDisplay_400Regular',
    weight: 700,
  },
  sans: {
    fontFamily: 'FamiljenGrotesk_400Regular',
    weight: 400,
  },
  sansBold: {
    fontFamily: 'FamiljenGrotesk_700Bold',
    weight: 700,
  },
  mono: {
    fontFamily: 'JetBrainsMono_400Regular',
    weight: 400,
  },
} as const;

// ===== TYPOGRAPHY =====
export const TYPOGRAPHY = {
  headline: {
    fontSize: 32,
    fontFamily: FONTS.serifBold.fontFamily,
    fontWeight: 700,
    lineHeight: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.serifBold.fontFamily,
    fontWeight: 700,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    fontFamily: FONTS.sans.fontFamily,
    fontWeight: 400,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: FONTS.sans.fontFamily,
    fontWeight: 400,
    lineHeight: 20,
  },
  label: {
    fontSize: 12,
    fontFamily: FONTS.sansBold.fontFamily,
    fontWeight: 600,
    lineHeight: 16,
    letterSpacing: 1,
  },
} as const;

// ===== SPACING =====
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ===== SIZES =====
export const SIZES = {
  buttonHeight: 52,
  chipHeight: 44,
  cardHeight: 240,
  iconSize: 24,
} as const;

// ===== TYPE EXPORTS =====
export type ThemeName = keyof typeof COLORS;
export type Theme = (typeof COLORS)[ThemeName];

// ===== HELPER FUNCTIONS =====
/**
 * Get a color theme by name
 * @param themeName - The theme name (parchment, midnight, or fjord)
 * @returns The color palette for the specified theme
 */
export function getTheme(themeName: ThemeName = 'parchment'): Theme {
  return COLORS[themeName];
}
