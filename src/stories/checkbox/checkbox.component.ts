import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  template: `
    <label class="checkbox" [class.checkbox--disabled]="disabled()">
      <input
        type="checkbox"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="checked.set($any($event.target).checked)"
      />
      <span>{{ label() }}</span>
    </label>
  `,
  styleUrl: './checkbox.css',
})
export class CheckboxComponent {
  /** Text next to the checkbox */
  readonly label = input('');

  /** Is the checkbox checked? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Is the checkbox disabled? */
  readonly disabled = input(false);
}
