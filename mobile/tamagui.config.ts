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
    },
  },
  themes: {
    ...config.themes,
    light: {
      ...config.themes.light,
      background: '#f8fafc',
      color: '#0f172a',
      colorHover: '#1e293b',
      colorPress: '#0f172a',
      colorFocus: '#0f172a',
      borderColor: '#e2e8f0',
      placeholderColor: '#94a3b8',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
    },
    dark: {
      ...config.themes.dark,
      background: '#0a0a0a',
      color: '#f1f5f9',
      colorHover: '#e2e8f0',
      colorPress: '#f1f5f9',
      colorFocus: '#f1f5f9',
      borderColor: '#1f2937',
      placeholderColor: '#64748b',
      accent: '#f97316',
      accentHover: '#fb923c',
      accentPress: '#ea580c',
      accentText: '#0c0a09',
    },
  },
})

export default tamaguiConfig
export type AppTamaguiConfig = typeof tamaguiConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppTamaguiConfig {}
}
