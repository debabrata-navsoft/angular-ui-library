import { type FormEvent, useState } from 'react';
import './login.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fakes a sign-in request: replace it with a call to your API */
const signIn = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

type Status = 'idle' | 'loading' | 'done';
interface Errors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = {
      email: EMAIL.test(email.trim()) ? '' : 'Enter a valid email address.',
      password: password.length >= 8 ? '' : 'Use at least 8 characters.',
    };
    setErrors(next);
    if (next.email || next.password) return;
    setStatus('loading');
    await signIn();
    setStatus('done');
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate>
        <div className="login__logo">N</div>
        <h1>Welcome back</h1>
        <p className="login__intro">Sign in to continue to your account.</p>

        <label className="field">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            aria-invalid={!!errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </label>

        <label className="field">
          Password
          <span className="field__box">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              aria-invalid={!!errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="field__toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
          {errors.password && <span className="field__error">{errors.password}</span>}
        </label>

        <div className="login__row">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot password?</a>
        </div>

        {status === 'done' ? (
          <p className="login__done">Signed in! Replace this with a redirect to your app.</p>
        ) : (
          <button type="submit" className="login__submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'}
          </button>
        )}

        <p className="login__footer">
          No account yet? <a href="#">Create one</a>
        </p>
      </form>
    </main>
  );
}
