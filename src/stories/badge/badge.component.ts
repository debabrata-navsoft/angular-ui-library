import { Component, input } from '@angular/core';

import type { Tone } from '../types';

@Component({
  selector: 'app-badge',
  template: `<span class="badge" [class]="'tone-' + variant()" [class.badge--pill]="pill()">{{ label() }}</span>`,
  styleUrl: './badge.css',
})
export class BadgeComponent {
  /** Badge text */
  readonly label = input('Badge');

  /** Color tone of the badge */
  readonly variant = input<Tone>('info');

  /** Fully rounded corners? */
  readonly pill = input(false);
}
