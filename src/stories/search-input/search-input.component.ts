import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  template: `
    <input
      type="search"
      class="ui-control"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="search.emit($any($event.target).value)"
    />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class SearchInputComponent {
  /** Text shown when the input is empty */
  readonly placeholder = input('Search...');

  /** Initial value of the input */
  readonly value = input('');

  /** Is the input disabled? */
  readonly disabled = input(false);

  /** Emits the current text on every keystroke */
  readonly search = output<string>();
}
