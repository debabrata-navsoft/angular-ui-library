import type { Meta, StoryObj } from '@storybook/angular-vite';

import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Components/Card',
  component: CardComponent,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <app-card [title]="title" [subtitle]="subtitle">
        This is the card content.
      </app-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
    subtitle: 'Card subtitle',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Card Title',
  },
};
