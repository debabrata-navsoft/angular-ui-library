import { Component, input, model } from '@angular/core';

export interface RadioOption {
  value: string;
  label: string;
}

let nextId = 0;

@Component({
  selector: 'app-radio-group',
  template: `
    <fieldset class="radio-group" [class.radio-group--horizontal]="horizontal()">
      @if (label()) {
        <legend>{{ label() }}</legend>
      }
      @for (option of options(); track option.value) {
        <label class="radio" [class.radio--disabled]="disabled()">
          <input
            type="radio"
            [name]="name"
            [value]="option.value"
            [checked]="option.value === value()"
            [disabled]="disabled()"
            (change)="value.set(option.value)"
          />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
  styleUrl: './radio-group.css',
})
export class RadioGroupComponent {
  /** Text shown above the options */
  readonly label = input('');

  /** Choices to display */
  readonly options = input<RadioOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Lay options out in a row instead of a column? */
  readonly horizontal = input(false);

  /** Are all options disabled? */
  readonly disabled = input(false);

  protected readonly name = `radio-group-${nextId++}`;
}
