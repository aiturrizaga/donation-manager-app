import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule, TableRowReorderEvent } from 'primeng/table';
import { Button } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { EmptyState } from '@shared/components';
import { DonationPage, FormConfigTarget } from '@domain/donation-page';
import { DonationPageApi } from '../../api/donation-page.api';
import { AssignTargetDlg } from '../assign-target-dlg/assign-target-dlg';
import { getTargetTypeLabel } from '@shared/utils/target-type.util';
import { DonationPageFormConfigApi } from '@shared/api/donation-page-form-config.api';

interface NonePositionOption {
  label: string;
  value: 'start' | 'end';
}

@Component({
  selector: 'app-page-tab-targets',
  imports: [FormsModule, TableModule, Button, ToggleSwitch, Select, Skeleton, EmptyState],
  providers: [DialogService],
  templateUrl: './page-tab-targets.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTabTargets implements OnInit {
  readonly page = input.required<DonationPage>();

  readonly #api = inject(DonationPageApi);
  readonly #formConfigApi = inject(DonationPageFormConfigApi);
  readonly #dialog = inject(DialogService);
  readonly #confirm = inject(ConfirmationService);

  readonly items = signal<FormConfigTarget[]>([]);
  readonly loading = signal(true);
  readonly allowNoneTarget = signal(false);
  readonly savingAllowNoneTarget = signal(false);
  readonly noneTargetPosition = signal<'start' | 'end'>('end');
  readonly savingNoneTargetPosition = signal(false);

  readonly nonePositionOptions: NonePositionOption[] = [
    { label: 'Al inicio', value: 'start' },
    { label: 'Al final', value: 'end' },
  ];

  ngOnInit(): void {
    this.allowNoneTarget.set(this.page().formConfig?.allowNoneTarget ?? false);
    this.noneTargetPosition.set(this.page().formConfig?.noneTargetPosition ?? 'end');
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
    return getTargetTypeLabel(type);
  }

  updateAllowNoneTarget(value: boolean): void {
    const previous = this.allowNoneTarget();
    this.allowNoneTarget.set(value);
    this.savingAllowNoneTarget.set(true);
    this.#formConfigApi.updateFormConfig(this.page().id, { allowNoneTarget: value }).subscribe({
      next: () => this.savingAllowNoneTarget.set(false),
      error: () => {
        this.allowNoneTarget.set(previous);
        this.savingAllowNoneTarget.set(false);
      },
    });
  }

  updateNoneTargetPosition(value: 'start' | 'end'): void {
    const previous = this.noneTargetPosition();
    this.noneTargetPosition.set(value);
    this.savingNoneTargetPosition.set(true);
    this.#formConfigApi.updateFormConfig(this.page().id, { noneTargetPosition: value }).subscribe({
      next: () => this.savingNoneTargetPosition.set(false),
      error: () => {
        this.noneTargetPosition.set(previous);
        this.savingNoneTargetPosition.set(false);
      },
    });
  }

  onRowReorder(event: TableRowReorderEvent): void {
    if (event.dragIndex === undefined || event.dropIndex === undefined) return;
    if (event.dragIndex === event.dropIndex) return;
    const reordered = [...this.items()];
    const [moved] = reordered.splice(event.dragIndex, 1);
    reordered.splice(event.dropIndex, 0, moved);
    this._persistOrder(reordered);
  }

  moveUp(index: number): void {
    if (index <= 0) return;
    const reordered = [...this.items()];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    this._persistOrder(reordered);
  }

  moveDown(index: number): void {
    if (index >= this.items().length - 1) return;
    const reordered = [...this.items()];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    this._persistOrder(reordered);
  }

  private _persistOrder(reordered: FormConfigTarget[]): void {
    const previous = this.items();
    this.items.set(reordered);
    this.#api.reorderTargets(this.page().id, reordered.map((t) => t.id)).subscribe({
      next: (updated) => this.items.set(updated),
      error: () => this.items.set(previous),
    });
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
      header: 'Desasignar objetivo',
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
