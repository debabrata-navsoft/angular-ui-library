import { Component, input, output } from '@angular/core';

import type { Size } from '../types';

@Component({
  selector: 'storybook-button',
  template: `
    <button
      type="button"
      class="storybook-button"
      [class]="['storybook-button--' + size(), primary() ? 'storybook-button--primary' : 'storybook-button--secondary']"
      [style.background-color]="backgroundColor()"
      (click)="onClick.emit($event)"
    >
      {{ label() }}
    </button>
  `,
  styleUrl: './button.css',
})
export class ButtonComponent {
  /** Is this the principal call to action on the page? */
  readonly primary = input(false);

  /** What background color to use */
  readonly backgroundColor = input<string>();

  /** How large should the button be? */
  readonly size = input<Size>('medium');

  /** Button contents */
  readonly label = input('Button');

  /** Optional click handler */
  readonly onClick = output<Event>();
}
