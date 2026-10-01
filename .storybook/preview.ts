import type { Preview } from '@storybook/angular-vite';
import { GLOBALS_UPDATED, SELECT_STORY, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import '../src/stories/styles/theme.css';
// Shared layout of the Icons and Animations pages
import '../src/stories/styles/gallery-page.css';
// Storybook's docs pages in dark mode
import './docs-theme.css';
import { applyTheme, savedTheme } from './nexui-theme';

// Light/dark mode and theme color (toolbar in manager.ts): applied to the whole preview, docs pages included
const onGlobals = ({ globals }: { globals: Record<string, string> }) =>
  applyTheme(document, globals['theme'], globals['palette']);
addons.getChannel().on(SET_GLOBALS, onGlobals);
addons.getChannel().on(GLOBALS_UPDATED, onGlobals);

// Links from the landing pages to Storybook pages (managerHref: "./icons", "./" for Welcome) open in the manager
// in place, like a sidebar click, instead of reloading Storybook. Modified clicks (new tab) keep the link
document.addEventListener('click', (event) => {
  const link = (event.target as Element).closest?.<HTMLAnchorElement>('a[target="_top"]');
  if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    return;
  const url = new URL(link.href);
  const page = url.pathname.split('/').pop()!;
  if (url.origin !== location.origin || url.search || !/^[\w-]*$/.test(page)) return;
  event.preventDefault();
  addons.getChannel().emit(SELECT_STORY, { storyId: page || 'getting-started-welcome--welcome' });
});

const preview: Preview = {
  // Start in the saved choice, so a reload doesn't flash the light theme first
  initialGlobals: savedTheme(),
  parameters: {
    options: {
      storySort: {
        order: [
          'Getting Started',
          ['Welcome', 'Use in React, Vue & Angular'],
          'Components',
          [
            'Overview',
            'Form',
            'Data',
            'Panel',
            'Overlay',
            'Menu',
            'Feedback',
            'Media',
            'Chat',
            'Misc',
          ],
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
