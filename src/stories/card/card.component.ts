import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class CardComponent {
  /** Card heading */
  readonly title = input('');

  /** Smaller text shown under the heading */
  readonly subtitle = input('');
}
