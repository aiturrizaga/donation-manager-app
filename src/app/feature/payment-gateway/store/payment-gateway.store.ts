import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { PaymentGatewayApi } from '../api/payment-gateway.api';
import { PaymentGateway } from '../models/payment-gateway.model';

interface PaymentGatewayListState {
  items: PaymentGateway[];
  organizationId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: PaymentGatewayListState = {
  items: [],
  organizationId: null,
  loading: false,
  error: null,
};

export const PaymentGatewayStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
  })),

  withMethods((store, api = inject(PaymentGatewayApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const orgId = store.organizationId();
          if (!orgId) {
            patchState(store, { items: [], loading: false });
            return EMPTY;
          }
          return api.getAll(orgId).pipe(
            tap((items) => patchState(store, { items, loading: false })),
            catchError((err: Error) => {
              patchState(store, { error: err.message, loading: false });
              return EMPTY;
            }),
          );
        }),
      ),
    ),

    setOrganization(orgId: number | null): void {
      patchState(store, { organizationId: orgId, items: [] });
    },

    upsert(gateway: PaymentGateway): void {
      const exists = store.items().some((g) => g.id === gateway.id);
      patchState(store, {
        items: exists
          ? store.items().map((g) => (g.id === gateway.id ? gateway : g))
          : [...store.items(), gateway],
      });
    },
  })),
);
