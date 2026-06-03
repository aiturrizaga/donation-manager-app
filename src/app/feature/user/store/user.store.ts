import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { computed } from '@angular/core';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
import { UserApi } from '../api/user.api';
import { User, UserFilterParams } from '../models/user.model';
import { DEFAULT_PAGE_QUERY, PageQuery } from '@shared/models';

interface UserListState {
  items: User[];
  total: number;
  pages: number;
  query: PageQuery;
  filters: UserFilterParams;
  loading: boolean;
  error: string | null;
}

const initialState: UserListState = {
  items: [],
  total: 0,
  pages: 0,
  query: DEFAULT_PAGE_QUERY,
  filters: {},
  loading: false,
  error: null,
};

export const UserStore = signalStore(
  withState(initialState),

  withComputed(({ items, loading, pages, query }) => ({
    isEmpty: computed(() => !loading() && items().length === 0),
    hasPagination: computed(() => pages() > 1),
    first: computed(() => (query().page - 1) * query().size),
  })),

  withMethods((store, api = inject(UserApi)) => ({
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

    setFilters(filters: UserFilterParams): void {
      patchState(store, {
        filters,
        query: { ...store.query(), page: 1 },
      });
    },

    changePage(page: number, size: number): void {
      patchState(store, { query: { page, size } });
    },

    toggleActive(user: User): void {
      const call$ = user.isActive ? api.deactivate(user.id) : api.activate(user.id);
      call$
        .pipe(
          tap((updated) =>
            patchState(store, {
              items: store.items().map((u) => (u.id === updated.id ? updated : u)),
            }),
          ),
          catchError((err: Error) => {
            patchState(store, { error: err.message });
            return EMPTY;
          }),
        )
        .subscribe();
    },

    revertToggle(user: User): void {
      patchState(store, {
        items: store.items().map((u) => (u.id === user.id ? { ...user } : u)),
      });
    },

    resetPassword(id: number): void {
      api.resetPassword(id).subscribe();
    },

    remove(id: number): void {
      api
        .delete(id)
        .pipe(
          tap(() =>
            patchState(store, {
              items: store.items().filter((u) => u.id !== id),
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
