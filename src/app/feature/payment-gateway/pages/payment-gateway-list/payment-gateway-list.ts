import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { PaymentGatewaysListFacade } from '../../facade/payment-gateways-list.facade';
import { PaymentGatewayDataView } from '../../components/payment-gateway-data-view/payment-gateway-data-view';
import { SavePaymentGatewayDlg } from '../../components/save-payment-gateway-dlg/save-payment-gateway-dlg';
import { OrganizationPaymentGateway } from '@domain/payment-gateway';
import { SelectedOrganizationContext } from '@shared/context/selected-organization.context';
import { OrganizationSelector } from '@shared/ui/organization-selector/organization-selector';
import { InlineError } from '@shared/ui/inline-error/inline-error';
import { rowOperation } from '@shared/utils/row-operation';

@Component({
  selector: 'app-payment-gateway-list-page',
  imports: [
    OrganizationSelector,
    PaymentGatewayDataView,
    InlineError,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
  ],
  providers: [PaymentGatewaysListFacade, DialogService],
  templateUrl: './payment-gateway-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentGatewayListPage {
  protected readonly facade = inject(PaymentGatewaysListFacade);
  protected readonly orgContext = inject(SelectedOrganizationContext);
  readonly #confirm = inject(ConfirmationService);
  readonly #dialog = inject(DialogService);
  readonly #message = inject(MessageService);

  protected readonly testOp = rowOperation<number>();
  protected readonly toggleOp = rowOperation<number>();

  constructor() {
    this.facade.connect(() => this.orgContext.selectedId());
  }

  onEdit(gw: OrganizationPaymentGateway): void {
    const ref = this.#dialog.open(SavePaymentGatewayDlg, {
      header: 'Editar pasarela',
      width: '560px',
      modal: true,
      closable: true,
      data: { organizationId: this.orgContext.selectedId(), gateway: gw },
    });
    ref?.onClose.subscribe((result: OrganizationPaymentGateway) => {
      if (result) this.facade.reload();
    });
  }

  onTest(gw: OrganizationPaymentGateway): void {
    if (this.testOp.isActive(gw.id)) return;
    this.testOp.run(gw.id, this.facade.test(gw.id)).subscribe({
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

  onToggle(gw: OrganizationPaymentGateway): void {
    if (this.toggleOp.isActive(gw.id)) return;
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
      data: { organizationId: this.orgContext.selectedId() },
    });
    ref?.onClose.subscribe((result: OrganizationPaymentGateway) => {
      if (result) this.facade.reload();
    });
  }

  #toggleGateway(gw: OrganizationPaymentGateway): void {
    this.toggleOp.run(gw.id, this.facade.update(gw.id, { isActive: !gw.isActive })).subscribe({
      next: () => {
        this.facade.reload();
        this.#message.add({
          severity: 'success',
          summary: 'Listo',
          detail: gw.isActive ? 'Pasarela desactivada.' : 'Pasarela activada.',
        });
      },
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
