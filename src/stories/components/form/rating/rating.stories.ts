import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { RatingComponent } from './rating.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<RatingComponent> = {
  title: 'Components/Form/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  args: {
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<RatingComponent>;

export const Default: Story = { args: { value: 0 } };

export const WithValue: Story = { args: { value: 3 } };

export const TenStars: Story = { args: { value: 7, max: 10 } };

export const ReadOnly: Story = { args: { value: 4, readonly: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the WithValue example */
const appearance = appearanceStories(meta, WithValue);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
