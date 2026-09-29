import { Component, input, model } from '@angular/core';

@Component({
  selector: 'app-modal',
  host: {
    '(document:keydown.escape)': 'close()',
  },
  template: `
    @if (open()) {
      <div class="modal-backdrop" (click)="close()">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
          (click)="$event.stopPropagation()"
        >
          <div class="modal-header">
            <h3>{{ title() }}</h3>
            <button type="button" class="ui-close" aria-label="Close" (click)="close()">
              ×
            </button>
          </div>
          <div class="modal-body">
            <ng-content />
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './modal.css',
})
export class ModalComponent {
  /** Is the modal visible? Supports [(open)] two-way binding */
  readonly open = model(false);

  /** Heading shown at the top of the modal */
  readonly title = input('');

  close() {
    this.open.set(false);
  }
}
