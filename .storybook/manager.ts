import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI (sidebar, toolbar) branding. Restart Storybook after editing
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Angular UI Library',
    brandUrl: '/',
    brandTarget: '_self',

    // Aurora colors from src/stories/theme.css
    colorPrimary: '#a855f7',
    colorSecondary: '#6366f1',
    barSelectedColor: '#6366f1',
    appBorderRadius: 10,
    fontBase: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  }),
});
