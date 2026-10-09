/// <reference types="vite/client" />
/**
 * The Templates page's data: every folder in src/stories/templates/files, read at build time, so a new template needs
 * no code changes. A template is `files/<slug>/template.json` (title, description, category, tags) plus one folder per
 * framework and language: html/, react/ (JavaScript), react-ts/ (TypeScript), next/, next-ts/, vue/, vue-ts/, angular/. Each
 * is a complete project (everything but node_modules). File contents
 * load only when a template is viewed or downloaded.
 */

/** The frameworks a template can come in, in picker order, with their languages (Angular is TypeScript only) */
export const TEMPLATE_FRAMEWORKS = [
  { value: 'react', label: 'React', languages: ['js', 'ts'] },
  { value: 'next', label: 'Next.js', languages: ['js', 'ts'] },
  { value: 'angular', label: 'Angular', languages: ['ts'] },
  { value: 'vue', label: 'Vue', languages: ['js', 'ts'] },
  { value: 'html', label: 'HTML / CSS / JS', languages: ['js'] },
] as const;
export type TemplateFramework = (typeof TEMPLATE_FRAMEWORKS)[number]['value'];

export const CODE_LANGUAGES = [
  { value: 'js', label: 'JavaScript' },
  { value: 'ts', label: 'TypeScript' },
] as const;
export type CodeLanguage = (typeof CODE_LANGUAGES)[number]['value'];

const frameworkInfo = (framework: TemplateFramework) =>
  TEMPLATE_FRAMEWORKS.find((f) => f.value === framework)!;

/** The folder of a framework in a language: react/ for JavaScript, react-ts/ for TypeScript; one-language
 * frameworks (Angular, HTML) have just their own name */
export const folderOf = (framework: TemplateFramework, language: CodeLanguage) =>
  frameworkInfo(framework).languages.length > 1 && language === 'ts'
    ? `${framework}-ts`
    : framework;

export interface TemplateMeta {
  title: string;
  description: string;
  /** Filter group on the page ("Other" without one) */
  category?: string;
  /** Extra search words */
  tags?: string[];
}

export interface TemplateFile {
  /** Path inside the framework folder, e.g. "src/App.jsx" */
  path: string;
  /** Text files load as text, images and fonts as bytes */
  load: () => Promise<string | Uint8Array>;
}

export interface Template extends TemplateMeta {
  slug: string;
  /** The meta's category, or "Other" */
  category: string;
  /** Files by folder (react, react-ts, angular, …) */
  frameworks: Partial<Record<string, TemplateFile[]>>;
}

const metas = import.meta.glob<TemplateMeta>('./files/*/template.json', {
  eager: true,
  import: 'default',
});
const texts = import.meta.glob<string>(
  [
    './files/*/*/**/*.{html,css,scss,js,jsx,mjs,ts,tsx,vue,json,md,txt,svg,yml,yaml}',
    // Dot files of a real project (glob patterns skip them unless named)
    './files/*/*/**/.{gitignore,editorconfig}',
    './files/*/*/.vscode/*.json',
  ],
  { query: '?raw', import: 'default' },
);
const binaries = import.meta.glob<string>(
  './files/*/*/**/*.{png,jpg,jpeg,gif,webp,avif,ico,woff,woff2}',
  { query: '?url', import: 'default' },
);

/** The files of each template, by slug and framework */
function collect() {
  const found: Record<string, Partial<Record<string, TemplateFile[]>>> = {};
  const add = (key: string, load: TemplateFile['load']) => {
    const [, , slug, framework, ...rest] = key.split('/');
    ((found[slug] ??= {})[framework] ??= []).push({ path: rest.join('/'), load });
  };
  for (const [key, load] of Object.entries(texts)) add(key, load);
  for (const [key, url] of Object.entries(binaries))
    add(key, async () => new Uint8Array(await (await fetch(await url())).arrayBuffer()));
  return found;
}

const files = collect();
const known = new Set<string>(
  TEMPLATE_FRAMEWORKS.flatMap((f) => f.languages.map((language) => folderOf(f.value, language))),
);

export const TEMPLATES: Template[] = Object.entries(metas)
  .map(([key, meta]) => {
    const slug = key.split('/')[2];
    const frameworks = Object.fromEntries(
      Object.entries(files[slug] ?? {})
        .filter(([framework]) => known.has(framework))
        .map(([framework, list]) => [
          framework,
          list!.sort((a, b) => a.path.localeCompare(b.path)),
        ]),
    );
    return { ...meta, slug, category: meta.category ?? 'Other', frameworks };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** The languages a template has a framework in */
export const languagesOf = (template: Template, framework: TemplateFramework): CodeLanguage[] =>
  frameworkInfo(framework).languages.filter(
    (language) => template.frameworks[folderOf(framework, language)]?.length,
  );

/** The template's frameworks (in any language), in picker order */
export const frameworksOf = (template: Template) =>
  TEMPLATE_FRAMEWORKS.filter((f) => languagesOf(template, f.value).length);

/** Built preview documents, once per template (cards, Welcome and the dialog show the same one) */
const previews = new Map<Template, Promise<string>>();

/**
 * The HTML version as one document, for a live preview in a sandboxed iframe: its own stylesheets and scripts are
 * inlined (an iframe's srcdoc can't load files next to it). '' without an html/index.html
 */
export function previewDocument(template: Template): Promise<string> {
  let doc = previews.get(template);
  if (!doc) previews.set(template, (doc = buildPreview(template)));
  return doc;
}

async function buildPreview(template: Template): Promise<string> {
  const list = template.frameworks['html'] ?? [];
  const index = list.find((f) => f.path === 'index.html');
  if (!index) return '';
  const text = async (path: string) => {
    const file = list.find((f) => f.path === path.replace(/^\.\//, ''));
    const content = file ? await file.load() : '';
    return typeof content === 'string' ? content : '';
  };
  let html = String(await index.load());
  for (const [tag, href] of [...html.matchAll(/<link[^>]+href="([^":]+\.css)"[^>]*>/g)]) {
    const css = await text(href);
    html = html.replace(tag, () => `<style>\n${css}\n</style>`);
  }
  // Scripts move to the end of the body, in order, so the page's elements exist when they run
  const scripts: string[] = [];
  for (const [tag, src] of [...html.matchAll(/<script[^>]+src="([^":]+\.js)"[^>]*><\/script>/g)]) {
    scripts.push((await text(src)).replace(/<\/script/gi, '<\\/script'));
    html = html.replace(tag, '');
  }
  const inline = scripts.map((code) => `<script>\n${code}\n</script>`).join('\n');
  return html.replace(/<\/body>/i, () => `${inline}\n</body>`);
}

/** One folder's files (a framework in a language, see folderOf) as a .zip, in a folder named after the template */
export async function zipTemplate(template: Template, framework: string): Promise<Blob> {
  const { zipSync, strToU8 } = await import('fflate');
  const folder = `${template.slug}-${framework}`;
  const entries = await Promise.all(
    (template.frameworks[framework] ?? []).map(async (file) => {
      const content = await file.load();
      return [
        `${folder}/${file.path}`,
        typeof content === 'string' ? strToU8(content) : content,
      ] as const;
    }),
  );
  const zip = zipSync(Object.fromEntries(entries));
  return new Blob([zip as BlobPart], { type: 'application/zip' });
}
