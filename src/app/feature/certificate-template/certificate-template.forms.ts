import { FormControl } from '@angular/forms';

export interface CertificateTemplateFormFields {
  bodyHtml: FormControl<string>;
  footerHtml: FormControl<string>;
  signatureHtml: FormControl<string>;
}
