<script setup lang="ts">
import { ref } from 'vue';
import './pricing.css';

interface Plan {
  name: string;
  monthly: number;
  text: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    "name": "Starter",
    "monthly": 0,
    "text": "For side projects and trying things out.",
    "features": [
      "1 project",
      "Community support",
      "Basic analytics"
    ],
    "cta": "Start for free"
  },
  {
    "name": "Pro",
    "monthly": 19,
    "text": "For growing teams that ship every week.",
    "features": [
      "Unlimited projects",
      "Priority support",
      "Advanced analytics",
      "Custom domains"
    ],
    "cta": "Start 14-day trial",
    "featured": true
  },
  {
    "name": "Business",
    "monthly": 49,
    "text": "For companies with security needs.",
    "features": [
      "Everything in Pro",
      "SSO and audit logs",
      "99.9% uptime SLA",
      "Dedicated manager"
    ],
    "cta": "Contact sales"
  }
];

const period = ref<'monthly' | 'yearly'>('monthly');
const price = (plan: Plan) => (period.value === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly);
</script>

<template>
  <main class="pricing">
    <h1>Simple, honest pricing</h1>
    <p class="pricing__intro">Start free, upgrade when you grow. Cancel any time.</p>
    <div class="switch" role="group" aria-label="Billing period">
      <button type="button" :aria-pressed="period === 'monthly'" @click="period = 'monthly'">Monthly</button>
      <button type="button" :aria-pressed="period === 'yearly'" @click="period = 'yearly'">
        Yearly <small>-20%</small>
      </button>
    </div>
    <div class="plans">
      <article v-for="plan in PLANS" :key="plan.name" class="plan" :class="{ 'plan--featured': plan.featured }">
        <span v-if="plan.featured" class="plan__badge">Most popular</span>
        <h2>{{ plan.name }}</h2>
        <p class="plan__text">{{ plan.text }}</p>
        <div class="plan__price">${{ price(plan) }}<span> / month</span></div>
        <ul>
          <li v-for="f in plan.features" :key="f">{{ f }}</li>
        </ul>
        <button type="button" class="plan__cta">{{ plan.cta }}</button>
      </article>
    </div>
  </main>
</template>
