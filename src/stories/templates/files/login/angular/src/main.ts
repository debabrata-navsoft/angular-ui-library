import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { LoginPageComponent } from './app/login-page/login-page.component';

bootstrapApplication(LoginPageComponent, { providers: [provideZonelessChangeDetection()] }).catch(
  (err) => console.error(err),
);
