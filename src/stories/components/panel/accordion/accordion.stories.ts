import type { Meta, StoryObj } from '@storybook/angular-vite';

import { AccordionComponent } from './accordion.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<AccordionComponent> = {
  title: 'Components/Panel/Accordion',
  component: AccordionComponent,
  tags: ['autodocs'],
  args: {
    items: [
      { title: 'What is Storybook?', content: 'A tool for building UI components in isolation.' },
      { title: 'Does it work with Angular?', content: 'Yes, Storybook supports Angular.' },
      { title: 'Is it free?', content: 'Yes, Storybook is open source.' },
    ],
  },
};

export default meta;
type Story = StoryObj<AccordionComponent>;

export const Default: Story = {};

export const MultipleOpen: Story = { args: { multiple: true } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Default example */
const appearance = appearanceStories(meta, Default);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
