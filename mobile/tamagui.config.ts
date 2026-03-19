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
      background: '#f5f6f8',
      backgroundStrong: '#eef1f4',
      backgroundHover: '#e7ebf0',
      backgroundPress: '#dde3ea',
      color: '#0f172a',
      colorHover: '#1e293b',
      colorPress: '#0f172a',
      colorFocus: '#0f172a',
      borderColor: '#d6dde6',
      placeholderColor: '#8f98a8',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
      red10: '#ef4444',
      red1: '#fee2e2',
    },
    dark: {
      ...config.themes.dark,
      background: '#181c22',
      backgroundStrong: '#212730',
      backgroundHover: '#2a313c',
      backgroundPress: '#343d4a',
      color: '#f1f5f9',
      colorHover: '#e2e8f0',
      colorPress: '#f1f5f9',
      colorFocus: '#f1f5f9',
      borderColor: '#3b4554',
      placeholderColor: '#8d97a8',
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
