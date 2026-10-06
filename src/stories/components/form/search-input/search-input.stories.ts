import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SearchInputComponent } from './search-input.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<SearchInputComponent> = {
  title: 'Components/Form/Search Input',
  component: SearchInputComponent,
  tags: ['autodocs'],
  args: {
    search: fn(),
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Default: Story = { args: { placeholder: 'Search...' } };

export const WithValue: Story = { args: { value: 'Angular' } };

export const Disabled: Story = { args: { disabled: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
