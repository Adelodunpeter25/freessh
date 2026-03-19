import type { TerminalActionId } from "./actions";

export type TerminalKeyboardPresetId =
  | "default"
  | "minimal"
  | "developer"
  | "sysadmin"
  | "compact";

export type TerminalKeyboardCustomizationPresetId =
  | TerminalKeyboardPresetId
  | "custom";

export type TerminalKeyboardKeySize = "small" | "medium" | "large";

export type TerminalKeyboardKey =
  | {
      id: string;
      label: string;
      kind: "action";
      actionId: TerminalActionId | string;
    }
  | {
      id: string;
      label: string;
      kind: "text";
      value: string;
    }
  | {
      id: string;
      label: string;
      kind: "modifier";
      modifier: "ctrl" | "alt";
    }
  | {
      id: "paste";
      label: string;
      kind: "paste";
    }
  | {
      id: "snippets";
      label: string;
      kind: "snippets";
    }
  | {
      id: "search";
      label: string;
      kind: "search";
    };

export type TerminalKeyboardRow = {
  id: string;
  label?: string;
  visible?: boolean;
  keys: TerminalKeyboardKey[];
};

export type TerminalKeyboardSettings = {
  keySize: TerminalKeyboardKeySize;
  compactMode: boolean;
  hapticFeedback: boolean;
  showHints: boolean;
};

export type TerminalKeyboardCustomization = {
  preset: TerminalKeyboardCustomizationPresetId;
  version: number;
  topBar: {
    pinnedKeys: TerminalKeyboardKey[];
    keys: TerminalKeyboardKey[];
  };
  fullKeyboard: {
    rows: TerminalKeyboardRow[];
  };
  settings: TerminalKeyboardSettings;
};

export type TerminalKeyboardPreset = {
  id: TerminalKeyboardPresetId;
  name: string;
  description: string;
  topBar: {
    pinnedKeys: TerminalKeyboardKey[];
    keys: TerminalKeyboardKey[];
  };
  fullKeyboard: {
    rows: TerminalKeyboardRow[];
  };
};

const DEFAULT_SETTINGS: TerminalKeyboardSettings = {
  keySize: "medium",
  compactMode: false,
  hapticFeedback: false,
  showHints: true,
};

const cloneKey = (key: TerminalKeyboardKey): TerminalKeyboardKey => ({ ...key });

const cloneRow = (row: TerminalKeyboardRow): TerminalKeyboardRow => ({
  ...row,
  keys: row.keys.map(cloneKey),
});

const actionKey = (
  id: string,
  label: string,
  actionId: TerminalActionId | string,
): TerminalKeyboardKey => ({ id, label, kind: "action", actionId });

const textKey = (id: string, label: string, value = label): TerminalKeyboardKey => ({
  id,
  label,
  kind: "text",
  value,
});

const ctrlKey = (): TerminalKeyboardKey => ({
  id: "ctrl",
  label: "Ctrl",
  kind: "modifier",
  modifier: "ctrl",
});

const altKey = (): TerminalKeyboardKey => ({
  id: "alt",
  label: "Alt",
  kind: "modifier",
  modifier: "alt",
});

const pasteKey = (): TerminalKeyboardKey => ({ id: "paste", label: "Paste", kind: "paste" });
const snippetsKey = (): TerminalKeyboardKey => ({ id: "snippets", label: "Snips", kind: "snippets" });
const searchKey = (): TerminalKeyboardKey => ({ id: "search", label: "Search", kind: "search" });

