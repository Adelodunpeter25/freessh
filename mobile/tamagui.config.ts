import { createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

const tamaguiConfig = createTamagui({
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      // Brand Palette
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentMuted: 'rgba(249, 115, 22, 0.18)',
      accentDeep: '#c2410c',

      // Grays (Slate)
      slate50: '#f8fafc',
      slate100: '#f1f5f9',
      slate200: '#e2e8f0',
      slate300: '#cbd5e1',
      slate400: '#94a3b8',
      slate500: '#64748b',
      slate600: '#475569',
      slate700: '#334155',
      slate800: '#1e293b',
      slate900: '#0f172a',
      slate950: '#020617',

      // Grays (Zinc/Neutral - More "Black" focused for Dark Mode)
      zinc50: '#fafafa',
      zinc100: '#f4f4f5',
      zinc200: '#e4e4e7',
      zinc300: '#d4d4d8',
      zinc400: '#a1a1aa',
      zinc500: '#71717a',
      zinc600: '#52525b',
      zinc700: '#3f3f46',
      zinc800: '#27272a',
      zinc900: '#18181b',
      zinc950: '#09090b',

      // Status
      success: '#22c55e',
      warning: '#f59e0b',
      destructive: '#ef4444',
      destructiveMuted: '#fee2e2',
      destructiveDeep: '#b91c1c',

      // Utilities
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      
      // Overlays
      ripple: 'rgba(148, 163, 184, 0.14)',
      selection: 'rgba(249, 115, 22, 0.08)',
    },
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: '#f8fafc', // slate50
      backgroundStrong: '#f1f5f9', // slate100
      backgroundHover: '#e2e8f0', // slate200
      backgroundPress: '#cbd5e1', // slate300
      backgroundTransparent: 'rgba(248, 250, 252, 0.8)',
      
      color: '#0f172a', // slate900
      colorHover: '#1e293b', // slate800
      colorPress: '#020617', // slate950
      colorMuted: '#64748b', // slate500
      colorSubtle: '#94a3b8', // slate400
      
      borderColor: '#e2e8f0', // slate200
      borderColorHover: '#cbd5e1', // slate300
      borderColorFocus: '#f97316', // accent
      
      placeholderColor: '#94a3b8', // slate400
      
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#ffffff',
      accentMuted: 'rgba(249, 115, 22, 0.12)',
      accentDeep: '#c2410c',
      
      destructive: '#ef4444',
      destructiveHover: '#dc2626',
      destructivePress: '#b91c1c',
      destructiveMuted: '#fee2e2',
      
      success: '#22c55e',
      warning: '#f59e0b',
      
      ripple: 'rgba(148, 163, 184, 0.12)',
      selection: 'rgba(249, 115, 22, 0.08)',
      
      iconPrimary: '#0f172a',
      iconMuted: '#64748b',
      iconSubtle: '#94a3b8',
      iconWhite: '#ffffff',
      iconAccent: '#f97316',

      headerBackground: '#ffffff',
      tabBarBackground: '#ffffff',
      cardBackground: '#ffffff',
    },
    dark: {
      ...config.themes.dark,
      background: '#09090b', // Zinc-950 (Slightly off-black)
      backgroundStrong: '#121214', // Zinc-925 (Custom deep gray)
      backgroundHover: '#18181b', // Zinc-900
      backgroundPress: '#27272a', // Zinc-800
      backgroundTransparent: 'rgba(9, 9, 11, 0.8)',
      
      color: '#fafafa', // zinc50
      colorHover: '#ffffff',
      colorPress: '#f4f4f5', // zinc100
      colorMuted: '#a1a1aa', // zinc400
      colorSubtle: '#71717a', // zinc500
      
      borderColor: '#1e1e21', // Slightly lighter border for contrast
      borderColorHover: '#27272a', // zinc800
      borderColorFocus: '#f97316', // accent
      
      placeholderColor: '#52525b', // zinc600
      
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#ffffff',
      accentMuted: 'rgba(249, 115, 22, 0.2)',
      accentDeep: '#fb923c',
      
      destructive: '#ef4444',
      destructiveHover: '#f87171',
      destructivePress: '#dc2626',
      destructiveMuted: 'rgba(239, 68, 68, 0.15)',
      
      success: '#22c55e',
      warning: '#f59e0b',
      
      ripple: 'rgba(255, 255, 255, 0.08)',
      selection: 'rgba(249, 115, 22, 0.15)',
      
      iconPrimary: '#fafafa',
      iconMuted: '#a1a1aa',
      iconSubtle: '#71717a',
      iconWhite: '#ffffff',
      iconAccent: '#f97316',

      headerBackground: '#09090b',
      tabBarBackground: '#09090b',
      cardBackground: '#121214',
    },
  },
})

export default tamaguiConfig
export type AppTamaguiConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
