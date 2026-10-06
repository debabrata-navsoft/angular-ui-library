import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { CheckboxComponent } from './checkbox.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<CheckboxComponent> = {
  title: 'Components/Form/Checkbox',
  component: CheckboxComponent,
  tags: ['autodocs'],
  args: {
    label: 'Accept terms and conditions',
    checkedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<CheckboxComponent>;

export const Unchecked: Story = {};

export const Checked: Story = { args: { checked: true } };

export const Disabled: Story = { args: { disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Checked example */
const appearance = appearanceStories(meta, Checked);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
