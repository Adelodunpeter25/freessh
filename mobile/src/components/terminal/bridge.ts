import type { TerminalWebViewMessage } from "./types";

export function parseTerminalWebViewMessage(
  rawData: string,
): TerminalWebViewMessage | null {
  try {
    return JSON.parse(rawData) as TerminalWebViewMessage;
  } catch (error) {
    console.error("[Terminal] Error parsing WebView message:", error);
    return null;
  }
}
