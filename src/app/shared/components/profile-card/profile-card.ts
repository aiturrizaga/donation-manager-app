import { Component, input } from '@angular/core';
import { Avatar } from 'primeng/avatar';

export type ProfileCardSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-profile-card',
  imports: [Avatar],
  templateUrl: './profile-card.html',
  styleUrl: './profile-card.scss',
})
export class ProfileCard {
  name = input.required<string>();
  role = input.required<string>();
  initials = input.required<string>();
  size = input<ProfileCardSize>('md');
  showStatus = input<boolean>(true);
  showRole = input<boolean>(true);
  showChevron = input<boolean>(false);
}
