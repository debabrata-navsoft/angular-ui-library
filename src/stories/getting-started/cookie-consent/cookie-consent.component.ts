import { Component, PLATFORM_ID, afterNextRender, effect, inject, input, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * The site's cookie notice: a bar along the bottom of the page with the message, a link to the privacy policy, an
 * Accept button (remembered in localStorage) and a close button (hides it until the next visit). Site-only
 */
@Component({
  selector: 'np-cookie-consent',
  templateUrl: './cookie-consent.html',
  styleUrl: './cookie-consent.css',
})
export class CookieConsentComponent {
  /** Text of the bar */
  readonly message = input('');

  /** Link to the privacy policy ('' for none) */
  readonly policyUrl = input('');

  /** Text of the policy link */
  readonly policyLabel = input('Privacy Policy');

  /** Target of the policy link, e.g. '_top' */
  readonly policyTarget = input('');

  /** Text of the accept button */
  readonly acceptLabel = input('Accept Cookies');

  /** localStorage key that remembers the visitor accepted */
  readonly storageKey = input('np-cookie-notice');

  /** Emits when the notice (and its overlay) opens or closes */
  readonly visibleChange = output<boolean>();

  protected readonly visible = signal(false);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    effect(() => this.visibleChange.emit(this.visible()));
    afterNextRender(() => this.visible.set(!localStorage.getItem(this.storageKey())));
  }

  protected accept() {
    if (this.browser) localStorage.setItem(this.storageKey(), new Date().toISOString());
    this.visible.set(false);
  }
}
