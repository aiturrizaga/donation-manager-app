import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RbacApi } from '@shared/api/rbac.api';
import { Role } from '@domain/rbac';
import { FormValidator } from '@shared/utils/form-validator.util';
import { operationState } from '@shared/utils/operation-state';
import { AppError } from '@shared/models';

interface SaveRoleForm {
  name: FormControl<string>;
  displayName: FormControl<string>;
  description: FormControl<string | null>;
}

/**
 * Crea un rol nuevo, o edita el nombre/descripción de uno existente — la
 * asignación de permisos y organizaciones se hace en RoleEditPage, no aquí.
 * `name` (el slug) es inmutable para roles is_system, editable para roles
 * personalizados.
 */
@Component({
  selector: 'app-save-role-dlg',
  imports: [ReactiveFormsModule, InputText, Textarea, Button, Message],
  templateUrl: './save-role-dlg.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaveRoleDlg implements OnDestroy {
  readonly #dialogRef = inject(DynamicDialogRef);
  readonly #dialogConfig = inject(DynamicDialogConfig);
  readonly #fb = inject(FormBuilder);
  readonly #rbacApi = inject(RbacApi);

  readonly #existingRole: Role | undefined = this.#dialogConfig.data?.role;
  protected readonly isSystem = this.#existingRole?.isSystem ?? false;

  protected readonly saveOp = operationState();

  readonly form: FormGroup<SaveRoleForm> = this.#fb.group({
    name: this.#fb.control(this.#existingRole?.name ?? '', {
      validators: [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]{1,49}$/)],
      nonNullable: true,
    }),
    displayName: this.#fb.control(this.#existingRole?.displayName ?? '', {
      validators: [Validators.required, Validators.maxLength(100)],
      nonNullable: true,
    }),
    description: this.#fb.control<string | null>(this.#existingRole?.description ?? null),
  });

  readonly formValidator = new FormValidator(this.form);

  constructor() {
    if (this.isSystem) this.form.controls.name.disable();
  }

  save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const raw = this.form.getRawValue();
    const call$ = this.#existingRole
      ? this.#rbacApi.updateRole(this.#existingRole.id, {
          displayName: raw.displayName,
          description: raw.description,
        })
      : this.#rbacApi.createRole({
          name: raw.name,
          displayName: raw.displayName,
          description: raw.description,
        });

    this.saveOp.run(call$).subscribe({
      next: (role) => this.#dialogRef.close(role),
      error: (err: AppError) => {
        if (err.fieldErrors) this.formValidator.applyServerErrors(err.fieldErrors);
      },
    });
  }

  close(): void {
    this.#dialogRef.close();
  }

  ngOnDestroy(): void {
    this.#dialogRef?.close();
  }
}
