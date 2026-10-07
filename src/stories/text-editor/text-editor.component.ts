import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type Quill from 'quill';
import type { Range as QuillRange } from 'quill';

import { anchorPosition } from '../utils/anchor-position';
import { IconComponent } from '../components/media/icon/icon.component';

/** Toolbar tools, in toolbar order. Pass a subset to `tools` to show fewer */
export const TEXT_EDITOR_TOOLS = [
  'undo',
  'redo',
  'heading',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'superscript',
  'subscript',
  'color',
  'background',
  'ordered',
  'bullet',
  'check',
  'align',
  'link',
  'image',
  'blockquote',
  'code-block',
  'divider',
  'clean',
] as const;
export type TextEditorTool = (typeof TEXT_EDITOR_TOOLS)[number];

/** default: a bordered field. document: a wide writing surface with a centered text column (zoom with `zoom`) */
export const TEXT_EDITOR_VARIANTS = ['default', 'document'] as const;
export type TextEditorVariant = (typeof TEXT_EDITOR_VARIANTS)[number];

/** auto follows the page (data-theme on <html>); light and dark force one look on this editor only */
export const TEXT_EDITOR_THEMES = ['auto', 'light', 'dark'] as const;
export type TextEditorTheme = (typeof TEXT_EDITOR_THEMES)[number];

/** Text and highlight colors. They're written into the HTML (style="color: …"), so they're fixed values, not tokens */
export const TEXT_EDITOR_COLORS: readonly { name: string; value: string }[] = Object.entries({
  Black: '#0f172a',
  Gray: '#64748b',
  Red: '#e11d48',
  Orange: '#ea580c',
  Yellow: '#ca8a04',
  Green: '#16a34a',
  Teal: '#0d9488',
  Blue: '#2563eb',
  Indigo: '#4f46e5',
  Purple: '#9333ea',
  Pink: '#db2777',
  'Light yellow': '#fef08a',
  'Light green': '#bbf7d0',
  'Light blue': '#bfdbfe',
  'Light purple': '#e9d5ff',
  'Light pink': '#fbcfe8',
}).map(([name, value]) => ({ name, value }));

export const TEXT_EDITOR_HEADINGS = [
  { label: 'Paragraph', value: '' },
  { label: 'Heading 1', value: '1' },
  { label: 'Heading 2', value: '2' },
  { label: 'Heading 3', value: '3' },
] as const;

/** One toolbar control: the Quill `format` it sets (to `value` if given, else on/off) */
interface ToolItem {
  tool: TextEditorTool;
  label: string;
  icon: string;
  format: string;
  value?: string;
  /** Keyboard shortcut, shown in the tooltip */
  keys?: string;
}

const tool = (
  t: TextEditorTool,
  label: string,
  icon: string,
  more: Partial<ToolItem> = {},
): ToolItem => ({
  tool: t,
  label,
  icon,
  format: t,
  ...more,
});
const align = (value: string, label: string): ToolItem =>
  tool('align', label, `align-${value || 'left'}`, { value });

/** Toolbar groups, with a divider between them */
const GROUPS: ToolItem[][] = [
  [
    tool('undo', 'Undo', 'undo-2', { keys: 'Ctrl+Z' }),
    tool('redo', 'Redo', 'redo-2', { keys: 'Ctrl+Shift+Z' }),
  ],
  [tool('heading', 'Text style', 'heading', { format: 'header' })],
  [
    tool('bold', 'Bold', 'bold', { keys: 'Ctrl+B' }),
    tool('italic', 'Italic', 'italic', { keys: 'Ctrl+I' }),
    tool('underline', 'Underline', 'underline', { keys: 'Ctrl+U' }),
    tool('strike', 'Strikethrough', 'strikethrough'),
    tool('code', 'Inline code', 'code', { keys: 'Ctrl+E' }),
  ],
  [
    tool('superscript', 'Superscript', 'superscript', { format: 'script', value: 'super' }),
    tool('subscript', 'Subscript', 'subscript', { format: 'script', value: 'sub' }),
  ],
  [tool('color', 'Text color', 'baseline'), tool('background', 'Highlight color', 'highlighter')],
  [
    tool('ordered', 'Numbered list', 'list-ordered', { format: 'list', value: 'ordered' }),
    tool('bullet', 'Bulleted list', 'list', { format: 'list', value: 'bullet' }),
    tool('check', 'Checklist', 'list-todo', { format: 'list', value: 'unchecked' }),
  ],
  [
    align('', 'Align left'),
    align('center', 'Align center'),
    align('right', 'Align right'),
    align('justify', 'Justify'),
  ],
  [
    tool('link', 'Link', 'link', { keys: 'Ctrl+K' }),
    tool('image', 'Image', 'image-plus'),
    tool('blockquote', 'Quote', 'text-quote'),
    tool('code-block', 'Code block', 'code-xml'),
    tool('divider', 'Divider', 'separator-horizontal'),
  ],
  [tool('clean', 'Clear formatting', 'remove-formatting')],
];

