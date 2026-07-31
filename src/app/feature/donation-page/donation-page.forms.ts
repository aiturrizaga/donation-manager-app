import { FormControl } from '@angular/forms';

export interface DonationPageGeneralForm {
  name: FormControl<string>;
  slug: FormControl<string>;
  description: FormControl<string | null>;
  domain: FormControl<string | null>;
}

export interface PageBrandingForm {
  companyName: FormControl<string>;
  primaryColor: FormControl<string>;
  secondaryColor: FormControl<string | null>;
  heroHeading: FormControl<string | null>;
  welcomeText: FormControl<string | null>;
}

/** Formulario de la pestaña "Pasarela" del detalle de una DonationPage. */
export interface DonationPageGatewayForm {
  publicKey: FormControl<string>;
  secretKey: FormControl<string>;
  webhookSecret: FormControl<string | null>;
  rsaId: FormControl<string | null>;
  rsaPublicKey: FormControl<string | null>;
  testMode: FormControl<boolean>;
}
