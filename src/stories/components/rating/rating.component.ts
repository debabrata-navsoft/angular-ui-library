import { Component, computed, input, model, signal } from '@angular/core';

@Component({
  selector: 'nex-rating',
  templateUrl: './rating.html',
  styleUrl: './rating.css',
})
export class RatingComponent {
  /** Selected rating. Supports [(value)] two-way binding */
  readonly value = model(0);

  /** Number of stars */
  readonly max = input(5);

  /** Display only, no clicking? */
  readonly readonly = input(false);

  protected readonly hover = signal(0);

  protected readonly stars = computed(() => Array.from({ length: this.max() }, (_, i) => i + 1));
}
