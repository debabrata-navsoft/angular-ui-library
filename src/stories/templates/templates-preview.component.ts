import { Component } from '@angular/core';

import { TemplateFrameComponent } from './template-frame.component';
import { TEMPLATES, TEMPLATE_FRAMEWORKS } from './templates-data';

/** The Templates card's picture on Welcome: live thumbnails of the first templates and the frameworks. Site-only */
@Component({
  selector: 'np-templates-preview',
  imports: [TemplateFrameComponent],
  templateUrl: './templates-preview.html',
  styleUrl: './templates-preview.css',
})
export class TemplatesPreviewComponent {
  protected readonly templates = TEMPLATES.slice(0, 2);
  protected readonly frameworks = TEMPLATE_FRAMEWORKS;
}
