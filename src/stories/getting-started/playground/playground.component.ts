import { NgComponentOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

import { InputNumberComponent } from '../../components/form/input-number/input-number.component';
import { SelectComponent } from '../../components/form/select/select.component';
import { TextInputComponent } from '../../components/form/text-input/text-input.component';
import { ToggleComponent } from '../../components/form/toggle/toggle.component';
import { FRAMEWORKS, elementCode, type Framework } from '../../utils/framework-code';
import { FrameworkCodeComponent } from '../framework-code/framework-code.component';
import { PLAYGROUND, type Control, type PlaygroundItem } from './playground-data';

type Values = Record<string, string | number | boolean>;

const startValues = (item: PlaygroundItem): Values =>
  Object.fromEntries(item.controls.map((c) => [c.name, c.value]));

/** "Getting Started ▸ Playground": pick a component, change its inputs, see it live and copy its code */
@Component({
  selector: 'np-playground',
  imports: [
    NgComponentOutlet,
    FrameworkCodeComponent,
    InputNumberComponent,
    SelectComponent,
    TextInputComponent,
    ToggleComponent,
  ],
  templateUrl: './playground.html',
  styleUrl: './playground.css',
})
export class PlaygroundComponent {
  protected readonly groups = [...new Set(PLAYGROUND.map((item) => item.group))].map((name) => ({
    name,
    items: PLAYGROUND.filter((item) => item.group === name),
  }));

  protected readonly selected = signal(PLAYGROUND[0]);
  protected readonly values = signal<Values>(startValues(PLAYGROUND[0]));

  /** Inputs for the live component */
  protected readonly inputs = computed(() => this.values());

  /** The component as code, with only the inputs that differ from its defaults */
  protected readonly code = computed(() => {
    const item = this.selected();
    const values = this.values();
    const inputs: Record<string, string | number | boolean> = {};
    for (const control of item.controls) {
      const value = values[control.name];
      const fallback = control.fallback ?? (control.type === 'boolean' ? false : '');
      if (value === fallback) continue;
      // false only matters when the default is true; written as "false" so it works as an attribute too
      inputs[control.name] = value === false ? 'false' : value;
    }
    return Object.fromEntries(
      FRAMEWORKS.map(({ value: framework }) => [framework, elementCode(framework, { tag: item.tag, inputs })]),
    ) as Record<Framework, string>;
  });

  protected pick(item: PlaygroundItem) {
    this.selected.set(item);
    this.values.set(startValues(item));
  }

  protected reset() {
    this.values.set(startValues(this.selected()));
  }

  protected set(name: string, value: string | number | boolean | null) {
    if (value == null) return;
    this.values.update((values) => ({ ...values, [name]: value }));
  }

  protected text(control: Control) {
    return String(this.values()[control.name] ?? '');
  }

  protected checked(control: Control) {
    return this.values()[control.name] === true;
  }

  protected number(control: Control) {
    return Number(this.values()[control.name]);
  }

  protected options(control: Control & { type: 'select' }) {
    return control.options.map((value) => ({ value, label: value || '(none)' }));
  }
}
