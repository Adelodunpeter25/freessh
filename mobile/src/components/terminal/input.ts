const SPECIAL_KEY_MAP: Record<string, string> = {
  ArrowUp: "\x1b[A",
  ArrowDown: "\x1b[B",
  ArrowRight: "\x1b[C",
  ArrowLeft: "\x1b[D",
  Escape: "\x1b",
};

export function normalizeTerminalInput(data: string): string {
  return data === "\b" || data === "\x7f" ? "\x08" : data;
}

export function mapHardwareKeyboardInput(event: {
  input: string;
  ctrl: boolean;
  shift: boolean;
}): string | null {
  const normalizedInput = event.input.toLowerCase();

  if (
    event.input === "\b" ||
    event.input === "\x7f" ||
    normalizedInput === "backspace"
  ) {
    return "\x08";
  }

  if (normalizedInput === "delete") {
    return "\x1b[3~";
  }

  if (event.shift && event.input === "\t") {
    return "\x1b[Z";
  }

  if (event.ctrl && event.input.length === 1) {
    const code = normalizedInput.charCodeAt(0) & 0x1f;
    return String.fromCharCode(code);
  }

  return SPECIAL_KEY_MAP[event.input] ?? null;
}
