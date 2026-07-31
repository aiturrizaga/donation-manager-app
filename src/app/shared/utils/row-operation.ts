import { signal } from '@angular/core';
import { Observable, finalize } from 'rxjs';

export function rowOperation<Id>() {
  const activeId = signal<Id | null>(null);

  function run<T>(id: Id, source$: Observable<T>): Observable<T> {
    activeId.set(id);
    return source$.pipe(finalize(() => activeId.set(null)));
  }

  return {
    activeId: activeId.asReadonly(),
    isActive: (id: Id) => activeId() === id,
    run,
  };
}
