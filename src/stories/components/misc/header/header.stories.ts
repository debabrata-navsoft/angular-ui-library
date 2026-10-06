import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { HeaderComponent } from './header.component';
import { appearanceStories } from '../../../utils/appearance-stories';

const meta: Meta<HeaderComponent> = {
  title: 'Components/Misc/Header',
  component: HeaderComponent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { login: fn(), logout: fn(), createAccount: fn() },
};

export default meta;
type Story = StoryObj<HeaderComponent>;

export const LoggedIn: Story = { args: { user: { name: 'Jane Doe' } } };

export const LoggedOut: Story = {};

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the LoggedIn example */
const appearance = appearanceStories(meta, LoggedIn);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
