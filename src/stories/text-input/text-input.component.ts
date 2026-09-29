import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-text-input',
  template: `
    <label class="ui-field">
      @if (label()) {
        <span class="ui-label">
          {{ label() }}
          @if (required()) {
            <span class="ui-error">*</span>
          }
        </span>
      }
      <input
        class="ui-control"
        [type]="type()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [required]="required()"
        [attr.aria-invalid]="!!error()"
        (input)="value.set($any($event.target).value)"
      />
      @if (error()) {
        <span class="ui-error">{{ error() }}</span>
      } @else if (hint()) {
        <span class="ui-hint">{{ hint() }}</span>
      }
    </label>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }
  `,
})
export class TextInputComponent {
  /** Text shown above the input */
  readonly label = input('');

  /** HTML input type */
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'>('text');

  /** Text shown when the input is empty */
  readonly placeholder = input('');

  /** Input value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Helper text shown under the input */
  readonly hint = input('');

  /** Error text. Shows a red border when set */
  readonly error = input('');

  /** Mark the field as required? */
  readonly required = input(false);

  /** Is the input disabled? */
  readonly disabled = input(false);
}
