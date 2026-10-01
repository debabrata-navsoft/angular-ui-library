import type { Preview } from '@storybook/angular-vite';
import '../src/stories/styles/theme.css';
// Shared layout of the Icons and Animations pages
import '../src/stories/styles/gallery-page.css';

const preview: Preview = {
  parameters: {
    options: {
      storySort: {
        order: [
          'Getting Started',
          'Components',
          ['Form', 'Data', 'Panel', 'Overlay', 'Menu', 'Feedback', 'Media', 'Chat', 'Misc'],
          'Icons',
          'Animations',
          'Onboarding',
          ['Tour', 'Checklist'],
          'NexLottie',
          'Effects',
          [
            'Particles',
            'Spotlight',
            'Aurora',
            'Starfield',
            'Matrix Rain',
            'Waves',
            'Dot Grid',
            'Cursor Trail',
            'Confetti',
          ],
        ],
      },
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
