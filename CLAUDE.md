# CLAUDE.md

Angular 21 UI component library, developed and documented in Storybook 10 (`@storybook/angular-vite`).

## Commands

```bash
npm run storybook         # Storybook dev server on http://localhost:6006
npm run build-storybook   # Static Storybook build -> storybook-static/
npm start                 # Angular app (src/app) on http://localhost:4200
npm run build             # Production app build -> dist/
npm test                  # Vitest unit tests (*.spec.ts)
npx ngc -p .storybook/tsconfig.json --noEmit   # Type-check all components + stories (incl. templates)
```

The Storybook Vite build does not fail on template type errors. Run the `ngc` command above after changing components.

## Layout

```
src/stories/
  theme.css          Global design tokens (--ui-*), .tone-* color classes, shared .ui-* classes
  types.ts           Shared types: Tone, TONES, TONE_ICONS, Size, SIZES, User, MenuItem, TreeNode
  anchor-position.ts Shared fixed-position helper for popovers and popup menus
  menu-utils.ts      Shared menu logic: runItem, MenuPath, DismissableMenu, PopupMenu
  icons/             Drop-in .svg files for <app-icon name="file-name" />: full Lucide set + user icons (see icons/README.md)
  icon-gallery/      "Icons" docs page (top of sidebar): search, customize, copy code. Not a library component
  components/
    <name>/
      <name>.component.ts   Class only: inputs/outputs/logic
      <name>.html           Template (templateUrl)
      <name>.css            Styles (styleUrl)
      <name>.stories.ts
  Configure.mdx, assets/   Storybook welcome page (boilerplate)
src/app/             Demo Angular app (not used by Storybook)
src/styles.css       Imports stories/theme.css for the app
.storybook/          Storybook config; preview.ts imports src/stories/theme.css
                     manager.ts sets the Storybook UI theme and brand name "Angular UI Library"
                     manager-head.html styles the Storybook sidebar (restart Storybook after editing either)
```

All components live in `src/stories/components/<name>/`, one folder per component. Import shared types with `from '../../types'` and other components with `from '../<other>/<other>.component'`.
Every story title is `Components/<Name>`. Do not use an `Example/` group.

## Component conventions

- Standalone components (no `standalone: true` needed, no NgModules, no `CommonModule`).
- Signal APIs only: `input()`, `output()`, `model()` for two-way values (`[(value)]`, `[(checked)]`, `[(open)]`, `[(page)]`), `signal()`/`computed()` for internal state.
- Built-in control flow (`@if`, `@for`, `@else`). Do not use `*ngIf`, `*ngFor` or `ngClass`.
- Every component has 3 files: `templateUrl: './<name>.html'` and `styleUrl: './<name>.css'`. Never use inline `template` or `styles` in the `.ts` file.
- Selector prefix `app-` (the Button/Header/Page examples keep `storybook-`).
- Every public input/output gets a one-line `/** doc comment */`. Storybook autodocs shows these.
- Static `class="x"` plus `[class]="'x--' + variant()"` merge in Angular. Don't repeat the base class inside the binding.

## Styling ("Aurora" design)

The look is an indigo → violet gradient accent (`--ui-gradient`) on slate neutrals, with soft layered shadows, rounded corners, a glowing focus ring on every interactive element, and short entrance/hover animations. Keep new components consistent with this:

- Use theme variables, not hex values. Colors: `--ui-primary`, `--ui-primary-hover`, `--ui-accent`, `--ui-gradient`, `--ui-primary-soft`, `--ui-text`, `--ui-text-muted`, `--ui-text-subtle`, `--ui-border`, `--ui-border-strong`, `--ui-surface`, `--ui-surface-muted`, `--ui-surface-sunken`, `--ui-success`, `--ui-warning`, `--ui-danger`. Shape and motion: `--ui-radius-sm`, `--ui-radius`, `--ui-radius-lg`, `--ui-shadow-sm`, `--ui-shadow`, `--ui-shadow-lg`, `--ui-ring`, `--ui-ease`, `--ui-font`.
- Selected/active states use `background: var(--ui-gradient)` with white text. Hover changes color, background, border or shadow only (e.g. `--ui-primary-soft`). Never move elements on hover (no `translateY` lift). `:focus-visible` uses `box-shadow: var(--ui-ring)`.
- Alert and Toast show a round tone icon: `<span class="ui-tone-icon">{{ icons[type()] }}</span>` with `TONE_ICONS`.
- Color variants: add the class `tone-<tone>` and read `--tone-bg`, `--tone-fg`, `--tone-border`, `--tone-solid`. Type the input as `Tone` from `types.ts` (`info | success | warning | danger | neutral`).
- Form fields: wrap in `.ui-field`, with `.ui-label`, `.ui-control` (on input/select/textarea), `.ui-hint` and `.ui-error`. `aria-invalid="true"` on a `.ui-control` gives it a red border.
- Buttons inside components use the shared `.ui-btn` classes: `.ui-btn--primary` (gradient), `--danger`, `--text` (combine with `--danger` for red text), `--sm`, `--icon`. Don't write component-local button CSS.
- Close buttons use `.ui-close`. Screen-reader-only text uses `.ui-visually-hidden`.
- The theme is global, so component CSS can use these classes despite view encapsulation.

