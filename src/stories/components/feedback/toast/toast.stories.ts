import type { Meta, StoryObj } from '@storybook/angular-vite';
import { moduleMetadata } from '@storybook/angular-vite';

import { ButtonComponent } from '../../form/button/button.component';
import { TONES } from '../../../utils/types';
import { ToastComponent } from './toast.component';

const meta: Meta<ToastComponent> = {
  title: 'Components/Feedback/Toast',
  component: ToastComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ButtonComponent] })],
  parameters: { docs: { story: { inline: false, height: '200px' } } },
  argTypes: {
    type: { control: 'select', options: TONES },
    position: {
      control: 'select',
      options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
    },
  },
  args: { open: false, message: 'Your changes have been saved.', duration: 3000 },
  render: (args) => ({
    props: args,
    template: `
      <storybook-button label="Show toast" [primary]="true" (onClick)="open = true" />
      <nex-toast
        [(open)]="open"
        [message]="message"
        [type]="type"
        [position]="position"
        [duration]="duration"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<ToastComponent>;

export const Success: Story = { args: { type: 'success' } };

export const Info: Story = { args: { type: 'info', message: 'A new version is available.' } };

export const Warning: Story = {
  args: { type: 'warning', message: 'Your session expires in 5 minutes.' },
};

/** The `danger` tone, for failures */
export const ErrorToast: Story = {
  name: 'Error',
  args: { type: 'danger', message: 'Failed to save changes.' },
};

export const Neutral: Story = { args: { type: 'neutral', message: 'Draft saved on this device.' } };

export const StaysOpen: Story = {
  args: { open: true, message: 'This toast stays until you close it.', duration: 0 },
};

/** Every type at once, one per corner */
export const AllTypes: Story = {
  parameters: { docs: { story: { inline: false, height: '260px' } } },
  render: () => ({
    template: `
      <nex-toast [open]="true" [duration]="0" type="success" position="top-left" message="Your changes have been saved." />
      <nex-toast [open]="true" [duration]="0" type="info" position="top-right" message="A new version is available." />
      <nex-toast [open]="true" [duration]="0" type="warning" position="bottom-left" message="Your session expires in 5 minutes." />
      <nex-toast [open]="true" [duration]="0" type="danger" position="bottom-right" message="Failed to save changes." />
    `,
  }),
};
