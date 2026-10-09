# E-commerce store (Angular)

A standalone component for Angular 17+ (signals and the built-in control flow): a full store page with search,
category filters, sorting, product cards and a cart drawer.

1. Copy `shop-data.ts` and the three `shop-page.component.*` files into your app, e.g. `src/app/shop/`.
2. Use it in a route or a template:

```ts
import { ShopPageComponent } from './shop/shop-page.component';

export const routes: Routes = [{ path: 'shop', component: ShopPageComponent }];
```

- Products, categories and the cart math are in `shop-data.ts`: replace `PRODUCTS` with your catalog and
  `checkout()` with your payment flow.
- Change `--brand` and `--brand-2` at the top of the CSS to match your brand.
