import { Component, input, output } from '@angular/core';

import { TONE_ICONS, type Tone } from '../types';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class AlertComponent {
  /** Color tone of the alert */
  readonly type = input<Tone>('info');

  /** Bold heading shown above the message */
  readonly title = input('');

  /** Alert text */
  readonly message = input('');

  /** Show a close button? */
  readonly dismissible = input(false);

  /** Emits when the close button is clicked */
  readonly dismiss = output<void>();

  protected readonly icons = TONE_ICONS;
}
