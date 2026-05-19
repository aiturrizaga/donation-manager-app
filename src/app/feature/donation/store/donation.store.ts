import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { DonationApi } from '../api/donation.api';
import { Donation, DonationFilterParams } from '../models/donation.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models';

interface DonationListState {
  items: Donation[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: DonationFilterParams;
  loading: boolean;
  exporting: boolean;
  error: string | null;
}

const initialState: DonationListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  loading: false,
  exporting: false,
  error: null,
};

export const DonationStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(DonationApi)) => ({
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

    setFilters(filters: DonationFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    exportCsv(): void {
      patchState(store, { exporting: true });
      api
        .exportCsv(store.filters())
        .pipe(
          tap((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `donaciones_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            patchState(store, { exporting: false });
          }),
          catchError((err: Error) => {
            patchState(store, { error: err.message, exporting: false });
            return EMPTY;
          }),
        )
        .subscribe();
    },
  })),
);
