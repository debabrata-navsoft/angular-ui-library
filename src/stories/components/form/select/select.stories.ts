import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { SelectComponent } from './select.component';
import { appearanceStories } from '../../../utils/appearance-stories';
import { FIELD_VARIANTS } from '../../../utils/types';

const meta: Meta<SelectComponent> = {
  title: 'Components/Form/Select',
  component: SelectComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: FIELD_VARIANTS } },
  args: {
    label: 'Role',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
    valueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Default: Story = {};

export const WithValue: Story = { args: { value: 'editor' } };

export const Disabled: Story = { args: { value: 'viewer', disabled: true } };

/** Field styles: outlined (default), filled, underline and floating (the label sits inside and floats up) */
export const Variants: Story = {
  decorators: [moduleMetadata({ imports: [SelectComponent] })],
  render: (args) => ({
    props: { ...args, variants: FIELD_VARIANTS },
    template: `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 28px 24px; align-items: start">
  @for (v of variants; track v) {
    <div style="display: grid; gap: 10px">
      <code style="justify-self: start; padding: 2px 8px; border-radius: 6px; background: var(--ui-surface-sunken); color: var(--ui-text-muted); font-size: 12px">{{ v }}</code>
      <np-select [variant]="v" label="Role" icon="user" [options]="options"></np-select>
    </div>
  }
</div>`,
  }),
};

/** A leading icon inside the dropdown (any icon file name) */
export const WithIcon: Story = { args: { icon: 'briefcase', value: 'editor' } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
