import type { Meta, StoryObj } from '@storybook/angular-vite';

import { SIZES } from '../types';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Components/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: { size: { control: 'select', options: SIZES } },
  args: {
    name: 'Jane Doe',
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Initials: Story = {};

export const WithImage: Story = { args: { src: 'https://i.pravatar.cc/128?img=5' } };

export const Small: Story = { args: { size: 'small' } };

export const Large: Story = { args: { size: 'large' } };
