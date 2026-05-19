import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { EmptyState } from '@shared/components';
import { DonationPageApi } from '../../../donation-page/api/donation-page.api';
import { DonationPageSummary, FormConfig } from '../../../donation-page/models/donation-page.model';
import { PageFormConfig } from '../../../donation-page/components/page-form-config/page-form-config';
import { OrganizationApi } from '../../../organization/api/organization.api';
import { Organization } from '../../../organization/models/organization.model';

@Component({
  selector: 'app-donation-form-list',
  imports: [RouterLink, FormsModule, Select, Skeleton, EmptyState, PageFormConfig],
  templateUrl: './donation-form-list.html',
})
export class DonationFormListPage implements OnInit {
  readonly #pageApi = inject(DonationPageApi);
  readonly #orgApi = inject(OrganizationApi);

  readonly organizations = signal<Organization[]>([]);
  readonly pages = signal<DonationPageSummary[]>([]);
  readonly selectedPageId = signal<string | null>(null);
  readonly selectedPage = signal<DonationPageSummary | null>(null);
  readonly formConfig = signal<FormConfig | null>(null);
  readonly loading = signal(false);

  ngOnInit(): void {
    this._loadOrganizations();
    this._loadPages();
  }

  private _loadOrganizations(): void {
    this.#orgApi
      .getAll({ page: 1, size: 100 }, {})
      .subscribe((data) =>
        this.organizations.set(
          data.items.map((o) => ({ ...o, tradeName: o.tradeName ?? o.legalName })),
        ),
      );
  }

  private _loadPages(): void {
    this.#pageApi
      .getAll({ page: 1, size: 100 }, {})
      .subscribe((data) => this.pages.set(data.items));
  }

  onPageSelect(pageId: string): void {
    this.selectedPageId.set(pageId);
    const page = this.pages().find((p) => p.id === pageId) ?? null;
    this.selectedPage.set(page);
    this.formConfig.set(null);

    if (!pageId) return;
    this.loading.set(true);
    this.#pageApi.getFormConfig(pageId).subscribe({
      next: (config) => {
        this.formConfig.set(config);
        this.loading.set(false);
      },
      error: () => {
        this.formConfig.set(null);
        this.loading.set(false);
      },
    });
  }

  onFormSaved(config: FormConfig): void {
    this.formConfig.set(config);
  }
}
