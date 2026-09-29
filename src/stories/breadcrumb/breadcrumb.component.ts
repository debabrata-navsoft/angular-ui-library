import { Component, input, output } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        @for (item of items(); track $index; let last = $last) {
          <li>
            @if (last) {
              <span aria-current="page">{{ item.label }}</span>
            } @else {
              <a [href]="item.url || '#'" (click)="onClick($event, item)">{{ item.label }}</a>
              <span class="separator" aria-hidden="true">{{ separator() }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './breadcrumb.css',
})
export class BreadcrumbComponent {
  /** Path items. The last one is the current page */
  readonly items = input<BreadcrumbItem[]>([]);

  /** Character shown between items */
  readonly separator = input('/');

  /** Emits the item that was clicked */
  readonly itemClick = output<BreadcrumbItem>();

  protected onClick(event: Event, item: BreadcrumbItem) {
    if (!item.url) {
      event.preventDefault();
    }
    this.itemClick.emit(item);
  }
}
