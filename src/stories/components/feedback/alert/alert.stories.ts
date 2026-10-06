import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { TONES } from '../../../utils/types';
import { AlertComponent } from './alert.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<AlertComponent> = {
  title: 'Components/Feedback/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: { type: { control: 'select', options: TONES } },
  args: { title: 'Heads up:', message: 'This is an alert message.', dismiss: fn() },
};

export default meta;
type Story = StoryObj<AlertComponent>;

export const Default: Story = {};

export const Dismissible: Story = { args: { dismissible: true } };

export const AllTypes: Story = {
  render: (args) => ({
    props: { ...args, tones: TONES },
    template: `
      <div style="display: grid; gap: 12px">
        @for (tone of tones; track tone) {
          <np-alert [type]="tone" [title]="tone + ':'" [message]="message" />
        }
      </div>
    `,
  }),
};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
