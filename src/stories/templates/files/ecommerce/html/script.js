// Shopora: products, filters, sorting and a cart drawer, in plain JavaScript

/** Replace with your catalog (an API call, a CMS, …) */
const PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Headphones',
    category: 'Audio',
    price: 129,
    oldPrice: 159,
    rating: 4.8,
    reviews: 212,
    emoji: '🎧',
    color: '#e0e7ff',
    badge: 'Sale',
  },
  {
    id: 2,
    name: 'Smart Watch',
    category: 'Wearables',
    price: 199,
    rating: 4.6,
    reviews: 98,
    emoji: '⌚',
    color: '#fce7f3',
    badge: 'New',
  },
  {
    id: 3,
    name: 'Running Sneakers',
    category: 'Wearables',
    price: 89,
    rating: 4.7,
    reviews: 340,
    emoji: '👟',
    color: '#dcfce7',
  },
  {
    id: 4,
    name: 'Travel Backpack',
    category: 'Bags',
    price: 74,
    oldPrice: 95,
    rating: 4.5,
    reviews: 126,
    emoji: '🎒',
    color: '#fef3c7',
    badge: 'Sale',
  },
  {
    id: 5,
    name: 'Polarized Sunglasses',
    category: 'Accessories',
    price: 49,
    rating: 4.3,
    reviews: 77,
    emoji: '🕶️',
    color: '#e0f2fe',
  },
  {
    id: 6,
    name: 'Instant Camera',
    category: 'Accessories',
    price: 119,
    rating: 4.9,
    reviews: 54,
    emoji: '📷',
    color: '#f3e8ff',
    badge: 'New',
  },
  {
    id: 7,
    name: 'Bluetooth Speaker',
    category: 'Audio',
    price: 59,
    rating: 4.4,
    reviews: 189,
    emoji: '🔊',
    color: '#ffe4e6',
  },
  {
    id: 8,
    name: 'Ceramic Plant Pot',
    category: 'Home',
    price: 24,
    rating: 4.6,
    reviews: 63,
    emoji: '🪴',
    color: '#ecfccb',
  },
  {
    id: 9,
    name: 'Leather Weekender',
    category: 'Bags',
    price: 149,
    rating: 4.8,
    reviews: 41,
    emoji: '👜',
    color: '#ffedd5',
    badge: 'New',
  },
  {
    id: 10,
    name: 'Desk Lamp',
    category: 'Home',
    price: 39,
    oldPrice: 49,
    rating: 4.2,
    reviews: 88,
    emoji: '💡',
    color: '#fef9c3',
    badge: 'Sale',
  },
  {
    id: 11,
    name: 'Classic Cap',
    category: 'Accessories',
    price: 19,
    rating: 4.1,
    reviews: 150,
    emoji: '🧢',
    color: '#e2e8f0',
  },
  {
    id: 12,
    name: 'Coffee Mug',
    category: 'Home',
    price: 16,
    rating: 4.7,
    reviews: 230,
    emoji: '☕',
    color: '#fae8ff',
  },
];

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Bags', 'Accessories', 'Home'];

/** The navbar's collections: every product, the New ones, or the ones on sale */
const COLLECTIONS = [
  { value: 'all', label: 'Shop', title: 'All products' },
  { value: 'new', label: 'New in', title: 'New in' },
  { value: 'sale', label: 'Sale', title: 'On sale' },
];

const titleOf = (collection) => COLLECTIONS.find((c) => c.value === collection).title;

/** The About section's numbers */
const STATS = [
  { value: '12k+', label: 'Happy customers' },
  { value: '4.8★', label: 'Average rating' },
  { value: '2 days', label: 'Average delivery' },
];

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
];

const FEATURES = [
  {
    icon: '🚚',
    title: 'Free shipping',
    text: 'On orders over $100',
  },
  {
    icon: '↩️',
    title: '30-day returns',
    text: 'No questions asked',
  },
  {
    icon: '🔒',
    title: 'Secure payment',
    text: 'Cards, PayPal and more',
  },
  {
    icon: '💬',
    title: '24/7 support',
    text: 'Real people, fast replies',
  },
];

const money = (value) => `$${value.toFixed(2)}`;
const stars = (rating) => '★'.repeat(Math.round(rating)).padEnd(5, '☆');

/** Products in a collection and category, matching a search, sorted */
function visibleProducts(category, query, sort, collection = 'all') {
  const q = query.trim().toLowerCase();
  const list = PRODUCTS.filter(
    (p) =>
      (collection === 'all' || (collection === 'new' ? p.badge === 'New' : !!p.oldPrice)) &&
      (category === 'All' || p.category === category) &&
      p.name.toLowerCase().includes(q),
  );
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  return list;
}

/** The cart with one more of a product */
const addToCart = (lines, product) =>
  lines.some((l) => l.product.id === product.id)
    ? lines.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
    : [...lines, { product, qty: 1 }];

/** The cart with a product's quantity changed by `step`; at 0 it's removed */
const updateQty = (lines, id, step) =>
  lines
    .map((l) => (l.product.id === id ? { ...l, qty: l.qty + step } : l))
    .filter((l) => l.qty > 0);

/** Subtotal, shipping (free over $100) and total of the cart */
function totals(lines) {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 9;
  return { subtotal, shipping, total: subtotal + shipping };
}

