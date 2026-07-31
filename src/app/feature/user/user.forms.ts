import { FormControl } from '@angular/forms';

export interface UserCreateForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string | null>;
  documentNumber: FormControl<string | null>;
  roleId: FormControl<number | null>;
}
