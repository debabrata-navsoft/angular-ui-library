import { Component, ViewEncapsulation, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import { ButtonComponent } from '../components/button/button.component';
import { SearchInputComponent } from '../components/search-input/search-input.component';

export interface GalleryIcon {
  name: string;
  /** Raw SVG markup from src/stories/icons/<name>.svg */
  svg: string;
}

type PreparedIcon = GalleryIcon & { html: SafeHtml; keywords: string };

const DEFAULTS = { size: 24, strokeWidth: 2, color: '#0f172a' };
type Settings = typeof DEFAULTS;

/** Storybook page that lists every icon, like lucide.dev: search, customize, click to copy */
@Component({
  selector: 'app-icon-gallery',
  imports: [ButtonComponent, SearchInputComponent],
  templateUrl: './icon-gallery.html',
  styleUrl: './icon-gallery.css',
  // Styles must reach the <svg> elements inserted with innerHTML
  encapsulation: ViewEncapsulation.None,
})
export class IconGalleryComponent {
  /** All icons to show */
  readonly icons = input<GalleryIcon[]>([]);

  /** Extra search keywords per icon name */
  readonly tags = input<Record<string, string[]>>({});

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly query = signal('');
  protected readonly settings = signal(DEFAULTS);
  protected readonly selected = signal<PreparedIcon | null>(null);
  /** Which button last copied, for the "Copied!" label */
  protected readonly copied = signal('');

  protected readonly sliders = [
    { key: 'size', label: 'Size', min: 12, max: 64, step: 2 },
    { key: 'strokeWidth', label: 'Stroke', min: 0.5, max: 3, step: 0.25 },
  ] as const;

  private readonly prepared = computed<PreparedIcon[]>(() =>
    this.icons().map((icon) => ({
      ...icon,
      html: this.sanitizer.bypassSecurityTrustHtml(icon.svg),
      keywords: [icon.name, ...(this.tags()[icon.name] ?? [])].join(' ').toLowerCase(),
    })),
  );

  protected readonly filtered = computed(() => {
    const words = this.query().toLowerCase().split(/\s+/).filter(Boolean);
    return this.prepared().filter((icon) => words.every((word) => icon.keywords.includes(word)));
  });

  protected readonly isCustomized = computed(() => this.settings() !== DEFAULTS);

  /** Copyable code for the selected icon, with the current settings applied */
  protected readonly code = computed(() => {
    const icon = this.selected();
    if (!icon) return null;
    const { size, strokeWidth, color } = this.settings();
    const attrs = [
      `name="${icon.name}"`,
      size !== 20 && `[size]="${size}"`,
      strokeWidth !== DEFAULTS.strokeWidth && `[strokeWidth]="${strokeWidth}"`,
      color !== DEFAULTS.color && `style="color: ${color}"`,
    ];
    return {
      angular: `<app-icon ${attrs.filter(Boolean).join(' ')} />`,
      svg: icon.svg
        .replace(/<!--[\s\S]*?-->\s*/g, '')
        .replace(/ width="[^"]*"/, ` width="${size}"`)
        .replace(/ height="[^"]*"/, ` height="${size}"`)
        .replace(/ stroke-width="[^"]*"/, ` stroke-width="${strokeWidth}"`)
        .replaceAll('currentColor', color === DEFAULTS.color ? 'currentColor' : color)
        .trim(),
    };
  });

  protected update<K extends keyof Settings>(key: K, value: Settings[K]) {
    this.settings.update((settings) => ({ ...settings, [key]: value }));
  }

  protected reset() {
    this.settings.set(DEFAULTS);
  }

  protected select(icon: PreparedIcon) {
    this.selected.update((current) => (current?.name === icon.name ? null : icon));
  }

  protected async copy(kind: 'angular' | 'svg') {
    await copyToClipboard(this.code()![kind]);
    this.copied.set(kind);
    setTimeout(() => this.copied() === kind && this.copied.set(''), 1500);
  }

  protected download() {
    const url = URL.createObjectURL(new Blob([this.code()!.svg], { type: 'image/svg+xml' }));
    Object.assign(document.createElement('a'), { href: url, download: `${this.selected()!.name}.svg` }).click();
    URL.revokeObjectURL(url);
  }
}

/** Clipboard API with a fallback for browsers/iframes where it is blocked */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
}
