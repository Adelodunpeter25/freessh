export interface KeyCommandEvent {
  input: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

export function addKeyCommandListener(
  listener: (event: KeyCommandEvent) => void
): { remove: () => void } | null;