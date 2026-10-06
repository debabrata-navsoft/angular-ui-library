import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { BreadcrumbComponent } from './breadcrumb.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<BreadcrumbComponent> = {
  title: 'Components/Menu/Breadcrumb',
  component: BreadcrumbComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { label: 'Home' },
      { label: 'Products' },
      { label: 'Laptops' },
      { label: 'MacBook Pro' },
    ],
    itemClick: fn(),
  },
};

export default meta;
type Story = StoryObj<BreadcrumbComponent>;

export const Default: Story = {};

export const CustomSeparator: Story = { args: { separator: '›' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
