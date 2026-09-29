import { Component, input, model } from '@angular/core';

export interface Tab {
  id: string;
  label: string;
  content: string;
}

@Component({
  selector: 'app-tabs',
  template: `
    <div class="tabs">
      <div class="tab-list" role="tablist">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            role="tab"
            class="tab"
            [class.tab--active]="tab.id === activeTab()"
            [attr.aria-selected]="tab.id === activeTab()"
            (click)="activeTab.set(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
      @for (tab of tabs(); track tab.id) {
        @if (tab.id === activeTab()) {
          <div class="tab-panel" role="tabpanel">{{ tab.content }}</div>
        }
      }
    </div>
  `,
  styleUrl: './tabs.css',
})
export class TabsComponent {
  /** Tab definitions */
  readonly tabs = input<Tab[]>([]);

  /** id of the selected tab. Supports [(activeTab)] two-way binding */
  readonly activeTab = model('');
}
