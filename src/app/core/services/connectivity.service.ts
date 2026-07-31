import { DestroyRef, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  readonly #online = signal(navigator.onLine);
  readonly online = this.#online.asReadonly();

  constructor(destroyRef: DestroyRef) {
    const goOnline = () => this.#online.set(true);
    const goOffline = () => this.#online.set(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    destroyRef.onDestroy(() => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    });
  }

  markOffline(): void {
    this.#online.set(false);
  }
}
