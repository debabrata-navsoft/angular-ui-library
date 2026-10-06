import type { Meta, StoryObj } from '@storybook/angular-vite';
import { fn } from 'storybook/test';

import { FileUploadComponent } from './file-upload.component';
import { appearanceStories } from '../../../utils/appearance-stories';

/** Uploading is simulated (~1.5s) unless you pass an `uploadHandler` */
const meta: Meta<FileUploadComponent> = {
  title: 'Components/Form/File Upload',
  component: FileUploadComponent,
  tags: ['autodocs'],
  argTypes: { mode: { control: 'select', options: ['advanced', 'basic'] } },
  args: {
    multiple: true,
    accept: '.pdf,image/*',
    maxFileSize: 1_000_000,
    select: fn(),
    upload: fn(),
    remove: fn(),
    clear: fn(),
    error: fn(),
  },
};

export default meta;
type Story = StoryObj<FileUploadComponent>;

export const Advanced: Story = {};

export const Basic: Story = { args: { mode: 'basic', multiple: false, auto: true } };

export const ImagesOnly: Story = { args: { accept: 'image/*' } };

export const WithLimits: Story = { args: { maxFileSize: 100_000, fileLimit: 3 } };

/** The appearance classes from theme.css (np-color-*, np-shape-*) on the Advanced example */
const appearance = appearanceStories(meta, Advanced);
export const AppearanceColors = appearance.colors;
export const AppearanceShapes = appearance.shapes;
