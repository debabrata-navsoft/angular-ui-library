import { Component, computed, input } from '@angular/core';

import type { Tone } from '../types';

@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress" [class]="'tone-' + variant()">
      <div class="track" role="progressbar" [attr.aria-valuenow]="percent()" aria-valuemin="0" aria-valuemax="100">
        <div class="fill" [style.width.%]="percent()"></div>
      </div>
      @if (showLabel()) {
        <span class="label">{{ percent() }}%</span>
      }
    </div>
  `,
  styleUrl: './progress-bar.css',
})
export class ProgressBarComponent {
  /** Progress from 0 to 100 */
  readonly value = input(0);

  /** Color tone of the bar */
  readonly variant = input<Tone>('info');

  /** Show the percentage next to the bar? */
  readonly showLabel = input(true);

  protected readonly percent = computed(() => Math.round(Math.min(100, Math.max(0, this.value()))));
}
