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
import { addShortcuts, dataUrl, editorHtml, loadQuill, normalizeUrl } from './text-editor-quill';
import {
  TEXT_EDITOR_COLORS,
  TEXT_EDITOR_HEADINGS,
  TEXT_EDITOR_TOOLS,
  type TextEditorTheme,
  type TextEditorTool,
  type TextEditorVariant,
  type ToolItem,
  toolbarItems,
} from './text-editor-tools';

export {
  TEXT_EDITOR_COLORS,
  TEXT_EDITOR_HEADINGS,
  TEXT_EDITOR_THEMES,
  TEXT_EDITOR_TOOLS,
  TEXT_EDITOR_VARIANTS,
  type TextEditorTheme,
  type TextEditorTool,
  type TextEditorVariant,
} from './text-editor-tools';

let nextId = 0;

/**
 * Rich text editor (Quill 2) with a NexPrime toolbar. The value is HTML. Works with [(value)], [(ngModel)] and
 * formControlName. Quill loads on first use, only in the browser (SSR-safe: afterNextRender doesn't run on the server).
 * The toolbar's tools are in text-editor-tools.ts, the Quill setup in text-editor-quill.ts.
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
  protected readonly items = computed(() => toolbarItems(this.tools()));

  /** Disabled by the input or by a form control (setDisabledState) */
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** Formats at the cursor, for the toolbar's pressed states and text style */
  protected readonly formats = signal<Record<string, unknown>>({});
  protected readonly heading = computed(() => String(this.formats()['header'] ?? ''));
  /** Whether there's something to undo / redo */
  protected readonly history = signal({ undo: false, redo: false });
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
        placeholder: this.placeholder(),
        // Pasted and dropped images go through `uploadImage` too
        modules: {
          toolbar: false,
          uploader: {
            handler: (range: QuillRange, files: File[]) => this.insertImages(range, files),
          },
        },
      });
      addShortcuts(quill, () => this.openBar('link'), this.typography);
      quill.on('text-change', (_delta, _old, source) => {
        if (source !== 'user') return;
        this.lastHtml = editorHtml(quill);
        this.value.set(this.lastHtml);
        this.onChange(this.lastHtml);
      });
      quill.on('editor-change', () => {
        const range = quill.getSelection();
        if (range) this.formats.set(quill.getFormat(range));
        const { undo, redo } = quill.history.stack;
        this.history.set({ undo: undo.length > 0, redo: redo.length > 0 });
      });
      this.quill.set(quill);
      this.ready.emit(quill);
    });

    // Value -> editor (input, writeValue). Changes typed in the editor are already there; loaded content can't be undone
    effect(() => {
      const html = this.value() ?? '';
      const quill = this.quill();
      if (!quill || html === this.lastHtml) return;
      untracked(() => {
        this.lastHtml = html;
        quill.setContents(quill.clipboard.convert({ html }), 'api');
        quill.history.clear();
        this.history.set({ undo: false, redo: false });
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

  /** Is there nothing for an undo / redo button to do? */
  protected isIdle({ tool }: ToolItem): boolean {
    return (tool === 'undo' || tool === 'redo') && !this.history()[tool];
  }

  /** Is the control's format on at the cursor? (for value tools: set to its value; left align is no value) */
  protected isActive(item: ToolItem): boolean {
    const current = this.formats()[item.format];
    if (item.tool === 'check') return current === 'checked' || current === 'unchecked';
    return item.value === undefined ? !!current : (current ?? '') === item.value;
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
    const { tool } = item;
    if (tool === 'color' || tool === 'background')
      return this.palette.set({ format: item.format, label: item.label, button });
    if (tool === 'link' || tool === 'image') return this.openBar(tool);
    if (tool === 'undo' || tool === 'redo') return this.edit((quill) => quill.history[tool]());
    this.edit((quill, range) => {
      const [line, offset] = quill.getLine(range.index);
      if (tool === 'divider') {
        // Before the line when the cursor is at its start (or it's empty), else after the whole line
        const at = range.index - offset + (offset && line ? line.length() : 0);
        if (at >= quill.getLength()) quill.insertText(at - 1, '\n', 'user');
        quill.insertEmbed(at, 'divider', true, 'user');
        quill.setSelection(at + 1, 0, 'user');
      } else if (tool !== 'clean') {
        const on = !this.isActive(item) && (item.value || item.value === undefined);
        quill.format(item.format, on, 'user');
      } else if (range.length) quill.removeFormat(range.index, range.length, 'user');
      // No selection: clear the cursor's line (its text; Quill clears the line's own formats with it)
      else if (line) quill.removeFormat(range.index - offset, line.length() - 1, 'user');
      this.formats.set(quill.getFormat(quill.getSelection() ?? range));
    });
  }

  protected setHeading(level: string) {
    this.edit((quill) => quill.format('header', level ? Number(level) : false, 'user'));
  }

  /** Closed without a pick (Escape, a click outside): back to the color button */
  protected closePalette() {
    this.palette()?.button.focus();
    this.palette.set(null);
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
    if (this.bar() === 'link') this.applyLink();
    else this.insertImages(null, [normalizeUrl(this.barUrl().trim())]);
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
    const [i, n] = [controls.indexOf(event.target as HTMLElement), controls.length];
    const keys: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1 + n,
      Home: 0,
      End: n - 1,
    };
    if (!(event.key in keys) || !n) return;
    event.preventDefault();
    controls[keys[event.key] % n].focus();
  }
}
