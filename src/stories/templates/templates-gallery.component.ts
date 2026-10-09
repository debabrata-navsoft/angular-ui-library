import { Component, computed, input, linkedSignal, signal } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import { SearchInputComponent } from '../components/form/search-input/search-input.component';
import { VERSION } from '../getting-started/landing';
import { TemplateDetailComponent } from './template-detail.component';
import { TemplateFrameComponent } from './template-frame.component';
import { type Template, frameworksOf } from './templates-data';

/**
 * The site's Templates page: ready-made pages (src/stories/templates/files) with a live preview, their code and a
 * .zip download for HTML, React, Vue or Angular. Site-only, not part of the library
 */
@Component({
  selector: 'np-templates-gallery',
  imports: [
    ButtonToggleComponent,
    SearchInputComponent,
    TemplateDetailComponent,
    TemplateFrameComponent,
  ],
  templateUrl: './templates-gallery.html',
  styleUrl: './templates-gallery.css',
})
export class TemplatesGalleryComponent {
  protected readonly version = VERSION;
  protected readonly frameworksOf = frameworksOf;

  /** All templates (from the route resolver) */
  readonly templates = input<Template[]>([]);
  /** Search text to start with (the site search opens the page with ?q=…) */
  readonly q = input<string | undefined>('');

  protected readonly query = linkedSignal(() => this.q() ?? '');
  protected readonly category = signal('All');
  protected readonly selected = signal<Template | null>(null);

  protected readonly categories = computed<ToggleOption<string>[]>(() =>
    ['All', ...new Set(this.templates().map((t) => t.category))].map((value) => ({
      value,
      label: value,
    })),
  );

  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    const category = this.category();
    return this.templates().filter(
      (t) =>
        (category === 'All' || t.category === category) &&
        [t.title, t.description, ...(t.tags ?? [])].join(' ').toLowerCase().includes(query),
    );
  });
}
