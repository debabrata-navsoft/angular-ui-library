import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { ShopPageComponent } from './app/shop-page/shop-page.component';

bootstrapApplication(ShopPageComponent, { providers: [provideZonelessChangeDetection()] }).catch(
  (err) => console.error(err),
);
