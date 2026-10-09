<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  CATEGORIES,
  COLLECTIONS,
  FEATURES,
  SORTS,
  STATS,
  addToCart,
  money,
  stars,
  titleOf,
  totals,
  updateQty,
  visibleProducts,
} from '../data/shop-data';
import type { CartLine, Collection, Product, SortKey } from '../data/shop-data';
import './shop.css';

// Shopora: products, filters, sorting and a cart drawer. Free shipping over $100, otherwise $9. Replace checkout() with your payment flow.
const collection = ref<Collection>('all');
const category = ref('All');
const query = ref('');
const sort = ref<SortKey>('featured');
const cart = ref<CartLine[]>([]);
const open = ref(false);
const added = ref<number | null>(null);
const done = ref(false);
const subscribed = ref(false);

const products = computed(() =>
  visibleProducts(category.value, query.value, sort.value, collection.value),
);
const count = computed(() => cart.value.reduce((n, l) => n + l.qty, 0));
const sums = computed(() => totals(cart.value));
let timer: ReturnType<typeof setTimeout> | undefined;

function add(product: Product) {
  cart.value = addToCart(cart.value, product);
  added.value = product.id;
  done.value = false;
  clearTimeout(timer);
  timer = setTimeout(() => (added.value = null), 1200);
}

function openCart() {
  open.value = true;
  done.value = false;
}

function checkout() {
  cart.value = [];
  done.value = true;
}

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/** A navbar link: that collection, all categories, and the products in view */
function showCollection(value: Collection) {
  collection.value = value;
  category.value = 'All';
  scrollTo('products');
}
</script>

