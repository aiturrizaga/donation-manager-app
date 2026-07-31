import { FormControl } from '@angular/forms';
import { DocumentType } from '@domain/donor';

export interface DonorCreateForm {
  documentType: FormControl<DocumentType>;
  documentNumber: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  businessName: FormControl<string>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  address: FormControl<string | null>;
}
