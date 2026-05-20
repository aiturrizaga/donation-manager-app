import { Component, inject, OnInit, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { finalize } from 'rxjs';
import { PaymentGatewayStore } from '../../store/payment-gateway.store';
import { PaymentGatewayApi } from '../../api/payment-gateway.api';
import { PaymentGatewayDataView } from '../../components/payment-gateway-data-view/payment-gateway-data-view';
import { PaymentGatewayFilters } from '../../components/payment-gateway-filters/payment-gateway-filters';
import { SavePaymentGatewayDlg } from '../../components/save-payment-gateway-dlg/save-payment-gateway-dlg';
import { PaymentGateway } from '../../models/payment-gateway.model';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';

@Component({
  selector: 'app-payment-gateway-list-page',
  imports: [
    PaymentGatewayFilters,
    PaymentGatewayDataView,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [PaymentGatewayStore, DialogService],
  templateUrl: './payment-gateway-list.html',
})
export class PaymentGatewayListPage implements OnInit {
  readonly store = inject(PaymentGatewayStore);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);
  readonly #message = inject(MessageService);
  readonly #orgApi = inject(OrganizationApi);
  readonly #api = inject(PaymentGatewayApi);

  readonly organizations = signal<Organization[]>([]);
  readonly testing = signal<number | null>(null);

  ngOnInit(): void {
    this.#loadOrganizations();
  }

  #loadOrganizations(): void {
    this.#orgApi.getAll({ page: 1, size: 100 }, {}).subscribe((data) => {
      this.organizations.set(data.items);
    });
  }

  onFiltersChange(filters: { organizationId: number | null }): void {
    this.store.setOrganization(filters.organizationId);
    if (filters.organizationId) this.store.load();
  }

  onEdit(gw: PaymentGateway): void {
    const ref = this.#dialog.open(SavePaymentGatewayDlg, {
      header: 'Editar pasarela',
      width: '560px',
      modal: true,
      closable: true,
      data: { organizationId: this.store.organizationId(), gateway: gw },
    });
    ref?.onClose.subscribe((result: PaymentGateway) => {
      if (result) this.store.upsert(result);
    });
  }

  onTest(gw: PaymentGateway): void {
    const orgId = this.store.organizationId();
    if (!orgId) return;

    this.testing.set(gw.id);
    this.#api
      .test(orgId, gw.id)
      .pipe(finalize(() => this.testing.set(null)))
      .subscribe({
        next: (result) => {
          this.#message.add({
            severity: result.success ? 'success' : 'error',
            summary: result.success ? 'Conexión exitosa' : 'Error de conexión',
            detail: result.message,
          });
        },
        error: () => {
          this.#message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo probar la conexión.',
          });
        },
      });
  }

  onToggle(gw: PaymentGateway): void {
    const label = gw.isActive ? 'desactivar' : 'activar';
    this.#confirm.confirm({
      message: `¿Deseas ${label} la pasarela ${gw.provider}?`,
      header: 'Cambiar estado',
      icon: 'ti ti-toggle-right',
      rejectLabel: 'No',
      acceptLabel: `Sí, ${label}`,
      accept: () => this.#toggleGateway(gw),
    });
  }

  openDialog(): void {
    const ref = this.#dialog.open(SavePaymentGatewayDlg, {
      header: 'Nueva pasarela',
      width: '560px',
      modal: true,
      closable: true,
      data: { organizationId: this.store.organizationId() },
    });
    ref?.onClose.subscribe((result: PaymentGateway) => {
      if (result) this.store.upsert(result);
    });
  }

  #toggleGateway(gw: PaymentGateway): void {
    const orgId = this.store.organizationId();
    if (!orgId) return;
    this.#api.update(orgId, gw.id, { isActive: !gw.isActive }).subscribe({
      next: (result) => this.store.upsert(result),
      error: () => {
        this.#message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cambiar el estado de la pasarela.',
        });
      },
    });
  }
}
