import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Button, ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { EmptyState } from '@shared/components';
import { LookupApi } from '@shared/api/lookup.api';
import { Lookup, LookupItem } from '@domain/lookup';
import { SaveLookupDlg } from '../../components/save-lookup-dlg/save-lookup-dlg';
import { SaveLookupItemDlg } from '../../components/save-lookup-item-dlg/save-lookup-item-dlg';
import { rowOperation } from '@shared/utils/row-operation';

@Component({
  selector: 'app-lookup-detail-page',
  imports: [TableModule, Tag, Button, ButtonDirective, ButtonIcon, ButtonLabel, Tooltip, EmptyState],
  providers: [DialogService],
  templateUrl: './lookup-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LookupDetailPage {
  readonly #lookupApi = inject(LookupApi);
  readonly #router = inject(Router);
  readonly #dialog = inject(DialogService);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);

  readonly lookupInput = input.required<Lookup>({ alias: 'lookup' });
  readonly #currentLookup = signal<Lookup | null>(null);
  readonly lookup = computed(() => this.#currentLookup() ?? this.lookupInput());

  protected readonly deleteItemOp = rowOperation<number>();

  reload(): void {
    this.#lookupApi.getById(this.lookupInput().id).subscribe((lookup) => this.#currentLookup.set(lookup));
  }

  goBack(): void {
    this.#router.navigate(['/settings/lookups']).then();
  }

  editLookup(): void {
    const current = this.lookup();

    const ref = this.#dialog.open(SaveLookupDlg, {
      header: 'Editar catálogo',
      width: '520px',
      modal: true,
      closable: true,
      data: { lookup: current },
    });

    ref?.onClose.subscribe((result: Lookup) => {
      if (result) this.reload();
    });
  }

  openCreateItemDialog(): void {
    const current = this.lookup();

    const ref = this.#dialog.open(SaveLookupItemDlg, {
      header: 'Nuevo ítem',
      width: '480px',
      modal: true,
      closable: true,
      data: { lookupId: current.id },
    });

    ref?.onClose.subscribe((result: LookupItem) => {
      if (result) this.reload();
    });
  }

  openEditItemDialog(item: LookupItem): void {
    const current = this.lookup();

    const ref = this.#dialog.open(SaveLookupItemDlg, {
      header: 'Editar ítem',
      width: '480px',
      modal: true,
      closable: true,
      data: { lookupId: current.id, item },
    });

    ref?.onClose.subscribe((result: LookupItem) => {
      if (result) this.reload();
    });
  }

  onDeleteItem(item: LookupItem): void {
    if (this.deleteItemOp.isActive(item.id)) return;
    const current = this.lookup();

    this.#confirm.confirm({
      message: `¿Eliminar el ítem "${item.label}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar ítem',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteItemOp.run(item.id, this.#lookupApi.deleteItem(current.id, item.id)).subscribe({
          next: () => this.reload(),
          error: () => this.#notifyError('No se pudo eliminar el ítem.'),
        });
      },
    });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }
}
