import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { OrganizationApi } from '../api/organization.api';
import { Organization, OrganizationFilterParams } from '../models/organization.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models/pagination.model';

interface OrganizationListState {
  items: Organization[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: OrganizationFilterParams;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  loading: false,
  error: null,
};

export const OrganizationStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    // first offset for p-table paginator
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(OrganizationApi)) => ({
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

    setFilters(filters: OrganizationFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    toggleActive(org: Organization): void {
      const call$ = org.isActive ? api.deactivate(org.id) : api.activate(org.id);
      call$
        .pipe(
          tap((updated) =>
            patchState(store, {
              items: store.items().map((i) => (i.id === updated.id ? updated : i)),
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
      api
        .delete(id)
        .pipe(
          tap(() =>
            patchState(store, {
              items: store.items().filter((i) => i.id !== id),
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
