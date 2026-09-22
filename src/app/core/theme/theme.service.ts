import { Injectable, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme';

/**
 * Toggles the `.dark` class on <html> (read by Tailwind's class-based `dark:`
 * variant — see tailwind.css — and by PrimeNG via `darkModeSelector: '.dark'`
 * in app.config.ts) and persists the chosen mode.
 *
 * Scope note: this wires up the switcher and its own infrastructure only.
 * Most existing components still use hardcoded light Tailwind classes
 * (bg-white, text-gray-900, etc.) with no `dark:` variant, so toggling this
 * won't visually change them yet — that's a separate, larger adoption effort
 * per page/component.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.#loadSaved());

  /** Resolved dark/light state — accounts for 'system' mode. */
  readonly isDark = signal(this.#resolveIsDark(this.mode()));

  constructor() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.mode() === 'system') this.isDark.set(this.#resolveIsDark('system'));
    });

    effect(() => {
      const dark = this.#resolveIsDark(this.mode());
      this.isDark.set(dark);
      document.documentElement.classList.toggle('dark', dark);
    });
  }

  setMode(mode: ThemeMode): void {
    this.mode.set(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }

  #loadSaved(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  }

  #resolveIsDark(mode: ThemeMode): boolean {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return mode === 'dark' || (mode === 'system' && prefersDark);
  }
}
