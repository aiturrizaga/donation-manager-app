import { FormControl } from '@angular/forms';
import { ComplaintGoodType, ComplaintRecordType } from '@domain/complaint';

export interface ComplaintCreateForm {
  organizationId: FormControl<number | null>;
  recordType: FormControl<ComplaintRecordType>;
  goodType: FormControl<ComplaintGoodType>;
  fullName: FormControl<string>;
  documentType: FormControl<string>;
  documentNumber: FormControl<string>;
  email: FormControl<string>;
  phone: FormControl<string>;
  address: FormControl<string>;
  isMinor: FormControl<boolean>;
  guardianName: FormControl<string | null>;
  amount: FormControl<number | null>;
  detail: FormControl<string>;
  request: FormControl<string>;
  dataConsent: FormControl<boolean>;
}
