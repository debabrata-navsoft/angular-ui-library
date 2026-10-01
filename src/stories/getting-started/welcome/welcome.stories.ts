import type { Meta, StoryObj } from '@storybook/angular-vite';

import { WelcomeComponent } from './welcome.component';

const meta: Meta<WelcomeComponent> = {
  title: 'Getting Started/Welcome',
  // Full screen like a website: manager.ts hides the sidebar, toolbar and addon panel
  tags: ['nexui-landing'],
  component: WelcomeComponent,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Welcome" page (story ID getting-started-welcome--welcome) */
export const Welcome: StoryObj<WelcomeComponent> = { name: 'Welcome' };
