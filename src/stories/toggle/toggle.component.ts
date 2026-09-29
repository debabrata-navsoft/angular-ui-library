import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <label class="toggle" [class.toggle--disabled]="disabled()">
      <input
        type="checkbox"
        role="switch"
        [checked]="checked()"
        [disabled]="disabled()"
        (change)="checked.set($any($event.target).checked)"
      />
      <span class="toggle-track"><span class="toggle-thumb"></span></span>
      @if (label()) {
        <span>{{ label() }}</span>
      }
    </label>
  `,
  styleUrl: './toggle.css',
})
export class ToggleComponent {
  /** Text next to the switch */
  readonly label = input('');

  /** Is the switch on? Supports [(checked)] two-way binding */
  readonly checked = model(false);

  /** Is the switch disabled? */
  readonly disabled = input(false);
}
