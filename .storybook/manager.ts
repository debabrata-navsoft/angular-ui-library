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

// Short page URLs instead of ?path=/docs/…: "/" for Welcome, else the page's Storybook id as one path segment,
// without "--docs"/"--story" for a component's first page (/icons, /components-form-button-toggle). Other params
// stay. `middleware.mjs` serves them in the dev server.
// Storybook only reads ?path=, so a short URL becomes ?path= just before Storybook reads it: on Back/Forward (this
// listener comes before Storybook's) and on load. On load Storybook's router reads the URL right after calling
// replaceState(state with `idx`), which it only does when history.state has no `idx`: so `idx` is dropped and the
// URL is rewritten in that call (rewriting it now would show the long URL for a frame). Every ?path= Storybook
// writes is then shortened in a microtask, once its router has read it
const WELCOME = 'getting-started-welcome--welcome';
const replace = history.replaceState.bind(history);
function storybookUrl() {
  if (new URLSearchParams(location.search).has('path')) return undefined;
  const page = location.pathname.split('/').pop()!;
  const id = /^[\w-]+$/.test(page) ? page : WELCOME;
  return `${location.pathname.replace(/[^/]*$/, '')}?path=/story/${id}${location.search.replace('?', '&')}`;
}
const pageUrl = location.href;
const opened = !!storybookUrl();
if (opened) {
  const { idx: _idx, ...state } = history.state ?? {};
  replace(state, '');
  history.replaceState = (state, unused, url) => replace(state, unused, url ?? storybookUrl());
}
let shorten = () => {};
addEventListener('popstate', () => {
  const url = storybookUrl();
  if (url) replace(history.state, '', url);
  requestAnimationFrame(() => shorten());
});
addons.register('nexui/page-url', (api) => {
  // Storybook's router has read the long URL by now
  if (opened) replace(history.state, '', pageUrl);
  shorten = () => {
    const url = new URL(location.href);
    const id = url.searchParams.get('path')?.split('/')[2];
    const entry = id ? api.resolveStory(id) : undefined;
    if (!id || !entry || entry.type === 'root') return;
    const parent = entry.parent ? api.resolveStory(entry.parent) : undefined;
    const first =
      entry.type === 'docs' || (parent?.type === 'component' && parent.children[0] === id);
    url.searchParams.delete('path');
    // Mode and theme color are saved in localStorage (saveTheme), so they stay out of the URL
    const globals = url.searchParams
      .get('globals')
      ?.split(';')
      .filter((g) => !/^(theme|palette):/.test(g));
    if (globals?.length) url.searchParams.set('globals', globals.join(';'));
    else url.searchParams.delete('globals');
    url.pathname = url.pathname.replace(
      /[^/]*$/,
      id === WELCOME ? '' : first ? id.split('--')[0] : id,
    );
    replace(history.state, '', url.href);
  };
  for (const method of ['pushState', 'replaceState'] as const) {
    const write = method === 'pushState' ? history.pushState.bind(history) : replace;
    history[method] = (state, unused, url) => {
      write(state, unused, url);
      queueMicrotask(shorten);
    };
  }
  api.on(CURRENT_STORY_WAS_SET, shorten);
  // The sidebar logo (brandUrl "/") opens Welcome in place instead of reloading Storybook; new-tab clicks keep it
  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest?.('.sidebar-header a[href="/"]');
    if (!link || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    api.selectStory(WELCOME);
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
// sidebar and toolbar but have no use for the addon panel. Elsewhere the panel stays as the user left it.
// Storybook asks layoutCustomisations on every render, the first one included, so a reload never shows the wrong
// layout. Until the story index has loaded there are no tags, so these pages are also known by id
const LAYOUTS: Record<string, string> = {
  'getting-started-welcome': 'landing',
  'components-overview': 'landing',
  icons: 'gallery',
  animations: 'gallery',
  nexlottie: 'gallery',
};
function layoutOf({
  storyId = '',
  index,
}: {
  storyId?: string;
  index?: Record<string, { tags?: string[] }>;
}) {
  const tags = index?.[storyId]?.tags;
  const layout =
    (tags
      ? ['landing', 'gallery'].find((name) => tags.includes(`nexui-${name}`))
      : LAYOUTS[storyId.split('--')[0]]) ?? 'default';
  // The toolbar is hidden with CSS (manager-head.html): Storybook keeps a hidden toolbar's landmark registered
  // without an element, and showing the sidebar later then crashes the manager UI
  document.documentElement.dataset['nexuiLayout'] = layout;
  return layout;
}
addons.setConfig({
  layoutCustomisations: {
    showSidebar: (state) => layoutOf(state) !== 'landing',
    showPanel: (state) => (layoutOf(state) === 'default' ? undefined : false),
  },
});
