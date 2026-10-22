import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ArticleContent } from './ArticleContent';

describe('educational article formatting', () => {
  it('renders headings, emphasis and lists without exposing Markdown markers', () => {
    const html = renderToStaticMarkup(<ArticleContent content={'## Panduan\n\nTeks **penting**.\n\n- Panel\n- Inverter'} />);
    expect(html).toContain('>Panduan</h2>');
    expect(html).toContain('<strong>penting</strong>');
    expect(html).toContain('<li>Panel</li>');
    expect(html).not.toContain('## Panduan');
  });
  it('keeps source URLs clickable for the existing plain-text articles', () => {
    const html = renderToStaticMarkup(<ArticleContent content={'Sumber\nhttps://www.energy.gov/solar'} />);
    expect(html).toContain('href="https://www.energy.gov/solar"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('escapes HTML and refuses active-content link protocols', () => {
    const html = renderToStaticMarkup(<ArticleContent content={'<script>alert(1)</script>\n\n[Klik](javascript:alert(1))'} />);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(html).toContain('&lt;script&gt;');
  });
});
