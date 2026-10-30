import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export interface TemporaryPasswordDlgData {
  password: string;
  email: string | null;
}

/**
 * Shows a temporary password once, right after creating a user or resetting
 * their password. The API never returns it again, so the dialog only closes
 * through an explicit "Listo".
 */
@Component({
  selector: 'app-temporary-password-dlg',
  imports: [Button, Message],
  template: `
    <div class="flex flex-col gap-4">
      <p class="text-sm text-gray-600 dark:text-zinc-300 m-0">
        Comparte esta contraseña temporal con el usuario
        @if (data.email) {
          (<span class="font-medium">{{ data.email }}</span>)
        }
        por un medio seguro. Al iniciar sesión se le pedirá crear una contraseña nueva.
      </p>

      <div
        class="flex items-center gap-2 rounded-md border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 px-3 py-2"
      >
        <code class="flex-1 font-mono text-base tracking-wide text-gray-900 dark:text-zinc-100 select-all break-all">
          {{ data.password }}
        </code>
        <p-button
          [icon]="copied() ? 'ti ti-check' : 'ti ti-copy'"
          [label]="copied() ? 'Copiada' : 'Copiar'"
          size="small"
          [severity]="copied() ? 'success' : 'secondary'"
          [outlined]="true"
          (onClick)="copy()"
        />
      </div>

      <p-message severity="warn" size="small" variant="simple">
        Esta contraseña solo se muestra una vez. Si la pierdes, restablécela de nuevo.
      </p-message>

      <div class="flex justify-end">
        <p-button label="Listo" (onClick)="close()" />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemporaryPasswordDlg {
  readonly #dialogRef = inject(DynamicDialogRef);
  protected readonly data: TemporaryPasswordDlgData = inject(DynamicDialogConfig).data;
  protected readonly copied = signal(false);

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.data.password);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Clipboard can be blocked (non-HTTPS, permissions); the text stays selectable.
      this.copied.set(false);
    }
  }

  close(): void {
    this.#dialogRef.close();
  }
}
