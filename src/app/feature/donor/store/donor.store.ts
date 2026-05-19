import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { DonorApi } from '../api/donor.api';
import { Donor, DonorFilterParams } from '../models/donor.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models';

interface DonorListState {
  items: Donor[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: DonorFilterParams;
  loading: boolean;
  error: string | null;
}

const initialState: DonorListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  loading: false,
  error: null,
};

export const DonorStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(DonorApi)) => ({
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

    setFilters(filters: DonorFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    toggleActive(donor: Donor): void {
      const call$ = donor.isActive ? api.deactivate(donor.id) : api.activate(donor.id);
      call$
        .pipe(
          tap((updated) =>
            patchState(store, {
              items: store.items().map((d) => (d.id === updated.id ? updated : d)),
            }),
          ),
          catchError((err: Error) => {
            patchState(store, { error: err.message });
            return EMPTY;
          }),
        )
        .subscribe();
    },

    revertItem(donor: Donor): void {
      patchState(store, {
        items: store.items().map((d) => (d.id === donor.id ? { ...donor } : d)),
      });
    },

    remove(id: string): void {
      api
        .delete(id)
        .pipe(
          tap(() =>
            patchState(store, {
              items: store.items().filter((d) => d.id !== id),
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
