import { computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AppError } from '@shared/models';

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface OperationState {
  status: OperationStatus;
  error: AppError | null;
}

export function operationState() {
  const state = signal<OperationState>({ status: 'idle', error: null });

  function run<T>(source$: Observable<T>): Observable<T> {
    state.set({ status: 'pending', error: null });
    return source$.pipe(
      tap({
        next: () => state.set({ status: 'success', error: null }),
        error: (err: AppError) => state.set({ status: 'error', error: err }),
      }),
    );
  }

  return {
    status: computed(() => state().status),
    error: computed(() => state().error),
    isPending: computed(() => state().status === 'pending'),
    run,
  };
}
