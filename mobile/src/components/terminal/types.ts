export type TerminalPalette = {
  background: string;
  foreground: string;
  cursor: string;
  selection: string;
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  brightBlack: string;
  brightRed: string;
  brightGreen: string;
  brightYellow: string;
  brightBlue: string;
  brightMagenta: string;
  brightCyan: string;
  brightWhite: string;
};

export type TerminalThemeOverride = {
  background?: string;
  foreground?: string;
  cursor?: string;
  selection?: string;
};

export type TerminalWebViewMessage =
  | {
      type: "terminalReady";
      data: { cols: number; rows: number };
    }
  | {
      type: "resize";
      data: { cols: number; rows: number };
    }
  | {
      type: "input";
      data: string;
    }
  | {
      type: "debug";
      data: { message: string; type: string };
    };
