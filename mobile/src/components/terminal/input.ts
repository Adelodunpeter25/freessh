import { resolveModifiedTerminalInput } from "@/services/terminal";

export function normalizeTerminalInput(data: string): string {
  return data === "\b" || data === "\x7f" ? "\x08" : data;
}

export function mapHardwareKeyboardInput(event: {
  input: string;
  ctrl: boolean;
  shift: boolean;
  alt?: boolean;
}): string | null {
  return resolveModifiedTerminalInput({
    key: normalizeTerminalInput(event.input),
    ctrl: event.ctrl,
    shift: event.shift,
    alt: event.alt,
  });
}
