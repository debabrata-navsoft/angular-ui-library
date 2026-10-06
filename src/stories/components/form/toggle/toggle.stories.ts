import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { ToggleComponent } from './toggle.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<ToggleComponent> = {
  title: 'Components/Form/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  args: {
    label: 'Enable notifications',
    checkedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Off: Story = {};

export const On: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the On example */
const appearance = appearanceStories(meta, On);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
