import { NgTemplateOutlet } from '@angular/common';
import { Component, type WritableSignal, input, output, signal } from '@angular/core';

import { type MenuItemEvent, runItem } from '../../menu-utils';
import type { MenuItem } from '../../types';
import { MenuItemComponent } from '../menu-item/menu-item.component';

@Component({
  selector: 'app-panel-menu',
  imports: [MenuItemComponent, NgTemplateOutlet],
  templateUrl: './panel-menu.html',
  styleUrl: './panel-menu.css',
})
export class PanelMenuComponent {
  /** Top-level items are panels; their nested `items` form an expandable tree */
  readonly model = input<MenuItem[]>([]);

  /** Allow more than one panel open at a time? */
  readonly multiple = input(false);

  /** Emits when an enabled item or panel header is clicked */
  readonly itemClick = output<MenuItemEvent>();

  protected readonly openPanels = signal<MenuItem[]>([]);
  protected readonly expandedItems = signal<MenuItem[]>([]);

  /** Runs the item and toggles it in `open` (only it stays open when `single`) */
  protected toggle(event: Event, item: MenuItem, open: WritableSignal<MenuItem[]>, single = false) {
    if (!runItem(event, item, this.itemClick) || !item.items?.length) return;
    open.update((list) =>
      list.includes(item) ? list.filter((i) => i !== item) : single ? [item] : [...list, item],
    );
  }
}