<template>
  <div class="shop">
    <header class="header">
      <div class="container header__row">
        <a class="logo" href="#"><span class="logo__mark">S</span> Shopora</a>
        <nav class="nav" aria-label="Main">
          <button
            v-for="c in COLLECTIONS"
            :key="c.value"
            type="button"
            :aria-current="c.value === collection"
            @click="showCollection(c.value)"
          >
            {{ c.label }}
          </button>
          <button type="button" @click="scrollTo('about')">About</button>
        </nav>
        <input
          v-model="query"
          class="search"
          type="search"
          placeholder="Search products…"
          aria-label="Search products"
        />
        <button class="cart-button" type="button" aria-label="Open cart" @click="openCart">
          🛒<span v-if="count" class="cart-button__count">{{ count }}</span>
        </button>
      </div>
    </header>

    <main class="container">
      <section class="hero">
        <span class="hero__tag">Summer sale · up to 30% off</span>
        <h1>Everything you need, delivered fast.</h1>
        <p>
          Headphones, bags, gadgets and home goods, picked for quality. Free shipping on orders over
          $100.
        </p>
        <button class="hero__cta" type="button" @click="scrollTo('products')">Shop now</button>
        <div class="hero__art" aria-hidden="true">
          <span>🎧</span><span>👟</span><span>⌚</span><span>🎒</span>
        </div>
      </section>

      <section id="products">
        <div class="toolbar">
          <h2>{{ titleOf(collection) }}</h2>
          <div class="chips" role="group" aria-label="Category">
            <button
              v-for="c in CATEGORIES"
              :key="c"
              type="button"
              class="chip"
              :aria-pressed="c === category"
              @click="category = c"
            >
              {{ c }}
            </button>
          </div>
          <select v-model="sort" class="sort" aria-label="Sort products">
            <option v-for="s in SORTS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
        <div class="grid">
          <article v-for="p in products" :key="p.id" class="product">
            <div class="product__image" :style="{ background: p.color }">
              <span
                v-if="p.badge"
                class="product__badge"
                :class="{ 'product__badge--sale': p.badge === 'Sale' }"
              >
                {{ p.badge }}
              </span>
              {{ p.emoji }}
            </div>
            <div class="product__body">
              <span class="product__category">{{ p.category }}</span>
              <h3 class="product__name">{{ p.name }}</h3>
              <span class="product__rating"
                >{{ stars(p.rating) }} <span>{{ p.rating }} ({{ p.reviews }})</span></span
              >
              <div class="product__foot">
                <span class="price"
                  >{{ money(p.price) }}<s v-if="p.oldPrice">{{ money(p.oldPrice) }}</s></span
                >
                <button
                  type="button"
                  class="add"
                  :class="{ 'add--done': added === p.id }"
                  @click="add(p)"
                >
                  {{ added === p.id ? 'Added ✓' : 'Add to cart' }}
                </button>
              </div>
            </div>
          </article>
        </div>
        <p v-if="!products.length" class="empty">No products match your search.</p>
      </section>

      <section class="features">
        <div v-for="f in FEATURES" :key="f.title" class="feature">
          <span class="feature__icon">{{ f.icon }}</span>
          <span
            ><b>{{ f.title }}</b
            ><span>{{ f.text }}</span></span
          >
        </div>
      </section>

      <section id="about" class="about">
        <div>
          <h2>About Shopora</h2>
          <p>
            We started Shopora in 2019 with one idea: fewer, better things. Every product is tested
            by our team before it reaches the shop, and we ship from our own warehouse, so most
            orders arrive in two days.
          </p>
          <p>
            Not happy with something? Send it back within 30 days for a full refund, no questions
            asked.
          </p>
        </div>
        <div class="stats">
          <div v-for="s in STATS" :key="s.label" class="stat">
            <b>{{ s.value }}</b
            ><span>{{ s.label }}</span>
          </div>
        </div>
      </section>

      <section class="newsletter">
        <div>
          <h3>Get 10% off your first order</h3>
          <p>Join the newsletter for new arrivals and member-only deals.</p>
        </div>
        <p v-if="subscribed">Thanks for subscribing! 🎉</p>
        <form v-else @submit.prevent="subscribed = true">
          <input type="email" required placeholder="you@example.com" aria-label="Email" />
          <button type="submit">Subscribe</button>
        </form>
      </section>
    </main>

    <footer id="footer" class="footer">
      <div class="container">
        <span>© 2026 Shopora. All rights reserved.</span><span>Privacy · Terms · Contact</span>
      </div>
    </footer>

    <template v-if="open">
      <div class="overlay" @click="open = false"></div>
      <aside class="drawer" role="dialog" aria-label="Cart">
        <div class="drawer__head">
          <h2>Your cart ({{ count }})</h2>
          <button type="button" class="close" aria-label="Close cart" @click="open = false">
            ×
          </button>
        </div>
        <p v-if="done" class="drawer__message">🎉 Thanks! Your order is on its way.</p>
        <p v-else-if="!cart.length" class="drawer__message">Your cart is empty.</p>
        <template v-else>
          <ul class="drawer__items">
            <li v-for="line in cart" :key="line.product.id" class="line">
              <span class="line__thumb" :style="{ background: line.product.color }">{{
                line.product.emoji
              }}</span>
              <span class="line__info"
                ><b>{{ line.product.name }}</b
                ><span>{{ money(line.product.price) }}</span></span
              >
              <span class="qty">
                <button
                  type="button"
                  aria-label="One less"
                  @click="cart = updateQty(cart, line.product.id, -1)"
                >
                  −
                </button>
                {{ line.qty }}
                <button
                  type="button"
                  aria-label="One more"
                  @click="cart = updateQty(cart, line.product.id, 1)"
                >
                  +
                </button>
              </span>
            </li>
          </ul>
          <div class="drawer__summary">
            <div>
              <span>Subtotal</span><span>{{ money(sums.subtotal) }}</span>
            </div>
            <div>
              <span>Shipping</span><span>{{ sums.shipping ? money(sums.shipping) : 'Free' }}</span>
            </div>
            <div class="drawer__total">
              <span>Total</span><span>{{ money(sums.total) }}</span>
            </div>
            <button type="button" class="checkout" @click="checkout">Checkout</button>
          </div>
        </template>
      </aside>
    </template>
  </div>
</template>
