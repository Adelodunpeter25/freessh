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
      background: '#f2f6fb',
      backgroundStrong: '#ecf2f9',
      backgroundHover: '#e5edf7',
      backgroundPress: '#dde8f3',
      color: '#0f172a',
      colorHover: '#1e293b',
      colorPress: '#0f172a',
      colorFocus: '#0f172a',
      borderColor: '#d2dbe7',
      placeholderColor: '#94a3b8',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
      red10: '#ef4444',
      red1: '#fee2e2',
    },
    dark: {
      ...config.themes.dark,
      background: '#141a22',
      backgroundStrong: '#1b2430',
      backgroundHover: '#222d3a',
      backgroundPress: '#2a3647',
      color: '#f1f5f9',
      colorHover: '#e2e8f0',
      colorPress: '#f1f5f9',
      colorFocus: '#f1f5f9',
      borderColor: '#2b3646',
      placeholderColor: '#7b8ba1',
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
