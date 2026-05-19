import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { DonationPage } from '../../models/donation-page.model';
import { DonationPageApi } from '../../api/donation-page.api';
import { PageTabGeneral } from '../../components/page-tab-general/page-tab-general';
import { PageTabBranding } from '../../components/page-tab-branding/page-tab-branding';
import { PageFormConfig } from '../../components/page-form-config/page-form-config';
import { PageTabTargets } from '../../components/page-tab-targets/page-tab-targets';
import { PageTabGateway } from '../../components/page-tab-gateway/page-tab-gateway';

@Component({
  selector: 'app-donation-page-detail',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Button,
    Tag,
    PageTabGeneral,
    PageTabBranding,
    PageFormConfig,
    PageTabTargets,
    PageTabGateway,
  ],
  providers: [ConfirmationService],
  templateUrl: './donation-page-detail.html',
})
export class DonationPageDetail {
  readonly #router = inject(Router);
  readonly #api = inject(DonationPageApi);
  readonly #confirm = inject(ConfirmationService);

  readonly page = input.required<DonationPage>();
  readonly currentPage = signal<DonationPage | null>(null);

  readonly resolvedPage = () => this.currentPage() ?? this.page();

  onPageSaved(updated: DonationPage): void {
    this.currentPage.set(updated);
  }

  getDomainStatusSeverity(): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, any> = {
      verified: 'success',
      pending: 'warn',
      error: 'danger',
    };
    return map[this.resolvedPage().domainStatus] ?? 'secondary';
  }

  toggleActive(): void {
    const p = this.resolvedPage();
    const deactivating = p.isActive;
    this.#confirm.confirm({
      message: `¿Deseas ${deactivating ? 'desactivar' : 'activar'} esta página?`,
      header: deactivating ? 'Desactivar página' : 'Activar página',
      icon: deactivating ? 'ti ti-eye-off' : 'ti ti-eye',
      rejectLabel: 'No',
      acceptLabel: deactivating ? 'Sí, desactivar' : 'Sí, activar',
      acceptButtonProps: deactivating ? { severity: 'danger' } : {},
      accept: () => {
        const call$ = deactivating ? this.#api.deactivate(p.id) : this.#api.activate(p.id);
        call$.subscribe((updated) => this.currentPage.set(updated));
      },
    });
  }

  saveBranding(): void {};

  openLink(link: string): void {}

  goBack(): void {
    this.#router.navigate(['/pages']).then();
  }
}
