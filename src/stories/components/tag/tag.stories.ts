import type { Meta, StoryObj } from '@storybook/angular-vite';

import { TAG_SEVERITIES, TagComponent } from './tag.component';

const meta: Meta<TagComponent> = {
  title: 'Components/Tag',
  component: TagComponent,
  tags: ['autodocs'],
  argTypes: { severity: { control: 'select', options: TAG_SEVERITIES } },
  args: { value: 'New' },
};

export default meta;
type Story = StoryObj<TagComponent>;

export const Default: Story = {};

export const AllSeverities: Story = {
  render: (args) => ({
    props: { ...args, severities: TAG_SEVERITIES },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        @for (severity of severities; track severity) {
          <app-tag [severity]="severity" [value]="severity" [icon]="icon" [rounded]="rounded" />
        }
      </div>
    `,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: 8px">
        <app-tag value="Primary" icon="sparkles" />
        <app-tag severity="info" value="Info" icon="info" />
        <app-tag severity="success" value="Success" icon="check" />
        <app-tag severity="warning" value="Warning" icon="triangle-alert" />
        <app-tag severity="danger" value="Danger" icon="circle-alert" />
      </div>
    `,
  }),
};

export const Rounded: Story = { args: { value: 'Rounded', rounded: true } };
