import { Component, computed, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import { type Template, previewDocument } from './templates-data';

/**
 * A template's HTML version, live, in a sandboxed iframe (scripts run, but it can't reach this page). `scale` shrinks
 * a full-size page into a thumbnail. Site-only, not part of the library
 */
@Component({
  selector: 'np-template-frame',
  templateUrl: './template-frame.html',
  styleUrl: './template-frame.css',
  host: { '[style.--frame-scale]': 'scale()' },
})
export class TemplateFrameComponent {
  /** The template to show */
  readonly template = input.required<Template>();
  /** Width of the page inside, in px (a phone, tablet or desktop); 0 fills the frame */
  readonly width = input(0, { transform: numberAttribute });
  /** Size of the page on screen (0.25: a thumbnail of a page four times bigger) */
  readonly scale = input(1, { transform: numberAttribute });
  /** Keyboard and pointer can't reach the page (thumbnails) */
  readonly inert = input(false);

  private readonly sanitizer = inject(DomSanitizer);
  /** The page as one document; our own files, so it's trusted, and the iframe's sandbox has no same-origin access */
  protected readonly doc = signal<SafeHtml | null>(null);
  protected readonly missing = signal(false);
  protected readonly title = computed(() => `${this.template().title} preview`);

  constructor() {
    effect(() => {
      const template = this.template();
      this.doc.set(null);
      previewDocument(template).then((html) => {
        if (template !== this.template()) return;
        this.missing.set(!html);
        this.doc.set(html ? this.sanitizer.bypassSecurityTrustHtml(html) : null);
      });
    });
  }
}
