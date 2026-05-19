import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Skeleton } from 'primeng/skeleton';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { EmptyState } from '@shared/components';
import { DonationPage, FormConfigTarget } from '../../models/donation-page.model';
import { DonationPageApi } from '../../api/donation-page.api';
import { AssignTargetDlg } from '../assign-target-dlg/assign-target-dlg';

@Component({
  selector: 'app-page-tab-targets',
  imports: [FormsModule, TableModule, Button, ToggleSwitch, Skeleton, EmptyState],
  providers: [DialogService, ConfirmationService],
  templateUrl: './page-tab-targets.html',
})
export class PageTabTargets implements OnInit {
  readonly page = input.required<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #dialog = inject(DialogService);
  readonly #confirm = inject(ConfirmationService);

  readonly items = signal<FormConfigTarget[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this._load();
  }

  private _load(): void {
    if (!this.page().formConfig) {
      this.loading.set(false);
      return;
    }
    this.#api.getFormConfigTargets(this.page().id).subscribe({
      next: (targets) => {
        this.items.set(targets);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
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

  updateFlag(
    target: FormConfigTarget,
    flag: 'isDefault' | 'isLocked' | 'isVisible',
    value: boolean,
  ): void {
    this.#api.updateTargetFlags(this.page().id, target.targetId, { [flag]: value }).subscribe({
      next: (updated) =>
        this.items.update((list) => list.map((t) => (t.id === updated.id ? updated : t))),
      error: () => this._load(),
    });
  }

  onUnassign(target: FormConfigTarget): void {
    this.#confirm.confirm({
      message: `¿Desasignar "${target.target.name}" del formulario?`,
      header: 'Desasignar target',
      icon: 'ti ti-unlink',
      rejectLabel: 'No',
      acceptLabel: 'Sí, desasignar',
      acceptButtonProps: { severity: 'danger' },
      accept: () => {
        this.#api
          .unassignTarget(this.page().id, target.targetId)
          .subscribe(() => this.items.update((list) => list.filter((t) => t.id !== target.id)));
      },
    });
  }

  openAssignDialog(): void {
    const assignedIds = this.items().map((t) => t.targetId);
    const ref = this.#dialog.open(AssignTargetDlg, {
      header: 'Asignar objetivo',
      width: '520px',
      modal: true,
      closable: true,
      data: {
        pageId: this.page().id,
        organizationId: this.page().organizationId,
        assignedIds,
      },
    });

    ref?.onClose.subscribe((result: FormConfigTarget) => {
      if (result) this.items.update((list) => [...list, result]);
    });
  }
}
