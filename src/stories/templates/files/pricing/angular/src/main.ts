import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { PricingPageComponent } from './app/pricing-page/pricing-page.component';

bootstrapApplication(PricingPageComponent, { providers: [provideZonelessChangeDetection()] }).catch(
  (err) => console.error(err),
);
