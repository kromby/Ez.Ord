/**
 * Design Token System for Orð Games
 * Centralized definitions for colors, typography, spacing, and sizes
 */

// ===== COLORS =====
export const COLORS = {
  parchment: {
    bg: '#FBF8F3',
    primary: '#8B5A3C',
    accent: '#D4AF37',
    secondary: '#C9B8A6',
    text: '#2C2C2C',
    textLight: '#6B6B6B',
    border: '#D9D3C8',
  },
  midnight: {
    bg: '#1A1A2E',
    primary: '#16213E',
    accent: '#0F3460',
    secondary: '#533483',
    text: '#EAE2B7',
    textLight: '#A89968',
    border: '#3D3D5C',
  },
  fjord: {
    bg: '#E8F1F5',
    primary: '#2C5282',
    accent: '#4299E1',
    secondary: '#90CDF4',
    text: '#1A202C',
    textLight: '#4A5568',
    border: '#BEE3F8',
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
