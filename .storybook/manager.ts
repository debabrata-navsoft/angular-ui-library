import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI (sidebar, toolbar) branding. Restart Storybook after editing
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'NexUI — Next-generation UI',
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

// Browser tab title: Storybook writes "Components / Button - Primary ⋅ Storybook"; show "NexUI - Button - Primary"
function renameTab() {
  const title = document.title;
  if (!title.includes('Storybook')) return;
  const parts = title
    .replace(/\s*\u22C5?\s*Storybook$/, '')
    .split(' - ')
    .map((part) => part.split(' / ').pop()!.trim())
    .filter((part, i, all) => part && part !== all[i - 1]);
  document.title = ['NexUI', ...parts].join(' - ');
}
new MutationObserver(renameTab).observe(document.head, { subtree: true, childList: true, characterData: true });
renameTab();