const state = {
  collection: 'all',
  category: 'All',
  query: '',
  sort: 'featured',
  cart: [],
  open: false,
  added: null,
  done: false,
};
const scrollTo = (id) => $(id).scrollIntoView({ behavior: 'smooth' });
const $ = (id) => document.getElementById(id);

function productCard(p) {
  const added = state.added === p.id;
  return `
    <article class="product">
      <div class="product__image" style="background: ${p.color}">
        ${p.badge ? `<span class="product__badge${p.badge === 'Sale' ? ' product__badge--sale' : ''}">${p.badge}</span>` : ''}
        ${p.emoji}
      </div>
      <div class="product__body">
        <span class="product__category">${p.category}</span>
        <h3 class="product__name">${p.name}</h3>
        <span class="product__rating">${stars(p.rating)} <span>${p.rating} (${p.reviews})</span></span>
        <div class="product__foot">
          <span class="price">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</span>
          <button type="button" class="add${added ? ' add--done' : ''}" data-add="${p.id}">${added ? 'Added ✓' : 'Add to cart'}</button>
        </div>
      </div>
    </article>`;
}

function render() {
  $('nav').innerHTML =
    COLLECTIONS.map(
      (c) =>
        `<button type="button" data-collection="${c.value}" aria-current="${c.value === state.collection}">${c.label}</button>`,
    ).join('') + '<button type="button" data-about>About</button>';
  $('title').textContent = titleOf(state.collection);
  $('chips').innerHTML = CATEGORIES.map(
    (c) =>
      `<button type="button" class="chip" data-category="${c}" aria-pressed="${c === state.category}">${c}</button>`,
  ).join('');
  const list = visibleProducts(state.category, state.query, state.sort, state.collection);
  $('grid').innerHTML = list.length
    ? list.map(productCard).join('')
    : '<p class="empty">No products match your search.</p>';

  const count = state.cart.reduce((n, l) => n + l.qty, 0);
  $('cart-count').textContent = count;
  $('cart-count').hidden = !count;

  const { subtotal, shipping, total } = totals(state.cart);
  $('cart').innerHTML = !state.open
    ? ''
    : `<div class="overlay" data-close></div>
      <aside class="drawer" role="dialog" aria-label="Cart">
        <div class="drawer__head"><h2>Your cart (${count})</h2><button type="button" class="close" data-close aria-label="Close cart">×</button></div>
        ${
          state.done
            ? '<p class="drawer__message">🎉 Thanks! Your order is on its way.</p>'
            : !state.cart.length
              ? '<p class="drawer__message">Your cart is empty.</p>'
              : `<ul class="drawer__items">${state.cart
                  .map(
                    ({ product: p, qty }) => `
                <li class="line">
                  <span class="line__thumb" style="background: ${p.color}">${p.emoji}</span>
                  <span class="line__info"><b>${p.name}</b><span>${money(p.price)}</span></span>
                  <span class="qty">
                    <button type="button" data-qty="${p.id}" data-step="-1" aria-label="One less">−</button>${qty}<button type="button" data-qty="${p.id}" data-step="1" aria-label="One more">+</button>
                  </span>
                </li>`,
                  )
                  .join('')}</ul>
              <div class="drawer__summary">
                <div><span>Subtotal</span><span>${money(subtotal)}</span></div>
                <div><span>Shipping</span><span>${shipping ? money(shipping) : 'Free'}</span></div>
                <div class="drawer__total"><span>Total</span><span>${money(total)}</span></div>
                <button type="button" class="checkout" data-checkout>Checkout</button>
              </div>`
        }
      </aside>`;
}

function add(id) {
  state.cart = addToCart(
    state.cart,
    PRODUCTS.find((p) => p.id === id),
  );
  state.added = id;
  state.done = false;
  setTimeout(() => {
    if (state.added === id) ((state.added = null), render());
  }, 1200);
}

document.addEventListener('click', (event) => {
  const el = event.target.closest('button, [data-close]');
  if (!el) return;
  if (el.dataset.collection)
    ((state.collection = el.dataset.collection), (state.category = 'All'), scrollTo('products'));
  else if ('about' in el.dataset) return scrollTo('about');
  else if (el.dataset.category) state.category = el.dataset.category;
  else if (el.dataset.add) add(Number(el.dataset.add));
  else if (el.dataset.qty)
    state.cart = updateQty(state.cart, Number(el.dataset.qty), Number(el.dataset.step));
  else if ('close' in el.dataset) state.open = false;
  else if ('checkout' in el.dataset) ((state.cart = []), (state.done = true));
  else if (el.id === 'cart-open') ((state.open = true), (state.done = false));
  else if (el.id === 'shop-now') return scrollTo('products');
  else return;
  render();
});
$('search').addEventListener('input', (e) => ((state.query = e.target.value), render()));
$('sort').innerHTML = SORTS.map((s) => `<option value="${s.value}">${s.label}</option>`).join('');
$('sort').addEventListener('change', (e) => ((state.sort = e.target.value), render()));
$('stats').innerHTML = STATS.map(
  (s) => `<div class="stat"><b>${s.value}</b><span>${s.label}</span></div>`,
).join('');
$('features').innerHTML = FEATURES.map(
  (f) =>
    `<div class="feature"><span class="feature__icon">${f.icon}</span><span><b>${f.title}</b><span>${f.text}</span></span></div>`,
).join('');
$('newsletter').addEventListener('submit', (e) => {
  e.preventDefault();
  e.target.innerHTML = '<p>Thanks for subscribing! 🎉</p>';
});
render();
