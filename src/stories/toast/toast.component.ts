import { Component, effect, input, model } from '@angular/core';

import type { Tone } from '../types';

@Component({
  selector: 'app-toast',
  template: `
    @if (open()) {
      <div class="toast" [class]="['tone-' + type(), 'toast--' + position()]" role="status">
        <span class="toast-message">{{ message() }}</span>
        <button type="button" class="ui-close" aria-label="Close" (click)="open.set(false)">×</button>
      </div>
    }
  `,
  styleUrl: './toast.css',
})
export class ToastComponent {
  /** Is the toast visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Toast text */
  readonly message = input('');

  /** Color tone of the toast */
  readonly type = input<Tone>('info');

  /** Corner of the screen where the toast appears */
  readonly position = input<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>('top-right');

  /** Milliseconds before the toast hides itself. 0 keeps it open */
  readonly duration = input(3000);

  constructor() {
    effect((onCleanup) => {
      if (this.open() && this.duration()) {
        const timer = setTimeout(() => this.open.set(false), this.duration());
        onCleanup(() => clearTimeout(timer));
      }
    });
  }
}
