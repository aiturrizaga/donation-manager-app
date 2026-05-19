import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { DonationTargetApi } from '../api/donation-target.api';
import { DonationTarget, DonationTargetFilterParams } from '../models/donation-target.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models';

interface DonationTargetListState {
  items: DonationTarget[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: DonationTargetFilterParams;
  organizationId: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: DonationTargetListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  organizationId: null,
  loading: false,
  error: null,
};

export const DonationTargetStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(DonationTargetApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const orgId = store.organizationId();
          if (!orgId) {
            patchState(store, { items: [], total: 0, loading: false });
            return EMPTY;
          }
          return api.getAll(orgId, store.query(), store.filters()).pipe(
            tap(({ items, total, pages }) =>
              patchState(store, { items, total, pages, loading: false }),
            ),
            catchError((err: Error) => {
              patchState(store, { error: err.message, loading: false });
              return EMPTY;
            }),
          );
        }),
      ),
    ),

    setOrganization(orgId: number | null): void {
      patchState(store, {
        organizationId: orgId,
        items: [],
        total: 0,
        query: { ...store.query(), page: 1 },
      });
    },

    setFilters(filters: DonationTargetFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    setStatus(target: DonationTarget, newStatus: 'active' | 'paused' | 'finished'): void {
      const orgId = store.organizationId();
      if (!orgId) return;

      const call$ =
        newStatus === 'active'
          ? api.activate(orgId, target.id)
          : newStatus === 'paused'
            ? api.pause(orgId, target.id)
            : api.finish(orgId, target.id);

      call$
        .pipe(
          tap((updated) =>
            patchState(store, {
              items: store.items().map((t) => (t.id === updated.id ? updated : t)),
            }),
          ),
          catchError((err: Error) => {
            patchState(store, { error: err.message });
            return EMPTY;
          }),
        )
        .subscribe();
    },

    remove(id: number): void {
      const orgId = store.organizationId();
      if (!orgId) return;
      api
        .delete(orgId, id)
        .pipe(
          tap(() =>
            patchState(store, {
              items: store.items().filter((t) => t.id !== id),
              total: store.total() - 1,
            }),
          ),
          catchError((err: Error) => {
            patchState(store, { error: err.message });
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