## Icons

- Users add their own `.svg` files to `src/stories/icons/`. `<app-icon name="x" />` (`components/icon/`) fetches `icons/x.svg` at runtime, caches it, and inlines it so `currentColor` works.
- The folder is served at `/icons` by Storybook (`staticDirs` in `.storybook/main.ts`) and by the app build (`assets` in `angular.json`). Keep both in sync with `ICONS_URL` in `icon.component.ts`.
- The folder ships with all Lucide icons (`LICENSE-lucide.txt`, search keywords in `tags.json`). The **Icons** page (`icon-gallery/icons.stories.ts`) reads every `.svg` with `import.meta.glob(..., { query: '?raw' })`, so new files need no code changes. Its data is passed as `props`, not `args`, to keep it out of the Controls panel.
- Sidebar order is set in `.storybook/preview.ts` (`storySort`): Configure your project, Icons, Components.
- `IconComponent` uses `ViewEncapsulation.None` to style the inlined `<svg>`, so scope its CSS under `.app-icon`.

## Shared patterns

- Menus (Menu, Menubar, MegaMenu, PanelMenu, TieredMenu) take `[model]="MenuItem[]"` from `types.ts`: `icon` is an icon file name, `command` runs on click, plus `url`, `items`, `separator`, `disabled`, `badge`. Popup menus expose `toggle(event)`, `show(event)`, `hide()`.
- Drag and drop uses `@angular/cdk/drag-drop` (PickList). Style CDK states (`.cdk-drag-preview`, `.cdk-drag-placeholder`, `.cdk-drop-list-dragging`) in the component CSS. The preview is a clone of the item, so component styles still apply.
- Badge is a standalone label; Overlay Badge (`<app-overlay-badge [value]="6">…</app-overlay-badge>`) wraps content and puts a count or dot on its corner.
- Footer slots (`<div dialogFooter>`, `<div cardFooter>`) get `display: contents` from theme.css, so the component's footer lays out the buttons with its gap. Card's `footerAlign="stretch"` uses a grid to make them equal width.
- Tree and TreeTable take `TreeNode[]` from `types.ts` (`key` is required and must be unique).
- ConfirmDialog and ConfirmPopup share `ConfirmationService` (`components/confirm-dialog/confirmation.service.ts`, `providedIn: 'root'`). Call `confirm({ message, header, accept, reject })`. Pass `target: event.currentTarget` for the popup; confirms without a target open the dialog.
- Anchored overlays (OverlayPanel, ConfirmPopup) and popup menus share `src/stories/anchor-position.ts`.
- All menus render rows with the internal `app-menu-item` (`components/menu-item/`, global CSS, tuned per menu via `--mi-*` variables). Its story is hidden from the sidebar with `tags: ['!dev']`.
- ConfirmDialog renders `<app-dialog>` internally; its No/Yes are `.ui-btn--text` (Yes turns red with `acceptTone: 'danger'`).
- `*-demo.component.ts` files (confirm-dialog, overlay-panel) are story-only helpers for examples that need injected services or icon buttons. They are not part of the library.
- AnimateOnScroll is a wrapper component (`<app-animate-on-scroll animation="fade-up">`). Pass `[root]` when content scrolls inside a container instead of the page.

## Stories

```ts
const meta: Meta<FooComponent> = {
  title: 'Components/Foo',
  component: FooComponent,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: TONES } },  // union inputs need explicit options
  args: { label: 'Foo', clicked: fn() },                          // shared args + fn() for every output
};
export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };      // keep short args on one line
```

- For `model()` inputs, add `<name>Change: fn()` to `args` so changes show in the Actions panel.
- Use a `render` template when the component needs projected content, a trigger button (Modal, Toast), or several instances in one story (`AllTypes`/`AllVariants`).
- Overlays (Modal, Toast) set `parameters.docs.story = { inline: false, height }` so they render inside the docs page.
- To reuse another component in a story template, add `decorators: [moduleMetadata({ imports: [ButtonComponent] })]`.

## Adding a component

1. Create `src/stories/components/<name>/` with `<name>.component.ts`, `<name>.html`, `<name>.css` and `<name>.stories.ts`, following the conventions above.
2. Run `npx ngc -p .storybook/tsconfig.json --noEmit`, then `npm run build-storybook`.
