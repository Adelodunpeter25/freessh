import { requireOptionalNativeModule } from "expo-modules-core";

const HardwareKeyboard = requireOptionalNativeModule("HardwareKeyboard");

export function addKeyCommandListener(listener) {
  if (!HardwareKeyboard) return null;
  return HardwareKeyboard.addListener("onKeyCommand", listener);
}
