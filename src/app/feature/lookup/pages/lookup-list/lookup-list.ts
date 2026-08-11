import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { LookupApi } from '@shared/api/lookup.api';
import { Lookup } from '@domain/lookup';
import { SaveLookupDlg } from '../../components/save-lookup-dlg/save-lookup-dlg';
import { LookupDataView } from '../../components/lookup-data-view/lookup-data-view';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

/**
 * Lista de catálogos internos — sin paginación server-side a propósito: el
 * volumen esperado (unos pocos catálogos del MVP) nunca justifica traer una
 * página a la vez, mismo criterio que la lista de roles.
 */
@Component({
  selector: 'app-lookup-list-page',
  imports: [LookupDataView, InlineError, ButtonDirective, ButtonIcon, ButtonLabel],
  providers: [DialogService],
  templateUrl: './lookup-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupListPage {
  readonly #lookupApi = inject(LookupApi);
  readonly #router = inject(Router);
  readonly #dialog = inject(DialogService);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);

  readonly lookups = signal<Lookup[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  protected readonly deleteOp = rowOperation<number>();

  constructor() {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(false);
    this.#lookupApi.getAll().subscribe({
      next: (lookups) => {
        this.lookups.set(lookups);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  onEdit(lookup: Lookup): void {
    this.#router.navigate(['/settings/lookups', lookup.id]).then();
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveLookupDlg, {
      header: 'Nuevo catálogo',
      width: '520px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result: Lookup) => {
      if (result) this.#router.navigate(['/settings/lookups', result.id]).then();
    });
  }

  onDelete(lookup: Lookup): void {
    if (this.deleteOp.isActive(lookup.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar el catálogo "${lookup.name}"? Se eliminarán también sus ${lookup.items.length} ítems. Esta acción no se puede deshacer.`,
      header: 'Eliminar catálogo',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(lookup.id, this.#lookupApi.delete(lookup.id)).subscribe({
          next: () => this.reload(),
          error: () => this.#notifyError('No se pudo eliminar el catálogo.'),
        });
      },
    });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }
}
