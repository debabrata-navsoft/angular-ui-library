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
  types.ts           Shared types: Tone, TONES, Size, SIZES, User
  <name>/
    <name>.component.ts
    <name>.css       (omitted when the component only uses shared .ui-* classes + inline `styles`)
    <name>.stories.ts
  Configure.mdx, assets/   Storybook welcome page (boilerplate)
src/app/             Demo Angular app (not used by Storybook)
src/styles.css       Imports stories/theme.css for the app
.storybook/          Storybook config; preview.ts imports src/stories/theme.css
```

All components live in `src/stories/<name>/`, one folder per component, with no nested folders.
Every story title is `Components/<Name>`. Do not use an `Example/` group.

## Component conventions

- Standalone components (no `standalone: true` needed, no NgModules, no `CommonModule`).
- Signal APIs only: `input()`, `output()`, `model()` for two-way values (`[(value)]`, `[(checked)]`, `[(open)]`, `[(page)]`), `signal()`/`computed()` for internal state.
- Built-in control flow (`@if`, `@for`, `@else`). Do not use `*ngIf`, `*ngFor` or `ngClass`.
- Inline `template`. Styles go in `styleUrl: './<name>.css'`, or inline `styles` when only a few lines.
- Selector prefix `app-` (the Button/Header/Page examples keep `storybook-`).
- Every public input/output gets a one-line `/** doc comment */`. Storybook autodocs shows these.
- Static `class="x"` plus `[class]="'x--' + variant()"` merge in Angular. Don't repeat the base class inside the binding.

## Styling

- Use theme variables, not hex values: `var(--ui-primary)`, `--ui-text`, `--ui-text-muted`, `--ui-border`, `--ui-border-strong`, `--ui-surface`, `--ui-surface-muted`, `--ui-danger`, `--ui-radius`, `--ui-font`.
- Color variants: add the class `tone-<tone>` and read `--tone-bg`, `--tone-fg`, `--tone-border`, `--tone-solid`. Type the input as `Tone` from `types.ts` (`info | success | warning | danger | neutral`).
- Form fields: wrap in `.ui-field`, with `.ui-label`, `.ui-control` (on input/select/textarea), `.ui-hint` and `.ui-error`. `aria-invalid="true"` on a `.ui-control` gives it a red border.
- Close buttons use `.ui-close`. Screen-reader-only text uses `.ui-visually-hidden`.
- The theme is global, so component CSS can use these classes despite view encapsulation.

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

1. Create `src/stories/<name>/<name>.component.ts` (+ `.css` if needed) and `<name>.stories.ts` following the conventions above.
2. Run `npx ngc -p .storybook/tsconfig.json --noEmit`, then `npm run build-storybook`.
