// Pricing page: draws the plans and switches between monthly and yearly prices (yearly saves 20%)
const PLANS = [
  {
    name: 'Starter',
    monthly: 0,
    text: 'For side projects and trying things out.',
    features: ['1 project', 'Community support', 'Basic analytics'],
    cta: 'Start for free',
  },
  {
    name: 'Pro',
    monthly: 19,
    text: 'For growing teams that ship every week.',
    features: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom domains'],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Business',
    monthly: 49,
    text: 'For companies with security needs.',
    features: ['Everything in Pro', 'SSO and audit logs', '99.9% uptime SLA', 'Dedicated manager'],
    cta: 'Contact sales',
  },
];

const plansEl = document.getElementById('plans');
const buttons = document.querySelectorAll('.switch button');

const price = (plan, period) =>
  period === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly;

function render(period) {
  plansEl.innerHTML = PLANS.map(
    (plan) => `
      <article class="plan${plan.featured ? ' plan--featured' : ''}">
        ${plan.featured ? '<span class="plan__badge">Most popular</span>' : ''}
        <h2>${plan.name}</h2>
        <p class="plan__text">${plan.text}</p>
        <div class="plan__price">$${price(plan, period)}<span> / month</span></div>
        <ul>${plan.features.map((f) => `<li>${f}</li>`).join('')}</ul>
        <button type="button" class="plan__cta">${plan.cta}</button>
      </article>`,
  ).join('');
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.period === period)));
}

buttons.forEach((b) => b.addEventListener('click', () => render(b.dataset.period)));
render('monthly');
