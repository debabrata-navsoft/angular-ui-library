import type { Meta, StoryObj } from '@storybook/angular-vite';

import { IconComponent } from './icon.component';

/** Browse and copy every icon on the "Icons" page at the top of the sidebar */
const meta: Meta<IconComponent> = {
  title: 'Components/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'range', min: 0.5, max: 3, step: 0.25 } },
  },
  args: { name: 'heart', size: 32 },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {};

export const ThinStroke: Story = { args: { name: 'house', strokeWidth: 1 } };

/** Icons that use currentColor take the color of the surrounding text */
export const Colored: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: 16px">
        <app-icon [name]="name" [size]="size" style="color: var(--ui-primary)" />
        <app-icon [name]="name" [size]="size" style="color: var(--ui-success)" />
        <app-icon [name]="name" [size]="size" style="color: var(--ui-warning)" />
        <app-icon [name]="name" [size]="size" style="color: var(--ui-danger)" />
      </div>
    `,
  }),
};