/**
 * The formats this editor uses, in their own Quill registry, so Quill instances elsewhere on the page keep their own
 * setup. Alignment is a style (style="text-align: center"), so the HTML looks right without Quill's CSS.
 */
let quillLoader: Promise<{ Quill: typeof Quill; registry: unknown }> | null = null;
function loadQuill() {
  return (quillLoader ??= import('quill').then(({ default: Quill, Parchment }) => {
    const registry = new Parchment.Registry();
    const blots = 'block block/embed break container cursor embed inline scroll text';
    const formats =
      'header bold italic underline strike code script color background link image blockquote code-block list';
    type Definition = { blotName?: string; requiredContainer?: Definition };
    const definitions = [
      ...blots.split(' ').map((b) => `blots/${b}`),
      ...formats.split(' ').map((f) => `formats/${f}`),
      'attributors/style/align',
    ].map((name) => Quill.import(name) as Definition);
    // A horizontal rule (<hr>), which Quill doesn't have
    const BlockEmbed = Quill.import('blots/block/embed') as new (...args: never[]) => object;
    class Divider extends BlockEmbed {
      static blotName = 'divider';
      static tagName = 'HR';
    }
    // Lists and code blocks need their container blots too; abstract base blots can't be registered
    for (const definition of [
      ...definitions,
      ...definitions.flatMap((d) => d.requiredContainer ?? []),
      Divider as Definition,
    ])
      if (definition.blotName !== 'abstract') registry.register(definition as never);
    return { Quill, registry };
  }));
}

/** Quill 2.0 writes every space as &nbsp;. Keep single spaces plain (so text wraps), and runs of spaces visible */
const normalizeSpaces = (html: string) =>
  html.replace(/(?:&nbsp;)+/g, (run) => ' ' + '&nbsp;'.repeat(run.length / 6 - 1));

/** Typed shortcuts and the symbols that replace them as you type */
const TYPOGRAPHY = '-> → <- ← => ⇒ -- — ... … <= ≤ >= ≥ != ≠ (c) © (r) ® (tm) ™ 1/2 ½';

