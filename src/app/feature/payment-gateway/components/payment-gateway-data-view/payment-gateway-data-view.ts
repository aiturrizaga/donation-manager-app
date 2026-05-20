import { Component, computed, input, output, signal, viewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { PaymentGateway } from '../../models/payment-gateway.model';

@Component({
  selector: 'app-payment-gateway-data-view',
  imports: [Button, Menu, Tag, Skeleton, EmptyState],
  templateUrl: './payment-gateway-data-view.html',
})
export class PaymentGatewayDataView {
  readonly items = input.required<PaymentGateway[]>();
  readonly isLoading = input<boolean>(false);

  readonly edit = output<PaymentGateway>();
  readonly test = output<PaymentGateway>();
  readonly toggle = output<PaymentGateway>();

  readonly menu = viewChild.required<Menu>('menu');
  readonly selected = signal<PaymentGateway | null>(null);

  readonly skeletonRows = Array(3).fill({});

  readonly menuItems = computed((): MenuItem[] => {
    const gw = this.selected();
    if (!gw) return [];
    return [
      {
        label: 'Editar credenciales',
        icon: 'ti ti-pencil',
        command: () => this.edit.emit(gw),
      },
      {
        label: 'Probar conexión',
        icon: 'ti ti-plug-connected',
        command: () => this.test.emit(gw),
      },
      { separator: true },
      {
        label: gw.isActive ? 'Desactivar' : 'Activar',
        icon: gw.isActive ? 'ti ti-toggle-left' : 'ti ti-toggle-right',
        command: () => this.toggle.emit(gw),
      },
    ];
  });

  openMenu(event: MouseEvent, gw: PaymentGateway): void {
    this.selected.set(gw);
    this.menu().toggle(event);
  }

  getProviderLabel(provider: string): string {
    const map: Record<string, string> = {
      culqi: 'Culqi',
      mercadopago: 'Mercado Pago',
      paypal: 'PayPal',
    };
    return map[provider] ?? provider;
  }

  getProviderIcon(provider: string): string {
    const map: Record<string, string> = {
      culqi: 'ti ti-credit-card',
      mercadopago: 'ti ti-brand-mastercard',
      paypal: 'ti ti-brand-paypal',
    };
    return map[provider] ?? 'ti ti-credit-card';
  }
}
