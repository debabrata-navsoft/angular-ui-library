import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SITE_STORY, type SiteComponent } from '../getting-started/site/site-story';

const meta: Meta<SiteComponent> = {
  title: 'Templates',
  // A page of the NexPrime site (templates-gallery.component.ts, data in templates-data.ts)
  tags: ['np-landing'],
  ...SITE_STORY,
  args: { page: 'templates' },
};

export default meta;

/** Named like the title, so Storybook shows it as a single "Templates" page in the sidebar */
export const Templates: StoryObj<SiteComponent> = { name: 'Templates' };
