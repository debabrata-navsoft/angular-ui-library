import { Component, ViewEncapsulation, effect, inject, input, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

/** Each SVG is downloaded once from /icons (served from src/stories/icons) and shared by every <app-icon> */
const cache = new Map<string, Promise<string>>();

function loadSvg(name: string): Promise<string> {
  let svg = cache.get(name);
  if (!svg) {
    svg = fetch(`icons/${name}.svg`).then((res) =>
      res.ok ? res.text() : Promise.reject(new Error(`Icon "${name}" not found. Add ${name}.svg to src/stories/icons/`)),
    );
    svg.catch(() => cache.delete(name));
    cache.set(name, svg);
  }
  return svg;
}

@Component({
  selector: 'app-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  // Styles must reach the <svg> inserted with innerHTML, which view encapsulation can't target
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'app-icon',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.--icon-stroke]': 'strokeWidth()',
    '[attr.role]': "label() ? 'img' : null",
    '[attr.aria-label]': 'label() || null',
    '[attr.aria-hidden]': '!label() || null',
  },
})
export class IconComponent {
  /** File name in src/stories/icons, without .svg */
  readonly name = input.required<string>();

  /** Width and height in pixels */
  readonly size = input(20);

  /** Line thickness for outline icons. Leave empty to keep the value from the SVG file */
  readonly strokeWidth = input<number>();

  /** Accessible name. Leave empty for decorative icons next to text */
  readonly label = input('');

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly svg = signal<SafeHtml | null>(null);

  constructor() {
    effect((onCleanup) => {
      let active = true;
      onCleanup(() => (active = false));
      loadSvg(this.name()).then(
        (markup) => active && this.svg.set(this.sanitizer.bypassSecurityTrustHtml(markup)),
        (error: Error) => {
          console.warn(error.message);
          if (active) this.svg.set(null);
        },
      );
    });
  }
}
