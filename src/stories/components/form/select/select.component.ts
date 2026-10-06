import { Component, booleanAttribute, input, model } from '@angular/core';

import { IconComponent } from '../../media/icon/icon.component';
import type { FieldVariant } from '../../../utils/types';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'np-select',
  imports: [IconComponent],
  templateUrl: './select.html',
  styleUrl: './select.css',
})
export class SelectComponent {
  /** Text shown above the dropdown */
  readonly label = input('');

  /** Choices in the dropdown */
  readonly options = input<SelectOption[]>([]);

  /** Selected value. Supports [(value)] two-way binding */
  readonly value = model('');

  /** Text shown when nothing is selected */
  readonly placeholder = input('Select an option');

  /** Is the dropdown disabled? */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Field style: outlined, filled, underline or floating (label inside the field) */
  readonly variant = input<FieldVariant>('outlined');

  /** Icon file name shown at the start of the dropdown (e.g. 'user') */
  readonly icon = input('');
}
