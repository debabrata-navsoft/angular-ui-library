import { Component, signal } from '@angular/core';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fakes a sign-in request: replace it with a call to your API */
const signIn = () => new Promise((resolve) => setTimeout(resolve, 800));

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly errors = signal({ email: '', password: '' });
  protected readonly status = signal<'idle' | 'loading' | 'done'>('idle');

  protected async submit(event: Event) {
    event.preventDefault();
    const errors = {
      email: EMAIL.test(this.email().trim()) ? '' : 'Enter a valid email address.',
      password: this.password().length >= 8 ? '' : 'Use at least 8 characters.',
    };
    this.errors.set(errors);
    if (errors.email || errors.password) return;
    this.status.set('loading');
    await signIn();
    this.status.set('done');
  }
}
