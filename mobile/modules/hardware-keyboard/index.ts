import { requireOptionalNativeModule } from "expo-modules-core";
import type { EventSubscription } from "expo-modules-core";

interface KeyCommandEvent {
  input: string;
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
}

interface HardwareKeyboardModule {
  addListener(
    eventName: "onKeyCommand",
    listener: (event: KeyCommandEvent) => void,
  ): EventSubscription;
}

const HardwareKeyboard =
  requireOptionalNativeModule<HardwareKeyboardModule>("HardwareKeyboard");

export function addKeyCommandListener(
  listener: (event: KeyCommandEvent) => void,
): EventSubscription | null {
  if (!HardwareKeyboard) return null;
  return HardwareKeyboard.addListener("onKeyCommand", listener);
}
