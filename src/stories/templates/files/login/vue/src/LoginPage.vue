<script setup>
import { ref } from 'vue';
import './login.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fakes a sign-in request: replace it with a call to your API */
const signIn = () => new Promise((resolve) => setTimeout(resolve, 800));

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const errors = ref({ email: '', password: '' });
const status = ref('idle'); // idle | loading | done

async function submit() {
  errors.value = {
    email: EMAIL.test(email.value.trim()) ? '' : 'Enter a valid email address.',
    password: password.value.length >= 8 ? '' : 'Use at least 8 characters.',
  };
  if (errors.value.email || errors.value.password) return;
  status.value = 'loading';
  await signIn();
  status.value = 'done';
}
</script>

<template>
  <main class="login">
    <form class="login__card" novalidate @submit.prevent="submit">
      <div class="login__logo">N</div>
      <h1>Welcome back</h1>
      <p class="login__intro">Sign in to continue to your account.</p>

      <label class="field">
        Email
        <input
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          :aria-invalid="!!errors.email"
        />
        <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
      </label>

      <label class="field">
        Password
        <span class="field__box">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="••••••••"
            :aria-invalid="!!errors.password"
          />
          <button type="button" class="field__toggle" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </span>
        <span v-if="errors.password" class="field__error">{{ errors.password }}</span>
      </label>

      <div class="login__row">
        <label><input type="checkbox" /> Remember me</label>
        <a href="#">Forgot password?</a>
      </div>

      <p v-if="status === 'done'" class="login__done">Signed in! Replace this with a redirect to your app.</p>
      <button v-else type="submit" class="login__submit" :disabled="status === 'loading'">
        {{ status === 'loading' ? 'Signing in…' : 'Sign in' }}
      </button>

      <p class="login__footer">No account yet? <a href="#">Create one</a></p>
    </form>
  </main>
</template>
