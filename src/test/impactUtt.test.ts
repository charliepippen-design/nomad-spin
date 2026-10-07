import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const UTT_SNIPPET =
  `<script type="text/javascript">(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7924825-40d9-43b7-ae9a-ca7878e3bf9c1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');</script>`;

describe('Impact.com Universal Tracking Tag', () => {
  it('is installed exactly once in the site head', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf-8');
    const head = html.slice(html.indexOf('<head>'), html.indexOf('</head>'));

    expect(head).toContain(UTT_SNIPPET);
    expect(head.match(/utt\.impactcdn\.com\/P-A7924825-40d9-43b7-ae9a-ca7878e3bf9c1\.js/g)).toHaveLength(1);
    expect(head).toContain("impactStat('transformLinks')");
    expect(head).toContain("impactStat('trackImpression')");

    const firstScript = head.indexOf('<script');
    expect(firstScript).toBeGreaterThan(-1);
    expect(head.slice(firstScript).startsWith(UTT_SNIPPET)).toBe(true);
    expect(firstScript).toBeLessThan(head.indexOf('googletagmanager.com'));
  });
});