/** A file as a data: URL (images are inlined unless `uploadImage` is set) */
const dataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** Adds https:// to bare addresses (example.com); keeps mailto:, tel:, other schemes, relative and # links */
const normalizeUrl = (url: string) =>
  /^([a-z][a-z\d+.-]*:|[/#?.])/i.test(url) ? url : `https://${url}`;

let nextId = 0;

/**
 * Rich text editor (Quill 2) with a NexPrime toolbar. The value is HTML. Works with [(value)], [(ngModel)] and
 * formControlName. Quill loads on first use, only in the browser (SSR-safe: afterNextRender doesn't run on the server).
 */
@Component({
  selector: 'np-text-editor',
  imports: [IconComponent],
  templateUrl: './text-editor.html',
  styleUrl: './text-editor.css',
  // Quill builds the editing area itself, so its content can't carry Angular's scoped style attributes
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextEditorComponent), multi: true },
  ],
  host: {
    class: 'np-text-editor',
    '[class.np-text-editor--disabled]': 'isDisabled()',
    '[class.np-text-editor--readonly]': 'readonly()',
    '[class.np-text-editor--light]': "theme() === 'light'",
    '[class.np-text-editor--dark]': "theme() === 'dark'",
    '[class.np-text-editor--document]': "variant() === 'document'",
    '[style.--te-zoom]': 'zoom()',
    '[style.--te-min-height]': 'minHeight()',
    '[style.--te-max-height]': 'maxHeight()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class TextEditorComponent implements ControlValueAccessor {
  /** Label shown above the editor (also its accessible name) */
  readonly label = input('');

  /** Accessible name when there's no visible label */
  readonly ariaLabel = input('Rich text editor');

  /** Text shown while the editor is empty */
  readonly placeholder = input('Write something...');

  /** Content as HTML. Supports [(value)]; emits valueChange with the HTML ('' when empty) */
  readonly value = model('');

  /** Is the editor disabled? (no editing, dimmed, toolbar off) */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Show the content without editing (no toolbar; the text can still be selected and copied) */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** Minimum height of the editing area (any CSS length) */
  readonly minHeight = input('200px');

  /** Maximum height of the editing area; longer content scrolls (any CSS length, or 'none') */
  readonly maxHeight = input('500px');

  /** auto (follows the page's light/dark mode), light or dark */
  readonly theme = input<TextEditorTheme>('auto');

  /** Look: default (a form field) or document (a wide surface with a centered text column, for long-form writing) */
  readonly variant = input<TextEditorVariant>('default');

  /** Zoom of the document page (1 = 100%) */
  readonly zoom = input(1, { transform: numberAttribute });

  /** Toolbar tools to show, in TEXT_EDITOR_TOOLS order (default: all) */
  readonly tools = input<readonly TextEditorTool[]>(TEXT_EDITOR_TOOLS);

  /** Hint shown under the editor */
  readonly hint = input('');

  /** Mark the content as invalid (red border, aria-invalid) */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Replace typed shortcuts as you type: -> →, <- ←, => ⇒, -- —, ... …, (c) ©, (tm) ™, <= ≤, >= ≥, != ≠, 1/2 ½ */
  readonly typography = input(true, { transform: booleanAttribute });

  /** Uploads an image (picked, pasted or dropped) and returns its URL. Without it, images are inlined as data: URLs */
  readonly uploadImage = input<((file: File) => Promise<string>) | null>(null);

  /** Emits the Quill instance once the editor is ready, for advanced use (modules, the Delta API) */
  readonly ready = output<Quill>();

  protected readonly headings = TEXT_EDITOR_HEADINGS;
  protected readonly colors = TEXT_EDITOR_COLORS;
  protected readonly id = `np-text-editor-${nextId++}`;

  /** Toolbar controls for `tools`; the first of each group after the first gets a divider */
  protected readonly items = computed(() => {
    const tools = new Set(this.tools());
    return GROUPS.map((group) => group.filter((item) => tools.has(item.tool)))
      .filter((group) => group.length)
      .flatMap((group, g) =>
        group.map((item, i) => {
          const color = item.tool === 'color' || item.tool === 'background';
          const action = ['clean', 'undo', 'redo', 'image', 'divider'].includes(item.tool);
          return {
            ...item,
            color,
            divider: g > 0 && i === 0,
            title: item.keys ? `${item.label} (${item.keys})` : item.label,
            // Toggles report aria-pressed; the color buttons open a palette and Link a dialog
            pressable: !color && !action,
            popup: color ? 'true' : item.tool === 'link' || item.tool === 'image' ? 'dialog' : null,
          };
        }),
      );
  });

  /** Disabled by the input or by a form control (setDisabledState) */
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Whether there's something to undo / redo */
  protected readonly history = signal({ undo: false, redo: false });

  /** Formats at the cursor, for the toolbar's pressed states */
  protected readonly formats = signal<Record<string, unknown>>({});
  /** Color palette popover: the format it sets and the button that opened it */
  protected readonly palette = signal<{
    format: string;
    label: string;
    button: HTMLElement;
  } | null>(null);
  /** The bar under the toolbar that asks for a link or image address */
  protected readonly bar = signal<'link' | 'image' | null>(null);
  protected readonly barUrl = signal('');

  private readonly quill = signal<Quill | null>(null);
  /** The HTML last read from or written to Quill, so value changes from either side don't echo back */
  private lastHtml: string | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly editorEl = viewChild.required<ElementRef<HTMLElement>>('editor');
  private readonly toolbarEl = viewChild<ElementRef<HTMLElement>>('toolbar');
  private readonly paletteEl = viewChild<ElementRef<HTMLElement>>('paletteEl');
  private readonly barInput = viewChild<ElementRef<HTMLInputElement>>('barInput');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(async () => {
      const { Quill, registry } = await loadQuill();
      if (destroyRef.destroyed) return;
      const quill = new Quill(this.editorEl().nativeElement, {
        registry: registry as never,
        // Pasted and dropped images go through `uploadImage` too
        modules: {
          toolbar: false,
          uploader: {
            handler: (range: QuillRange, files: File[]) => this.insertImages(range, files),
          },
        },
        placeholder: this.placeholder(),
      });
      // Tab leaves the editor (no keyboard trap) instead of inserting a tab or indenting
      quill.keyboard.bindings['Tab'] = [];
      quill.keyboard.addBinding({ key: 'k', shortKey: true }, () => (this.openBar('link'), false));
      quill.keyboard.addBinding(
        { key: 'e', shortKey: true },
        (_: QuillRange, { format }: { format: Record<string, unknown> }) => (
          quill.format('code', !format['code'], 'user'),
          false
        ),
      );
      // Typography: the shortcut's last key, after the rest of it; not in code, where -> means ->
      for (const [, before, key, symbol] of TYPOGRAPHY.matchAll(/(\S*)(\S) (\S+)/g))
        quill.keyboard.addBinding(
          {
            key,
            shiftKey: null,
            prefix: new RegExp(`${before.replace(/[.()]/g, '\\$&')}$`, 'i'),
            format: { 'code-block': false, code: false },
          },
          (range: QuillRange) => {
            if (!this.typography()) return true;
            const start = range.index - before.length;
            quill.deleteText(start, before.length, 'user');
            quill.insertText(start, symbol, 'user');
            quill.setSelection(start + 1, 0, 'silent');
            return false;
          },
        );
      quill.on('text-change', (_delta, _old, source) => {
        if (source !== 'user') return;
        const html = quill.getLength() <= 1 ? '' : normalizeSpaces(quill.getSemanticHTML());
        this.lastHtml = html;
        this.value.set(html);
        this.onChange(html);
      });
      quill.on('editor-change', () => {
        const range = quill.getSelection();
        if (range) this.formats.set(quill.getFormat(range));
        this.updateHistory(quill);
      });
      this.quill.set(quill);
      this.ready.emit(quill);
    });

    // Value -> editor (input, writeValue). Changes typed in the editor are already there
    effect(() => {
      const html = this.value() ?? '';
      const quill = this.quill();
      if (!quill || html === this.lastHtml) return;
      untracked(() => {
        this.lastHtml = html;
        quill.setContents(quill.clipboard.convert({ html }), 'api');
        quill.history.clear();
        this.updateHistory(quill);
      });
    });

    // Editable state and the editing area's accessibility attributes
    effect(() => {
      const quill = this.quill();
      if (!quill) return;
      const disabled = this.isDisabled();
      const readonly = this.readonly() && !disabled;
      quill.enable(!disabled && !readonly);
      const attrs: Record<string, string | null> = {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-labelledby': this.label() ? `${this.id}-label` : null,
        'aria-label': this.label() ? null : this.ariaLabel(),
        'aria-describedby': this.hint() ? `${this.id}-hint` : null,
        'aria-placeholder': this.placeholder() || null,
        'aria-disabled': disabled ? 'true' : null,
        'aria-readonly': readonly ? 'true' : null,
        'aria-invalid': this.invalid() ? 'true' : null,
        // Read-only content stays reachable with Tab, to read and select it
        tabindex: readonly ? '0' : null,
        'data-placeholder': this.placeholder(),
      };
      for (const [name, value] of Object.entries(attrs))
        value === null ? quill.root.removeAttribute(name) : quill.root.setAttribute(name, value);
    });

    // The palette is a popover (top layer), so the toolbar's container can't clip it; placed under its button
    effect(() => {
      const el = this.paletteEl()?.nativeElement;
      const button = this.palette()?.button;
      if (!el || !button) return;
      el.showPopover?.();
      const { top, left } = anchorPosition(button, el);
      Object.assign(el.style, { top: `${top}px`, left: `${left}px` });
      el.querySelector('button')?.focus();
    });

    effect(() => this.bar() && this.barInput()?.nativeElement.focus());

    // Roving tabindex: Tab reaches one toolbar control (the first, until another is focused)
    afterRenderEffect(() => {
      this.items();
      this.readonly();
      this.isDisabled();
      const controls = this.toolbarControls();
      if (!controls.some((c) => c.getAttribute('tabindex') === '0')) this.setTabStop(controls[0]);
    });
  }

  // ControlValueAccessor

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  /** Move focus into the editing area */
  focus() {
    this.quill()?.focus();
  }

  /** The current content as plain text */
  getText(): string {
    return this.quill()?.getText().trimEnd() ?? '';
  }

  /** Touched once focus leaves the whole component (the toolbar, palette and link bar count as inside) */
  protected onFocusOut(event: FocusEvent) {
    if (!this.host.contains(event.relatedTarget as Node | null)) this.onTouched();
  }

  private updateHistory({ history: { stack } }: Quill) {
    this.history.set({ undo: stack.undo.length > 0, redo: stack.redo.length > 0 });
  }

  /** Is there nothing for an undo / redo button to do? */
  protected isIdle(item: ToolItem): boolean {
    return (item.tool === 'undo' || item.tool === 'redo') && !this.history()[item.tool];
  }

  /** Is the control's format on at the cursor? (for value tools: set to its value; left align is no value) */
  protected isActive(item: ToolItem): boolean {
    const current = this.formats()[item.format];
    if (item.tool === 'check') return current === 'checked' || current === 'unchecked';
    return item.value === undefined ? !!current : (current ?? '') === item.value;
  }

  protected heading(): string {
    return String(this.formats()['header'] ?? '');
  }

  /** The Quill instance, unless the editor is disabled or read-only */
  private editable(): Quill | null {
    return this.isDisabled() || this.readonly() ? null : this.quill();
  }

  /** Runs an edit on the selection: focuses the editor (which restores the last selection) unless it's locked */
  private edit(change: (quill: Quill, range: QuillRange) => void) {
    const quill = this.editable();
    quill?.focus();
    const range = quill?.getSelection();
    if (quill && range) change(quill, range);
  }

  protected run(item: ToolItem, button: HTMLElement) {
    if (item.tool === 'color' || item.tool === 'background')
      return this.palette.set({ format: item.format, label: item.label, button });
    if (item.tool === 'link' || item.tool === 'image') return this.openBar(item.tool);
    const step = item.tool;
    if (step === 'undo' || step === 'redo') return this.edit((quill) => quill.history[step]());
    this.edit((quill, range) => {
      if (item.tool === 'divider') {
        // Before the line when the cursor is at its start (or it's empty), else after the whole line
        const [line, offset] = quill.getLine(range.index);
        const at = range.index - offset + (offset && line ? line.length() : 0);
        if (at >= quill.getLength()) quill.insertText(at - 1, '\n', 'user');
        quill.insertEmbed(at, 'divider', true, 'user');
        quill.setSelection(at + 1, 0, 'user');
      } else if (item.tool !== 'clean')
        quill.format(
          item.format,
          !this.isActive(item) && (item.value || item.value === undefined),
          'user',
        );
      else if (range.length) quill.removeFormat(range.index, range.length, 'user');
      else {
        // No selection: clear the line the cursor is on (its text; Quill clears the line's own formats with it)
        const [line, offset] = quill.getLine(range.index);
        if (line) quill.removeFormat(range.index - offset, line.length() - 1, 'user');
      }
      this.formats.set(quill.getFormat(quill.getSelection() ?? range));
    });
  }

  protected setHeading(level: string) {
    this.edit((quill) => quill.format('header', level ? Number(level) : false, 'user'));
  }

  /** Closed without a pick (Escape, a click outside): back to the color button */
  protected closePalette() {
    const palette = this.palette();
    this.palette.set(null);
    palette?.button.focus();
  }

  protected pickColor(format: string, color: string | false) {
    this.palette.set(null);
    this.edit((quill) => quill.format(format, color, 'user'));
  }

  protected openBar(kind: 'link' | 'image') {
    const quill = this.editable();
    if (!quill) return;
    const range = quill.getSelection();
    const link = kind === 'link' && range && quill.getFormat(range)['link'];
    this.barUrl.set(typeof link === 'string' ? link : '');
    this.bar.set(kind);
  }

  protected closeBar() {
    this.bar.set(null);
    this.quill()?.focus();
  }

  protected applyBar() {
    const url = this.barUrl().trim();
    if (this.bar() === 'link') this.applyLink();
    else this.insertImages(null, [normalizeUrl(url)]);
  }

  /** Inserts images (addresses, or files: uploaded with `uploadImage`, else inlined) at the range or the cursor */
  protected async insertImages(range: QuillRange | null, images: (File | string)[]) {
    const quill = this.editable();
    if (!quill) return;
    this.bar.set(null);
    if (!range) quill.focus();
    let index = (range ?? quill.getSelection())?.index ?? quill.getLength() - 1;
    for (const image of images) {
      if (typeof image !== 'string' && !image.type.startsWith('image/')) continue;
      const url = typeof image === 'string' ? image : await (this.uploadImage() ?? dataUrl)(image);
      quill.insertEmbed(index++, 'image', url, 'user');
    }
    quill.setSelection(index, 0, 'user');
  }

  protected applyLink(remove = false) {
    const url = remove ? '' : this.barUrl().trim();
    const link = url && normalizeUrl(url);
    this.bar.set(null);
    this.edit((quill, { index, length }) => {
      if (!length) {
        // The cursor is in a link: change all of it
        const [blot, offset] = quill.scroll.descendant(
          (b: { statics: { blotName: string } } | null) => b?.statics.blotName === 'link',
          index,
        ) as unknown as [{ length(): number } | null, number];
        if (blot) [index, length] = [index - offset, blot.length()];
      }
      if (length) quill.formatText(index, length, 'link', link || false, 'user');
      else if (link) {
        // Nothing selected: insert the address as the link text
        quill.insertText(index, url, 'link', link, 'user');
        quill.setSelection(index + url.length, 0, 'user');
      }
    });
  }

  /** The toolbar's controls, its own and projected ones marked data-tool, in order */
  private toolbarControls(): HTMLElement[] {
    return [
      ...(this.toolbarEl()?.nativeElement.querySelectorAll<HTMLElement>('[data-tool]') ?? []),
    ];
  }

  private setTabStop(target: HTMLElement | undefined) {
    for (const control of this.toolbarControls()) control.tabIndex = control === target ? 0 : -1;
  }

  protected onToolbarFocus(event: FocusEvent) {
    const control = (event.target as HTMLElement).closest<HTMLElement>('[data-tool]');
    if (control) this.setTabStop(control);
  }

  /** Toolbar keys (WAI-ARIA toolbar): arrows, Home and End move between controls; Tab leaves the toolbar */
  protected onToolbarKey(event: KeyboardEvent) {
    const controls = this.toolbarControls().filter((c) => !(c as HTMLButtonElement).disabled);
    const i = controls.indexOf(event.target as HTMLElement);
    const n = controls.length;
    const next = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[
      event.key
    ];
    if (next === undefined || !n) return;
    event.preventDefault();
    controls[next].focus();
  }
}
