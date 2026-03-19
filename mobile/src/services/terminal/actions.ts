export type TerminalModifier = "ctrl" | "alt" | "shift";

export type TerminalActionId =
  | "escape"
  | "tab"
  | "shiftTab"
  | "enter"
  | "space"
  | "backspace"
  | "delete"
  | "insert"
  | "home"
  | "end"
  | "pageUp"
  | "pageDown"
  | "arrowUp"
  | "arrowDown"
  | "arrowLeft"
  | "arrowRight"
  | "clear"
  | "interrupt"
  | "eof"
  | "suspend"
  | "quit"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12";

export type TerminalActionDefinition = {
  id: TerminalActionId;
  label: string;
  sequence: string;
  description: string;
  aliases?: string[];
};

export const TERMINAL_ACTIONS: Record<
  TerminalActionId,
  TerminalActionDefinition
> = {
  escape: {
    id: "escape",
    label: "Esc",
    sequence: "\x1b",
    description: "Escape key",
    aliases: ["esc"],
  },
  tab: {
    id: "tab",
    label: "Tab",
    sequence: "\t",
    description: "Tab key",
  },
  shiftTab: {
    id: "shiftTab",
    label: "Shift+Tab",
    sequence: "\x1b[Z",
    description: "Reverse tab",
  },
  enter: {
    id: "enter",
    label: "Enter",
    sequence: "\r",
    description: "Enter key",
  },
  space: {
    id: "space",
    label: "Space",
    sequence: " ",
    description: "Space key",
  },
  backspace: {
    id: "backspace",
    label: "Backspace",
    sequence: "\x08",
    description: "Backspace key",
    aliases: ["del"],
  },
  delete: {
    id: "delete",
    label: "Delete",
    sequence: "\x1b[3~",
    description: "Delete key",
  },
  insert: {
    id: "insert",
    label: "Insert",
    sequence: "\x1b[2~",
    description: "Insert key",
  },
  home: {
    id: "home",
    label: "Home",
    sequence: "\x1b[H",
    description: "Home key",
  },
  end: {
    id: "end",
    label: "End",
    sequence: "\x1b[F",
    description: "End key",
  },
  pageUp: {
    id: "pageUp",
    label: "PgUp",
    sequence: "\x1b[5~",
    description: "Page Up key",
  },
  pageDown: {
    id: "pageDown",
    label: "PgDn",
    sequence: "\x1b[6~",
    description: "Page Down key",
  },
  arrowUp: {
    id: "arrowUp",
    label: "Up",
    sequence: "\x1b[A",
    description: "Up arrow key",
    aliases: ["history", "hist"],
  },
  arrowDown: {
    id: "arrowDown",
    label: "Down",
    sequence: "\x1b[B",
    description: "Down arrow key",
  },
  arrowRight: {
    id: "arrowRight",
    label: "Right",
    sequence: "\x1b[C",
    description: "Right arrow key",
  },
  arrowLeft: {
    id: "arrowLeft",
    label: "Left",
    sequence: "\x1b[D",
    description: "Left arrow key",
  },
  clear: {
    id: "clear",
    label: "Clear",
    sequence: "\x0c",
    description: "Ctrl+L clear screen",
  },
  interrupt: {
    id: "interrupt",
    label: "Ctrl+C",
    sequence: "\x03",
    description: "Send SIGINT",
  },
  eof: {
    id: "eof",
    label: "Ctrl+D",
    sequence: "\x04",
    description: "Send EOF",
  },
  suspend: {
    id: "suspend",
    label: "Ctrl+Z",
    sequence: "\x1a",
    description: "Suspend foreground process",
  },
  quit: {
    id: "quit",
    label: "Ctrl+\\",
    sequence: "\x1c",
    description: "Send SIGQUIT",
  },
  f1: { id: "f1", label: "F1", sequence: "\x1bOP", description: "F1 key" },
  f2: { id: "f2", label: "F2", sequence: "\x1bOQ", description: "F2 key" },
  f3: { id: "f3", label: "F3", sequence: "\x1bOR", description: "F3 key" },
  f4: { id: "f4", label: "F4", sequence: "\x1bOS", description: "F4 key" },
  f5: { id: "f5", label: "F5", sequence: "\x1b[15~", description: "F5 key" },
  f6: { id: "f6", label: "F6", sequence: "\x1b[17~", description: "F6 key" },
  f7: { id: "f7", label: "F7", sequence: "\x1b[18~", description: "F7 key" },
  f8: { id: "f8", label: "F8", sequence: "\x1b[19~", description: "F8 key" },
  f9: { id: "f9", label: "F9", sequence: "\x1b[20~", description: "F9 key" },
  f10: {
    id: "f10",
    label: "F10",
    sequence: "\x1b[21~",
    description: "F10 key",
  },
  f11: {
    id: "f11",
    label: "F11",
    sequence: "\x1b[23~",
    description: "F11 key",
  },
  f12: {
    id: "f12",
    label: "F12",
    sequence: "\x1b[24~",
    description: "F12 key",
  },
};

const actionByAlias = Object.values(TERMINAL_ACTIONS).reduce<
  Record<string, TerminalActionDefinition>
>((acc, action) => {
  acc[action.id.toLowerCase()] = action;
  action.aliases?.forEach((alias) => {
    acc[alias.toLowerCase()] = action;
  });
  return acc;
}, {});

export function getTerminalAction(
  actionId: TerminalActionId | string,
): TerminalActionDefinition | null {
  return actionByAlias[actionId.toLowerCase()] ?? null;
}

export function getTerminalActionSequence(
  actionId: TerminalActionId | string,
): string | null {
  return getTerminalAction(actionId)?.sequence ?? null;
}

export function resolveCtrlSequence(input: string): string | null {
  if (!input) return null;
  const normalized = input.toLowerCase();

  if (normalized.length === 1 && normalized >= "a" && normalized <= "z") {
    const code = normalized.charCodeAt(0) & 0x1f;
    return String.fromCharCode(code);
  }

  if (normalized === " ") return "\x00";
  if (normalized === "6") return "\x1e";
  if (normalized === "-") return "\x1f";
  if (normalized === "[") return "\x1b";
  if (normalized === "\\") return "\x1c";
  if (normalized === "]") return "\x1d";

  return null;
}

export function resolveModifiedTerminalInput(options: {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
}): string | null {
  const { key, ctrl = false, shift = false, alt = false } = options;
  if (!key) return null;

  if (key === "\x08" || key === "\x7f") {
    return getTerminalActionSequence("backspace");
  }

  if (key === "\r" || key === "\n") {
    return getTerminalActionSequence("enter");
  }

  if (ctrl) {
    return resolveCtrlSequence(key);
  }

  if (shift && key === "\t") {
    return getTerminalActionSequence("shiftTab");
  }

  const action =
    getTerminalAction(key) ??
    getTerminalAction(
      key
        .replace(/^Arrow/, "arrow")
        .replace(/^PageUp$/, "pageUp")
        .replace(/^PageDown$/, "pageDown"),
    );

  if (action) {
    return alt ? `\x1b${action.sequence}` : action.sequence;
  }

  return alt ? `\x1b${key}` : key;
}
