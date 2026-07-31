import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';

@Component({
  selector: 'app-inline-error',
  imports: [ButtonDirective, ButtonIcon, ButtonLabel],
  templateUrl: './inline-error.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineError {
  readonly message = input('No se pudo cargar la información.');
  readonly retry = output<void>();
}
