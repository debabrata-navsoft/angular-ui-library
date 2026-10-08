import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

const data = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: `Member ${i + 1}` }));

describe('TableComponent pagination', () => {
  let fixture: ComponentFixture<TableComponent>;
  const el = () => fixture.nativeElement as HTMLElement;
  const text = (selector: string) =>
    el().querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();
  const bodyRows = () => el().querySelectorAll('tbody tr').length;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TableComponent);
    fixture.componentRef.setInput('columns', [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name' },
    ]);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('rows', 5);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the compact bar: items per page, the range and arrows without page numbers', () => {
    expect(text('.pagination__per-page')).toContain('Items per page:');
    expect(text('.pagination__text[aria-live]')).toBe('1 – 5 of 12');
    expect(el().querySelectorAll('.pagination__page').length).toBe(0);
    expect(el().querySelector('[aria-label="Previous page"]')?.hasAttribute('disabled')).toBe(true);
    expect(bodyRows()).toBe(5);
  });

  it('pages with the arrows and changes the page size from the select', async () => {
    (el().querySelector('[aria-label="Next page"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(text('.pagination__text[aria-live]')).toBe('6 – 10 of 12');

    // The size picker is np-select (a themed listbox), not a native <select>
    (el().querySelector('.pagination__per-page [role="combobox"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    const options = [...el().querySelectorAll<HTMLElement>('[role="option"]')];
    expect(options.map((o) => o.textContent?.trim())).toEqual(['5', '10', '25', '50']);
    options[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    // Back to the first page with the new size
    expect(text('.pagination__text[aria-live]')).toBe('1 – 10 of 12');
    expect(bodyRows()).toBe(10);
  });

  it('can use another pagination look, with page numbers', () => {
    fixture.componentRef.setInput('paginator', 'default');
    fixture.detectChanges();
    expect(el().querySelectorAll('.pagination__page').length).toBe(3);
    expect(text('.pagination__text[aria-live]')).toBe('1–5 of 12');
    expect(text('.pagination__per-page')).not.toContain('Items per page');
  });

  it('load-more adds the next rows below', () => {
    fixture.componentRef.setInput('paginator', 'load-more');
    fixture.detectChanges();
    expect(text('.pagination__text[aria-live]')).toBe('Showing 5 of 12');
    const more = () =>
      [...el().querySelectorAll('button')].find((b) => b.textContent?.includes('more'));
    expect(more()?.textContent?.trim()).toBe('Load 5 more');
    more()!.click();
    fixture.detectChanges();
    expect(bodyRows()).toBe(10);
    expect(more()?.textContent?.trim()).toBe('Load 2 more');
    more()!.click();
    fixture.detectChanges();
    expect(bodyRows()).toBe(12);
    expect(more()).toBeUndefined();
    expect(el().textContent).toContain('All loaded');
  });

  it('input goes to the typed page', () => {
    fixture.componentRef.setInput('paginator', 'input');
    fixture.detectChanges();
    const box = el().querySelector('.pagination__status input') as HTMLInputElement;
    box.value = '3';
    box.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(box.value).toBe('3');
    expect(bodyRows()).toBe(2);
  });
});
