import { Component, computed, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Complaint } from '@domain/complaint';
import { ComplaintApi } from '@shared/api/complaint.api';
import { operationState } from '@shared/utils/operation-state';

const STATUS_OPTIONS = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'En revisión', value: 'in_review' },
  { label: 'Resuelto', value: 'resolved' },
  { label: 'Cerrado', value: 'closed' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  in_review: 'En revisión',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

const STATUS_SEVERITIES: Record<string, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
  pending: 'warn',
  in_review: 'info',
  resolved: 'success',
  closed: 'secondary',
};

@Component({
  selector: 'app-complaint-detail-page',
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule, Button, Tag, Select, Textarea],
  templateUrl: './complaint-detail.html',
})
export class ComplaintDetailPage {
  readonly #router = inject(Router);
  readonly #api = inject(ComplaintApi);
  readonly #fb = inject(FormBuilder);

  readonly complaint = input.required<Complaint>();
  readonly statusOptions = STATUS_OPTIONS;

  protected readonly saveOp = operationState();

  readonly orgName = computed(
    () => this.complaint().organization?.tradeName ?? this.complaint().organization?.legalName ?? '—',
  );

  readonly form = this.#fb.group({
    status: [''],
    response: [''],
  });

  constructor() {
    // input.required() no tiene valor garantizado en el cuerpo síncrono del
    // constructor — se lee desde un effect(), igual que RoleEditPage.
    effect(() => {
      const complaint = this.complaint();
      this.form.patchValue({
        status: complaint.status,
        response: complaint.response ?? '',
      });
    });
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    return STATUS_SEVERITIES[status] ?? 'secondary';
  }

  getRecordTypeLabel(recordType: string): string {
    return recordType === 'reclamo' ? 'Reclamo' : 'Queja';
  }

  getGoodTypeLabel(goodType: string): string {
    return goodType === 'producto' ? 'Producto' : 'Servicio';
  }

  save(): void {
    const value = this.form.getRawValue();
    this.saveOp
      .run(
        this.#api.update(this.complaint().id, {
          status: value.status as Complaint['status'],
          response: value.response ?? undefined,
        }),
        'Reclamo actualizado.',
      )
      .subscribe();
  }

  goBack(): void {
    this.#router.navigate(['/complaints']);
  }
}
