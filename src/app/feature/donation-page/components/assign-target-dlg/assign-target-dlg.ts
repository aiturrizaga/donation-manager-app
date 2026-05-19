import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { EmptyState } from '@shared/components';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DonationPageApi } from '../../api/donation-page.api';
import { DonationTargetApi } from '../../../donation-target/api/donation-target.api';
import { DonationTarget } from '../../../donation/models/donation.model';

interface TargetSelection {
  target: DonationTarget;
  isDefault: boolean;
  isLocked: boolean;
  isVisible: boolean;
}

@Component({
  selector: 'app-assign-target-dlg',
  imports: [FormsModule, Button, Skeleton, ToggleSwitch, EmptyState],
  templateUrl: './assign-target-dlg.html',
})
export class AssignTargetDlg implements OnInit {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogService = inject(DialogService);
  readonly #targetApi = inject(DonationTargetApi);
  readonly #pageApi = inject(DonationPageApi);

  readonly availableTargets = signal<DonationTarget[]>([]);
  readonly loading = signal(true);
  readonly isSaving = signal(false);
  selected = signal<TargetSelection | null>(null);

  #pageId = '';
  #orgId = 0;
  #assignedIds: number[] = [];

  ngOnInit(): void {
    const instance = this.#dialogService.getInstance(this.#dialogRef);
    this.#pageId = instance?.data?.pageId ?? '';
    this.#orgId = instance?.data?.organizationId ?? 0;
    this.#assignedIds = instance?.data?.assignedIds ?? [];
    this._loadAvailable();
  }

  private _loadAvailable(): void {
    this.#targetApi.getAll(this.#orgId, { page: 1, size: 100 }, { status: 'active' }).subscribe({
      next: (data) => {
        this.availableTargets.set(data.items.filter((t) => !this.#assignedIds.includes(t.id)));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  select(target: DonationTarget): void {
    this.selected.set({
      target,
      isDefault: false,
      isLocked: false,
      isVisible: true,
    });
  }

  assign(): void {
    const sel = this.selected();
    if (!sel) return;

    this.isSaving.set(true);
    this.#pageApi
      .assignTarget(this.#pageId, {
        targetId: sel.target.id,
        isDefault: sel.isDefault,
        isLocked: sel.isLocked,
        isVisible: sel.isVisible,
      })
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (result) => this.#dialogRef.close(result),
        error: (err) => console.error('[AssignTargetDlg]', err),
      });
  }

  getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      cause: 'Causa',
      group: 'Grupo',
      campaign: 'Campaña',
      goal: 'Meta',
    };
    return map[type] ?? type;
  }

  close(): void {
    this.#dialogRef.close();
  }
}
