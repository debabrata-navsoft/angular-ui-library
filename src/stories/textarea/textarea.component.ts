import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-textarea',
  template: `
    <label class="ui-field">
      @if (label()) {
        <span class="ui-label">{{ label() }}</span>
      }
      <textarea
        class="ui-control"
        [rows]="rows()"
        [placeholder]="placeholder()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.maxlength]="maxLength() || null"
        (input)="value.set($any($event.target).value)"
      ></textarea>
      @if (maxLength()) {
        <span class="ui-hint count">{{ value().length }} / {{ maxLength() }}</span>
      }
    </label>
  `,
  styles: `
    :host {
      display: block;
      max-width: 400px;
    }
    textarea {
      resize: vertical;
    }
    .count {
      align-self: flex-end;
    }
  `,
})
export class TextareaComponent {
  /** Text shown above the textarea */
  readonly label = input('');

  /** Text shown when the textarea is empty */
  readonly placeholder = input('');

  /** Textarea value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Visible number of lines */
  readonly rows = input(4);

  /** Maximum number of characters. Shows a counter when set */
  readonly maxLength = input(0);

  /** Is the textarea disabled? */
  readonly disabled = input(false);
}
