import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute } from '@angular/core';
import { input, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DonationTargetsListFacade } from '../../facade/donation-targets-list.facade';
import { DonationTargetFilters } from '../../components/donation-target-filters/donation-target-filters';
import { DonationTargetDataView } from '../../components/donation-target-data-view/donation-target-data-view';
import { SaveDonationTargetDlg } from '../../components/save-donation-target-dlg/save-donation-target-dlg';
import { DonationTarget } from '@domain/donation-target';
import { SelectedOrganizationContext } from '@shared/context/selected-organization.context';
import { OrganizationSelector } from '@shared/ui/organization-selector/organization-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { FiltersPanel } from '@shared/ui/filters-panel/filters-panel';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay objetivos',
    description: 'Crea un nuevo objetivo para esta organización.',
  },
  filtered: {
    title: 'Ningún objetivo coincide',
    description: 'Prueba a cambiar el tipo o el estado.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ningún objetivo coincide con tu búsqueda.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'paused', label: 'Pausados' },
  { value: 'finished', label: 'Finalizados' },
] as const;

type TargetTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-donation-target-list-page',
  imports: [
    OrganizationSelector,
    DonationTargetFilters,
    FiltersPanel,
    DonationTargetDataView,
    InlineError,
    Tabs,
    TabList,
    Tab,
    Badge,
    Chip,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [DonationTargetsListFacade, DialogService],
  templateUrl: './donation-target-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DonationTargetListPage {
  readonly search = input<string | null>(null);
  readonly targetType = input<string | null>(null);
  readonly status = input<TargetTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(DonationTargetsListFacade);
  protected readonly orgContext = inject(SelectedOrganizationContext);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);

  readonly statusTabs = STATUS_TABS;

  protected readonly filtersRef = viewChild(DonationTargetFilters);

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<TargetTabValue>(() => this.status() ?? 'all');

  // La organización no cuenta como "filtro" aquí — es contexto obligatorio
  // (la página no puede listar objetivos sin una organización elegida), así
  // que "Limpiar filtros" no la toca.
  protected readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.search()) count++;
    if (this.targetType()) count++;
    return count;
  });

  protected readonly setStatusOp = rowOperation<number>();
  protected readonly deleteOp = rowOperation<number>();

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => ({
      organizationId: this.orgContext.selectedId(),
      search: this.search(),
      targetType: this.targetType(),
      status: this.activeStatus() === 'all' ? null : this.activeStatus(),
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as TargetTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search: string | null; targetType: string | null }): void {
    this.#navigate({ ...filters, page: 1 });
  }

  onClearFilters(): void {
    this.filtersRef()?.reset();
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onSetStatus(event: { target: DonationTarget; status: 'active' | 'paused' | 'finished' }): void {
    if (this.setStatusOp.isActive(event.target.id)) return;
    const labels: Record<string, string> = {
      active: 'activar',
      paused: 'pausar',
      finished: 'finalizar',
    };
    const doneLabels: Record<string, string> = {
      active: 'activado',
      paused: 'pausado',
      finished: 'finalizado',
    };
    this.#confirm.confirm({
      message: `¿Deseas ${labels[event.status]} "${event.target.name}"?`,
      header: 'Cambiar estado',
      icon: 'ti ti-refresh',
      rejectLabel: 'No',
      acceptLabel: `Sí, ${labels[event.status]}`,
      accept: () => {
        this.setStatusOp
          .run(event.target.id, this.facade.setStatus(event.target, event.status))
          .subscribe({
            next: () => {
              this.facade.reload();
              this.#notifySuccess(`Objetivo ${doneLabels[event.status]}.`);
            },
            error: () => this.#notifyError(`No se pudo ${labels[event.status]} el objetivo.`),
          });
      },
    });
  }

  onDelete(target: DonationTarget): void {
    if (this.deleteOp.isActive(target.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar "${target.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar objetivo',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.deleteOp.run(target.id, this.facade.remove(target.id)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError('No se pudo eliminar el objetivo.'),
        });
      },
    });
  }

  #notifySuccess(detail: string): void {
    this.#message.add({ severity: 'success', summary: 'Listo', detail });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }

  openDialog(target?: DonationTarget): void {
    const ref = this.#dialog.open(SaveDonationTargetDlg, {
      header: target ? 'Editar objetivo' : 'Nuevo objetivo',
      width: '560px',
      modal: true,
      closable: true,
      data: { organizationId: this.orgContext.selectedId(), target },
    });

    ref?.onClose.subscribe((result: DonationTarget) => {
      if (result) this.facade.reload();
    });
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
