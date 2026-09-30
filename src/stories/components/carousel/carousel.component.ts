import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  computed,
  contentChild,
  effect,
  input,
  model,
  signal,
} from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * Slides through items rendered with your template:
 * <nex-carousel [items]="products"><ng-template let-item>…</ng-template></nex-carousel>
 */
@Component({
  selector: 'nex-carousel',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
  host: {
    '(mouseenter)': 'paused.set(true)',
    '(mouseleave)': 'paused.set(false)',
    '(focusin)': 'paused.set(true)',
    '(focusout)': 'paused.set(false)',
  },
})
export class CarouselComponent<T = unknown> {
  /** Items to show */
  readonly items = input<T[]>([]);

  /** Items visible at once */
  readonly numVisible = input(1);

  /** Items moved per step */
  readonly numScroll = input(1);

  /** Wrap from the last page to the first and back */
  readonly circular = input(false);

  /** Milliseconds between automatic steps (0 = off). Pauses while hovered or focused */
  readonly autoplayInterval = input(0);

  /** Previous/next buttons */
  readonly showNavigators = input(true);

  /** Page dots below the items */
  readonly showIndicators = input(true);

  /** Gap between items (any CSS length) */
  readonly gap = input('16px');

  /** Accessible name of the carousel */
  readonly ariaLabel = input('Carousel');

  /** Current page. Supports [(page)] two-way binding */
  readonly page = model(0);

  protected readonly template =
    contentChild.required<TemplateRef<{ $implicit: T; index: number }>>(TemplateRef);
  protected readonly paused = signal(false);

  protected readonly pages = computed(() =>
    Math.max(1, Math.ceil((this.items().length - this.numVisible()) / this.numScroll()) + 1),
  );

  protected readonly pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i));

  /** Index of the first visible item; the last page is aligned to the end */
  protected readonly first = computed(() =>
    Math.max(0, Math.min(this.page() * this.numScroll(), this.items().length - this.numVisible())),
  );

  protected readonly canPrev = computed(() => this.circular() || this.page() > 0);
  protected readonly canNext = computed(() => this.circular() || this.page() < this.pages() - 1);

  /** Pointer x where a swipe started */
  private swipeStart: number | null = null;

  constructor() {
    // Keep the page valid when items or sizes change
    effect(() => this.page() >= this.pages() && this.page.set(this.pages() - 1));

    effect((onCleanup) => {
      const interval = this.autoplayInterval();
      if (!interval || this.paused() || this.pages() < 2) return;
      const timer = setInterval(() => this.go(this.page() + 1, true), interval);
      onCleanup(() => clearInterval(timer));
    });
  }

  /** Goes to a page; `wrap` loops around at the ends (autoplay always does) */
  protected go(page: number, wrap = this.circular()) {
    const count = this.pages();
    this.page.set(wrap ? (page + count) % count : Math.min(Math.max(page, 0), count - 1));
  }

  protected isVisible(index: number) {
    return index >= this.first() && index < this.first() + this.numVisible();
  }

  protected onKeydown(event: KeyboardEvent) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
    if (!step) return;
    event.preventDefault();
    this.go(this.page() + step);
  }

  protected onPointerDown(event: PointerEvent) {
    this.swipeStart = event.clientX;
  }

  /** A horizontal drag of 50px or more changes the page */
  protected onPointerUp(event: PointerEvent) {
    if (this.swipeStart === null) return;
    const distance = event.clientX - this.swipeStart;
    this.swipeStart = null;
    if (Math.abs(distance) >= 50) this.go(this.page() + (distance < 0 ? 1 : -1));
  }
}
