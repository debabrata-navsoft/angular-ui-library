'use client';

import { useEffect, useMemo, useState } from 'react';
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
} from './shop-data';
import type { CartLine, Collection, Product, SortKey } from './shop-data';
import './shop.css';

/** Shopora: products, filters, sorting and a cart drawer. Free shipping over $100, otherwise $9. Replace checkout() with your payment flow. */
export function ShopPage() {
  const [collection, setCollection] = useState<Collection>('all');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const products = useMemo(
    () => visibleProducts(category, query, sort, collection),
    [category, query, sort, collection],
  );
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const { subtotal, shipping, total } = totals(cart);

  // "Added ✓" shows for a moment on the button that was clicked
  useEffect(() => {
    if (added === null) return;
    const timer = setTimeout(() => setAdded(null), 1200);
    return () => clearTimeout(timer);
  }, [added]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  /** A navbar link: that collection, all categories, and the products in view */
  function showCollection(value: Collection) {
    setCollection(value);
    setCategory('All');
    scrollTo('products');
  }

  function add(product: Product) {
    setCart((lines) => addToCart(lines, product));
    setAdded(product.id);
    setDone(false);
  }

  const changeQty = (id: number, step: number) => setCart((lines) => updateQty(lines, id, step));

  function checkout() {
    setCart([]);
    setDone(true);
  }

  return (
    <div className="shop">
      <header className="header">
        <div className="container header__row">
          <a className="logo" href="#">
            <span className="logo__mark">S</span> Shopora
          </a>
          <nav className="nav" aria-label="Main">
            {COLLECTIONS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-current={c.value === collection}
                onClick={() => showCollection(c.value)}
              >
                {c.label}
              </button>
            ))}
            <button type="button" onClick={() => scrollTo('about')}>
              About
            </button>
          </nav>
          <input
            className="search"
            type="search"
            placeholder="Search products…"
            aria-label="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="cart-button"
            type="button"
            aria-label="Open cart"
            onClick={() => (setOpen(true), setDone(false))}
          >
            🛒{count > 0 && <span className="cart-button__count">{count}</span>}
          </button>
        </div>
      </header>

      <main className="container">
        <section className="hero">
          <span className="hero__tag">Summer sale · up to 30% off</span>
          <h1>Everything you need, delivered fast.</h1>
          <p>
            Headphones, bags, gadgets and home goods, picked for quality. Free shipping on orders
            over $100.
          </p>
          <button className="hero__cta" type="button" onClick={() => scrollTo('products')}>
            Shop now
          </button>
          <div className="hero__art" aria-hidden="true">
            <span>🎧</span>
            <span>👟</span>
            <span>⌚</span>
            <span>🎒</span>
          </div>
        </section>

        <section id="products">
          <div className="toolbar">
            <h2>{titleOf(collection)}</h2>
            <div className="chips" role="group" aria-label="Category">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="chip"
                  aria-pressed={c === category}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <select
              className="sort"
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid">
            {products.map((p) => (
              <article key={p.id} className="product">
                <div className="product__image" style={{ background: p.color }}>
                  {p.badge && (
                    <span
                      className={
                        'product__badge' + (p.badge === 'Sale' ? ' product__badge--sale' : '')
                      }
                    >
                      {p.badge}
                    </span>
                  )}
                  {p.emoji}
                </div>
                <div className="product__body">
                  <span className="product__category">{p.category}</span>
                  <h3 className="product__name">{p.name}</h3>
                  <span className="product__rating">
                    {stars(p.rating)}{' '}
                    <span>
                      {p.rating} ({p.reviews})
                    </span>
                  </span>
                  <div className="product__foot">
                    <span className="price">
                      {money(p.price)}
                      {p.oldPrice && <s>{money(p.oldPrice)}</s>}
                    </span>
                    <button
                      type="button"
                      className={'add' + (added === p.id ? ' add--done' : '')}
                      onClick={() => add(p)}
                    >
                      {added === p.id ? 'Added ✓' : 'Add to cart'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {products.length === 0 && <p className="empty">No products match your search.</p>}
        </section>

        <section className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <span className="feature__icon">{f.icon}</span>
              <span>
                <b>{f.title}</b>
                <span>{f.text}</span>
              </span>
            </div>
          ))}
        </section>

        <section id="about" className="about">
          <div>
            <h2>About Shopora</h2>
            <p>
              We started Shopora in 2019 with one idea: fewer, better things. Every product is
              tested by our team before it reaches the shop, and we ship from our own warehouse, so
              most orders arrive in two days.
            </p>
            <p>
              Not happy with something? Send it back within 30 days for a full refund, no questions
              asked.
            </p>
          </div>
          <div className="stats">
            {STATS.map((s) => (
              <div key={s.label} className="stat">
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="newsletter">
          <div>
            <h3>Get 10% off your first order</h3>
            <p>Join the newsletter for new arrivals and member-only deals.</p>
          </div>
          {subscribed ? (
            <p>Thanks for subscribing! 🎉</p>
          ) : (
            <form onSubmit={(e) => (e.preventDefault(), setSubscribed(true))}>
              <input type="email" required placeholder="you@example.com" aria-label="Email" />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </section>
      </main>

      <footer id="footer" className="footer">
        <div className="container">
          <span>© 2026 Shopora. All rights reserved.</span>
          <span>Privacy · Terms · Contact</span>
        </div>
      </footer>

      {open && (
        <>
          <div className="overlay" onClick={() => setOpen(false)} />
          <aside className="drawer" role="dialog" aria-label="Cart">
            <div className="drawer__head">
              <h2>Your cart ({count})</h2>
              <button
                type="button"
                className="close"
                aria-label="Close cart"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            {done ? (
              <p className="drawer__message">🎉 Thanks! Your order is on its way.</p>
            ) : cart.length === 0 ? (
              <p className="drawer__message">Your cart is empty.</p>
            ) : (
              <>
                <ul className="drawer__items">
                  {cart.map(({ product: p, qty }) => (
                    <li key={p.id} className="line">
                      <span className="line__thumb" style={{ background: p.color }}>
                        {p.emoji}
                      </span>
                      <span className="line__info">
                        <b>{p.name}</b>
                        <span>{money(p.price)}</span>
                      </span>
                      <span className="qty">
                        <button
                          type="button"
                          aria-label="One less"
                          onClick={() => changeQty(p.id, -1)}
                        >
                          −
                        </button>
                        {qty}
                        <button
                          type="button"
                          aria-label="One more"
                          onClick={() => changeQty(p.id, 1)}
                        >
                          +
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="drawer__summary">
                  <div>
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div>
                    <span>Shipping</span>
                    <span>{shipping ? money(shipping) : 'Free'}</span>
                  </div>
                  <div className="drawer__total">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                  <button type="button" className="checkout" onClick={checkout}>
                    Checkout
                  </button>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
