import { Component, effect, inject, input, linkedSignal, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { Donor } from '@domain/donor';
import { DonorProfileDonations } from '../donor-profile-donations/donor-profile-donations';
import { DonorProfileSubscriptions } from '../donor-profile-subscriptions/donor-profile-subscriptions';
import { DonorProfileCertificates } from '../donor-profile-certificates/donor-profile-certificates';
import { SaveDonorDlg } from '../../components/save-donor-dlg/save-donor-dlg';
import { DonationApi } from '@shared/api/donation.api';
import { DonorApi } from '../../api/donor.api';
import { PageTitleService } from '@core/services';

@Component({
  selector: 'app-donor-profile-page',
  imports: [
    DecimalPipe,
    DatePipe,
    Avatar,
    Tag,
    Button,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    DonorProfileDonations,
    DonorProfileSubscriptions,
    DonorProfileCertificates,
  ],
  providers: [DialogService],
  templateUrl: './donor-profile.html',
})
export class DonorProfilePage implements OnInit {
  readonly #router = inject(Router);
  readonly #donationApi = inject(DonationApi);
  readonly #donorApi = inject(DonorApi);
  readonly #dialog = inject(DialogService);
  readonly #pageTitle = inject(PageTitleService);

  readonly donor = input.required<Donor>();

  // Starts from the route-resolved donor, but can be refreshed in place
  // after a successful edit — the route resolver itself doesn't re-run just
  // because a dialog closed on the same page.
  protected readonly currentDonor = linkedSignal(() => this.donor());

  readonly totalDonated = signal(0);
  readonly donationCount = signal(0);

  readonly initials = computed(() =>
    this.currentDonor()
      .partner.name.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
  );

  constructor() {
    // Route.title (función) no puede leer route.data de otro resolver (se
    // resuelven en paralelo) — el título de pestaña se setea aquí en su lugar.
    effect(() => this.#pageTitle.setPageTitle(this.currentDonor().partner.name));
  }

  ngOnInit(): void {
    this._loadStats();
  }

  private _loadStats(): void {
    this.#donationApi
      .getAll({ page: 1, size: 100 }, { donorId: this.donor().id, status: 'completed' })
      .subscribe((data) => {
        this.donationCount.set(data.total);
        this.totalDonated.set(data.items.reduce((sum, d) => sum + Number(d.amount), 0));
      });
  }

  openEditDialog(): void {
    const ref = this.#dialog.open(SaveDonorDlg, {
      header: 'Editar donante',
      width: '560px',
      modal: true,
      closable: true,
      data: { donor: this.currentDonor() },
    });
    ref?.onClose.subscribe((result) => {
      if (!result) return;
      // The dialog returns the updated Partner, not a Donor — re-fetch so
      // the header shows the server's own computed `partner.name`, etc.,
      // instead of trying to reconstruct it client-side.
      this.#donorApi.getById(this.currentDonor().id).subscribe((donor) => {
        this.currentDonor.set(donor);
      });
    });
  }

  goBack(): void {
    this.#router.navigate(['/donors']).then();
  }
}