const ALL_KEYS = {
  escape: actionKey("escape", "Esc", "escape"),
  tab: actionKey("tab", "Tab", "tab"),
  ctrl: ctrlKey(),
  alt: altKey(),
  arrowUp: actionKey("arrowUp", "↑", "arrowUp"),
  arrowDown: actionKey("arrowDown", "↓", "arrowDown"),
  arrowLeft: actionKey("arrowLeft", "←", "arrowLeft"),
  arrowRight: actionKey("arrowRight", "→", "arrowRight"),
  home: actionKey("home", "Home", "home"),
  end: actionKey("end", "End", "end"),
  pageUp: actionKey("pageUp", "PgUp", "pageUp"),
  pageDown: actionKey("pageDown", "PgDn", "pageDown"),
  insert: actionKey("insert", "Ins", "insert"),
  delete: actionKey("delete", "Del", "delete"),
  clear: actionKey("clear", "^L", "clear"),
  history: actionKey("history", "Hist", "arrowUp"),
  complete: actionKey("complete", "Comp", "tab"),
  ctrlC: actionKey("ctrlC", "^C", "ctrlC"),
  ctrlD: actionKey("ctrlD", "^D", "ctrlD"),
  ctrlZ: actionKey("ctrlZ", "^Z", "suspend"),
  ctrlL: actionKey("ctrlL", "^L", "ctrlL"),
  ctrlA: actionKey("ctrlA", "^A", "ctrlA"),
  ctrlE: actionKey("ctrlE", "^E", "ctrlE"),
  ctrlK: actionKey("ctrlK", "^K", "ctrlK"),
  ctrlU: actionKey("ctrlU", "^U", "ctrlU"),
  ctrlW: actionKey("ctrlW", "^W", "ctrlW"),
  ctrlR: actionKey("ctrlR", "^R", "ctrlR"),
  ctrlY: actionKey("ctrlY", "^Y", "ctrlY"),
  ctrlT: actionKey("ctrlT", "^T", "ctrlT"),
  ctrlN: actionKey("ctrlN", "^N", "ctrlN"),
  ctrlP: actionKey("ctrlP", "^P", "ctrlP"),
  ctrlB: actionKey("ctrlB", "^B", "ctrlB"),
  ctrlF: actionKey("ctrlF", "^F", "ctrlF"),
  altF: actionKey("altF", "Alt+F", "altF"),
  altB: actionKey("altB", "Alt+B", "altB"),
  altD: actionKey("altD", "Alt+D", "altD"),
  paste: pasteKey(),
  search: searchKey(),
  snippets: snippetsKey(),
  enter: actionKey("enter", "Enter", "enter"),
  space: actionKey("space", "Space", "space"),
  backspace: actionKey("backspace", "⌫", "backspace"),
  f1: actionKey("f1", "F1", "f1"),
  f2: actionKey("f2", "F2", "f2"),
  f3: actionKey("f3", "F3", "f3"),
  f4: actionKey("f4", "F4", "f4"),
  f5: actionKey("f5", "F5", "f5"),
  f6: actionKey("f6", "F6", "f6"),
  f7: actionKey("f7", "F7", "f7"),
  f8: actionKey("f8", "F8", "f8"),
  f9: actionKey("f9", "F9", "f9"),
  f10: actionKey("f10", "F10", "f10"),
  f11: actionKey("f11", "F11", "f11"),
  f12: actionKey("f12", "F12", "f12"),
  num0: textKey("num0", "0"),
  num1: textKey("num1", "1"),
  num2: textKey("num2", "2"),
  num3: textKey("num3", "3"),
  num4: textKey("num4", "4"),
  num5: textKey("num5", "5"),
  num6: textKey("num6", "6"),
  num7: textKey("num7", "7"),
  num8: textKey("num8", "8"),
  num9: textKey("num9", "9"),
  backtick: textKey("backtick", "`"),
  tilde: textKey("tilde", "~"),
  exclamation: textKey("exclamation", "!"),
  at: textKey("at", "@"),
  hash: textKey("hash", "#"),
  dollar: textKey("dollar", "$"),
  percent: textKey("percent", "%"),
  caret: textKey("caret", "^"),
  ampersand: textKey("ampersand", "&"),
  asterisk: textKey("asterisk", "*"),
  minus: textKey("minus", "-"),
  underscore: textKey("underscore", "_"),
  equals: textKey("equals", "="),
  plus: textKey("plus", "+"),
  pipe: textKey("pipe", "|"),
  backslash: textKey("backslash", "\\"),
  slash: textKey("slash", "/"),
  question: textKey("question", "?"),
  semicolon: textKey("semicolon", ";"),
  colon: textKey("colon", ":"),
  comma: textKey("comma", ","),
  period: textKey("period", "."),
  singleQuote: textKey("singleQuote", "'"),
  doubleQuote: textKey("doubleQuote", "\""),
  parenLeft: textKey("parenLeft", "("),
  parenRight: textKey("parenRight", ")"),
  bracketLeft: textKey("bracketLeft", "["),
  bracketRight: textKey("bracketRight", "]"),
  braceLeft: textKey("braceLeft", "{"),
  braceRight: textKey("braceRight", "}"),
  angleBracketLeft: textKey("angleBracketLeft", "<"),
  angleBracketRight: textKey("angleBracketRight", ">"),
};

