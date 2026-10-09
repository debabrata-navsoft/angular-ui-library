import { useState } from 'react';
import './pricing.css';

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

const price = (plan, period) =>
  period === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly;

export function PricingPage() {
  const [period, setPeriod] = useState('monthly');

  return (
    <main className="pricing">
      <h1>Simple, honest pricing</h1>
      <p className="pricing__intro">Start free, upgrade when you grow. Cancel any time.</p>
      <div className="switch" role="group" aria-label="Billing period">
        <button
          type="button"
          aria-pressed={period === 'monthly'}
          onClick={() => setPeriod('monthly')}
        >
          Monthly
        </button>
        <button
          type="button"
          aria-pressed={period === 'yearly'}
          onClick={() => setPeriod('yearly')}
        >
          Yearly <small>-20%</small>
        </button>
      </div>
      <div className="plans">
        {PLANS.map((plan) => (
          <article key={plan.name} className={'plan' + (plan.featured ? ' plan--featured' : '')}>
            {plan.featured && <span className="plan__badge">Most popular</span>}
            <h2>{plan.name}</h2>
            <p className="plan__text">{plan.text}</p>
            <div className="plan__price">
              ${price(plan, period)}
              <span> / month</span>
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button type="button" className="plan__cta">
              {plan.cta}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
