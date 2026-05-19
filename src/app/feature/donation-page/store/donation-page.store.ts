import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { DonationPageApi } from '../api/donation-page.api';
import { DonationPageFilterParams, DonationPageSummary } from '../models/donation-page.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models';

interface DonationPageListState {
  items: DonationPageSummary[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: DonationPageFilterParams;
  loading: boolean;
  error: string | null;
}

const initialState: DonationPageListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  loading: false,
  error: null,
};

export const DonationPageStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(DonationPageApi)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          api.getAll(store.query(), store.filters()).pipe(
            tap(({ items, total, pages }) =>
              patchState(store, { items, total, pages, loading: false }),
            ),
            catchError((err: Error) => {
              patchState(store, { error: err.message, loading: false });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    setFilters(filters: DonationPageFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    toggleActive(page: DonationPageSummary): void {
      const call$ = page.isActive ? api.deactivate(page.id) : api.activate(page.id);
      call$
        .pipe(
          tap((updated) =>
            patchState(store, {
              items: store
                .items()
                .map((p) => (p.id === updated.id ? { ...p, isActive: updated.isActive } : p)),
            }),
          ),
          catchError((err: Error) => {
            patchState(store, { error: err.message });
            return EMPTY;
          }),
        )
        .subscribe();
    },

    revertItem(page: DonationPageSummary): void {
      patchState(store, {
        items: store.items().map((p) => (p.id === page.id ? { ...page } : p)),
      });
    },

    remove(id: string): void {
      api
        .delete(id)
        .pipe(
          tap(() =>
            patchState(store, {
              items: store.items().filter((p) => p.id !== id),
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
