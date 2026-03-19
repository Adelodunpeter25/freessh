import { createTamagui } from 'tamagui'
import { config } from '@tamagui/config/v3'

const tamaguiConfig = createTamagui({
  ...config,
  tokens: {
    ...config.tokens,
    color: {
      ...config.tokens.color,
      placeholderColor: '#94a3b8',
      accent: '#f97316',
      red10: '#ef4444',
      red1: '#fee2e2',
    },
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: '#f1f3f6',
      backgroundStrong: '#e9edf2',
      backgroundHover: '#e1e7ee',
      backgroundPress: '#d7dee8',
      color: '#0f172a',
      colorHover: '#1e293b',
      colorPress: '#0f172a',
      colorFocus: '#0f172a',
      borderColor: '#cfd7e2',
      placeholderColor: '#8a94a6',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
      red10: '#ef4444',
      red1: '#fee2e2',
    },
    dark: {
      ...config.themes.dark,
      background: '#090b10',
      backgroundStrong: '#0f141c',
      backgroundHover: '#161d28',
      backgroundPress: '#1f2937',
      color: '#f1f5f9',
      colorHover: '#e2e8f0',
      colorPress: '#f1f5f9',
      colorFocus: '#f1f5f9',
      borderColor: '#253140',
      placeholderColor: '#6d7d96',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
      red10: '#ef4444',
      red1: '#7f1d1d',
    },
  },
})

export default tamaguiConfig
export type AppTamaguiConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
