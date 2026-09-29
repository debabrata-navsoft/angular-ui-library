import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-search-input',
  template: `
    <input
      type="search"
      class="search-input"
      [placeholder]="placeholder()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="onInput($event)"
    />
  `,
  styleUrl: './search-input.css',
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

  onInput(event: Event) {
    this.search.emit((event.target as HTMLInputElement).value);
  }
}
