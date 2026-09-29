import { Component, input, output } from '@angular/core';

import type { Tone } from '../types';

@Component({
  selector: 'app-alert',
  template: `
    <div class="alert" [class]="'tone-' + type()" role="alert">
      <div>
        @if (title()) {
          <strong>{{ title() }}</strong>
        }
        {{ message() }}
      </div>
      @if (dismissible()) {
        <button type="button" class="ui-close" aria-label="Close" (click)="dismiss.emit()">×</button>
      }
    </div>
  `,
  styleUrl: './alert.css',
})
export class AlertComponent {
  /** Color tone of the alert */
  readonly type = input<Tone>('info');

  /** Bold heading shown before the message */
  readonly title = input('');

  /** Alert text */
  readonly message = input('');

  /** Show a close button? */
  readonly dismissible = input(false);

  /** Emits when the close button is clicked */
  readonly dismiss = output<void>();
}
