import type { TerminalActionId } from "./actions";

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
  keys: TerminalKeyboardKey[];
};

export const pinnedTerminalKeys: TerminalKeyboardKey[] = [
  { id: "escape", label: "Esc", kind: "action", actionId: "escape" },
  { id: "tab", label: "Tab", kind: "action", actionId: "tab" },
  { id: "ctrl", label: "Ctrl", kind: "modifier", modifier: "ctrl" },
  { id: "alt", label: "Alt", kind: "modifier", modifier: "alt" },
  { id: "arrowUp", label: "↑", kind: "action", actionId: "arrowUp" },
  { id: "arrowDown", label: "↓", kind: "action", actionId: "arrowDown" },
  { id: "arrowLeft", label: "←", kind: "action", actionId: "arrowLeft" },
  { id: "arrowRight", label: "→", kind: "action", actionId: "arrowRight" },
  { id: "paste", label: "Paste", kind: "paste" },
  { id: "search", label: "Search", kind: "search" },
  { id: "snippets", label: "Snips", kind: "snippets" },
];

export const terminalKeyboardRows: TerminalKeyboardRow[] = [
  {
    id: "navigation",
    label: "Navigation",
    keys: [
      { id: "insert", label: "Ins", kind: "action", actionId: "insert" },
      { id: "home", label: "Home", kind: "action", actionId: "home" },
      { id: "pageUp", label: "PgUp", kind: "action", actionId: "pageUp" },
      { id: "delete", label: "Del", kind: "action", actionId: "delete" },
      { id: "end", label: "End", kind: "action", actionId: "end" },
      { id: "pageDown", label: "PgDn", kind: "action", actionId: "pageDown" },
    ],
  },
  {
    id: "quick-actions",
    label: "Quick Actions",
    keys: [
      { id: "interrupt", label: "^C", kind: "action", actionId: "interrupt" },
      { id: "eof", label: "^D", kind: "action", actionId: "eof" },
      { id: "clear", label: "^L", kind: "action", actionId: "clear" },
      { id: "searchHistory", label: "^R", kind: "action", actionId: "searchHistory" },
      { id: "suspend", label: "^Z", kind: "action", actionId: "suspend" },
      { id: "quit", label: "^\\", kind: "action", actionId: "quit" },
    ],
  },
  {
    id: "function-keys",
    label: "Function Keys",
    keys: [
      { id: "f1", label: "F1", kind: "action", actionId: "f1" },
      { id: "f2", label: "F2", kind: "action", actionId: "f2" },
      { id: "f3", label: "F3", kind: "action", actionId: "f3" },
      { id: "f4", label: "F4", kind: "action", actionId: "f4" },
      { id: "f5", label: "F5", kind: "action", actionId: "f5" },
      { id: "f6", label: "F6", kind: "action", actionId: "f6" },
      { id: "f7", label: "F7", kind: "action", actionId: "f7" },
      { id: "f8", label: "F8", kind: "action", actionId: "f8" },
      { id: "f9", label: "F9", kind: "action", actionId: "f9" },
      { id: "f10", label: "F10", kind: "action", actionId: "f10" },
      { id: "f11", label: "F11", kind: "action", actionId: "f11" },
      { id: "f12", label: "F12", kind: "action", actionId: "f12" },
    ],
  },
  {
    id: "symbols",
    label: "Symbols",
    keys: [
      { id: "tilde", label: "~", kind: "text", value: "~" },
      { id: "backtick", label: "`", kind: "text", value: "`" },
      { id: "pipe", label: "|", kind: "text", value: "|" },
      { id: "backslash", label: "\\", kind: "text", value: "\\" },
      { id: "slash", label: "/", kind: "text", value: "/" },
      { id: "minus", label: "-", kind: "text", value: "-" },
      { id: "underscore", label: "_", kind: "text", value: "_" },
      { id: "dollar", label: "$", kind: "text", value: "$" },
      { id: "hash", label: "#", kind: "text", value: "#" },
      { id: "ampersand", label: "&", kind: "text", value: "&" },
      { id: "asterisk", label: "*", kind: "text", value: "*" },
      { id: "question", label: "?", kind: "text", value: "?" },
    ],
  },
  {
    id: "brackets",
    label: "Brackets",
    keys: [
      { id: "parenLeft", label: "(", kind: "text", value: "(" },
      { id: "parenRight", label: ")", kind: "text", value: ")" },
      { id: "bracketLeft", label: "[", kind: "text", value: "[" },
      { id: "bracketRight", label: "]", kind: "text", value: "]" },
      { id: "braceLeft", label: "{", kind: "text", value: "{" },
      { id: "braceRight", label: "}", kind: "text", value: "}" },
      { id: "lessThan", label: "<", kind: "text", value: "<" },
      { id: "greaterThan", label: ">", kind: "text", value: ">" },
      { id: "quoteSingle", label: "'", kind: "text", value: "'" },
      { id: "quoteDouble", label: "\"", kind: "text", value: "\"" },
      { id: "equals", label: "=", kind: "text", value: "=" },
      { id: "plus", label: "+", kind: "text", value: "+" },
    ],
  },
  {
    id: "basic-actions",
    label: "Basic Actions",
    keys: [
      { id: "enter", label: "Enter", kind: "action", actionId: "enter" },
      { id: "space", label: "Space", kind: "action", actionId: "space" },
      { id: "backspace", label: "⌫", kind: "action", actionId: "backspace" },
      { id: "tab2", label: "Tab", kind: "action", actionId: "tab" },
      { id: "escape2", label: "Esc", kind: "action", actionId: "escape" },
    ],
  },
];
