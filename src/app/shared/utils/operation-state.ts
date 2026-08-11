import { computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AppError } from '@shared/models';

export type OperationStatus = 'idle' | 'pending' | 'success' | 'error';

export interface OperationState {
  status: OperationStatus;
  error: AppError | null;
}

export function operationState() {
  const message = inject(MessageService);
  const state = signal<OperationState>({ status: 'idle', error: null });

  /** `successMessage`, si se pasa, dispara un toast de "Listo" al completarse. */
  function run<T>(source$: Observable<T>, successMessage?: string): Observable<T> {
    state.set({ status: 'pending', error: null });
    return source$.pipe(
      tap({
        next: () => {
          state.set({ status: 'success', error: null });
          if (successMessage) {
            message.add({ severity: 'success', summary: 'Listo', detail: successMessage });
          }
        },
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
