import { Component, input, signal } from '@angular/core';

export interface AccordionItem {
  title: string;
  content: string;
}

@Component({
  selector: 'app-accordion',
  template: `
    <div class="accordion">
      @for (item of items(); track $index) {
        <div class="accordion-item">
          <button
            type="button"
            class="accordion-header"
            [attr.aria-expanded]="isOpen($index)"
            (click)="toggle($index)"
          >
            <span>{{ item.title }}</span>
            <span class="accordion-icon" [class.accordion-icon--open]="isOpen($index)">▾</span>
          </button>
          @if (isOpen($index)) {
            <div class="accordion-body">{{ item.content }}</div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './accordion.css',
})
export class AccordionComponent {
  /** Sections to display */
  readonly items = input<AccordionItem[]>([]);

  /** Allow more than one section open at a time? */
  readonly multiple = input(false);

  protected readonly openIndexes = signal<number[]>([]);

  protected isOpen(index: number) {
    return this.openIndexes().includes(index);
  }

  protected toggle(index: number) {
    if (this.isOpen(index)) {
      this.openIndexes.update((open) => open.filter((i) => i !== index));
    } else {
      this.openIndexes.update((open) => (this.multiple() ? [...open, index] : [index]));
    }
  }
}
