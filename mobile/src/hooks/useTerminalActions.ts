import { useCallback } from "react";

import {
  getTerminalActionSequence,
  resolveModifiedTerminalInput,
  type TerminalActionId,
} from "@/services/terminal";

type UseTerminalActionsOptions = {
  sendInput: (data: string) => void;
};

export function useTerminalActions({
  sendInput,
}: UseTerminalActionsOptions) {
  const sendAction = useCallback(
    (actionId: TerminalActionId | string) => {
      const sequence = getTerminalActionSequence(actionId);
      if (!sequence) return false;
      sendInput(sequence);
      return true;
    },
    [sendInput],
  );

  const sendModifiedKey = useCallback(
    (options: {
      key: string;
      ctrl?: boolean;
      shift?: boolean;
      alt?: boolean;
    }) => {
      const sequence = resolveModifiedTerminalInput(options);
      if (!sequence) return false;
      sendInput(sequence);
      return true;
    },
    [sendInput],
  );

  return {
    sendAction,
    sendModifiedKey,
  };
}
