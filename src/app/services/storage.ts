import { WritableSignal, signal } from '@angular/core';

export interface StoredSignalOptions {
  removeOnFalsy?: boolean;
}

function cloneFallback<T>(fallback: T): T {
  return JSON.parse(JSON.stringify(fallback)) as T;
}

export function readStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return cloneFallback(fallback);
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : cloneFallback(fallback);
  } catch {
    return cloneFallback(fallback);
  }
}

export function writeStored<T>(key: string, value: T, options: StoredSignalOptions = {}): void {
  if (typeof window === 'undefined') return;
  try {
    if (options.removeOnFalsy && !value) {
      window.localStorage.removeItem(key);
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local demo persistence should never break the UI.
  }
}

export function storedSignal<T>(
  key: string,
  fallback: T,
  options: StoredSignalOptions = {},
): WritableSignal<T> {
  const state = signal<T>(readStored(key, fallback));
  const originalSet = state.set.bind(state);
  const originalUpdate = state.update.bind(state);

  state.set = (value: T) => {
    originalSet(value);
    writeStored(key, value, options);
  };

  state.update = (updater: (value: T) => T) => {
    originalUpdate((value) => {
      const next = updater(value);
      writeStored(key, next, options);
      return next;
    });
  };

  return state;
}
