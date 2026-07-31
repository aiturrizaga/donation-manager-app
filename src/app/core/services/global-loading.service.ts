import { Injectable, computed, signal } from '@angular/core';

export type GlobalProcess = 'org-switch' | 'critical-sync';

const LABELS: Record<GlobalProcess, string> = {
  'org-switch': 'Cambiando de organización…',
  'critical-sync': 'Sincronizando…',
};

@Injectable({ providedIn: 'root' })
export class GlobalLoadingService {
  readonly #active = signal<Set<GlobalProcess>>(new Set());

  readonly isBlocking = computed(() => this.#active().size > 0);
  readonly activeLabel = computed(() => {
    const current = [...this.#active()].at(-1);
    return current ? LABELS[current] : null;
  });

  begin(process: GlobalProcess): void {
    this.#active.update((s) => new Set(s).add(process));
  }

  end(process: GlobalProcess): void {
    this.#active.update((s) => {
      const next = new Set(s);
      next.delete(process);
      return next;
    });
  }
}
