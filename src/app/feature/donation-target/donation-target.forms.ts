import { FormControl } from '@angular/forms';

export interface DonationTargetForm {
  targetType: FormControl<string>;
  name: FormControl<string>;
  description: FormControl<string | null>;
  amountGoal: FormControl<number | null>;
  startsAt: FormControl<Date | null>;
  endsAt: FormControl<Date | null>;
  isPublic: FormControl<boolean>;
}
