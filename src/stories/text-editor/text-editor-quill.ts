/** Quill for the text editor: loading it with its own registry, keyboard shortcuts and HTML helpers */
import type Quill from 'quill';
import type { Range as QuillRange } from 'quill';

/**
 * The formats this editor uses, in their own Quill registry, so Quill instances elsewhere on the page keep their own
 * setup. Alignment is a style (style="text-align: center"), so the HTML looks right without Quill's CSS. Loaded once,
 * on first use.
 */
let quillLoader: Promise<{ Quill: typeof Quill; registry: unknown }> | null = null;
export function loadQuill() {
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

/** Typed shortcuts and the symbols that replace them as you type */
const TYPOGRAPHY = '-> → <- ← => ⇒ -- — ... … <= ≤ >= ≥ != ≠ (c) © (r) ® (tm) ™ 1/2 ½';

/**
 * Keyboard setup: Tab leaves the editor (no keyboard trap), Ctrl/⌘ K opens the link bar, Ctrl/⌘ E toggles inline
 * code, and typography shortcuts become symbols (not in code, where -> means ->) while `typography()` is on
 */
export function addShortcuts(quill: Quill, openLink: () => void, typography: () => boolean) {
  quill.keyboard.bindings['Tab'] = [];
  quill.keyboard.addBinding({ key: 'k', shortKey: true }, () => (openLink(), false));
  quill.keyboard.addBinding(
    { key: 'e', shortKey: true },
    (_: QuillRange, { format }: { format: Record<string, unknown> }) => (
      quill.format('code', !format['code'], 'user'),
      false
    ),
  );
  // Each shortcut's last key, typed after the rest of it
  for (const [, before, key, symbol] of TYPOGRAPHY.matchAll(/(\S*)(\S) (\S+)/g))
    quill.keyboard.addBinding(
      {
        key,
        shiftKey: null,
        prefix: new RegExp(`${before.replace(/[.()]/g, '\\$&')}$`, 'i'),
        format: { 'code-block': false, code: false },
      },
      (range: QuillRange) => {
        if (!typography()) return true;
        const start = range.index - before.length;
        quill.deleteText(start, before.length, 'user');
        quill.insertText(start, symbol, 'user');
        quill.setSelection(start + 1, 0, 'silent');
        return false;
      },
    );
}

/** The editor's HTML ('' when empty). Quill 2.0 writes every space as &nbsp;: single spaces become plain again */
export const editorHtml = (quill: Quill) =>
  quill.getLength() <= 1
    ? ''
    : quill
        .getSemanticHTML()
        .replace(/(?:&nbsp;)+/g, (run) => ' ' + '&nbsp;'.repeat(run.length / 6 - 1));

/** Adds https:// to bare addresses (example.com); keeps mailto:, tel:, other schemes, relative and # links */
export const normalizeUrl = (url: string) =>
  /^([a-z][a-z\d+.-]*:|[/#?.])/i.test(url) ? url : `https://${url}`;

/** A file as a data: URL (images are inlined unless `uploadImage` is set) */
export const dataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
