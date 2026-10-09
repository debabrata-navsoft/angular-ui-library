import { Component, signal } from '@angular/core';

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

@Component({
  selector: 'app-pricing-page',
  templateUrl: './pricing-page.component.html',
  styleUrl: './pricing-page.component.css',
})
export class PricingPageComponent {
  protected readonly plans = PLANS;
  protected readonly period = signal<'monthly' | 'yearly'>('monthly');

  /** Yearly billing saves 20% */
  protected price(plan: Plan) {
    return this.period() === 'yearly' ? Math.round(plan.monthly * 0.8) : plan.monthly;
  }
}
