import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Storybook UI (sidebar, toolbar) branding. Restart Storybook after editing
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'NexUI — Next-generation UI',
    brandUrl: '/',
    brandTarget: '_self',

    // Aurora colors from src/stories/styles/theme.css
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
new MutationObserver(renameTab).observe(document.head, {
  subtree: true,
  childList: true,
  characterData: true,
});
renameTab();

// Storybook opens every sidebar group on page load. Keep one open: the group holding the page being viewed,
// or Getting Started when the page isn't in a group (e.g. Icons).
const collapseGroups = new MutationObserver(() => {
  const groups = [...document.querySelectorAll<HTMLElement>('.sidebar-subheading')];
  if (!groups.length) return;
  collapseGroups.disconnect();
  const selected = document
    .querySelector('.sidebar-item[data-selected="true"]')
    ?.getAttribute('data-item-id');
  const keep =
    groups.find((group) => selected?.startsWith(`${group.dataset.itemId}-`))?.dataset.itemId ??
    'getting-started';
  groups
    .filter((group) => group.dataset.itemId !== keep)
    .forEach((group) => group.querySelector<HTMLElement>('[aria-expanded="true"]')?.click());
});
collapseGroups.observe(document.body, { childList: true, subtree: true });

// Accordion at every level: opening a top-level group closes the other open one, and opening a sub-group
// (Components ▸ Form) or a component closes its open siblings (also when a story is picked from search)
new MutationObserver((mutations) => {
  for (const { target } of mutations) {
    const opened = target as HTMLElement;
    if (opened.getAttribute('aria-expanded') !== 'true') continue;
    const parent = opened.closest<HTMLElement>(
      '.sidebar-item:is([data-nodetype="component"], [data-nodetype="group"])',
    )?.dataset.parentId;
    const selector =
      opened.dataset.action === 'collapse-root'
        ? '[data-action="collapse-root"][aria-expanded="true"]'
        : parent &&
          `.sidebar-item:is([data-nodetype="component"], [data-nodetype="group"])[data-parent-id="${parent}"] > [aria-expanded="true"]`;
    if (!selector) continue;
    document
      .querySelectorAll<HTMLElement>(selector)
      .forEach((other) => other !== opened && other.click());
  }
}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['aria-expanded'] });
