import { Component, input } from '@angular/core';

import type { Size } from '../types';

@Component({
  selector: 'app-spinner',
  template: `
    <span class="spinner-wrapper" role="status">
      <span class="spinner" [class]="'spinner--' + size()"></span>
      @if (label()) {
        <span class="spinner-label">{{ label() }}</span>
      } @else {
        <span class="ui-visually-hidden">Loading</span>
      }
    </span>
  `,
  styleUrl: './spinner.css',
})
export class SpinnerComponent {
  /** How large should the spinner be? */
  readonly size = input<Size>('medium');

  /** Text shown next to the spinner */
  readonly label = input('');
}
