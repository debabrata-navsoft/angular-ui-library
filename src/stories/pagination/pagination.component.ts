import { Component, computed, input, model } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <nav class="pagination" aria-label="Pagination">
      <button type="button" [disabled]="page() <= 1" (click)="goTo(page() - 1)">‹ Prev</button>
      @for (item of pages(); track $index) {
        @if (item === null) {
          <span class="ellipsis">…</span>
        } @else {
          <button
            type="button"
            [class.active]="item === page()"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="goTo(item)"
          >
            {{ item }}
          </button>
        }
      }
      <button type="button" [disabled]="page() >= totalPages()" (click)="goTo(page() + 1)">
        Next ›
      </button>
    </nav>
  `,
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  /** Current page, starting at 1. Supports [(page)] two-way binding */
  readonly page = model(1);

  /** Total number of pages */
  readonly totalPages = input(1);

  /** Page numbers shown on each side of the current page */
  readonly siblings = input(1);

  /** Page numbers to show, with null where pages are skipped */
  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const start = Math.max(2, current - this.siblings());
    const end = Math.min(total - 1, current + this.siblings());
    const result: (number | null)[] = [1];
    if (start > 2) {
      result.push(null);
    }
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
    if (end < total - 1) {
      result.push(null);
    }
    if (total > 1) {
      result.push(total);
    }
    return result;
  });

  protected goTo(page: number) {
    this.page.set(Math.min(this.totalPages(), Math.max(1, page)));
  }
}
