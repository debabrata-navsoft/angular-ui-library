# Login page (Angular)

A standalone component for Angular 17+ (signals and the built-in control flow).

1. Copy the three `login-page.component.*` files into your app, e.g. `src/app/login-page/`.
2. Use it in a route or a template:

```ts
import { LoginPageComponent } from './login-page/login-page.component';

export const routes: Routes = [{ path: 'login', component: LoginPageComponent }];
```

Change `--brand` and `--brand-2` at the top of the CSS to match your brand.
