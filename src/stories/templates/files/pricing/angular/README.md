# Pricing page (Angular)

A standalone component for Angular 17+ (signals and the built-in control flow).

1. Copy the three `pricing-page.component.*` files into your app, e.g. `src/app/pricing-page/`.
2. Use it in a route or a template:

```ts
import { PricingPageComponent } from './pricing-page/pricing-page.component';

export const routes: Routes = [{ path: 'pricing', component: PricingPageComponent }];
```

Edit the plans in the `PLANS` list, and change `--brand` and `--brand-2` at the top of the CSS to match your brand.