const PRESET_DEFINITIONS: TerminalKeyboardPreset[] = [
  {
    id: "default",
    name: "Default",
    description: "Full-featured keyboard with all keys organized by category.",
    topBar: {
      pinnedKeys: [],
      keys: [
        ALL_KEYS.escape,
        ALL_KEYS.tab,
        ALL_KEYS.ctrl,
        ALL_KEYS.alt,
        ALL_KEYS.arrowUp,
        ALL_KEYS.arrowDown,
        ALL_KEYS.arrowLeft,
        ALL_KEYS.arrowRight,
        ALL_KEYS.backslash,
        ALL_KEYS.pipe,
        ALL_KEYS.tilde,
        ALL_KEYS.minus,
        ALL_KEYS.search,
        ALL_KEYS.snippets,
      ],
    },
    fullKeyboard: {
      rows: [
        {
          id: "function-keys",
          label: "Function Keys",
          keys: [
            ALL_KEYS.f1, ALL_KEYS.f2, ALL_KEYS.f3, ALL_KEYS.f4, ALL_KEYS.f5, ALL_KEYS.f6,
            ALL_KEYS.f7, ALL_KEYS.f8, ALL_KEYS.f9, ALL_KEYS.f10, ALL_KEYS.f11, ALL_KEYS.f12,
          ],
        },
        {
          id: "navigation",
          label: "Navigation",
          keys: [ALL_KEYS.insert, ALL_KEYS.home, ALL_KEYS.pageUp, ALL_KEYS.delete, ALL_KEYS.end, ALL_KEYS.pageDown],
        },
        {
          id: "quick-actions",
          label: "Quick Actions",
          keys: [ALL_KEYS.paste, ALL_KEYS.clear, ALL_KEYS.history, ALL_KEYS.complete],
        },
        {
          id: "numbers",
          label: "Numbers",
          keys: [ALL_KEYS.num1, ALL_KEYS.num2, ALL_KEYS.num3, ALL_KEYS.num4, ALL_KEYS.num5, ALL_KEYS.num6, ALL_KEYS.num7, ALL_KEYS.num8, ALL_KEYS.num9, ALL_KEYS.num0],
        },
        {
          id: "symbols-1",
          label: "Symbols",
          keys: [
            ALL_KEYS.backtick, ALL_KEYS.tilde, ALL_KEYS.exclamation, ALL_KEYS.at, ALL_KEYS.hash, ALL_KEYS.dollar,
            ALL_KEYS.percent, ALL_KEYS.caret, ALL_KEYS.ampersand, ALL_KEYS.asterisk, ALL_KEYS.parenLeft, ALL_KEYS.parenRight,
          ],
        },
        {
          id: "operators",
          label: "Operators",
          keys: [
            ALL_KEYS.minus, ALL_KEYS.underscore, ALL_KEYS.equals, ALL_KEYS.plus, ALL_KEYS.bracketLeft, ALL_KEYS.braceLeft,
            ALL_KEYS.bracketRight, ALL_KEYS.braceRight, ALL_KEYS.backslash, ALL_KEYS.pipe, ALL_KEYS.semicolon, ALL_KEYS.colon,
          ],
        },
        {
          id: "punctuation",
          label: "Punctuation",
          keys: [
            ALL_KEYS.singleQuote, ALL_KEYS.doubleQuote, ALL_KEYS.comma, ALL_KEYS.angleBracketLeft,
            ALL_KEYS.period, ALL_KEYS.angleBracketRight, ALL_KEYS.slash, ALL_KEYS.question,
          ],
        },
        {
          id: "basic-actions",
          label: "Basic Actions",
          keys: [ALL_KEYS.enter, ALL_KEYS.space, ALL_KEYS.backspace],
        },
        {
          id: "ctrl-shortcuts",
          label: "Ctrl Shortcuts",
          keys: [
            ALL_KEYS.ctrlC, ALL_KEYS.ctrlD, ALL_KEYS.ctrlZ, ALL_KEYS.ctrlL, ALL_KEYS.ctrlA, ALL_KEYS.ctrlE,
            ALL_KEYS.ctrlK, ALL_KEYS.ctrlU, ALL_KEYS.ctrlW, ALL_KEYS.ctrlR, ALL_KEYS.ctrlY, ALL_KEYS.altF,
          ],
        },
      ],
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Just the essentials for basic terminal usage.",
    topBar: {
      pinnedKeys: [],
      keys: [
        ALL_KEYS.escape, ALL_KEYS.tab, ALL_KEYS.ctrl, ALL_KEYS.alt,
        ALL_KEYS.arrowUp, ALL_KEYS.arrowDown, ALL_KEYS.arrowLeft, ALL_KEYS.arrowRight,
        ALL_KEYS.tilde, ALL_KEYS.pipe, ALL_KEYS.slash,
      ],
    },
    fullKeyboard: {
      rows: [
        { id: "navigation", label: "Navigation", keys: [ALL_KEYS.home, ALL_KEYS.end, ALL_KEYS.pageUp, ALL_KEYS.pageDown] },
        { id: "essential-symbols", label: "Essential Symbols", keys: [ALL_KEYS.tilde, ALL_KEYS.backtick, ALL_KEYS.pipe, ALL_KEYS.backslash, ALL_KEYS.slash, ALL_KEYS.minus, ALL_KEYS.underscore, ALL_KEYS.dollar] },
        { id: "basic-actions", label: "Actions", keys: [ALL_KEYS.paste, ALL_KEYS.enter, ALL_KEYS.space, ALL_KEYS.backspace] },
        { id: "essential-shortcuts", label: "Shortcuts", keys: [ALL_KEYS.ctrlC, ALL_KEYS.ctrlD, ALL_KEYS.ctrlL, ALL_KEYS.ctrlZ] },
      ],
    },
  },
  {
    id: "developer",
    name: "Developer",
    description: "Optimized for coding with easy access to symbols and brackets.",
    topBar: {
      pinnedKeys: [],
      keys: [
        ALL_KEYS.escape, ALL_KEYS.tab, ALL_KEYS.ctrl, ALL_KEYS.alt,
        ALL_KEYS.arrowUp, ALL_KEYS.arrowDown, ALL_KEYS.arrowLeft, ALL_KEYS.arrowRight,
        ALL_KEYS.bracketLeft, ALL_KEYS.bracketRight, ALL_KEYS.braceLeft, ALL_KEYS.braceRight,
        ALL_KEYS.pipe, ALL_KEYS.backslash,
      ],
    },
    fullKeyboard: {
      rows: [
        { id: "brackets", label: "Brackets", keys: [ALL_KEYS.parenLeft, ALL_KEYS.parenRight, ALL_KEYS.bracketLeft, ALL_KEYS.bracketRight, ALL_KEYS.braceLeft, ALL_KEYS.braceRight, ALL_KEYS.angleBracketLeft, ALL_KEYS.angleBracketRight] },
        { id: "coding-symbols", label: "Coding Symbols", keys: [ALL_KEYS.backtick, ALL_KEYS.tilde, ALL_KEYS.exclamation, ALL_KEYS.at, ALL_KEYS.hash, ALL_KEYS.dollar, ALL_KEYS.percent, ALL_KEYS.caret, ALL_KEYS.ampersand, ALL_KEYS.asterisk] },
        { id: "operators", label: "Operators", keys: [ALL_KEYS.equals, ALL_KEYS.plus, ALL_KEYS.minus, ALL_KEYS.underscore, ALL_KEYS.pipe, ALL_KEYS.backslash, ALL_KEYS.slash, ALL_KEYS.question, ALL_KEYS.semicolon, ALL_KEYS.colon] },
        { id: "quotes", label: "Quotes", keys: [ALL_KEYS.singleQuote, ALL_KEYS.doubleQuote, ALL_KEYS.comma, ALL_KEYS.period] },
        { id: "navigation", label: "Navigation", keys: [ALL_KEYS.home, ALL_KEYS.end, ALL_KEYS.pageUp, ALL_KEYS.pageDown] },
        { id: "actions", label: "Actions", keys: [ALL_KEYS.paste, ALL_KEYS.enter, ALL_KEYS.space, ALL_KEYS.backspace] },
        { id: "dev-shortcuts", label: "Dev Shortcuts", keys: [ALL_KEYS.ctrlC, ALL_KEYS.ctrlZ, ALL_KEYS.ctrlA, ALL_KEYS.ctrlE, ALL_KEYS.ctrlK, ALL_KEYS.ctrlU, ALL_KEYS.ctrlR, ALL_KEYS.ctrlW] },
      ],
    },
  },
  {
    id: "sysadmin",
    name: "System Admin",
    description: "Function keys and navigation for system administration.",
    topBar: {
      pinnedKeys: [],
      keys: [
        ALL_KEYS.escape, ALL_KEYS.tab, ALL_KEYS.ctrl, ALL_KEYS.alt,
        ALL_KEYS.arrowUp, ALL_KEYS.arrowDown, ALL_KEYS.arrowLeft, ALL_KEYS.arrowRight,
        ALL_KEYS.home, ALL_KEYS.end, ALL_KEYS.pipe, ALL_KEYS.slash,
      ],
    },
    fullKeyboard: {
      rows: [
        { id: "function-keys", label: "Function Keys", keys: [ALL_KEYS.f1, ALL_KEYS.f2, ALL_KEYS.f3, ALL_KEYS.f4, ALL_KEYS.f5, ALL_KEYS.f6, ALL_KEYS.f7, ALL_KEYS.f8, ALL_KEYS.f9, ALL_KEYS.f10, ALL_KEYS.f11, ALL_KEYS.f12] },
        { id: "navigation", label: "Navigation", keys: [ALL_KEYS.insert, ALL_KEYS.home, ALL_KEYS.pageUp, ALL_KEYS.delete, ALL_KEYS.end, ALL_KEYS.pageDown] },
        { id: "admin-symbols", label: "Admin Symbols", keys: [ALL_KEYS.tilde, ALL_KEYS.slash, ALL_KEYS.pipe, ALL_KEYS.backslash, ALL_KEYS.dollar, ALL_KEYS.hash, ALL_KEYS.minus, ALL_KEYS.underscore] },
        { id: "actions", label: "Actions", keys: [ALL_KEYS.paste, ALL_KEYS.clear, ALL_KEYS.history, ALL_KEYS.complete] },
        { id: "system-shortcuts", label: "System Shortcuts", keys: [ALL_KEYS.ctrlC, ALL_KEYS.ctrlD, ALL_KEYS.ctrlZ, ALL_KEYS.ctrlL, ALL_KEYS.ctrlR, ALL_KEYS.ctrlU] },
      ],
    },
  },
  {
    id: "compact",
    name: "Compact",
    description: "More keys per row with tighter spacing for larger screens.",
    topBar: {
      pinnedKeys: [],
      keys: [
        ALL_KEYS.escape, ALL_KEYS.tab, ALL_KEYS.ctrl, ALL_KEYS.alt,
        ALL_KEYS.arrowUp, ALL_KEYS.arrowDown, ALL_KEYS.arrowLeft, ALL_KEYS.arrowRight,
        ALL_KEYS.home, ALL_KEYS.end, ALL_KEYS.pipe, ALL_KEYS.tilde, ALL_KEYS.slash, ALL_KEYS.minus,
      ],
    },
    fullKeyboard: {
      rows: [
        { id: "function-keys", label: "F-Keys", keys: [ALL_KEYS.f1, ALL_KEYS.f2, ALL_KEYS.f3, ALL_KEYS.f4, ALL_KEYS.f5, ALL_KEYS.f6, ALL_KEYS.f7, ALL_KEYS.f8, ALL_KEYS.f9, ALL_KEYS.f10, ALL_KEYS.f11, ALL_KEYS.f12] },
        { id: "nav-nums", label: "Nav + Numbers", keys: [ALL_KEYS.pageUp, ALL_KEYS.pageDown, ALL_KEYS.num1, ALL_KEYS.num2, ALL_KEYS.num3, ALL_KEYS.num4, ALL_KEYS.num5, ALL_KEYS.num6, ALL_KEYS.num7, ALL_KEYS.num8, ALL_KEYS.num9, ALL_KEYS.num0] },
        { id: "all-symbols", label: "Symbols", keys: [ALL_KEYS.backtick, ALL_KEYS.tilde, ALL_KEYS.exclamation, ALL_KEYS.at, ALL_KEYS.hash, ALL_KEYS.dollar, ALL_KEYS.percent, ALL_KEYS.caret, ALL_KEYS.ampersand, ALL_KEYS.asterisk, ALL_KEYS.minus, ALL_KEYS.underscore, ALL_KEYS.equals, ALL_KEYS.plus] },
        { id: "brackets-ops", label: "Brackets + Ops", keys: [ALL_KEYS.parenLeft, ALL_KEYS.parenRight, ALL_KEYS.bracketLeft, ALL_KEYS.bracketRight, ALL_KEYS.braceLeft, ALL_KEYS.braceRight, ALL_KEYS.angleBracketLeft, ALL_KEYS.angleBracketRight, ALL_KEYS.pipe, ALL_KEYS.backslash, ALL_KEYS.slash, ALL_KEYS.question] },
        { id: "punct-actions", label: "Punct + Actions", keys: [ALL_KEYS.singleQuote, ALL_KEYS.doubleQuote, ALL_KEYS.semicolon, ALL_KEYS.colon, ALL_KEYS.comma, ALL_KEYS.period, ALL_KEYS.paste, ALL_KEYS.clear] },
        { id: "shortcuts", label: "Shortcuts", keys: [ALL_KEYS.ctrlC, ALL_KEYS.ctrlD, ALL_KEYS.ctrlZ, ALL_KEYS.ctrlL, ALL_KEYS.ctrlA, ALL_KEYS.ctrlE, ALL_KEYS.ctrlK, ALL_KEYS.ctrlU, ALL_KEYS.ctrlW, ALL_KEYS.ctrlR] },
      ],
    },
  },
];

export function getPresetById(
  id: TerminalKeyboardPresetId,
): TerminalKeyboardPreset | undefined {
  return PRESET_DEFINITIONS.find((preset) => preset.id === id);
}

export function buildTerminalKeyboardCustomization(
  presetId: TerminalKeyboardPresetId,
  settings: TerminalKeyboardSettings = DEFAULT_SETTINGS,
): TerminalKeyboardCustomization {
  const preset = getPresetById(presetId);
  if (!preset) {
    throw new Error(`Terminal keyboard preset "${presetId}" not found`);
  }

  return {
    preset: presetId,
    version: 1,
    topBar: {
      pinnedKeys: preset.topBar.pinnedKeys.map(cloneKey),
      keys: preset.topBar.keys.map(cloneKey),
    },
    fullKeyboard: {
      rows: preset.fullKeyboard.rows.map((row) => ({
        ...cloneRow(row),
        visible: row.visible ?? true,
      })),
    },
    settings: { ...settings },
  };
}

export function getDefaultTerminalKeyboardCustomization(): TerminalKeyboardCustomization {
  return buildTerminalKeyboardCustomization("default");
}

export { PRESET_DEFINITIONS as terminalKeyboardPresets };
