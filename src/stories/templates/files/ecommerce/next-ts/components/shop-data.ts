export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  emoji: string;
  color: string;
  badge?: 'Sale' | 'New';
}

export interface CartLine {
  product: Product;
  qty: number;
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';
export type Collection = 'all' | 'new' | 'sale';

/** Replace with your catalog (an API call, a CMS, …) */
export const PRODUCTS: Product[] = [
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

export const CATEGORIES = ['All', 'Audio', 'Wearables', 'Bags', 'Accessories', 'Home'];

/** The navbar's collections: every product, the New ones, or the ones on sale */
export const COLLECTIONS = [
  { value: 'all', label: 'Shop', title: 'All products' },
  { value: 'new', label: 'New in', title: 'New in' },
  { value: 'sale', label: 'Sale', title: 'On sale' },
] as const;

export const titleOf = (collection: Collection) =>
  COLLECTIONS.find((c) => c.value === collection)!.title;

/** The About section's numbers */
export const STATS = [
  { value: '12k+', label: 'Happy customers' },
  { value: '4.8★', label: 'Average rating' },
  { value: '2 days', label: 'Average delivery' },
];

export const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
] as const;

export const FEATURES = [
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

export const money = (value: number) => `$${value.toFixed(2)}`;
export const stars = (rating: number) => '★'.repeat(Math.round(rating)).padEnd(5, '☆');

/** Products in a collection and category, matching a search, sorted */
export function visibleProducts(
  category: string,
  query: string,
  sort: SortKey,
  collection: Collection = 'all',
) {
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
export const addToCart = (lines: CartLine[], product: Product) =>
  lines.some((l) => l.product.id === product.id)
    ? lines.map((l) => (l.product.id === product.id ? { ...l, qty: l.qty + 1 } : l))
    : [...lines, { product, qty: 1 }];

/** The cart with a product's quantity changed by `step`; at 0 it's removed */
export const updateQty = (lines: CartLine[], id: number, step: number) =>
  lines
    .map((l) => (l.product.id === id ? { ...l, qty: l.qty + step } : l))
    .filter((l) => l.qty > 0);

/** Subtotal, shipping (free over $100) and total of the cart */
export function totals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 100 ? 0 : 9;
  return { subtotal, shipping, total: subtotal + shipping };
}
