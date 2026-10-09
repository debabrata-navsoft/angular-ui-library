import { Component, computed, effect, input, linkedSignal, output, signal } from '@angular/core';

import {
  ButtonToggleComponent,
  type ToggleOption,
} from '../components/form/button-toggle/button-toggle.component';
import { IconComponent } from '../components/media/icon/icon.component';
import {
  RadioGroupComponent,
  type RadioOption,
} from '../components/form/radio-group/radio-group.component';
import { DialogComponent } from '../components/overlay/dialog/dialog.component';
import { copyToClipboard } from '../utils/clipboard';
import { downloadBlob } from '../utils/download';
import { TemplateFrameComponent } from './template-frame.component';
import { highlight } from './template-highlight';
import {
  CODE_LANGUAGES,
  type CodeLanguage,
  TEMPLATE_FRAMEWORKS,
  type Template,
  type TemplateFile,
  type TemplateFramework,
  folderOf,
  frameworksOf,
  languagesOf,
  zipTemplate,
} from './templates-data';

type Device = 'desktop' | 'tablet' | 'phone';
const DEVICES: (ToggleOption<Device> & { width: number })[] = [
  { value: 'desktop', label: 'Desktop', icon: 'monitor', width: 0 },
  { value: 'tablet', label: 'Tablet', icon: 'tablet', width: 768 },
  { value: 'phone', label: 'Phone', icon: 'smartphone', width: 375 },
];

/**
 * A template opened from the Templates page: a live preview at desktop, tablet or phone width, its code per framework
 * (file list and source) and a .zip download of the chosen framework. Site-only, not part of the library
 */
@Component({
  selector: 'np-template-detail',
  imports: [
    ButtonToggleComponent,
    DialogComponent,
    IconComponent,
    RadioGroupComponent,
    TemplateFrameComponent,
  ],
  templateUrl: './template-detail.html',
  styleUrl: './template-detail.css',
})
export class TemplateDetailComponent {
  /** The template to show */
  readonly template = input.required<Template>();
  /** Emits when the dialog closes */
  readonly closed = output<void>();

  protected readonly devices = DEVICES;
  protected readonly device = signal<Device>('desktop');
  protected readonly deviceWidth = computed(
    () => DEVICES.find((d) => d.value === this.device())!.width,
  );
  protected readonly view = signal<'preview' | 'code'>('preview');

  /** Framework cards and language choices; the ones this template doesn't come in are disabled */
  protected readonly frameworkOptions = computed(() =>
    choices(
      TEMPLATE_FRAMEWORKS,
      frameworksOf(this.template()).map((f) => f.value),
    ),
  );
  protected readonly framework = linkedSignal<TemplateFramework>(
    () => frameworksOf(this.template())[0]?.value ?? 'html',
  );
  protected readonly languages = computed(() => languagesOf(this.template(), this.framework()));
  protected readonly languageOptions = computed(() => choices(CODE_LANGUAGES, this.languages()));
  /** The language picked last, or the framework's only one (Angular: TypeScript, HTML: JavaScript) */
  protected readonly preferred = signal<CodeLanguage>('js');
  protected readonly language = computed(() =>
    this.languages().includes(this.preferred()) ? this.preferred() : (this.languages()[0] ?? 'js'),
  );
  /** The folder of the chosen framework and language: what the code view shows and the download contains */
  protected readonly folder = computed(() => folderOf(this.framework(), this.language()));
  protected readonly files = computed(() => this.template().frameworks[this.folder()] ?? []);
  protected readonly zipName = computed(() => `${this.template().slug}-${this.folder()}.zip`);
  /** The file shown in the code view: the framework's main file at first */
  protected readonly file = linkedSignal<TemplateFile | undefined>(() => mainFile(this.files()));
  protected readonly code = signal('');
  /** The code with syntax colors (escaped HTML with token spans) */
  protected readonly highlighted = computed(() => highlight(this.code(), this.file()?.path ?? ''));
  protected readonly copied = signal(false);
  protected readonly downloading = signal(false);

  constructor() {
    effect(() => {
      const file = this.file();
      this.code.set('');
      file?.load().then((content) => {
        if (file === this.file())
          this.code.set(
            typeof content === 'string' ? content : '(binary file: included in the download)',
          );
      });
    });
  }

  protected async download() {
    this.downloading.set(true);
    try {
      downloadBlob(await zipTemplate(this.template(), this.folder()), this.zipName());
    } finally {
      this.downloading.set(false);
    }
  }

  protected async copy() {
    await copyToClipboard(this.code());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}

/** Radio options for `list`, disabled unless their value is `enabled` */
const choices = (list: readonly { value: string; label: string }[], enabled: readonly string[]) =>
  list.map(({ value, label }): RadioOption => ({
    value,
    label,
    disabled: !enabled.includes(value),
  }));

/** Files worth showing first, best first: the page component, index.html, then anything in src/ */
const FIRST = [/Page\.(jsx|tsx|vue)$|page\.component\.html$/, /^index\.html$/, /^src\//];

function mainFile(files: TemplateFile[]) {
  const rank = ({ path }: TemplateFile) => {
    const i = FIRST.findIndex((pattern) => pattern.test(path));
    return i < 0 ? FIRST.length : i;
  };
  return [...files].sort((a, b) => rank(a) - rank(b))[0];
}
