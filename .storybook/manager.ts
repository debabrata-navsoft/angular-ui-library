import { CURRENT_STORY_WAS_SET, GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { addons, types } from 'storybook/manager-api';

import { applyTheme, saveTheme, savedTheme, themeOf } from './nexui-theme';
import { ModeTool, PaletteTool, SearchTool, managerTheme } from './theme-tools';

/** The last light/dark mode and theme color the user picked (preview.ts starts the stories with it too) */
const saved = savedTheme();

// Storybook UI (sidebar, toolbar) branding in the saved mode and color. Storybook's own toolbar tools are hidden
// (with `features` in main.ts for backgrounds/grid, outline, measure and viewport); NexUI's are added below.
// The sidebar CSS in manager-head.html reads data-theme and --ui-primary from this page. Restart after editing
applyTheme(document, saved.theme, saved.palette);
addons.setConfig({
  theme: managerTheme(saved.theme, saved.palette),
  toolbar: Object.fromEntries(
    [
      'zoom',
      'remount',
      'fullscreen',
      'eject',
      'copy',
      'share',
      'isolationMode',
      'storybook/a11y/panel',
    ].map((id) => [id, { hidden: true }]),
  ),
});

// Toolbar: search, light/dark mode and theme color (PrimeNG-style). The choice is saved and comes back on reload
const TOOLS = [
  ['search', 'Search', SearchTool],
  ['mode', 'Light or dark mode', ModeTool],
  ['palette', 'Theme color', PaletteTool],
] as const;
addons.register('nexui/theme', (api) => {
  for (const [id, title, Tool] of TOOLS) {
    addons.add(`nexui/${id}`, { type: types.TOOL, title, match: () => true, render: () => Tool() });
  }
  // A change from the toolbar or the landing pages' top bar: save it and restyle the Storybook UI. Storybook sends
  // GLOBALS_UPDATED on every render, so unchanged themes stop at applyTheme
  api.on(GLOBALS_UPDATED, ({ globals }: { globals: Record<string, string> }) => {
    const { theme, palette } = themeOf(globals);
    if (!applyTheme(document, theme, palette)) return;
    saveTheme(theme, palette);
    api.setOptions({ theme: managerTheme(theme, palette) });
  });
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

// Layout per page, from the story's tags. `nexui-landing` pages (Welcome, the components catalog) fill the window like
// a website: no sidebar, toolbar or addon panel. `nexui-gallery` pages (Icons, Animations, NexLottie) keep the
// sidebar and toolbar but have no use for the addon panel. Elsewhere the panel comes back as the user left it
type Layout = 'landing' | 'gallery' | 'default';
addons.register('nexui/layout', (api) => {
  // null until the first page: Storybook keeps the layout across reloads, so the first page always applies it
  let current: Layout | null = null;
  // CURRENT_STORY_WAS_SET fires on every selection, the first load included
  api.on(CURRENT_STORY_WAS_SET, () => {
    const tags = api.getCurrentStoryData()?.tags ?? [];
    const layout: Layout = tags.includes('nexui-landing')
      ? 'landing'
      : tags.includes('nexui-gallery')
        ? 'gallery'
        : 'default';
    if (layout === current) return;
    // Links on the landing pages reload the manager, so the panel state is kept for the session
    if (current === 'default') sessionStorage.setItem('nexui-panel', String(api.getIsPanelShown()));
    current = layout;
    api.toggleNav(layout !== 'landing');
    api.toggleToolbar(layout !== 'landing');
    api.togglePanel(layout === 'default' && sessionStorage.getItem('nexui-panel') !== 'false');
  });
});
