import { FormControl } from '@angular/forms';

export interface LegalPageCreateForm {
  organizationId: FormControl<number | null>;
  title: FormControl<string>;
  slug: FormControl<string>;
  content: FormControl<string>;
  isActive: FormControl<boolean>;
}

export interface LegalPageEditForm {
  title: FormControl<string>;
  slug: FormControl<string>;
  content: FormControl<string>;
  isActive: FormControl<boolean>;
}
