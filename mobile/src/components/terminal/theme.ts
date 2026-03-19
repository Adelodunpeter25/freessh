import type { SessionProfile } from "@/types";
import { getDefaultTheme, getThemeByName } from "@/utils";

import type { TerminalPalette, TerminalThemeOverride } from "./types";

export function resolveTerminalPalette(
  isDark: boolean,
  profile?: SessionProfile,
  override?: TerminalThemeOverride,
): TerminalPalette {
  const preset =
    (profile?.terminal_theme && getThemeByName(profile.terminal_theme)) ||
    getDefaultTheme(!isDark);
  const theme = preset.theme;

  return {
    background: override?.background ?? theme.background,
    foreground: override?.foreground ?? theme.foreground,
    cursor: override?.cursor ?? theme.cursor,
    selection:
      override?.selection ?? theme.selection ?? "rgba(255,255,255,0.2)",
    black: theme.background,
    red: theme.red,
    green: theme.green,
    yellow: theme.yellow,
    blue: theme.blue,
    magenta: theme.magenta,
    cyan: theme.cyan,
    white: theme.white,
    brightBlack: theme.brightBlack,
    brightRed: theme.brightRed,
    brightGreen: theme.brightGreen,
    brightYellow: theme.brightYellow,
    brightBlue: theme.brightBlue,
    brightMagenta: theme.brightMagenta,
    brightCyan: theme.brightCyan,
    brightWhite: theme.brightWhite,
  };
}
