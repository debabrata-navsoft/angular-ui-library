import { Component, computed, input } from '@angular/core';

import type { Tone } from '../../types';

@Component({
  selector: 'nex-progress-bar',
  templateUrl: './progress-bar.html',
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
