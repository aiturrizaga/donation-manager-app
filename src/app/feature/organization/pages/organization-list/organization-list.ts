import { ChangeDetectionStrategy, Component, computed, inject, numberAttribute } from '@angular/core';
import { input } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Tab, TabList, Tabs } from 'primeng/tabs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Chip } from 'primeng/chip';
import { DialogService } from 'primeng/dynamicdialog';
import { OrganizationsListFacade } from '../../facade/organizations-list.facade';
import { OrganizationFilters } from '../../components/organization-filters/organization-filters';
import { OrganizationDataView } from '../../components/organization-data-view/organization-data-view';
import { Organization } from '@domain/organization';
import { OrganizationApi } from '@shared/api/organization.api';
import { SaveOrganizationDlg } from '../../components/save-organization-dlg/save-organization-dlg';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

const EMPTY_TEXT: Record<'no-records' | 'filtered' | 'search', { title: string; description: string }> = {
  'no-records': {
    title: 'Aún no hay organizaciones',
    description: 'Crea la primera organización para empezar a gestionar sus páginas y donaciones.',
  },
  filtered: {
    title: 'Ninguna organización coincide',
    description: 'Prueba a cambiar el filtro de estado.',
  },
  search: {
    title: 'Sin resultados',
    description: 'Ninguna organización coincide con tu búsqueda.',
  },
};

const STATUS_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
] as const;

type OrgTabValue = (typeof STATUS_TABS)[number]['value'];

@Component({
  selector: 'app-organization-list-page',
  imports: [
    OrganizationFilters,
    OrganizationDataView,
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
  providers: [OrganizationsListFacade, DialogService],
  templateUrl: './organization-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationListPage {
  // Ligados a queryParams por el Router (withComponentInputBinding) — F10:
  // filtrar/paginar produce una URL compartible y sobrevive a un F5.
  readonly search = input<string | null>(null);
  readonly status = input<OrgTabValue>('all');
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly facade = inject(OrganizationsListFacade);
  readonly #confirm = inject(ConfirmationService);
  readonly #message = inject(MessageService);
  readonly #dialog = inject(DialogService);
  readonly #router = inject(Router);
  readonly #api = inject(OrganizationApi);

  readonly statusTabs = STATUS_TABS;

  // El router deja `status()` en `undefined` (no en su valor por defecto)
  // cuando la URL no trae `?status=...` — este signal normaliza ambos casos.
  protected readonly activeStatus = computed<OrgTabValue>(() => this.status() ?? 'all');

  protected readonly deleteOp = rowOperation<number>();

  protected readonly emptyText = computed(() => {
    const reason = this.facade.emptyReason();
    return reason ? EMPTY_TEXT[reason] : null;
  });

  constructor() {
    this.facade.connect(() => ({
      search: this.search(),
      active: this.activeStatus() === 'active' ? true : this.activeStatus() === 'inactive' ? false : null,
      page: this.page(),
      size: 50,
    }));
  }

  onStatusChange(tab: string | number | undefined): void {
    this.#navigate({ status: (tab as OrgTabValue) ?? 'all', page: 1 });
  }

  onFiltersChange(filters: { search?: string | null }): void {
    this.#navigate({ search: filters.search ?? null, page: 1 });
  }

  onPageChange(event: { first: number; rows: number }): void {
    const page = Math.floor(event.first / event.rows) + 1;
    this.#navigate({ page });
  }

  onDelete(org: Organization): void {
    if (this.deleteOp.isActive(org.id)) return;
    this.#confirm.confirm({
      message: `¿Eliminar "${org.legalName}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar organización',
      icon: 'ti ti-trash',
      rejectLabel: 'No',
      acceptLabel: 'Sí, eliminar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteOp.run(org.id, this.#api.delete(org.id)).subscribe({
          next: () => this.facade.reload(),
          error: () => this.#notifyError('No se pudo eliminar la organización.'),
        });
      },
    });
  }

  #notifyError(detail: string): void {
    this.#message.add({ severity: 'error', summary: 'Error', detail });
  }

  openCreateDialog(): void {
    const ref = this.#dialog.open(SaveOrganizationDlg, {
      header: 'Nueva organización',
      width: '520px',
      modal: true,
      closable: true,
    });

    ref?.onClose.subscribe((result: Organization) => {
      // Recién creada, sin logo ni datos adicionales aún — llevamos al admin
      // directo a su vista de detalle para que siga completándola ahí.
      if (result) this.#router.navigate(['/organizations', result.id]).then();
    });
  }

  onEdit(org: Organization): void {
    this.#router.navigate(['/organizations', org.id]).then();
  }

  #navigate(queryParams: Record<string, unknown>): void {
    this.#router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
}
