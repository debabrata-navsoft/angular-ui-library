import { Component, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-tooltip',
  template: `
    <span class="tooltip-wrapper" [attr.aria-describedby]="id">
      <ng-content />
      <span class="tooltip" [class]="'tooltip--' + position()" role="tooltip" [id]="id">
        {{ text() }}
      </span>
    </span>
  `,
  styleUrl: './tooltip.css',
})
export class TooltipComponent {
  /** Text shown in the tooltip */
  readonly text = input('');

  /** Where the tooltip appears */
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');

  protected readonly id = `tooltip-${nextId++}`;
}
