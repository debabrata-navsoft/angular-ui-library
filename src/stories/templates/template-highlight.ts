/**
 * A small syntax highlighter for the Templates page's code view: HTML (and Angular / Vue templates), CSS, JavaScript,
 * TypeScript, JSX, JSON and Markdown. It returns escaped HTML with <span class="t-…"> tokens; the colors are in
 * template-detail.css. Site-only, not part of the library
 */

type Rules = [token: string, pattern: string][];

const STRING = `'(?:\\\\.|[^'\\\\\\n])*'|"(?:\\\\.|[^"\\\\\\n])*"`;
const KEYWORDS =
  'import|from|export|default|const|let|var|function|return|if|else|for|of|in|while|do|switch|case|break|' +
  'continue|new|class|extends|implements|async|await|try|catch|finally|throw|typeof|instanceof|interface|type|' +
  'enum|readonly|protected|private|public|static|as|void|true|false|null|undefined|this';

const SCRIPT: Rules = [
  ['comment', String.raw`\/\/[^\n]*|\/\*[\s\S]*?\*\/`],
  ['string', '`(?:\\\\[\\s\\S]|[^`\\\\])*`|' + STRING],
  // JSX tags; the > of an arrow function (=>) isn't one
  ['tag', String.raw`<\/?[A-Z][\w.]*|<\/?[a-z][\w-]*(?=[\s>/])|(?<![=-])\/?>(?=\s*$|\s*[<{)])`],
  ['keyword', `\\b(?:${KEYWORDS})\\b`],
  ['decorator', String.raw`@\w+`],
  ['number', String.raw`\b\d+(?:\.\d+)?\b`],
  ['function', String.raw`\b[A-Za-z_$][\w$]*(?=\()`],
];

const STYLE: Rules = [
  ['comment', String.raw`\/\*[\s\S]*?\*\/`],
  ['string', STRING],
  ['keyword', String.raw`@[\w-]+|!important`],
  ['selector', String.raw`[^{}@;\s][^{};]*(?=\{)`],
  ['property', String.raw`--?[\w-]+(?=\s*:)|\b[a-z-]+(?=\s*:)`],
  ['number', String.raw`#[\da-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|%|r?em|vh|vw|s|ms|deg|fr)?\b`],
  ['function', String.raw`\b[a-z-]+(?=\()`],
];

const MARKUP: Rules = [
  ['comment', String.raw`<!--[\s\S]*?-->`],
  [
    'expression',
    String.raw`\{\{[\s\S]*?\}\}|@(?:if|else|for|empty|switch|case|default|let|defer)\b`,
  ],
  ['tag', String.raw`<\/?[A-Za-z][\w:.-]*|\/?>`],
  ['attribute', String.raw`[\w:@#.*\[\]()-]+(?==)`],
  ['string', STRING],
];

const JSON_RULES: Rules = [
  ['property', String.raw`"(?:\\.|[^"\\])*"(?=\s*:)`],
  ['string', STRING],
  ['number', String.raw`-?\b\d+(?:\.\d+)?\b`],
  ['keyword', String.raw`\b(?:true|false|null)\b`],
];

const MARKDOWN: Rules = [
  ['keyword', String.raw`^#{1,6} [^\n]*`],
  ['string', '```[\\s\\S]*?```|`[^`\\n]+`'],
  ['attribute', String.raw`\*\*[^*\n]+\*\*`],
];

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Code as escaped HTML, the first matching rule's text wrapped in <span class="t-<token>"> */
function tokenize(code: string, rules: Rules): string {
  const pattern = new RegExp(rules.map(([, p]) => `(${p})`).join('|'), 'gm');
  let html = '';
  let last = 0;
  for (const match of code.matchAll(pattern)) {
    if (!match[0]) continue;
    const token = rules[match.slice(1).findIndex((group) => group !== undefined)][0];
    html +=
      escape(code.slice(last, match.index)) + `<span class="t-${token}">${escape(match[0])}</span>`;
    last = match.index! + match[0].length;
  }
  return html + escape(code.slice(last));
}

/** HTML and Vue files: the markup, with <script> and <style> blocks in their own language */
function markup(code: string): string {
  let html = '';
  let last = 0;
  for (const m of code.matchAll(/(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/g)) {
    html += tokenize(code.slice(last, m.index) + m[1], MARKUP);
    html += tokenize(m[3], m[2] === 'style' ? STYLE : SCRIPT) + tokenize(m[4], MARKUP);
    last = m.index! + m[0].length;
  }
  return html + tokenize(code.slice(last), MARKUP);
}

/** The code of a file (its path picks the language) as highlighted HTML */
export function highlight(code: string, path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  if (ext === 'html' || ext === 'vue' || ext === 'svg') return markup(code);
  if (ext === 'css' || ext === 'scss') return tokenize(code, STYLE);
  if (ext === 'json') return tokenize(code, JSON_RULES);
  if (ext === 'md') return tokenize(code, MARKDOWN);
  if (['js', 'jsx', 'mjs', 'ts', 'tsx'].includes(ext)) return tokenize(code, SCRIPT);
  return escape(code);
}
