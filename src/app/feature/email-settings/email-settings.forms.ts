import { FormControl } from '@angular/forms';

export interface EmailSettingsFormFields {
  smtpHost: FormControl<string>;
  smtpPort: FormControl<number>;
  smtpUser: FormControl<string>;
  smtpPassword: FormControl<string | null>;
  fromName: FormControl<string>;
  fromEmail: FormControl<string>;
  useTls: FormControl<boolean>;
}
