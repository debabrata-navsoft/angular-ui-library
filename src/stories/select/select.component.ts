import { Component, input, model } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select',
  template: `
    <label class="ui-field">
      @if (label()) {
        <span class="ui-label">{{ label() }}</span>
      }
      <select
        class="ui-control"
        [value]="value()"
        [disabled]="disabled()"
        (change)="value.set($any($event.target).value)"
      >
        @if (placeholder()) {
          <option value="" disabled [selected]="!value()">{{ placeholder() }}</option>
        }
        @for (option of options(); track option.value) {
          <option [value]="option.value" [selected]="option.value === value()">{{ option.label }}</option>
        }
      </select>
    </label>
  `,
  styles: `
    :host {
      display: inline-block;
      min-width: 200px;
    }
  `,
})
export class SelectComponent {
  /** Text shown above the dropdown */
  readonly label = input('');

  /** Choices in the dropdown */
  readonly options = input<SelectOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Text shown when nothing is selected */
  readonly placeholder = input('Select an option');

  /** Is the dropdown disabled? */
  readonly disabled = input(false);
}
