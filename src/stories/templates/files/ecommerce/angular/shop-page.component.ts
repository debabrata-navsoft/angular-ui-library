import { Component, computed, signal } from '@angular/core';

import {
  CATEGORIES,
  COLLECTIONS,
  type CartLine,
  type Collection,
  FEATURES,
  type Product,
  SORTS,
  STATS,
  type SortKey,
  addToCart,
  money,
  stars,
  titleOf,
  totals,
  updateQty,
  visibleProducts,
} from './shop-data';

/** Shopora: products, filters, sorting and a cart drawer. Free shipping over $100, otherwise $9. Replace checkout() with your payment flow. */
@Component({
  selector: 'app-shop-page',
  templateUrl: './shop-page.component.html',
  styleUrl: './shop-page.component.css',
  host: { class: 'shop' },
})
export class ShopPageComponent {
  protected readonly collections = COLLECTIONS;
  protected readonly stats = STATS;
  protected readonly titleOf = titleOf;
  protected readonly categories = CATEGORIES;
  protected readonly sorts = SORTS;
  protected readonly features = FEATURES;
  protected readonly money = money;
  protected readonly stars = stars;

  protected readonly collection = signal<Collection>('all');
  protected readonly category = signal('All');
  protected readonly query = signal('');
  protected readonly sort = signal<SortKey>('featured');
  protected readonly cart = signal<CartLine[]>([]);
  protected readonly open = signal(false);
  protected readonly added = signal<number | null>(null);
  protected readonly done = signal(false);
  protected readonly subscribed = signal(false);

  protected readonly products = computed(() =>
    visibleProducts(this.category(), this.query(), this.sort(), this.collection()),
  );
  protected readonly count = computed(() => this.cart().reduce((n, l) => n + l.qty, 0));
  protected readonly sums = computed(() => totals(this.cart()));
  private timer?: ReturnType<typeof setTimeout>;

  protected add(product: Product) {
    this.cart.update((lines) => addToCart(lines, product));
    this.added.set(product.id);
    this.done.set(false);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.added.set(null), 1200);
  }

  protected changeQty(id: number, step: number) {
    this.cart.update((lines) => updateQty(lines, id, step));
  }

  protected openCart() {
    this.open.set(true);
    this.done.set(false);
  }

  protected checkout() {
    this.cart.set([]);
    this.done.set(true);
  }

  protected scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  /** A navbar link: that collection, all categories, and the products in view */
  protected showCollection(value: Collection) {
    this.collection.set(value);
    this.category.set('All');
    this.scrollTo('products');
  }

  protected subscribe(event: Event) {
    event.preventDefault();
    this.subscribed.set(true);
  }
}
