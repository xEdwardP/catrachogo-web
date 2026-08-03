import { useCallback, useState } from 'react';

function readDismissed(storageKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function useDismissedItems(storageKey: string) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => readDismissed(storageKey));

  const dismiss = useCallback(
    (id: string) => {
      setDismissed((current) => {
        const next = new Set(current);
        next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
        }
        return next;
      });
    },
    [storageKey],
  );

  return { dismissed, dismiss };
}
