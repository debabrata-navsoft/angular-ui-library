// Login page: validates the form, then fakes a sign-in request. Replace signIn() with a call to your API
const form = document.getElementById('login-form');
const email = document.getElementById('email');
const password = document.getElementById('password');
const toggle = document.getElementById('toggle');
const submit = document.getElementById('submit');
const done = document.getElementById('done');

function showError(input, message) {
  const error = document.getElementById(input.id + '-error');
  error.textContent = message;
  error.hidden = !message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function validate() {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
  showError(email, emailOk ? '' : 'Enter a valid email address.');
  showError(password, password.value.length >= 8 ? '' : 'Use at least 8 characters.');
  return emailOk && password.value.length >= 8;
}

function signIn() {
  return new Promise((resolve) => setTimeout(resolve, 800));
}

toggle.addEventListener('click', () => {
  const hidden = password.type === 'password';
  password.type = hidden ? 'text' : 'password';
  toggle.textContent = hidden ? 'Hide' : 'Show';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validate()) return;
  submit.disabled = true;
  submit.textContent = 'Signing in…';
  await signIn();
  submit.hidden = true;
  done.hidden = false;
});
