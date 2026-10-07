/** Starting content of the Text Editor page's modes. Not part of the library */

export const SAMPLE_TITLE = 'Customer Portal Redesign';

export const SAMPLE_DOCUMENT = `<p style="text-align: center;"><span style="color: #64748b;">PROJECT PROPOSAL · DRAFT</span></p>
<h1 style="text-align: center;">Customer Portal Redesign</h1>
<p style="text-align: center;"><em>Prepared by the Product team · Version 1.2</em></p>
<h2>1. Summary</h2>
<p>This proposal describes a redesign of the <strong>customer portal</strong>: a faster dashboard, a simpler billing area
and self-service account settings. The goal is to cut support tickets about billing by <strong>30%</strong> within two
quarters of launch.</p>
<h2>2. Goals</h2>
<ol>
<li>Show the account's status, invoices and usage on one screen.</li>
<li>Let customers update payment details without contacting support.</li>
<li>Meet WCAG 2.2 AA across the portal.</li>
</ol>
<h2>3. Scope</h2>
<p>In scope for the first release:</p>
<ul>
<li>Dashboard with <span style="background-color: #fef08a;">usage charts</span> and alerts</li>
<li>Invoices: list, filters, PDF download</li>
<li>Account settings: profile, team members, security</li>
</ul>
<blockquote>Out of scope: the public marketing site and the mobile apps, which follow in a later phase.</blockquote>
<h3>Launch checklist</h3>
<ul>
<li data-list="checked">Kick-off with stakeholders</li>
<li data-list="checked">User interviews (12 customers)</li>
<li data-list="unchecked">Design review</li>
<li data-list="unchecked">Beta sign-up page</li>
</ul>
<h2>4. Timeline</h2>
<p>Discovery takes <u>three weeks</u>, design <u>four weeks</u> and build <u>eight weeks</u>, followed by a two-week
beta with selected customers. See the <a href="https://example.com/roadmap">roadmap</a> for dates.</p>
<h2>5. Technical notes</h2>
<p>The portal reads account data from the existing API:</p>
<pre>GET /api/v2/accounts/{id}/summary
Authorization: Bearer &lt;token&gt;</pre>
<h2>6. Writing tools</h2>
<p>This editor handles the details: <strong>superscript</strong> (x<sup>2</sup>) and <strong>subscript</strong>
(H<sub>2</sub>O), <code>inline code</code>, and typographic shortcuts: type <code>-&gt;</code> for an arrow →,
<code>--</code> for a dash — and <code>(c)</code> for ©. Add images by upload, address, paste or drag and drop:</p>
<p><img src="nexprime-hero.svg" alt="NexPrime"></p>
<hr>
<h2>7. Approval</h2>
<p>Please review and comment by <strong>Friday</strong>. Replace this text with your own: everything on this page is
editable, and your changes are saved in this browser.</p>`;

export const SAMPLE_SIMPLE = `<h2>Hello, NexPrime 👋</h2>
<p>Type here and watch the <strong>HTML</strong> update on the right. Try <em>italic</em>, <u>underline</u>, a
<a href="https://example.com">link</a> (Ctrl/⌘ K) or a list:</p>
<ul><li>Select some text</li><li>Pick a format in the toolbar</li></ul>`;

export interface SampleComment {
  name: string;
  time: string;
  html: string;
}

export const SAMPLE_COMMENTS: SampleComment[] = [
  {
    name: 'Ava Thompson',
    time: '2 hours ago',
    html: '<p>The new dashboard looks great. Can we add <strong>CSV export</strong> to the invoices list?</p>',
  },
  {
    name: 'Liam Carter',
    time: '1 hour ago',
    html: '<p>Agreed. Two notes:</p><ul><li>Keep the filters sticky</li><li>Show totals per month</li></ul>',
  },
];
