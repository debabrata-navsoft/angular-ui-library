import type { Meta, StoryObj } from '@storybook/angular-vite';

import { ComponentsCatalogComponent } from './components-catalog.component';

const meta: Meta<ComponentsCatalogComponent> = {
  title: 'Components/Overview',
  component: ComponentsCatalogComponent,
  // Opened from "View Components", not listed in the sidebar; full screen like Welcome (see manager.ts)
  tags: ['!dev', 'nexui-landing'],
  parameters: { layout: 'fullscreen', controls: { disable: true }, actions: { disable: true } },
};

export default meta;

/** Story ID components-overview--overview. The page lists components from Storybook's index.json, so new ones
 *  appear automatically */
export const Overview: StoryObj<ComponentsCatalogComponent> = { name: 'Overview' };
