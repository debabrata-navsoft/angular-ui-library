import type { Preview } from '@storybook/angular-vite';
import '../src/stories/theme.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: { order: ['Configure your project', 'Icons', 'Components'] },
    },

    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
