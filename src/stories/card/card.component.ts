import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      @if (title()) {
        <h3 class="card-title">{{ title() }}</h3>
      }
      @if (subtitle()) {
        <p class="card-subtitle">{{ subtitle() }}</p>
      }
      <div class="card-body">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './card.css',
})
export class CardComponent {
  /** Card heading */
  readonly title = input('');

  /** Smaller text shown under the heading */
  readonly subtitle = input('');
}
