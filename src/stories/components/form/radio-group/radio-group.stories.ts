import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { RadioGroupComponent } from './radio-group.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<RadioGroupComponent> = {
  title: 'Components/Form/Radio Group',
  component: RadioGroupComponent,
  tags: ['autodocs'],
  args: {
    label: 'Plan',
    options: [
      { value: 'free', label: 'Free' },
      { value: 'pro', label: 'Pro' },
      { value: 'enterprise', label: 'Enterprise' },
    ],
    value: 'free',
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<RadioGroupComponent>;

export const Default: Story = {};

export const Horizontal: Story = { args: { horizontal: true } };

export const Disabled: Story = { args: { disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
