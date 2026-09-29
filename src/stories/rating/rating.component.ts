import { Component, computed, input, model, signal } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: `
    <div
      class="rating"
      [class.rating--readonly]="readonly()"
      role="radiogroup"
      aria-label="Rating"
      (mouseleave)="hover.set(0)"
    >
      @for (star of stars(); track star) {
        <button
          type="button"
          class="star"
          [class.star--filled]="star <= (hover() || value())"
          [disabled]="readonly()"
          role="radio"
          [attr.aria-checked]="star === value()"
          [attr.aria-label]="star + ' star' + (star > 1 ? 's' : '')"
          (mouseenter)="!readonly() && hover.set(star)"
          (click)="value.set(star)"
        >
          ★
        </button>
      }
    </div>
  `,
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
