/** The text editor's toolbar: its tools, groups, colors and text styles (re-exported by text-editor.component.ts) */

/** Toolbar tools, in toolbar order. Pass a subset to `tools` to show fewer */
// prettier-ignore
export const TEXT_EDITOR_TOOLS = [
  'undo', 'redo', 'heading', 'bold', 'italic', 'underline', 'strike', 'code', 'superscript', 'subscript', 'color',
  'background', 'ordered', 'bullet', 'check', 'align', 'link', 'image', 'blockquote', 'code-block', 'divider', 'clean',
] as const;
export type TextEditorTool = (typeof TEXT_EDITOR_TOOLS)[number];

/** default: a bordered field. document: a wide writing surface with a centered text column (zoom with `zoom`) */
export const TEXT_EDITOR_VARIANTS = ['default', 'document'] as const;
export type TextEditorVariant = (typeof TEXT_EDITOR_VARIANTS)[number];

/** auto follows the page (data-theme on <html>); light and dark force one look on this editor only */
export const TEXT_EDITOR_THEMES = ['auto', 'light', 'dark'] as const;
export type TextEditorTheme = (typeof TEXT_EDITOR_THEMES)[number];

/** Text and highlight colors. They're written into the HTML (style="color: …"), so they're fixed values, not tokens */
// prettier-ignore
export const TEXT_EDITOR_COLORS: readonly { name: string; value: string }[] = Object.entries({
  Black: '#0f172a', Gray: '#64748b', Red: '#e11d48', Orange: '#ea580c', Yellow: '#ca8a04', Green: '#16a34a',
  Teal: '#0d9488', Blue: '#2563eb', Indigo: '#4f46e5', Purple: '#9333ea', Pink: '#db2777',
  'Light yellow': '#fef08a', 'Light green': '#bbf7d0', 'Light blue': '#bfdbfe', 'Light purple': '#e9d5ff',
  'Light pink': '#fbcfe8',
}).map(([name, value]) => ({ name, value }));

export const TEXT_EDITOR_HEADINGS = [
  { label: 'Paragraph', value: '' },
  { label: 'Heading 1', value: '1' },
  { label: 'Heading 2', value: '2' },
  { label: 'Heading 3', value: '3' },
] as const;

/** One toolbar control: the Quill `format` it sets (to `value` if given, else on/off) */
export interface ToolItem {
  tool: TextEditorTool;
  label: string;
  icon: string;
  format: string;
  value?: string;
  /** Keyboard shortcut, shown in the tooltip */
  keys?: string;
}

const tool = (t: TextEditorTool, label: string, icon: string, more?: Partial<ToolItem>) =>
  ({ tool: t, label, icon, format: t, ...more }) as ToolItem;
const align = (value: string, label: string) =>
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

/** Tools that do something once (no on/off state) */
const ACTIONS = new Set<TextEditorTool>(['clean', 'undo', 'redo', 'image', 'divider']);

/** The toolbar's controls for `tools`; the first of each group after the first gets a divider */
export function toolbarItems(tools: readonly TextEditorTool[]) {
  const shown = new Set(tools);
  return GROUPS.map((group) => group.filter((item) => shown.has(item.tool)))
    .filter((group) => group.length)
    .flatMap((group, g) =>
      group.map((item, i) => {
        const color = item.tool === 'color' || item.tool === 'background';
        return {
          ...item,
          color,
          divider: g > 0 && i === 0,
          title: item.keys ? `${item.label} (${item.keys})` : item.label,
          // Toggles report aria-pressed; the color buttons open a palette, Link and Image a dialog
          pressable: !color && !ACTIONS.has(item.tool),
          popup: color ? 'true' : item.tool === 'link' || item.tool === 'image' ? 'dialog' : null,
        };
      }),
    );
}
