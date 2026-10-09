import { Component } from '@angular/core';

import { LoginPageComponent } from './login-page/login-page.component';

@Component({
  selector: 'app-root',
  imports: [LoginPageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
