import { Component, computed, input } from '@angular/core';

import type { Size } from '../types';

@Component({
  selector: 'app-avatar',
  template: `
    <span class="avatar" [class]="'avatar--' + size()" [attr.title]="name()">
      @if (src()) {
        <img [src]="src()" [alt]="name()" />
      } @else {
        {{ initials() }}
      }
    </span>
  `,
  styleUrl: './avatar.css',
})
export class AvatarComponent {
  /** Image URL. Initials are shown when empty */
  readonly src = input('');

  /** Person's name, used for initials and alt text */
  readonly name = input('');

  /** How large should the avatar be? */
  readonly size = input<Size>('medium');

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );
}
