import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Avatar } from 'primeng/avatar';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { Donor } from '../../models/donor.model';
import { DonorProfileDonations } from '../donor-profile-donations/donor-profile-donations';
import { DonorProfileSubscriptions } from '../donor-profile-subscriptions/donor-profile-subscriptions';
import { DonorProfileCertificates } from '../donor-profile-certificates/donor-profile-certificates';
import { DonationApi } from '../../../donation/api/donation.api';

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
  templateUrl: './donor-profile.html',
})
export class DonorProfilePage implements OnInit {
  readonly #router = inject(Router);
  readonly #donationApi = inject(DonationApi);

  readonly donor = input.required<Donor>();

  readonly totalDonated = signal(0);
  readonly donationCount = signal(0);

  readonly initials = computed(() =>
    this.donor()
      .partner.name.split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
  );

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

  openEditDialog(): void {}

  goBack(): void {
    this.#router.navigate(['/donors']).then();
  }
}
